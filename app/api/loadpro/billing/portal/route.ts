import { NextResponse } from "next/server";
import { resolveLoadProBillingAccess } from "@/lib/checkout/loadpro";
import { createStripeBillingPortalSession } from "@/lib/checkout/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRODUCTION_APP_ORIGIN = "https://loadpro.rumoaopro.com.br";

function allowedOrigin(request: Request) {
  const origin = request.headers.get("origin") || "";
  if (origin === PRODUCTION_APP_ORIGIN) return origin;
  if (/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin)) return origin;
  return "";
}

function corsHeaders(request: Request) {
  const origin = allowedOrigin(request);
  return {
    ...(origin ? { "Access-Control-Allow-Origin": origin } : {}),
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
    Vary: "Origin"
  };
}

function json(request: Request, body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders(request) });
}

export async function OPTIONS(request: Request) {
  if (!allowedOrigin(request)) return json(request, { error: "Origin not allowed" }, 403);
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  if (!allowedOrigin(request)) return json(request, { error: "Origin not allowed" }, 403);

  const body = (await request.json().catch(() => ({}))) as { locale?: unknown };
  const portalLocale = body.locale === "en" ? "en" : body.locale === "es" ? "es" : "pt-BR";
  const authorization = request.headers.get("authorization") || "";
  const accessToken = authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";
  if (!accessToken) return json(request, { error: "Authentication required" }, 401);

  try {
    const resolved = await resolveLoadProBillingAccess(accessToken);
    if (!resolved) return json(request, { error: "Billing account not found" }, 404);
    const { access, appUrl } = resolved;
    if (
      access.access_kind === "lifetime" ||
      access.billing_provider !== "stripe" ||
      !access.provider_customer_id
    ) {
      return json(request, { error: "This subscription is not managed by Stripe" }, 409);
    }

    const url = await createStripeBillingPortalSession(
      access.provider_customer_id,
      `${appUrl}/?view=setup&settings=security`,
      portalLocale
    );
    return json(request, { url });
  } catch (error) {
    console.error("[loadpro.billing.portal]", error);
    return json(request, { error: "Unable to open subscription management" }, 502);
  }
}
