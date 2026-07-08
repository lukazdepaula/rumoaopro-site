import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE_NAME = "rap_admin_session";

function adminSecret() {
  return process.env.ADMIN_SESSION_SECRET || "development-admin-session-secret";
}

function adminPassword() {
  return process.env.ADMIN_PASSWORD;
}

function sign(payload: string) {
  return crypto.createHmac("sha256", adminSecret()).update(payload).digest("hex");
}

export function createAdminSessionValue() {
  const expires = Date.now() + 1000 * 60 * 60 * 8;
  const payload = String(expires);
  return `${payload}.${sign(payload)}`;
}

export function isValidAdminSession(value?: string | null) {
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature) return false;
  if (Number(expires) < Date.now()) return false;

  const expected = sign(expires);
  const left = Buffer.from(signature, "hex");
  const right = Buffer.from(expected, "hex");

  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function verifyAdminPassword(password: string) {
  const configured = adminPassword();
  if (!configured) return false;

  const left = Buffer.from(password);
  const right = Buffer.from(configured);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!isValidAdminSession(session)) {
    redirect("/admin/login");
  }
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
