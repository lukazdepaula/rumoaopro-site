import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  appendOrderLog,
  createCustomerLoginToken,
  getOrderById,
  updateDeliveryStatus
} from "@/lib/checkout/db";
import {
  sendInternalSaleNotice,
  sendOnboardingEmail,
  sendPdfDeliveryEmail,
  sendProgramAccessEmail
} from "@/lib/checkout/email";
import { getSiteUrl } from "@/lib/checkout/payments";
import { getProductById } from "@/lib/checkout/products";
import type { CheckoutProduct, Order } from "@/lib/checkout/types";

const dayInSeconds = 60 * 60 * 24;

export function privateFilesDir() {
  return process.env.PRIVATE_FILES_DIR || path.join(process.cwd(), "private-files");
}

function downloadSecret() {
  return (
    process.env.SIGNED_DOWNLOAD_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    "development-download-secret"
  );
}

export function privateFilePath(product: CheckoutProduct) {
  if (!product.file_id) return null;
  return path.join(privateFilesDir(), product.file_id);
}

export function createSignedDownloadUrl(order: Order, product: CheckoutProduct) {
  if (!product.file_id) return null;

  const expires = Math.floor(Date.now() / 1000) + dayInSeconds;
  const payload = `${order.id}.${product.file_id}.${expires}`;
  const signature = crypto
    .createHmac("sha256", downloadSecret())
    .update(payload)
    .digest("hex");

  return `${getSiteUrl()}/api/download/${order.id}?file=${encodeURIComponent(
    product.file_id
  )}&expires=${expires}&sig=${signature}`;
}

export function verifySignedDownload(input: {
  orderId: string;
  fileId: string;
  expires: string | null;
  signature: string | null;
}) {
  if (!input.expires || !input.signature) return false;
  const expiresNumber = Number(input.expires);
  if (!Number.isFinite(expiresNumber)) return false;
  if (expiresNumber < Math.floor(Date.now() / 1000)) return false;

  const payload = `${input.orderId}.${input.fileId}.${expiresNumber}`;
  const expected = crypto
    .createHmac("sha256", downloadSecret())
    .update(payload)
    .digest("hex");

  const left = Buffer.from(input.signature, "hex");
  const right = Buffer.from(expected, "hex");
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export async function deliverOrder(orderId: string) {
  const order = await getOrderById(orderId);
  if (!order) return;
  if (order.status !== "paid") {
    await appendOrderLog(orderId, "delivery.skipped", "Pedido ainda não está pago.");
    return;
  }
  if (order.delivery_status === "delivered") {
    await appendOrderLog(orderId, "delivery.idempotent", "Entrega já estava concluída.");
    return;
  }

  const product = getProductById(order.product_id);
  if (!product) {
    await updateDeliveryStatus(order.id, "manual_required", {
      reason: "product_not_found"
    });
    return;
  }

  if (product.delivery_type === "member_area") {
    const accountPath = `/my-programs/${product.slug}`;
    const login = await createCustomerLoginToken(
      order.customer_email,
      order.customer_name
    );
    const accountUrl = login
      ? `${getSiteUrl()}/api/auth/verify?token=${login.token}&next=${encodeURIComponent(accountPath)}`
      : `${getSiteUrl()}${accountPath}`;

    await sendProgramAccessEmail({
      orderId: order.id,
      to: order.customer_email,
      name: order.customer_name,
      productName: product.name,
      accountUrl
    });
    await sendInternalSaleNotice({
      orderId: order.id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      productName: product.name,
      amount: order.amount,
      currency: order.currency
    });
    await updateDeliveryStatus(order.id, "delivered", {
      delivery_type: "member_area"
    });
    return;
  }

  if (product.delivery_type === "pdf_download") {
    const filePath = privateFilePath(product);
    if (!filePath || !fs.existsSync(filePath)) {
      await updateDeliveryStatus(order.id, "manual_required", {
        reason: "private_file_missing",
        expected_file_id: product.file_id
      });
      await sendInternalSaleNotice({
        orderId: order.id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        productName: product.name,
        amount: order.amount,
        currency: order.currency
      });
      return;
    }

    const downloadUrl = createSignedDownloadUrl(order, product);
    if (!downloadUrl) {
      await updateDeliveryStatus(order.id, "manual_required", {
        reason: "download_url_not_generated"
      });
      return;
    }

    await sendPdfDeliveryEmail({
      orderId: order.id,
      to: order.customer_email,
      name: order.customer_name,
      productName: product.name,
      downloadUrl
    });
    await sendInternalSaleNotice({
      orderId: order.id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      productName: product.name,
      amount: order.amount,
      currency: order.currency
    });
    await updateDeliveryStatus(order.id, "delivered", {
      download_url_expires_in_seconds: dayInSeconds
    });
    return;
  }

  if (product.delivery_type === "onboarding_email") {
    await sendOnboardingEmail({
      orderId: order.id,
      to: order.customer_email,
      name: order.customer_name,
      productName: product.name
    });
    await updateDeliveryStatus(order.id, "delivered");
    return;
  }

  await updateDeliveryStatus(order.id, "manual_required", {
    reason: "manual_delivery_type"
  });
}
