import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/checkout/db";

export const CUSTOMER_COOKIE_NAME = "rap_customer_session";

function customerSecret() {
  return (
    process.env.CUSTOMER_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    "development-customer-session-secret"
  );
}

function sign(payload: string) {
  return crypto
    .createHmac("sha256", customerSecret())
    .update(payload)
    .digest("hex");
}

export function createCustomerSessionValue(userId: string) {
  const expires = Date.now() + 1000 * 60 * 60 * 24 * 30;
  const payload = `${userId}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function isValidCustomerSession(value?: string | null) {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;

  const [userId, expires, signature] = parts;
  if (!userId || !expires || !signature) return null;
  if (Number(expires) < Date.now()) return null;

  const payload = `${userId}.${expires}`;
  const expected = sign(payload);
  const left = Buffer.from(signature, "hex");
  const right = Buffer.from(expected, "hex");

  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
    return null;
  }

  return { userId, expires: Number(expires) };
}

export async function getCustomerSession() {
  const cookieStore = await cookies();
  const session = isValidCustomerSession(
    cookieStore.get(CUSTOMER_COOKIE_NAME)?.value
  );

  if (!session) return null;

  const user = await getUserById(session.userId);
  return user ? { user } : null;
}

export async function requireCustomer() {
  const session = await getCustomerSession();

  if (!session) {
    redirect("/login");
  }

  return session.user;
}

export function customerCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  };
}
