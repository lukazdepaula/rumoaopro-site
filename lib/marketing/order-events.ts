import type { Order } from "@/lib/checkout/types";
import { appendOrderLog } from "@/lib/checkout/db";
import { getProductById } from "@/lib/checkout/products";
import {
  marketingConsentGranted,
  sendMetaEvent,
  type MetaDataset
} from "@/lib/marketing/meta";

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://rumoaopro.com"
  ).replace(/\/$/, "");
}

function orderMetaText(order: Order, field: string) {
  const value = order.metadata[field];
  return typeof value === "string" && value ? value : undefined;
}

function datasetForOrder(order: Order): MetaDataset {
  return order.product_id === "loadpro_founders" ? "loadpro" : "rumoaopro";
}

function productSlug(order: Order) {
  return getProductById(order.product_id)?.slug || order.product_id;
}

function userData(order: Order) {
  const nameParts = order.customer_name.trim().split(/\s+/).filter(Boolean);
  return {
    email: order.customer_email,
    phone: order.customer_whatsapp,
    firstName: nameParts[0],
    lastName: nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined,
    country: order.customer_country,
    postalCode: order.customer_postal_code,
    externalId: order.id,
    clientIpAddress: orderMetaText(order, "marketing_client_ip_address"),
    clientUserAgent: orderMetaText(order, "marketing_client_user_agent"),
    fbp: orderMetaText(order, "marketing_fbp"),
    fbc: orderMetaText(order, "marketing_fbc")
  };
}

async function recordMetaResult(
  order: Order,
  eventName: "StartTrial" | "Purchase",
  eventId: string,
  result: Awaited<ReturnType<typeof sendMetaEvent>>
) {
  try {
    await appendOrderLog(
      order.id,
      result.sent ? "marketing.meta.sent" : "marketing.meta.failed",
      result.sent
        ? `${eventName} enviado à Meta com sucesso.`
        : `${eventName} não foi enviado à Meta.`,
      {
        event_name: eventName,
        event_id: eventId,
        dataset: datasetForOrder(order),
        sent: result.sent,
        reason: "reason" in result ? result.reason : null
      }
    );
  } catch (error) {
    console.error("[meta.capi.audit]", error);
  }
}

function eventSourceUrl(order: Order) {
  return `${siteUrl()}/checkout/success?order_id=${encodeURIComponent(order.id)}`;
}

export async function trackMetaStartTrial(order: Order) {
  if (order.product_id !== "loadpro_founders") return;
  if (!marketingConsentGranted(order.metadata.marketing_consent)) return;

  const eventId = `start_trial:${order.id}`;
  const result = await sendMetaEvent({
    dataset: "loadpro",
    eventName: "StartTrial",
    eventId,
    eventSourceUrl: eventSourceUrl(order),
    userData: userData(order),
    customData: {
      content_name: order.product_name,
      content_ids: ["loadpro-founders"],
      content_type: "product",
      currency: order.currency,
      value: order.amount
    }
  });
  await recordMetaResult(order, "StartTrial", eventId, result);
}

export async function trackMetaPurchase(
  order: Order,
  options: {
    eventId?: string;
    amount?: number;
    currency?: string;
  } = {}
) {
  const amount = options.amount ?? order.amount;
  if (amount <= 0) return;
  if (!marketingConsentGranted(order.metadata.marketing_consent)) return;

  const slug = productSlug(order);
  const eventId = options.eventId || `purchase:${order.id}`;
  const result = await sendMetaEvent({
    dataset: datasetForOrder(order),
    eventName: "Purchase",
    eventId,
    eventSourceUrl: eventSourceUrl(order),
    userData: userData(order),
    customData: {
      content_name: order.product_name,
      content_ids: [slug],
      content_type: "product",
      currency: options.currency || order.currency,
      value: amount
    }
  });
  await recordMetaResult(order, "Purchase", eventId, result);
}
