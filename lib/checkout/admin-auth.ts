import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminPasswordHash } from "@/lib/checkout/admin-password";
import {
  getAdminAccountByEmail,
  type AdminAccountRecord
} from "@/lib/checkout/db";
import { isSameSiteRequest } from "@/lib/checkout/request-security";

export const ADMIN_COOKIE_NAME = "rap_admin_session";
export const ADMIN_MFA_PENDING_COOKIE_NAME = "rap_admin_mfa_pending";
export const ADMIN_MFA_RECOVERY_COOKIE_NAME = "rap_admin_mfa_recovery";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 4;
export const ADMIN_MFA_PENDING_MAX_AGE = 60 * 10;

type AdminSession = {
  email: string;
  expires: number;
  authVersion: string;
};

type PendingAdminMfaSession = {
  email: string;
  expires: number;
  authVersion: string;
  returnTo: string;
  setupSecret?: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function getAdminAccountSafely(email: string, context: string) {
  try {
    return await getAdminAccountByEmail(email);
  } catch (error) {
    console.error(`[admin.auth.${context}]`, error);
    return null;
  }
}

function adminSecret() {
  const configured = process.env.ADMIN_SESSION_SECRET?.trim();
  if (configured) return configured;

  return process.env.NODE_ENV === "production"
    ? null
    : "development-admin-session-secret";
}

function legacyAdminPassword() {
  return process.env.ADMIN_PASSWORD || null;
}

export function getAllowedAdminEmails() {
  const configured =
    process.env.ADMIN_LOGIN_EMAILS || process.env.ADMIN_EMAILS || "";

  return configured
    .split(/[;,\n]/)
    .map(normalizeEmail)
    .filter(Boolean);
}

export function isAllowedAdminEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  return getAllowedAdminEmails().some((allowedEmail) =>
    safeEqual(normalizedEmail, allowedEmail)
  );
}

export function isAdminAuthConfigured() {
  return Boolean(adminSecret() && getAllowedAdminEmails().length > 0);
}

function safeEqual(leftValue: string, rightValue: string) {
  const left = Buffer.from(leftValue);
  const right = Buffer.from(rightValue);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function sign(payload: string, purpose: "session" | "mfa-pending") {
  const secret = adminSecret();
  if (!secret) return null;
  return crypto
    .createHmac("sha256", secret)
    .update(`${purpose}:${payload}`)
    .digest("hex");
}

function legacyCredentialVersion() {
  const password = legacyAdminPassword();
  if (!password) return null;
  return `legacy:${crypto
    .createHash("sha256")
    .update(password)
    .digest("hex")
    .slice(0, 16)}`;
}

export async function verifyAdminCredentials(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const account = await getAdminAccountByEmail(normalizedEmail);
  if (account) {
    if (!account.active) return null;
    const passwordMatches = await verifyAdminPasswordHash(
      password,
      account.password_hash
    );
    return passwordMatches
      ? {
          email: normalizedEmail,
          authVersion: account.password_updated_at,
          usesIndividualPassword: true
        }
      : null;
  }

  if (!isAllowedAdminEmail(normalizedEmail)) return null;

  const configuredPassword = legacyAdminPassword();
  const version = legacyCredentialVersion();
  if (!configuredPassword || !version || !safeEqual(password, configuredPassword)) {
    return null;
  }

  return {
    email: normalizedEmail,
    authVersion: version,
    usesIndividualPassword: false
  };
}

export function adminAccountAuthVersion(account: AdminAccountRecord) {
  return `${account.password_updated_at}:${account.mfa_updated_at || "mfa-disabled"}`;
}

export function createAdminSessionValue(email: string, authVersion: string) {
  if (!adminSecret()) return null;

  const session: AdminSession = {
    email: normalizeEmail(email),
    expires: Date.now() + ADMIN_SESSION_MAX_AGE * 1000,
    authVersion
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = sign(payload, "session");

  return signature ? `${payload}.${signature}` : null;
}

function readSignedAdminSession(value?: string | null) {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload, "session");
  if (!expected || !safeEqual(signature, expected)) return null;

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as Partial<AdminSession>;

    if (
      typeof session.email !== "string" ||
      typeof session.expires !== "number" ||
      typeof session.authVersion !== "string" ||
      session.expires < Date.now()
    ) {
      return null;
    }

    const email = normalizeEmail(session.email);
    return { email, expires: session.expires, authVersion: session.authVersion };
  } catch {
    return null;
  }
}

export async function readAdminSession(value?: string | null) {
  const session = readSignedAdminSession(value);
  if (!session) return null;

  const account = await getAdminAccountSafely(session.email, "session_lookup");
  if (account) {
    const mfaEnabled = Boolean(
      account.mfa_enabled_at &&
        account.mfa_updated_at &&
        account.mfa_secret_encrypted
    );
    return account.active &&
      mfaEnabled &&
      safeEqual(session.authVersion, adminAccountAuthVersion(account))
      ? { email: session.email, expires: session.expires }
      : null;
  }

  return null;
}

export function createPendingAdminMfaValue(input: {
  email: string;
  authVersion: string;
  returnTo?: string;
  setupSecret?: string;
}) {
  if (!adminSecret()) return null;
  const safeReturnTo =
    input.returnTo?.startsWith("/admin") && !input.returnTo.startsWith("//")
      ? input.returnTo
      : "/admin";
  const session: PendingAdminMfaSession = {
    email: normalizeEmail(input.email),
    expires: Date.now() + ADMIN_MFA_PENDING_MAX_AGE * 1000,
    authVersion: input.authVersion,
    returnTo: safeReturnTo,
    ...(input.setupSecret ? { setupSecret: input.setupSecret } : {})
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = sign(payload, "mfa-pending");
  return signature ? `${payload}.${signature}` : null;
}

function readSignedPendingAdminMfa(value?: string | null) {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload, "mfa-pending");
  if (!expected || !safeEqual(signature, expected)) return null;

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as Partial<PendingAdminMfaSession>;
    if (
      typeof session.email !== "string" ||
      typeof session.expires !== "number" ||
      typeof session.authVersion !== "string" ||
      typeof session.returnTo !== "string" ||
      session.expires < Date.now()
    ) {
      return null;
    }
    const returnTo =
      session.returnTo.startsWith("/admin") &&
      !session.returnTo.startsWith("//")
        ? session.returnTo
        : "/admin";
    return {
      email: normalizeEmail(session.email),
      expires: session.expires,
      authVersion: session.authVersion,
      returnTo,
      setupSecret:
        typeof session.setupSecret === "string" ? session.setupSecret : undefined
    };
  } catch {
    return null;
  }
}

export async function readPendingAdminMfaSession(value?: string | null) {
  const session = readSignedPendingAdminMfa(value);
  if (!session) return null;

  const account = await getAdminAccountSafely(session.email, "mfa_session_lookup");
  if (account) {
    return account.active &&
      safeEqual(session.authVersion, account.password_updated_at)
      ? session
      : null;
  }

  const legacyVersion = legacyCredentialVersion();
  return legacyVersion &&
    isAllowedAdminEmail(session.email) &&
    safeEqual(session.authVersion, legacyVersion)
    ? session
    : null;
}

export async function isEligibleAdminEmail(email: string) {
  if (isAllowedAdminEmail(email)) return true;
  const account = await getAdminAccountSafely(email, "eligibility_lookup");
  return Boolean(account?.active);
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
    priority: "high" as const
  };
}

export function adminMfaPendingCookieOptions() {
  return {
    ...adminCookieOptions(),
    maxAge: ADMIN_MFA_PENDING_MAX_AGE
  };
}

export function adminMfaRecoveryCookieOptions() {
  return {
    ...adminCookieOptions(),
    maxAge: ADMIN_MFA_PENDING_MAX_AGE
  };
}

export async function requireAdmin(returnTo?: string) {
  const cookieStore = await cookies();
  const session = await readAdminSession(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value
  );

  if (!session) {
    const safeReturnTo =
      returnTo?.startsWith("/admin") && !returnTo.startsWith("//")
        ? returnTo
        : null;
    redirect(
      safeReturnTo
        ? `/admin/login?returnTo=${encodeURIComponent(safeReturnTo)}`
        : "/admin/login"
    );
  }
  return session;
}

export async function getAdminRequestSession(request: Request) {
  if (
    !["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase()) &&
    !isSameSiteRequest(request)
  ) {
    return null;
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${ADMIN_COOKIE_NAME}=`));

  const value = match
    ? decodeURIComponent(match.slice(`${ADMIN_COOKIE_NAME}=`.length))
    : null;
  return readAdminSession(value);
}

function requestCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(`${name}=`.length)) : null;
}

export async function getPendingAdminMfaRequestSession(request: Request) {
  if (
    !["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase()) &&
    !isSameSiteRequest(request)
  ) {
    return null;
  }
  return readPendingAdminMfaSession(
    requestCookie(request, ADMIN_MFA_PENDING_COOKIE_NAME)
  );
}

export async function requirePendingAdminMfa() {
  const cookieStore = await cookies();
  const session = await readPendingAdminMfaSession(
    cookieStore.get(ADMIN_MFA_PENDING_COOKIE_NAME)?.value
  );
  if (!session) redirect("/admin/login");
  return session;
}

export async function isAdminRequest(request: Request) {
  return Boolean(await getAdminRequestSession(request));
}
