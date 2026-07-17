import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE_NAME = "rap_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 4;

type AdminSession = {
  email: string;
  expires: number;
  credentialVersion: string;
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

function adminPassword() {
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

export function isAdminAuthConfigured() {
  return Boolean(
    adminSecret() && adminPassword() && getAllowedAdminEmails().length > 0
  );
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

function credentialVersion() {
  const password = adminPassword();
  if (!password) return null;

  return crypto.createHash("sha256").update(password).digest("hex").slice(0, 16);
}

export function verifyAdminCredentials(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const configuredPassword = adminPassword();
  const allowedEmails = getAllowedAdminEmails();

  if (!configuredPassword || allowedEmails.length === 0) return null;

  const emailAllowed = allowedEmails.some((allowedEmail) =>
    safeEqual(normalizedEmail, allowedEmail)
  );
  const passwordMatches = safeEqual(password, configuredPassword);

  return emailAllowed && passwordMatches ? normalizedEmail : null;
}

export function createAdminSessionValue(email: string) {
  const version = credentialVersion();
  if (!adminSecret() || !version) return null;

  const session: AdminSession = {
    email: normalizeEmail(email),
    expires: Date.now() + ADMIN_SESSION_MAX_AGE * 1000,
    credentialVersion: version
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = sign(payload);

  return signature ? `${payload}.${signature}` : null;
}

export function readAdminSession(value?: string | null) {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  if (!expected || !safeEqual(signature, expected)) return null;

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as Partial<AdminSession>;
    const version = credentialVersion();

    if (
      typeof session.email !== "string" ||
      typeof session.expires !== "number" ||
      typeof session.credentialVersion !== "string" ||
      session.expires < Date.now() ||
      !version ||
      !safeEqual(session.credentialVersion, version)
    ) {
      return null;
    }

    const normalizedEmail = normalizeEmail(session.email);
    const emailAllowed = getAllowedAdminEmails().some((allowedEmail) =>
      safeEqual(normalizedEmail, allowedEmail)
    );

    return emailAllowed
      ? { email: normalizedEmail, expires: session.expires }
      : null;
  } catch {
    return null;
  }
}

export function isValidAdminSession(value?: string | null) {
  return Boolean(readAdminSession(value));
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
  const session = readAdminSession(cookieStore.get(ADMIN_COOKIE_NAME)?.value);

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export function isAdminRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE_NAME}=`));

  if (!cookie) return false;
  return isValidAdminSession(decodeURIComponent(cookie.split("=")[1] || ""));
}
