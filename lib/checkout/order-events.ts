import {
  appendOrderLog,
  getOrderById,
  revokeProductAccessByOrder,
  updateOrderStatus
} from "@/lib/checkout/db";
import { grantProductAccess } from "@/lib/checkout/access";
import { deliverOrder } from "@/lib/checkout/delivery";
import { sendInternalSaleNotice } from "@/lib/checkout/email";
import type { Order } from "@/lib/checkout/types";

async function assertOrder(orderId: string): Promise<Order> {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  return order;
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
    await grantProductAccess(paidOrder);

    if (firstConfirmation) {
      await sendInternalSaleNotice({
        orderId: paidOrder.id,
        customerName: paidOrder.customer_name,
        customerEmail: paidOrder.customer_email,
        customerCountry: paidOrder.customer_country,
        customerPostalCode: paidOrder.customer_postal_code,
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
  return getOrderById(orderId);
}
