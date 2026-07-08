import {
  getActiveEntitlement,
  getOrCreateUserByEmail,
  grantProductAccess as grantAccessInDb,
  revokeProductAccess as revokeAccessInDb,
  updateOrderUserId,
  userHasAccessToProduct as userHasAccessInDb
} from "@/lib/checkout/db";
import type { Order } from "@/lib/checkout/types";

export async function grantProductAccess(order: Order) {
  const user = await getOrCreateUserByEmail(
    order.customer_email,
    order.customer_name
  );
  if (!user) return null;

  if (order.user_id !== user.id) {
    await updateOrderUserId(order.id, user.id);
  }

  return grantAccessInDb({
    user_id: user.id,
    order_id: order.id,
    product_id: order.product_id,
    metadata: {
      source: "paid_order",
      order_id: order.id
    }
  });
}

export async function revokeProductAccess(entitlementId: string) {
  return revokeAccessInDb(entitlementId);
}

export async function userHasAccessToProduct(userId: string, productId: string) {
  return userHasAccessInDb(userId, productId);
}

export async function getProductAccess(userId: string, productId: string) {
  return getActiveEntitlement(userId, productId);
}
