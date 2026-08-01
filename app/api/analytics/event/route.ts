import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { recordWebhookEvent } from "@/lib/checkout/db";
import { getProductBySlug } from "@/lib/checkout/products";
import type { AnalyticsEventType } from "@/lib/checkout/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedTypes = new Set<AnalyticsEventType>([
  "product_view",
  "checkout_click",
  "checkout_view",
  "checkout_submit",
  "checkout_error"
]);

const cleanText = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

function sameSiteRequest(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite) return fetchSite === "same-origin" || fetchSite === "same-site";

  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";

  try {
    const originHost = new URL(origin).hostname.replace(/^www\./, "");
    const requestHost = new URL(request.url).hostname.replace(/^www\./, "");
    return originHost === requestHost;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!sameSiteRequest(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 4096) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const type = cleanText(body.type, 32) as AnalyticsEventType;
    const sessionId = cleanText(body.sessionId, 80);
    const productSlug = cleanText(body.productSlug, 100);
    const locale = body.locale === "en" ? "en" : "pt";
    const path = cleanText(body.path, 240);
    const sourcePath = cleanText(body.sourcePath, 240);
    const referrerHost = cleanText(body.referrerHost, 160);
    const country = cleanText(body.country, 2).toUpperCase();
    const paymentMethod = cleanText(body.paymentMethod, 32);
    const errorCode = cleanText(body.errorCode, 80);
    const product = getProductBySlug(productSlug);

    if (!allowedTypes.has(type) || !sessionId || !product || !path.startsWith("/")) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    const eventId = `${sessionId}:${type}:${product.id}:${locale}`;
    const recorded = await recordWebhookEvent("analytics", eventId, {
      type,
      session_id: sessionId,
      product_id: product.id,
      product_slug: product.slug,
      locale,
      path,
      source_path: sourcePath || null,
      referrer_host: referrerHost || null,
      country: country || null,
      payment_method: paymentMethod || null,
      error_code: errorCode || null,
      request_id: randomUUID()
    });

    return NextResponse.json({ recorded });
  } catch (error) {
    console.error("[analytics.event]", error);
    return NextResponse.json({ error: "Analytics event error" }, { status: 500 });
  }
}
