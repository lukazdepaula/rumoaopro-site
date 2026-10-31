import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { recordWebhookEvent, readMeasurementEvent } from "@/lib/checkout/db";
import { publicEventPath } from "@/lib/marketing/event-path";
import { getProductBySlug, isLoadProProductId } from "@/lib/checkout/products";
import type { AnalyticsEventType } from "@/lib/checkout/types";
import { marketingConsentGranted, sendMetaEvent, type MetaEventName } from "@/lib/marketing/meta";
import { attributionStatus, normalizeMarketingAttribution } from "@/lib/marketing/attribution";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedTypes = new Set<AnalyticsEventType>([
  "page_view",
  "product_view",
  "checkout_click",
  "checkout_view",
  "checkout_submit",
  "checkout_error",
  "application_submit",
  "whatsapp_click"
]);

const cleanText = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

function sameSiteRequest(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;

  const origin = request.headers.get("origin");
  if (!origin) return fetchSite === "same-origin" || process.env.NODE_ENV !== "production";

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function metaEventFor(type: AnalyticsEventType): MetaEventName | null {
  if (type === "page_view") return "PageView";
  if (type === "product_view") return "ViewContent";
  if (type === "checkout_submit") return "InitiateCheckout";
  if (type === "application_submit" || type === "whatsapp_click") return "Contact";
  return null;
}

export async function POST(request: Request) {
  if (!sameSiteRequest(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 12288) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const marketing = normalizeMarketingAttribution(body.marketing);
    const type = cleanText(body.type, 32) as AnalyticsEventType;
    const sessionId = cleanText(body.sessionId, 80);
    const productSlug = cleanText(body.productSlug, 100);
    const locale = body.locale === "en" ? "en" : "pt";
    const path = publicEventPath(body.path);
    const sourcePath = publicEventPath(body.sourcePath);
    const referrerHost = cleanText(body.referrerHost, 160);
    const country = cleanText(body.country, 2).toUpperCase();
    const paymentMethod = cleanText(body.paymentMethod, 32);
    const errorCode = cleanText(body.errorCode, 80);
    const product = productSlug === "site" ? null : getProductBySlug(productSlug);

    if (
      !allowedTypes.has(type) ||
      !sessionId ||
      (!product && productSlug !== "site") ||
      !path
    ) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    const eventId = cleanText(body.eventId, 240) || `${sessionId}:${type}:${product?.id || "site"}:${locale}:${path}`;
    const attribution = {
      consent: marketingConsentGranted(marketing.consent) ? "granted" : "denied",
      landing_url: cleanText(marketing.landingUrl, 500) || null,
      utm_source: cleanText(marketing.utmSource, 180) || null,
      utm_medium: cleanText(marketing.utmMedium, 180) || null,
      utm_campaign: cleanText(marketing.utmCampaign, 180) || null,
      utm_content: cleanText(marketing.utmContent, 180) || null,
      utm_term: cleanText(marketing.utmTerm, 180) || null,
      fbclid: cleanText(marketing.fbclid, 240) || null,
      fbp: cleanText(marketing.fbp, 240) || null,
      fbc: cleanText(marketing.fbc, 240) || null,
      landing_attribution_id: marketing.landingAttributionId || null,
      status: attributionStatus(marketing)
    };
    let recorded = false;
    try {
      recorded = await recordWebhookEvent("analytics", eventId, {
        type,
        session_id: sessionId,
        product_id: product?.id || "site",
        product_slug: product?.slug || "site",
        locale,
        path,
        source_path: sourcePath || null,
        referrer_host: referrerHost || null,
        country: country || null,
        payment_method: paymentMethod || null,
        error_code: errorCode || null,
        attribution,
        request_id: randomUUID()
      });
    } catch (error) {
      console.error("[analytics.event.storage]", error);
      return NextResponse.json(
        { accepted: true, recorded: false },
        {
          status: 202,
          headers: {
            "Cache-Control": "no-store",
            "Retry-After": "30"
          }
        }
      );
    }

    const metaEvent = metaEventFor(type);
    let retryable = false;
    if (metaEvent && attribution.consent === "granted") {
      // A previous internal insert is not proof of CAPI delivery. Keep the
      // original timestamp on replay and reject reused IDs with other data.
      const previous = await readMeasurementEvent("analytics", eventId);
      if (!previous) throw new Error("Recorded analytics event unavailable");
      if (!recorded && (previous.payload.path !== path ||
        previous.payload.type !== type || previous.payload.session_id !== sessionId ||
        previous.payload.product_slug !== (product?.slug || "site") ||
        (previous.payload.attribution as Record<string, unknown> | undefined)?.consent !== "granted")) {
        return NextResponse.json({ error: "Event ID conflict" }, { status: 409 });
      }
      const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
      const result = await sendMetaEvent({
        dataset: isLoadProProductId(product?.id) ? "loadpro" : "rumoaopro",
        eventName: metaEvent,
        eventId,
        eventTime: Math.floor(Date.parse(previous.createdAt) / 1000),
        eventSourceUrl: new URL(path, request.url).toString(),
        userData: {
          clientIpAddress: forwardedFor || request.headers.get("x-real-ip"),
          clientUserAgent: request.headers.get("user-agent"),
          fbp: attribution.fbp,
          fbc: attribution.fbc
        },
        customData: product
          ? {
              content_name: product.name,
              content_ids: [product.slug],
              content_type: "product",
              currency: locale === "pt" ? "BRL" : "USD",
              value: locale === "pt" ? product.price_brl : product.price_usd
            }
          : undefined
      });
      retryable = !result.sent && "retryable" in result && result.retryable === true;
    }

    return NextResponse.json({ recorded, accepted: true, retryable }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    console.error("[analytics.event]", error);
    return NextResponse.json({ error: "Analytics event error" }, { status: 500 });
  }
}
