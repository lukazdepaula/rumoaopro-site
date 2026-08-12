import type { Order } from "@/lib/checkout/types";
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
  return {
    email: order.customer_email,
    phone: order.customer_whatsapp,
    externalId: order.id,
    fbp: orderMetaText(order, "marketing_fbp"),
    fbc: orderMetaText(order, "marketing_fbc")
  };
}

function eventSourceUrl(order: Order) {
  return `${siteUrl()}/checkout/success?order_id=${encodeURIComponent(order.id)}`;
}

export async function trackMetaStartTrial(order: Order) {
  if (order.product_id !== "loadpro_founders") return;
  if (!marketingConsentGranted(order.metadata.marketing_consent)) return;

  await sendMetaEvent({
    dataset: "loadpro",
    eventName: "StartTrial",
    eventId: `start_trial:${order.id}`,
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
  await sendMetaEvent({
    dataset: datasetForOrder(order),
    eventName: "Purchase",
    eventId: options.eventId || `purchase:${order.id}`,
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
}
