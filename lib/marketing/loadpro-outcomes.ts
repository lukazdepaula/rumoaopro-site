import { recordWebhookEvent } from "@/lib/checkout/db";
import { getProductById, isLoadProProductId } from "@/lib/checkout/products";
import type { Order } from "@/lib/checkout/types";
import { isPreviewEnvironment } from "@/lib/preview-safety";
import { attributionStatus, normalizeMarketingAttribution } from "@/lib/marketing/attribution";

type LoadProOutcome = {
  type: "trial_started" | "payment_received";
  reference: string;
  amount: number;
  currency: string;
  occurredAt?: number;
};

// Internal billing facts, not advertising events. Only trusted webhook handlers
// call this function; the public analytics endpoint must never accept these types.
export async function recordLoadProOutcome(order: Order, outcome: LoadProOutcome) {
  if (!isLoadProProductId(order.product_id) || isPreviewEnvironment()) return;
  if (order.metadata.checkout_gateway_mode !== "live" || !["stripe", "mercado_pago"].includes(order.gateway)) return;
  if (!outcome.reference || !Number.isFinite(outcome.amount)) return;
  if (outcome.type === "payment_received" && outcome.amount <= 0) return;
  if (!/^[A-Z]{3}$/.test(outcome.currency)) return;

  const attribution = normalizeMarketingAttribution({
    consent: order.metadata.marketing_consent,
    utmSource: order.metadata.marketing_utm_source,
    utmMedium: order.metadata.marketing_utm_medium,
    utmCampaign: order.metadata.marketing_utm_campaign,
    utmContent: order.metadata.marketing_utm_content,
    utmTerm: order.metadata.marketing_utm_term,
    fbclid: order.metadata.marketing_fbclid,
    sessionId: order.metadata.marketing_session_id,
    landingAttributionId: order.metadata.marketing_landing_attribution_id
  });
  const timestamp = outcome.occurredAt;
  const occurredAt = typeof timestamp === "number" && Number.isFinite(timestamp) && timestamp > 0 && timestamp <= 8640000000000
    ? new Date(timestamp * 1000).toISOString()
    : new Date().toISOString();
  try {
    return await recordWebhookEvent("analytics", `loadpro:${outcome.type}:${order.gateway}:${outcome.reference}`, {
      type: outcome.type,
      schema_version: 1,
      source: "billing_webhook",
      order_id: order.id,
      provider_reference: outcome.reference,
      gateway: order.gateway,
      product_id: order.product_id,
      product_slug: getProductById(order.product_id)?.slug || order.product_id,
      locale: order.metadata.checkout_locale === "en" ? "en" : "pt",
      occurred_at: occurredAt,
      // A free trial is progress, not collected money or a paid conversion.
      amount: outcome.type === "trial_started" ? 0 : outcome.amount,
      currency: outcome.currency,
      session_id: attribution.sessionId || null,
      attribution: {
        consent: attribution.consent,
        status: attributionStatus(attribution),
        utm_source: attribution.utmSource || null,
        utm_medium: attribution.utmMedium || null,
        utm_campaign: attribution.utmCampaign || null,
        utm_content: attribution.utmContent || null,
        utm_term: attribution.utmTerm || null,
        landing_attribution_id: attribution.landingAttributionId || null
      }
    });
  } catch {
    // Billing, access and customer communications must not depend on analytics.
    // The original signed provider webhook remains the reconciliation source.
    console.error("[loadpro.outcome.storage]", outcome.type);
    return false;
  }
}
