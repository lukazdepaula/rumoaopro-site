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
  sendLoadProAccessEmail,
  sendOnboardingEmail,
  sendPdfDeliveryEmail,
  sendProgramAccessEmail
} from "@/lib/checkout/email";
import { getSiteUrl } from "@/lib/checkout/payments";
import { getProductById } from "@/lib/checkout/products";
import { getRaptorProProgramConfig, isRaptorProProgramOrder } from "@/lib/checkout/raptorpro";
import type { CheckoutProduct, Order } from "@/lib/checkout/types";

const dayInSeconds = 60 * 60 * 24;

export function privateFilesDir() {
  return process.env.PRIVATE_FILES_DIR || path.join(process.cwd(), "private-files");
}

function downloadSecret() {
  const configured = process.env.SIGNED_DOWNLOAD_SECRET?.trim();
  if (configured) return configured;

  if (process.env.NODE_ENV === "production") return null;

  return process.env.ADMIN_SESSION_SECRET?.trim() || "development-download-secret";
}

export function privateFilePath(product: CheckoutProduct) {
  if (!product.file_id) return null;
  return path.join(privateFilesDir(), product.file_id);
}

export function createSignedDownloadUrl(order: Order, product: CheckoutProduct) {
  if (!product.file_id) return null;
  const secret = downloadSecret();
  if (!secret) return null;

  const expires = Math.floor(Date.now() / 1000) + dayInSeconds;
  const payload = `${order.id}.${product.file_id}.${expires}`;
  const signature = crypto
    .createHmac("sha256", secret)
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
  const secret = downloadSecret();
  if (!secret) return false;
  const expiresNumber = Number(input.expires);
  if (!Number.isFinite(expiresNumber)) return false;
  if (expiresNumber < Math.floor(Date.now() / 1000)) return false;

  const payload = `${input.orderId}.${input.fileId}.${expiresNumber}`;
  const expected = crypto
    .createHmac("sha256", secret)
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

  if (product.id === "loadpro_founders") {
    if (order.metadata.loadpro_provisioning_status !== "synced") {
      await updateDeliveryStatus(order.id, "manual_required", {
        reason: "loadpro_provisioning_not_confirmed"
      });
      return;
    }
    const emailSent = await sendLoadProAccessEmail({
      orderId: order.id,
      to: order.customer_email,
      name: order.customer_name,
      appUrl: process.env.LOADPRO_APP_URL || "https://loadpro.rumoaopro.com.br"
    });
    if (!emailSent) {
      await updateDeliveryStatus(order.id, "manual_required", {
        reason: "email_delivery_failed"
      });
      return;
    }
    await updateDeliveryStatus(order.id, "delivered", {
      delivery_type: "loadpro_access"
    });
    return;
  }

  if (isRaptorProProgramOrder(order)) {
    const program = getRaptorProProgramConfig(order);
    if (
      order.metadata.raptorpro_provisioning_status !== "synced" ||
      order.metadata.raptorpro_welcome_email_sent !== true
    ) {
      await updateDeliveryStatus(order.id, "manual_required", {
        reason: "raptorpro_provisioning_not_confirmed"
      });
      return;
    }
    await updateDeliveryStatus(order.id, "delivered", {
      delivery_type: "raptorpro_program_access",
      program_id: program?.programId || null
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

    const emailSent = await sendProgramAccessEmail({
      orderId: order.id,
      to: order.customer_email,
      name: order.customer_name,
      productName: product.name,
      accountUrl
    });
    if (!emailSent) {
      await updateDeliveryStatus(order.id, "manual_required", {
        reason: "email_delivery_failed"
      });
      return;
    }
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
      return;
    }

    const downloadUrl = createSignedDownloadUrl(order, product);
    if (!downloadUrl) {
      await updateDeliveryStatus(order.id, "manual_required", {
        reason: "download_url_not_generated"
      });
      return;
    }

    const emailSent = await sendPdfDeliveryEmail({
      orderId: order.id,
      to: order.customer_email,
      name: order.customer_name,
      productName: product.name,
      downloadUrl
    });
    if (!emailSent) {
      await updateDeliveryStatus(order.id, "manual_required", {
        reason: "email_delivery_failed"
      });
      return;
    }
    await updateDeliveryStatus(order.id, "delivered", {
      download_url_expires_in_seconds: dayInSeconds
    });
    return;
  }

  if (product.delivery_type === "onboarding_email") {
    const emailSent = await sendOnboardingEmail({
      orderId: order.id,
      to: order.customer_email,
      name: order.customer_name,
      productName: product.name
    });
    if (!emailSent) {
      await updateDeliveryStatus(order.id, "manual_required", {
        reason: "email_delivery_failed"
      });
      return;
    }
    await updateDeliveryStatus(order.id, "delivered");
    return;
  }

  await updateDeliveryStatus(order.id, "manual_required", {
    reason: "manual_delivery_type"
  });
}
