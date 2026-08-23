import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_MFA_PENDING_COOKIE_NAME,
  adminAccountAuthVersion,
  adminCookieOptions,
  adminMfaPendingCookieOptions,
  createAdminSessionValue,
  getAdminRequestSession,
  getPendingAdminMfaRequestSession
} from "@/lib/checkout/admin-auth";
import {
  checkAdminMfaRateLimit,
  clearAdminMfaFailures,
  recordAdminMfaFailure
} from "@/lib/checkout/admin-login-rate-limit";
import {
  decryptAdminMfaValue,
  hashAdminRecoveryCode,
  verifyAdminTotp
} from "@/lib/checkout/admin-mfa";
import { logAdminSecurityEvent } from "@/lib/checkout/admin-security-log";
import {
  consumeAdminMfaRecoveryCode,
  consumeAdminMfaStep,
  getAdminAccountByEmail
} from "@/lib/checkout/db";
import { readUrlEncodedForm } from "@/lib/checkout/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function challengeRedirect(request: Request, error: string) {
  return NextResponse.redirect(
    new URL(`/admin/mfa?error=${encodeURIComponent(error)}`, request.url),
    303
  );
}

export async function POST(request: Request) {
  const session = await getPendingAdminMfaRequestSession(request);
  if (!session) {
    const existingSession = await getAdminRequestSession(request);
    return NextResponse.redirect(
      new URL(existingSession ? "/admin" : "/admin/login", request.url),
      303
    );
  }

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > 4 * 1024) {
    return challengeRedirect(request, "invalid");
  }

  const rateLimit = checkAdminMfaRateLimit(request, session.email);
  if (!rateLimit.allowed) {
    logAdminSecurityEvent("mfa_rate_limited", session.email);
    const response = challengeRedirect(request, "rate-limit");
    response.headers.set("Retry-After", String(rateLimit.retryAfterSeconds));
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  const parsedForm = await readUrlEncodedForm(request, 4 * 1024);
  if (!parsedForm.ok) return challengeRedirect(request, "invalid");
  const code = String(parsedForm.form.get("code") || "").trim();
  const account = await getAdminAccountByEmail(session.email);
  if (!account?.mfa_secret_encrypted || !account.mfa_enabled_at) {
    return challengeRedirect(request, "unavailable");
  }

  let verifiedAccount = null;
  let usedRecoveryCode = false;
  const secret = decryptAdminMfaValue(account.mfa_secret_encrypted);
  const step = secret ? verifyAdminTotp(secret, code) : null;

  if (step !== null) {
    verifiedAccount = await consumeAdminMfaStep(session.email, step);
  } else {
    const recoveryHash = hashAdminRecoveryCode(code);
    if (recoveryHash) {
      usedRecoveryCode = await consumeAdminMfaRecoveryCode(
        session.email,
        recoveryHash
      );
      if (usedRecoveryCode) {
        verifiedAccount = await getAdminAccountByEmail(session.email);
      }
    }
  }

  if (!verifiedAccount) {
    recordAdminMfaFailure(request, session.email);
    logAdminSecurityEvent("mfa_failed", session.email);
    const response = challengeRedirect(request, "invalid");
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  const sessionValue = createAdminSessionValue(
    verifiedAccount.email,
    adminAccountAuthVersion(verifiedAccount)
  );
  if (!sessionValue) return challengeRedirect(request, "unavailable");

  clearAdminMfaFailures(request, session.email);
  logAdminSecurityEvent(
    usedRecoveryCode ? "recovery_code_used" : "mfa_verified",
    session.email
  );
  const response = NextResponse.redirect(
    new URL(session.returnTo, request.url),
    303
  );
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: sessionValue,
    ...adminCookieOptions()
  });
  response.cookies.set({
    name: ADMIN_MFA_PENDING_COOKIE_NAME,
    value: "",
    ...adminMfaPendingCookieOptions(),
    maxAge: 0
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
