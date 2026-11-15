import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { readMeasurementEvent, recordWebhookEvent } from "@/lib/checkout/db";
import { normalizeMarketingAttribution, attributionStatus } from "@/lib/marketing/attribution";
import { sendMetaEvent } from "@/lib/marketing/meta";
import { isPreviewEnvironment } from "@/lib/preview-safety";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APP_ORIGIN = "https://loadpro.rumoaopro.com.br";
const names = { page_view: "PageView", product_view: "ViewContent", whatsapp_click: "Contact" } as const;
const attempts = new Map<string, { count: number; until: number }>();

function headers() {
  return { "Access-Control-Allow-Origin": APP_ORIGIN, "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type", "Cache-Control": "no-store", Vary: "Origin" };
}
function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: headers() });
}
function allowed(request: Request) { return request.headers.get("origin") === APP_ORIGIN; }
function cookieId(value: unknown, click = false) {
  return typeof value === "string" && value.length <= 240 &&
    (click ? /^fb\.\d\.\d{10,13}\.[A-Za-z0-9_-]+$/ : /^fb\.\d\.\d{10,13}\.\d+$/).test(value) ? value : undefined;
}
function rateAllowed(ip: string) {
  const now = Date.now();
  for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
  const key = createHash("sha256").update(ip).digest("hex");
  const value = attempts.get(key);
  if (!value) {
    if (attempts.size >= 5000) return false;
    attempts.set(key, { count: 1, until: now + 60000 }); return true;
  }
  return ++value.count <= 30;
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: allowed(request) ? 204 : 403,
    headers: allowed(request) ? headers() : { "Cache-Control": "no-store" } });
}

// Dedicated bridge for the public LoadPro sales page. Never accepts player,
// account, payment or health events, URLs, customer data or custom parameters.
export async function POST(request: Request) {
  if (!allowed(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  if (isPreviewEnvironment()) return json({ accepted: false, reason: "preview_disabled" }, 202);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ error: "Invalid content type" }, 415);
  if (Number(request.headers.get("content-length") || 0) > 12288) return json({ error: "Payload too large" }, 413);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  if (!rateAllowed(ip)) return json({ error: "Rate limited" }, 429);
  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > 12288) return json({ error: "Payload too large" }, 413);
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return json({ error: "Invalid event" }, 400);
    body = parsed as Record<string, unknown>;
  } catch { return json({ error: "Invalid JSON" }, 400); }
  const type = body.type as keyof typeof names;
  const sessionId = typeof body.sessionId === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(body.sessionId) ? body.sessionId : "";
  const eventId = typeof body.eventId === "string" ? body.eventId : "";
  const eventName = Object.hasOwn(names, type) ? names[type] : null;
  if (!eventName || !sessionId || eventId.length > 240 ||
    !eventId.startsWith(`loadpro:${sessionId}:${eventName}:`) || !/^[a-zA-Z0-9_:-]+$/.test(eventId) ||
    !/^[a-zA-Z0-9_-]{1,80}$/.test(eventId.slice(`loadpro:${sessionId}:${eventName}:`.length)) ||
    Object.keys(body).some(key => !["type", "eventId", "sessionId", "locale", "marketing"].includes(key))) return json({ error: "Invalid event" }, 400);
  const marketing = normalizeMarketingAttribution(body.marketing);
  if (marketing.consent !== "granted") return json({ accepted: false, reason: "consent_denied" });
  const locale = body.locale === "en" || body.locale === "es" ? body.locale : "pt";
  try {
    const recorded = await recordWebhookEvent("analytics", eventId, {
      type, session_id: sessionId, product_id: "loadpro_founders", product_slug: "loadpro-founders", locale,
      source: "loadpro_public", origin: APP_ORIGIN, path: "/",
      attribution: { consent: "granted", status: attributionStatus(marketing),
        utm_source: marketing.utmSource || null, utm_medium: marketing.utmMedium || null,
        utm_campaign: marketing.utmCampaign || null, utm_content: marketing.utmContent || null,
        utm_term: marketing.utmTerm || null, landing_attribution_id: marketing.landingAttributionId || null }
    });
    const previous = await readMeasurementEvent("analytics", eventId);
    if (!previous) throw new Error("Missing receipt");
    if (previous.payload.source !== "loadpro_public" || previous.payload.origin !== APP_ORIGIN ||
      previous.payload.type !== type || previous.payload.session_id !== sessionId || previous.payload.locale !== locale) {
      return json({ error: "Event ID conflict" }, 409);
    }
    const result = await sendMetaEvent({ dataset: "loadpro", eventName, eventId,
      eventTime: Math.floor(Date.parse(previous.createdAt) / 1000),
      // Keep the real, restricted source. This bridge is not a category bypass.
      eventSourceUrl: `${APP_ORIGIN}/`,
      userData: { clientIpAddress: ip === "unknown" ? undefined : ip,
        clientUserAgent: request.headers.get("user-agent"), fbp: cookieId(marketing.fbp), fbc: cookieId(marketing.fbc, true) },
      customData: type === "page_view" ? undefined : {
        content_name: "LoadPro App - Plano Treinadores Fundadores", content_ids: ["loadpro-founders"], content_type: "product"
      }
    });
    return json({ accepted: true, recorded, providerAccepted: result.sent,
      retryable: !result.sent && "retryable" in result && result.retryable === true });
  } catch {
    console.error("[loadpro.marketing]", "storage_or_delivery_error");
    return json({ accepted: false, retryable: true }, 503);
  }
}
