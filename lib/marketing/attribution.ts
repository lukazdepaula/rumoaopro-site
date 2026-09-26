import type { MarketingAttributionInput } from "@/lib/checkout/types";

const text = (value: unknown, limit: number) =>
  typeof value === "string" ? value.trim().slice(0, limit) || undefined : undefined;

export function attributionId(value: unknown) {
  const id = text(value, 100);
  return id && /^[a-zA-Z0-9_-]+$/.test(id) ? id : undefined;
}

// Do not persist checkout access tokens, emails or arbitrary URL parameters.
export function marketingLandingUrl(value: unknown) {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return undefined;
    const allowed = new Set(["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "lp_attribution_id"]);
    for (const key of [...url.searchParams.keys()]) {
      if (!allowed.has(key)) url.searchParams.delete(key);
    }
    url.hash = "";
    return url.toString().slice(0, 500);
  } catch {
    return undefined;
  }
}

export function normalizeMarketingAttribution(value: unknown): MarketingAttributionInput {
  const data = value && typeof value === "object" ? value as Record<string, unknown> : {};
  // Apply consent on the server too, not just in the browser.
  if (data.consent !== "granted") return { consent: "denied" };
  return {
    consent: "granted",
    landingUrl: marketingLandingUrl(data.landingUrl),
    utmSource: text(data.utmSource, 180),
    utmMedium: text(data.utmMedium, 180),
    utmCampaign: text(data.utmCampaign, 180),
    utmContent: text(data.utmContent, 180),
    utmTerm: text(data.utmTerm, 180),
    fbclid: text(data.fbclid, 240),
    fbp: text(data.fbp, 240),
    fbc: text(data.fbc, 240),
    sessionId: attributionId(data.sessionId),
    landingAttributionId: attributionId(data.landingAttributionId)
  };
}

export function attributionStatus(value: MarketingAttributionInput) {
  if (value.consent !== "granted") return "consent_denied" as const;
  if (value.utmCampaign) return "campaign_identified" as const;
  if (value.utmSource || value.fbclid || value.fbc) return "source_only" as const;
  return "unidentified" as const;
}
