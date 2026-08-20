import { NextResponse } from "next/server";
import {
  getOrderByGatewayPaymentId,
  updateOrderGatewayIds
} from "@/lib/checkout/db";
import {
  isLoadProOrder,
  resolveLoadProBillingAccess,
  syncLoadProAccess
} from "@/lib/checkout/loadpro";
import {
  changeStripeLoadProPlan,
  fetchStripeSubscription
} from "@/lib/checkout/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRODUCTION_APP_ORIGIN = "https://loadpro.rumoaopro.com.br";
const TARGET_PLAN = "loadpro_founders_50" as const;

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

function recordOf(value: unknown) {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function textValue(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function subscriptionItem(subscription: Record<string, unknown>) {
  const items = recordOf(subscription.items);
  const data = Array.isArray(items.data) ? items.data : [];
  return recordOf(data[0]);
}

function accessStatus(value: unknown) {
  if (value === "active" || value === "trialing") return "active" as const;
  if (value === "past_due" || value === "incomplete") return "past_due" as const;
  if (value === "paused") return "paused" as const;
  if (value === "unpaid") return "unpaid" as const;
  if (value === "canceled" || value === "incomplete_expired") return "canceled" as const;
  return null;
}

export async function OPTIONS(request: Request) {
  if (!allowedOrigin(request)) return json(request, { error: "Origin not allowed" }, 403);
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  if (!allowedOrigin(request)) return json(request, { error: "Origin not allowed" }, 403);

  const authorization = request.headers.get("authorization") || "";
  const accessToken = authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";
  if (!accessToken) return json(request, { error: "Authentication required" }, 401);

  const body = (await request.json().catch(() => ({}))) as { plan_code?: unknown };
  if (body.plan_code !== TARGET_PLAN) {
    return json(request, { error: "Unsupported plan change" }, 400);
  }

  try {
    const resolved = await resolveLoadProBillingAccess(accessToken);
    if (!resolved) return json(request, { error: "Billing account not found" }, 404);
    const { access, identity } = resolved;

    if (access.plan_code === TARGET_PLAN) return json(request, { access, unchanged: true });
    if (
      access.access_kind === "lifetime" ||
      access.plan_code !== "loadpro_founders" ||
      access.billing_provider !== "stripe" ||
      !access.provider_customer_id ||
      !access.provider_subscription_id
    ) {
      return json(request, { error: "This subscription cannot be upgraded" }, 409);
    }

    const order = await getOrderByGatewayPaymentId(
      "stripe",
      access.provider_subscription_id
    );
    if (
      !order ||
      !isLoadProOrder(order) ||
      order.customer_email.trim().toLowerCase() !== identity.email
    ) {
      return json(request, { error: "Subscription order not found" }, 404);
    }

    const currentSubscription = await fetchStripeSubscription(
      access.provider_subscription_id
    );
    const currentCustomer = textValue(currentSubscription.customer);
    const currentStatus = textValue(currentSubscription.status);
    const item = subscriptionItem(currentSubscription);
    const itemId = textValue(item.id);
    if (
      currentCustomer !== access.provider_customer_id ||
      !itemId ||
      !["active", "trialing"].includes(currentStatus || "")
    ) {
      return json(request, { error: "Stripe subscription is not eligible" }, 409);
    }

    const updated = await changeStripeLoadProPlan({
      subscriptionId: access.provider_subscription_id,
      subscriptionItemId: itemId,
      planCode: TARGET_PLAN
    });
    const updatedStatus = textValue(updated.status);
    const mappedStatus = accessStatus(updatedStatus);
    if (!mappedStatus) throw new Error("Stripe returned an unsupported subscription status.");

    await updateOrderGatewayIds(order.id, {
      metadata: {
        subscription_plan_code: TARGET_PLAN,
        subscription_price_cents: 6990,
        subscription_plan_changed_at: new Date().toISOString()
      }
    });

    await syncLoadProAccess(order, {
      status: mappedStatus,
      currentPeriodStart: numberValue(updated.current_period_start),
      currentPeriodEnd:
        numberValue(updated.trial_end) ||
        numberValue(updated.current_period_end) ||
        access.current_period_end,
      trialStart: numberValue(updated.trial_start),
      trialEnd: numberValue(updated.trial_end),
      providerSubscriptionStatus: updatedStatus,
      cancelAtPeriodEnd: updated.cancel_at_period_end === true,
      canceledAt: numberValue(updated.canceled_at),
      providerCustomerId: currentCustomer,
      providerSubscriptionId: access.provider_subscription_id,
      planCode: TARGET_PLAN,
      priceCents: 6990,
      eventId: `direct-plan-change:${order.id}`
    });

    const refreshed = await resolveLoadProBillingAccess(accessToken);
    if (!refreshed?.access || refreshed.access.plan_code !== TARGET_PLAN) {
      throw new Error("LoadPro entitlement did not confirm the upgraded plan.");
    }
    return json(request, { access: refreshed.access });
  } catch (error) {
    console.error("[loadpro.billing.change-plan]", error);
    return json(request, { error: "Unable to change subscription plan" }, 502);
  }
}
