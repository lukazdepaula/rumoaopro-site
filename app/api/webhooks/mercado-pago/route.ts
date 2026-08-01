import { NextResponse } from "next/server";
import {
  getOrderByGatewayCheckoutId,
  getOrderByGatewayPaymentId,
  getOrderById,
  recordWebhookEvent,
  updateOrderGatewayIds
} from "@/lib/checkout/db";
import {
  markOrderAsCancelled,
  markOrderAsFailed,
  markOrderAsPaid,
  markOrderAsRefunded,
  syncOrderSubscription
} from "@/lib/checkout/order-events";
import {
  fetchMercadoPagoPayment,
  fetchMercadoPagoSubscription,
  mapMercadoPagoStatus,
  verifyMercadoPagoWebhookSignature
} from "@/lib/checkout/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MercadoPagoNotification = {
  id?: string | number;
  action?: string;
  type?: string;
  data?: { id?: string | number };
};

function subscriptionTopic(value: string) {
  return value.includes("preapproval") || value.includes("subscription");
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const body = (await request.json().catch(() => ({}))) as MercadoPagoNotification;
    const dataId = String(
      body.data?.id || url.searchParams.get("data.id") || url.searchParams.get("id") || ""
    );
    if (!dataId) {
      return NextResponse.json({ received: true, ignored: "missing_data_id" });
    }

    if (
      !verifyMercadoPagoWebhookSignature(
        dataId,
        request.headers.get("x-request-id"),
        request.headers.get("x-signature")
      )
    ) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const topic = String(body.type || url.searchParams.get("topic") || body.action || "payment");
    const eventId = String(body.id || `${topic}:${body.action || "updated"}:${dataId}`);
    const firstDelivery = await recordWebhookEvent("mercado_pago", eventId, {
      body,
      query: Object.fromEntries(url.searchParams)
    });
    if (!firstDelivery) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (subscriptionTopic(topic)) {
      const subscription = await fetchMercadoPagoSubscription(dataId);
      const externalReference =
        typeof subscription.external_reference === "string"
          ? subscription.external_reference
          : undefined;
      const order = externalReference
        ? await getOrderById(externalReference)
        : await getOrderByGatewayCheckoutId("mercado_pago", dataId);
      if (!order) {
        return NextResponse.json({ received: true, order: "not_found" });
      }

      await updateOrderGatewayIds(order.id, {
        gateway_checkout_id: dataId,
        metadata: {
          billing_type: "subscription",
          mercado_pago_subscription_id: dataId,
          subscription_status: subscription.status,
          next_payment_date: subscription.next_payment_date || null,
          mercado_pago_event_id: eventId
        }
      });

      if (subscription.status === "authorized") {
        await markOrderAsPaid(order.id, {
          event_id: eventId,
          provider_subscription_id: dataId,
          provider_customer_id:
            subscription.payer_id === undefined ? null : String(subscription.payer_id),
          next_payment_date: subscription.next_payment_date
        });
      } else if (subscription.status === "paused") {
        await syncOrderSubscription(order.id, "paused", {
          event_id: eventId,
          provider_subscription_id: dataId,
          next_payment_date: subscription.next_payment_date
        });
      } else if (subscription.status === "cancelled" || subscription.status === "canceled") {
        await syncOrderSubscription(order.id, "canceled", {
          event_id: eventId,
          provider_subscription_id: dataId,
          next_payment_date: subscription.next_payment_date
        });
      }

      return NextResponse.json({ received: true, type: "subscription" });
    }

    const payment = await fetchMercadoPagoPayment(dataId);
    const status = mapMercadoPagoStatus(payment.status);
    const externalReference =
      typeof payment.external_reference === "string"
        ? payment.external_reference
        : undefined;
    const paymentId = String(payment.id || dataId);
    const order = externalReference
      ? await getOrderById(externalReference)
      : await getOrderByGatewayPaymentId("mercado_pago", paymentId);
    if (!order) {
      return NextResponse.json({ received: true, order: "not_found" });
    }

    await updateOrderGatewayIds(order.id, {
      gateway_payment_id:
        order.metadata.billing_type === "subscription"
          ? order.gateway_payment_id
          : paymentId,
      metadata: {
        mercado_pago_last_payment_id: paymentId,
        mercado_pago_status: payment.status,
        mercado_pago_status_detail: payment.status_detail,
        mercado_pago_event_id: eventId
      }
    });

    const subscriptionId =
      typeof order.metadata.mercado_pago_subscription_id === "string"
        ? order.metadata.mercado_pago_subscription_id
        : null;

    if (status === "paid") {
      await markOrderAsPaid(order.id, {
        event_id: eventId,
        mercado_pago_status: payment.status,
        provider_subscription_id: subscriptionId,
        current_period_end: null
      });
    } else if (status === "failed") {
      if (order.status === "paid" && subscriptionId) {
        await syncOrderSubscription(order.id, "past_due", {
          event_id: eventId,
          provider_subscription_id: subscriptionId
        });
      } else {
        await markOrderAsFailed(order.id, {
          mercado_pago_event_id: eventId,
          mercado_pago_status: payment.status
        });
      }
    } else if (status === "refunded") {
      await markOrderAsRefunded(order.id, {
        mercado_pago_event_id: eventId,
        mercado_pago_status: payment.status
      });
    } else if (status === "cancelled") {
      if (order.status === "paid" && subscriptionId) {
        await syncOrderSubscription(order.id, "canceled", {
          event_id: eventId,
          provider_subscription_id: subscriptionId
        });
      } else {
        await markOrderAsCancelled(order.id, {
          mercado_pago_event_id: eventId,
          mercado_pago_status: payment.status
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhook.mercado_pago]", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
