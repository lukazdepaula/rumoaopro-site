import {
  appendOrderLog,
  getOrderById,
  revokeProductAccessByOrder,
  updateOrderGatewayIds,
  updateOrderStatus
} from "@/lib/checkout/db";
import { grantProductAccess } from "@/lib/checkout/access";
import { deliverOrder } from "@/lib/checkout/delivery";
import { sendInternalSaleNotice } from "@/lib/checkout/email";
import { isLoadProOrder, syncLoadProAccess } from "@/lib/checkout/loadpro";
import type { Order } from "@/lib/checkout/types";

async function assertOrder(orderId: string): Promise<Order> {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  return order;
}

async function syncLoadProSafely(
  order: Order,
  status: "active" | "past_due" | "canceled" | "unpaid" | "paused",
  gatewayData: Record<string, unknown>,
  invite = false
) {
  if (!isLoadProOrder(order)) return;
  try {
    const result = await syncLoadProAccess(order, {
      status,
      currentPeriodEnd:
        (gatewayData.current_period_end as string | number | null | undefined) ||
        (gatewayData.next_payment_date as string | null | undefined),
      providerCustomerId:
        typeof gatewayData.provider_customer_id === "string"
          ? gatewayData.provider_customer_id
          : null,
      providerSubscriptionId:
        typeof gatewayData.provider_subscription_id === "string"
          ? gatewayData.provider_subscription_id
          : null,
      eventId:
        typeof gatewayData.event_id === "string"
          ? gatewayData.event_id
          : null,
      invite
    });
    await updateOrderGatewayIds(order.id, {
      metadata: {
        loadpro_provisioning_status:
          result.configured === false ? "pending_configuration" : "synced"
      }
    });
  } catch (error) {
    await updateOrderGatewayIds(order.id, {
      metadata: { loadpro_provisioning_status: "error" }
    });
    await appendOrderLog(
      order.id,
      "loadpro.provisioning.error",
      "O pagamento foi preservado, mas o acesso automático ao LoadPro precisa ser reprocessado.",
      { error: error instanceof Error ? error.message : String(error), status }
    );
  }
}

export async function syncOrderSubscription(
  orderId: string,
  status: "active" | "past_due" | "canceled" | "unpaid" | "paused",
  gatewayData: Record<string, unknown> = {},
  options: { invite?: boolean } = {}
) {
  const order = await assertOrder(orderId);
  const providerStatus =
    typeof gatewayData.provider_subscription_status === "string"
      ? gatewayData.provider_subscription_status
      : status;
  await updateOrderGatewayIds(order.id, {
    metadata: {
      subscription_status: providerStatus,
      subscription_updated_at: new Date().toISOString(),
      subscription_gateway_data: gatewayData
    }
  });
  const updated = (await getOrderById(order.id)) || order;
  await syncLoadProSafely(updated, status, gatewayData, options.invite === true);
  return getOrderById(order.id);
}

export async function triggerDelivery(orderId: string) {
  const order = await assertOrder(orderId);

  if (order.status !== "paid") {
    await appendOrderLog(
      orderId,
      "delivery.blocked",
      "Entrega bloqueada porque o pedido ainda não está paid.",
      { status: order.status }
    );
    return getOrderById(orderId);
  }

  await deliverOrder(orderId);
  return getOrderById(orderId);
}

export async function markOrderAsPaid(
  orderId: string,
  gatewayData: Record<string, unknown> = {}
) {
  const order = await assertOrder(orderId);
  const firstConfirmation = order.status !== "paid";

  if (firstConfirmation) {
    await updateOrderStatus(orderId, "paid", {
      gateway_data: gatewayData
    });
  } else {
    await appendOrderLog(orderId, "order.paid.idempotent", "Pedido já estava paid.", {
      gateway_data: gatewayData
    });
  }

  const paidOrder = await getOrderById(orderId);
  if (paidOrder) {
    await syncLoadProSafely(paidOrder, "active", gatewayData, firstConfirmation);
    if (!isLoadProOrder(paidOrder)) await grantProductAccess(paidOrder);

    if (firstConfirmation) {
      await sendInternalSaleNotice({
        orderId: paidOrder.id,
        customerName: paidOrder.customer_name,
        customerEmail: paidOrder.customer_email,
        customerCountry: paidOrder.customer_country,
        customerPostalCode: paidOrder.customer_postal_code,
        customerAddress: paidOrder.customer_address,
        customerWhatsapp: paidOrder.customer_whatsapp,
        productName: paidOrder.product_name,
        amount: paidOrder.amount,
        currency: paidOrder.currency,
        gateway: paidOrder.gateway,
        discountCode:
          typeof paidOrder.metadata.discount_code === "string"
            ? paidOrder.metadata.discount_code
            : null
      });
    }
  }

  await triggerDelivery(orderId);
  return getOrderById(orderId);
}

export async function markOrderAsFailed(
  orderId: string,
  gatewayData: Record<string, unknown> = {}
) {
  await assertOrder(orderId);
  await updateOrderStatus(orderId, "failed", {
    gateway_data: gatewayData
  });
  return getOrderById(orderId);
}

export async function markOrderAsRefunded(
  orderId: string,
  gatewayData: Record<string, unknown> = {}
) {
  await assertOrder(orderId);
  await updateOrderStatus(orderId, "refunded", {
    gateway_data: gatewayData
  });
  await revokeProductAccessByOrder(orderId);
  const order = await getOrderById(orderId);
  if (order) await syncLoadProSafely(order, "canceled", gatewayData);
  return getOrderById(orderId);
}

export async function markOrderAsCancelled(
  orderId: string,
  gatewayData: Record<string, unknown> = {}
) {
  await assertOrder(orderId);
  await updateOrderStatus(orderId, "cancelled", {
    gateway_data: gatewayData
  });
  const order = await getOrderById(orderId);
  if (order) await syncLoadProSafely(order, "canceled", gatewayData);
  return getOrderById(orderId);
}
