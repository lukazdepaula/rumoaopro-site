import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { sendLoadProPasswordRecovery } from "@/lib/checkout/loadpro";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RecoveryAttempt = { requests: number; resetAt: number };

const MAX_REQUESTS = 3;
const WINDOW_MS = 60 * 60 * 1000;
const globalRecoveryAttempts = globalThis as typeof globalThis & {
  loadProRecoveryAttempts?: Map<string, RecoveryAttempt>;
};
const recoveryAttempts =
  globalRecoveryAttempts.loadProRecoveryAttempts || new Map<string, RecoveryAttempt>();
globalRecoveryAttempts.loadProRecoveryAttempts = recoveryAttempts;

function configuredOrigin() {
  try {
    return new URL(
      process.env.LOADPRO_APP_URL || "https://loadpro.rumoaopro.com.br"
    ).origin;
  } catch {
    return "https://loadpro.rumoaopro.com.br";
  }
}

function allowedOrigin(request: Request) {
  const origin = request.headers.get("origin") || "";
  return origin === configuredOrigin() ? origin : null;
}

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
    Vary: "Origin"
  };
}

function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function requestKey(request: Request, email: string) {
  return crypto
    .createHash("sha256")
    .update(`${clientIp(request)}:${email}`)
    .digest("hex");
}

function canRequestRecovery(request: Request, email: string) {
  const now = Date.now();
  const key = requestKey(request, email);
  const attempt = recoveryAttempts.get(key);
  if (!attempt || attempt.resetAt <= now) {
    recoveryAttempts.set(key, { requests: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (attempt.requests >= MAX_REQUESTS) return false;
  attempt.requests += 1;
  recoveryAttempts.set(key, attempt);
  return true;
}

function genericResponse(origin: string) {
  return NextResponse.json(
    { ok: true },
    { status: 200, headers: corsHeaders(origin) }
  );
}

export async function OPTIONS(request: Request) {
  const origin = allowedOrigin(request);
  if (!origin) return new NextResponse(null, { status: 403 });
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request: Request) {
  const origin = allowedOrigin(request);
  if (!origin) return NextResponse.json({ ok: false }, { status: 403 });

  let email = "";
  let locale: "pt" | "en" = "pt";
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    email = String(payload.email || "").trim().toLowerCase();
    locale = payload.locale === "en" ? "en" : "pt";
  } catch {
    return genericResponse(origin);
  }

  if (!/^\S+@\S+\.\S+$/.test(email) || !canRequestRecovery(request, email)) {
    return genericResponse(origin);
  }

  try {
    await sendLoadProPasswordRecovery({ email, locale });
  } catch (error) {
    console.error("[loadpro.auth.recovery]", error);
  }

  // Always return the same response so this public endpoint cannot be used to
  // discover which email addresses have a LoadPro account.
  return genericResponse(origin);
}
