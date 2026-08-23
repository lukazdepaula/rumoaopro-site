import crypto from "node:crypto";

export const CHECKOUT_ACCESS_COOKIE_NAME = "rap_checkout_access";

const CHECKOUT_ACCESS_TTL_SECONDS = 60 * 60 * 24;
const CHECKOUT_ACCESS_PURPOSE = "checkout-access:v1";

function checkoutAccessSecret() {
  const configured = process.env.CHECKOUT_ACCESS_SECRET?.trim();
  if (configured) return configured;

  if (process.env.NODE_ENV === "production") return null;

  return "development-checkout-access-secret";
}

function signature(orderId: string, expires: number) {
  const secret = checkoutAccessSecret();
  if (!secret) return null;

  return crypto
    .createHmac("sha256", secret)
    .update(`${CHECKOUT_ACCESS_PURPOSE}.${orderId}.${expires}`)
    .digest("hex");
}

export function isCheckoutAccessConfigured() {
  return Boolean(checkoutAccessSecret());
}

export function createCheckoutAccessToken(orderId: string) {
  const expires = Math.floor(Date.now() / 1000) + CHECKOUT_ACCESS_TTL_SECONDS;
  const signed = signature(orderId, expires);
  return signed ? `${expires}.${signed}` : null;
}

export function verifyCheckoutAccessToken(
  orderId: string,
  token?: string | null
) {
  if (!orderId || orderId.length > 128 || !token || token.length > 256) {
    return false;
  }

  const [expiresText, provided, extra] = token.split(".");
  if (!expiresText || !provided || extra || !/^[a-f0-9]{64}$/i.test(provided)) {
    return false;
  }

  const expires = Number(expiresText);
  if (!Number.isSafeInteger(expires)) return false;
  if (expires < Math.floor(Date.now() / 1000)) return false;

  const expected = signature(orderId, expires);
  if (!expected) return false;

  const left = Buffer.from(provided, "hex");
  const right = Buffer.from(expected, "hex");
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function createCheckoutReturnUrl(
  siteUrl: string,
  orderId: string,
  options: { locale?: "en" | "pt"; token?: string } = {}
) {
  const token = options.token || createCheckoutAccessToken(orderId);
  if (!token) return null;

  const url = new URL("/api/checkout/return", siteUrl);
  url.searchParams.set("order_id", orderId);
  url.searchParams.set("token", token);
  if (options.locale === "en") url.searchParams.set("locale", "en");
  return url.toString();
}

export function checkoutAccessCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CHECKOUT_ACCESS_TTL_SECONDS,
    priority: "high" as const
  };
}
