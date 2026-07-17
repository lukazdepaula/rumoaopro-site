import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminPasswordHash } from "@/lib/checkout/admin-password";
import { getAdminAccountByEmail } from "@/lib/checkout/db";

export const ADMIN_COOKIE_NAME = "rap_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 4;

type AdminSession = {
  email: string;
  expires: number;
  authVersion: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
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

function sign(payload: string) {
  const secret = adminSecret();
  if (!secret) return null;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
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
  if (!isAllowedAdminEmail(normalizedEmail)) return null;

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

export function createAdminSessionValue(email: string, authVersion: string) {
  if (!adminSecret()) return null;

  const session: AdminSession = {
    email: normalizeEmail(email),
    expires: Date.now() + ADMIN_SESSION_MAX_AGE * 1000,
    authVersion
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = sign(payload);

  return signature ? `${payload}.${signature}` : null;
}

function readSignedAdminSession(value?: string | null) {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
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
    return isAllowedAdminEmail(email)
      ? { email, expires: session.expires, authVersion: session.authVersion }
      : null;
  } catch {
    return null;
  }
}

export async function readAdminSession(value?: string | null) {
  const session = readSignedAdminSession(value);
  if (!session) return null;

  const account = await getAdminAccountByEmail(session.email);
  if (account) {
    return account.active && safeEqual(session.authVersion, account.password_updated_at)
      ? { email: session.email, expires: session.expires }
      : null;
  }

  const legacyVersion = legacyCredentialVersion();
  return legacyVersion && safeEqual(session.authVersion, legacyVersion)
    ? { email: session.email, expires: session.expires }
    : null;
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

export async function requireAdmin() {
  const cookieStore = await cookies();
  const session = await readAdminSession(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value
  );

  if (!session) redirect("/admin/login");
  return session;
}

export async function getAdminRequestSession(request: Request) {
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

export async function isAdminRequest(request: Request) {
  return Boolean(await getAdminRequestSession(request));
}
