import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import {
  getOrderByGatewayCheckoutId,
  getOrderById,
  recordWebhookEvent,
  updateOrderGatewayIds
} from "@/lib/checkout/db";
import {
  markOrderAsFailed,
  markOrderAsPaid
} from "@/lib/checkout/order-events";
import { verifyStripeWebhookSignature } from "@/lib/checkout/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StripeEvent = {
  id?: string;
  type?: string;
  data?: {
    object?: Record<string, unknown>;
  };
};

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  try {
    if (!verifyStripeWebhookSignature(payload, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(payload) as StripeEvent;
    const eventId = event.id || randomUUID();
    const firstDelivery = await recordWebhookEvent("stripe", eventId, event);

    if (!firstDelivery) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const object = event.data?.object || {};
    const metadata =
      typeof object.metadata === "object" && object.metadata !== null
        ? (object.metadata as Record<string, unknown>)
        : {};
    const orderId =
      typeof metadata.order_id === "string" ? metadata.order_id : undefined;
    const sessionId = typeof object.id === "string" ? object.id : undefined;
    const paymentIntent =
      typeof object.payment_intent === "string"
        ? object.payment_intent
        : undefined;

    const order = orderId
      ? await getOrderById(orderId)
      : sessionId
        ? await getOrderByGatewayCheckoutId("stripe", sessionId)
        : null;

    if (!order) {
      return NextResponse.json({ received: true, order: "not_found" });
    }

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const paymentStatus = object.payment_status;
      if (paymentStatus === "paid" || event.type.includes("succeeded")) {
        await updateOrderGatewayIds(order.id, {
          gateway_checkout_id: sessionId,
          gateway_payment_id: paymentIntent,
          metadata: {
            stripe_event_id: eventId,
            stripe_payment_status: paymentStatus,
            stripe_session_status: object.status
          }
        });
        await markOrderAsPaid(order.id, {
          stripe_event_id: eventId,
          stripe_payment_status: paymentStatus
        });
      }
    }

    if (
      event.type === "checkout.session.async_payment_failed" ||
      event.type === "payment_intent.payment_failed"
    ) {
      await markOrderAsFailed(order.id, {
        stripe_event_id: eventId
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhook.stripe]", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
