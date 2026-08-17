import { createHash } from "node:crypto";

export type MetaEventName =
  | "PageView"
  | "ViewContent"
  | "InitiateCheckout"
  | "StartTrial"
  | "Purchase"
  | "Contact";

export type MetaDataset = "rumoaopro" | "loadpro";

type MetaUserData = {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  country?: string | null;
  postalCode?: string | null;
  externalId?: string | null;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
};

export type MetaEventInput = {
  dataset: MetaDataset;
  eventName: MetaEventName;
  eventId: string;
  eventSourceUrl: string;
  eventTime?: number;
  userData?: MetaUserData;
  customData?: Record<string, unknown>;
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();
const normalizePhone = (value: string) => value.replace(/\D/g, "");
const normalizeName = (value: string) => value
  .trim()
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z]/g, "");
const normalizeCountry = (value: string) => value.trim().toLowerCase().replace(/[^a-z]/g, "");
const normalizePostalCode = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
const normalizeExternalId = (value: string) => value.trim().toLowerCase();

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function hashed(value: string | null | undefined, normalize: (value: string) => string) {
  if (!value) return undefined;
  const normalized = normalize(value);
  return normalized ? [hash(normalized)] : undefined;
}

function configuredMeta(dataset: MetaDataset) {
  const pixelId = dataset === "loadpro"
    ? (
        process.env.NEXT_PUBLIC_LOADPRO_META_PIXEL_ID ||
        process.env.NEXT_PUBLIC_META_PIXEL_ID
      )?.trim()
    : process.env.NEXT_PUBLIC_RUMOAOPRO_META_PIXEL_ID?.trim();
  const accessToken = dataset === "loadpro"
    ? (
        process.env.LOADPRO_META_CONVERSIONS_API_TOKEN ||
        process.env.META_CONVERSIONS_API_TOKEN
      )?.trim()
    : process.env.RUMOAOPRO_META_CONVERSIONS_API_TOKEN?.trim();
  if (!pixelId || !accessToken) return null;

  return {
    pixelId,
    accessToken,
    graphVersion: process.env.META_GRAPH_API_VERSION?.trim() || "v23.0",
    testEventCode: dataset === "loadpro"
      ? (
          process.env.LOADPRO_META_CONVERSIONS_API_TEST_EVENT_CODE ||
          process.env.META_CONVERSIONS_API_TEST_EVENT_CODE
        )?.trim()
      : process.env.RUMOAOPRO_META_CONVERSIONS_API_TEST_EVENT_CODE?.trim()
  };
}

export function marketingConsentGranted(value: unknown) {
  return value === true || value === "true" || value === "granted";
}

export async function sendMetaEvent(input: MetaEventInput) {
  const config = configuredMeta(input.dataset);
  if (!config) return { sent: false, reason: "not_configured" as const };

  const userData = input.userData || {};
  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: input.eventName,
        event_time: input.eventTime || Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        event_source_url: input.eventSourceUrl,
        action_source: "website",
        user_data: {
          em: hashed(userData.email, normalizeEmail),
          ph: hashed(userData.phone, normalizePhone),
          fn: hashed(userData.firstName, normalizeName),
          ln: hashed(userData.lastName, normalizeName),
          country: hashed(userData.country, normalizeCountry),
          zp: hashed(userData.postalCode, normalizePostalCode),
          external_id: hashed(userData.externalId, normalizeExternalId),
          client_ip_address: userData.clientIpAddress || undefined,
          client_user_agent: userData.clientUserAgent || undefined,
          fbp: userData.fbp || undefined,
          fbc: userData.fbc || undefined
        },
        custom_data: input.customData || undefined
      }
    ],
    access_token: config.accessToken
  };

  if (config.testEventCode) payload.test_event_code = config.testEventCode;

  try {
    const response = await fetch(
      `https://graph.facebook.com/${config.graphVersion}/${encodeURIComponent(config.pixelId)}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store"
      }
    );

    if (!response.ok) {
      console.error("[meta.capi]", response.status, await response.text());
      return { sent: false, reason: "provider_error" as const };
    }

    return { sent: true as const };
  } catch (error) {
    console.error("[meta.capi]", error);
    return { sent: false, reason: "network_error" as const };
  }
}
