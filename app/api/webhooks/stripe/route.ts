import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import {
  getOrderByGatewayCheckoutId,
  getOrderByGatewayPaymentId,
  getOrderById,
  recordWebhookEvent,
  updateOrderGatewayIds
} from "@/lib/checkout/db";
import {
  markOrderAsFailed,
  markOrderAsPaid,
  syncOrderSubscription
} from "@/lib/checkout/order-events";
import {
  fetchStripeSubscription,
  verifyStripeWebhookSignature
} from "@/lib/checkout/payments";
import {
  trackMetaPurchase,
  trackMetaStartTrial
} from "@/lib/marketing/order-events";
import { isLoadProOrder } from "@/lib/checkout/loadpro";
import { sendLoadProPaymentFailedEmail } from "@/lib/checkout/email";
import type { Order } from "@/lib/checkout/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StripeEvent = {
  id?: string;
  type?: string;
  livemode?: boolean;
  data?: { object?: Record<string, unknown> };
};

function expectedLivemode() {
  const key = process.env.STRIPE_SECRET_KEY || "";
  if (key.startsWith("sk_live_") || key.startsWith("rk_live_")) return true;
  if (key.startsWith("sk_test_") || key.startsWith("rk_test_")) return false;
  return null;
}

const textValue = (value: unknown) =>
  typeof value === "string" && value ? value : undefined;

function metadataOf(object: Record<string, unknown>) {
  return typeof object.metadata === "object" && object.metadata !== null
    ? (object.metadata as Record<string, unknown>)
    : {};
}

function recordOf(value: unknown) {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function stripeSubscriptionId(
  object: Record<string, unknown>,
  eventType?: string
) {
  const direct = textValue(object.subscription);
  if (direct) return direct;
  const parent = recordOf(object.parent);
  const subscriptionDetails = recordOf(parent.subscription_details);
  const nested = textValue(subscriptionDetails.subscription);
  if (nested) return nested;
  return eventType?.startsWith("customer.subscription.")
    ? textValue(object.id)
    : undefined;
}

function subscriptionFields(
  object: Record<string, unknown>,
  fallbackStatus?: string
) {
  const metadata = metadataOf(object);
  const items = recordOf(object.items);
  const data = Array.isArray(items.data) ? items.data : [];
  const firstItem = recordOf(data[0]);
  const price = recordOf(firstItem.price);
  return {
    provider_subscription_status: textValue(object.status) || fallbackStatus,
    current_period_start:
      typeof object.current_period_start === "number"
        ? object.current_period_start
        : undefined,
    current_period_end: stripePeriodEnd(object),
    trial_start:
      typeof object.trial_start === "number" ? object.trial_start : undefined,
    trial_end:
      typeof object.trial_end === "number" ? object.trial_end : undefined,
    cancel_at_period_end: object.cancel_at_period_end === true,
    canceled_at:
      typeof object.canceled_at === "number" ? object.canceled_at : undefined,
    plan_code: textValue(metadata.plan_code),
    price_cents:
      typeof price.unit_amount === "number" ? price.unit_amount : undefined
  };
}

function stripePeriodEnd(object: Record<string, unknown>) {
  if (object.status === "trialing" && typeof object.trial_end === "number") {
    return object.trial_end;
  }
  if (typeof object.current_period_end === "number") return object.current_period_end;
  const lines =
    typeof object.lines === "object" && object.lines !== null
      ? (object.lines as Record<string, unknown>)
      : {};
  const data = Array.isArray(lines.data) ? lines.data : [];
  const first =
    typeof data[0] === "object" && data[0] !== null
      ? (data[0] as Record<string, unknown>)
      : {};
  const period =
    typeof first.period === "object" && first.period !== null
      ? (first.period as Record<string, unknown>)
      : {};
  return typeof period.end === "number" ? period.end : undefined;
}

function accessStatus(status: unknown) {
  if (status === "active" || status === "trialing") return "active" as const;
  if (status === "past_due" || status === "incomplete") return "past_due" as const;
  if (status === "paused") return "paused" as const;
  if (status === "unpaid") return "unpaid" as const;
  if (status === "canceled" || status === "incomplete_expired") return "canceled" as const;
  return null;
}

async function sendLoadProPaymentFailureOnce(input: {
  order: Order;
  invoice: Record<string, unknown>;
  eventId: string;
}) {
  const { order, invoice, eventId } = input;
  if (!isLoadProOrder(order) || order.metadata.checkout_gateway_mode === "sandbox") return;

  const invoiceId = textValue(invoice.id);
  if (!invoiceId) return;
  if (
    order.metadata.loadpro_payment_failed_email_invoice_id === invoiceId &&
    order.metadata.loadpro_payment_failed_email_status === "sent"
  ) {
    return;
  }

  const amount = typeof invoice.amount_due === "number"
    ? invoice.amount_due / 100
    : order.amount;
  const currency = textValue(invoice.currency)?.toUpperCase() || order.currency;
  const locale = String(order.metadata.locale || order.metadata.checkout_locale || "pt")
    .toLowerCase()
    .startsWith("en") ? "en" as const : "pt" as const;
  const sent = await sendLoadProPaymentFailedEmail({
    orderId: order.id,
    to: order.customer_email,
    productName: order.product_name,
    amount,
    currency,
    appUrl: process.env.LOADPRO_APP_URL || "https://loadpro.rumoaopro.com.br",
    locale
  });

  await updateOrderGatewayIds(order.id, {
    metadata: {
      loadpro_payment_failed_email_invoice_id: invoiceId,
      loadpro_payment_failed_email_status: sent ? "sent" : "failed",
      loadpro_payment_failed_email_event_id: eventId,
      loadpro_payment_failed_email_updated_at: new Date().toISOString(),
      ...(sent
        ? { loadpro_payment_failed_email_sent_at: new Date().toISOString() }
        : {})
    }
  });
}

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  try {
    if (!verifyStripeWebhookSignature(payload, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(payload) as StripeEvent;
    const expected = expectedLivemode();
    if (expected === null || event.livemode !== expected) {
      return NextResponse.json(
        { error: "Stripe environment mismatch" },
        { status: 409 }
      );
    }
    const eventId = event.id || randomUUID();
    const firstDelivery = await recordWebhookEvent("stripe", eventId, event);
    if (!firstDelivery) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const object = event.data?.object || {};
    const metadata = metadataOf(object);
    const orderId = textValue(metadata.order_id);
    const objectId = textValue(object.id);
    const sessionId = event.type?.startsWith("checkout.session.") ? objectId : undefined;
    const subscriptionId = stripeSubscriptionId(object, event.type);
    const paymentIntent = textValue(object.payment_intent);

    let order = orderId ? await getOrderById(orderId) : null;
    if (!order && subscriptionId) {
      order = await getOrderByGatewayPaymentId("stripe", subscriptionId);
    }
    if (!order && sessionId) {
      order = await getOrderByGatewayCheckoutId("stripe", sessionId);
    }
    if (!order) {
      return NextResponse.json({ received: true, order: "not_found" });
    }

    const orderMode = order.metadata.checkout_gateway_mode;
    if (
      (event.livemode === false && orderMode !== "sandbox") ||
      (event.livemode === true && orderMode === "sandbox")
    ) {
      return NextResponse.json(
        { error: "Stripe order environment mismatch" },
        { status: 409 }
      );
    }

    const environmentData = { provider_livemode: event.livemode };

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const paymentStatus = object.payment_status;
      const paid = paymentStatus === "paid" || event.type.includes("succeeded");
      const subscription = subscriptionId
        ? await fetchStripeSubscription(subscriptionId)
        : null;
      const subscriptionStatus = textValue(subscription?.status);

      await updateOrderGatewayIds(order.id, {
        gateway_checkout_id: sessionId,
        gateway_payment_id: subscriptionId || paymentIntent,
        metadata: {
          stripe_event_id: eventId,
          stripe_payment_status: paymentStatus,
          stripe_session_status: object.status,
          stripe_subscription_id: subscriptionId || null,
          subscription_status:
            subscriptionStatus || (subscriptionId ? "active" : null)
        }
      });

      // Stripe reports a zero-value trial checkout as paid. The subscription
      // status is the source of truth here so a trial does not become a sale,
      // fiscal event, or paid-delivery email before the first real invoice.
      if (subscriptionStatus === "trialing" && subscriptionId) {
        await syncOrderSubscription(
          order.id,
          "active",
          {
            ...environmentData,
            event_id: eventId,
            provider_customer_id: textValue(object.customer),
            provider_subscription_id: subscriptionId,
            ...subscriptionFields(subscription || {}, subscriptionStatus)
          },
          { invite: true }
        );
        await trackMetaStartTrial(order);
      } else if (paid) {
        await markOrderAsPaid(order.id, {
          ...environmentData,
          event_id: eventId,
          stripe_event_id: eventId,
          stripe_payment_status: paymentStatus,
          provider_customer_id: textValue(object.customer),
          provider_subscription_id: subscriptionId,
          ...subscriptionFields(subscription || {}, subscriptionStatus)
        });
        if (!isLoadProOrder(order)) {
          await trackMetaPurchase(order, {
            eventId: `purchase:${order.id}`,
            amount:
              typeof object.amount_total === "number"
                ? object.amount_total / 100
                : order.amount,
            currency: textValue(object.currency)?.toUpperCase() || order.currency
          });
        }
      }
    }

    if (event.type === "invoice.paid" && subscriptionId) {
      const amountPaid =
        typeof object.amount_paid === "number" ? object.amount_paid : null;
      const zeroValueTrialInvoice =
        isLoadProOrder(order) &&
        amountPaid === 0 &&
        Number(order.metadata.trial_days || 0) > 0;

      if (zeroValueTrialInvoice) {
        await syncOrderSubscription(
          order.id,
          "active",
          {
            ...environmentData,
            event_id: eventId,
            provider_customer_id: textValue(object.customer),
            provider_subscription_id: subscriptionId,
            ...subscriptionFields(object, "trialing")
          },
          { invite: true }
        );
        await trackMetaStartTrial(order);
      } else if (order.status !== "paid") {
        await markOrderAsPaid(order.id, {
          ...environmentData,
          event_id: eventId,
          provider_customer_id: textValue(object.customer),
          provider_subscription_id: subscriptionId,
          ...subscriptionFields(object, "active")
        });
      } else {
        await syncOrderSubscription(order.id, "active", {
          ...environmentData,
          event_id: eventId,
          provider_customer_id: textValue(object.customer),
          provider_subscription_id: subscriptionId,
          ...subscriptionFields(object, "active")
        });
      }

      if (amountPaid && amountPaid > 0) {
        await trackMetaPurchase(order, {
          eventId: `purchase:${eventId}`,
          amount: amountPaid / 100,
          currency: textValue(object.currency)?.toUpperCase() || order.currency
        });
      }
    }

    if (event.type?.startsWith("customer.subscription.")) {
      const status =
        event.type === "customer.subscription.deleted"
          ? "canceled"
          : accessStatus(object.status);
      if (status) {
        await syncOrderSubscription(
          order.id,
          status,
          {
            ...environmentData,
            event_id: eventId,
            provider_customer_id: textValue(object.customer),
            provider_subscription_id: subscriptionId,
            ...subscriptionFields(object, textValue(object.status))
          },
          {
            invite:
              event.type === "customer.subscription.created" &&
              object.status === "trialing"
          }
        );
      }
    }

    if (
      (event.type === "invoice.payment_failed" ||
        event.type === "invoice.payment_action_required" ||
        event.type === "invoice.finalization_failed") &&
      subscriptionId
    ) {
      await syncOrderSubscription(order.id, "past_due", {
        ...environmentData,
        event_id: eventId,
        provider_customer_id: textValue(object.customer),
        provider_subscription_id: subscriptionId,
        ...subscriptionFields(object, "past_due")
      });
      if (event.type === "invoice.payment_failed") {
        await sendLoadProPaymentFailureOnce({ order, invoice: object, eventId });
      }
    } else if (
      event.type === "checkout.session.async_payment_failed" ||
      event.type === "payment_intent.payment_failed"
    ) {
      await markOrderAsFailed(order.id, {
        ...environmentData,
        stripe_event_id: eventId
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhook.stripe]", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
