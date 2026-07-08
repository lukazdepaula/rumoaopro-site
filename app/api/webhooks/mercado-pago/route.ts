import { NextResponse } from "next/server";
import {
  getOrderByGatewayPaymentId,
  getOrderById,
  recordWebhookEvent,
  updateOrderGatewayIds
} from "@/lib/checkout/db";
import {
  markOrderAsCancelled,
  markOrderAsFailed,
  markOrderAsPaid,
  markOrderAsRefunded
} from "@/lib/checkout/order-events";
import {
  fetchMercadoPagoPayment,
  mapMercadoPagoStatus,
  verifyMercadoPagoWebhookSignature
} from "@/lib/checkout/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MercadoPagoNotification = {
  id?: string | number;
  action?: string;
  type?: string;
  data?: {
    id?: string | number;
  };
};

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const body = (await request.json().catch(() => ({}))) as MercadoPagoNotification;
    const dataId = String(
      body.data?.id ||
        url.searchParams.get("data.id") ||
        url.searchParams.get("id") ||
        ""
    );

    if (!dataId) {
      return NextResponse.json({ received: true, ignored: "missing_data_id" });
    }

    const signatureIsValid = verifyMercadoPagoWebhookSignature(
      dataId,
      request.headers.get("x-request-id"),
      request.headers.get("x-signature")
    );

    if (!signatureIsValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const eventId = String(
      body.id ||
        `${body.action || body.type || url.searchParams.get("topic") || "payment"}:${dataId}`
    );
    const firstDelivery = await recordWebhookEvent("mercado_pago", eventId, {
      body,
      query: Object.fromEntries(url.searchParams)
    });

    if (!firstDelivery) {
      return NextResponse.json({ received: true, duplicate: true });
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
      gateway_payment_id: paymentId,
      metadata: {
        mercado_pago_status: payment.status,
        mercado_pago_status_detail: payment.status_detail,
        mercado_pago_event_id: eventId
      }
    });

    if (status) {
      if (status === "paid") {
        await markOrderAsPaid(order.id, {
          mercado_pago_event_id: eventId,
          mercado_pago_status: payment.status
        });
      } else if (status === "failed") {
        await markOrderAsFailed(order.id, {
          mercado_pago_event_id: eventId,
          mercado_pago_status: payment.status
        });
      } else if (status === "refunded") {
        await markOrderAsRefunded(order.id, {
          mercado_pago_event_id: eventId,
          mercado_pago_status: payment.status
        });
      } else if (status === "cancelled") {
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
