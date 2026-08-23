import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_MFA_PENDING_COOKIE_NAME,
  ADMIN_MFA_RECOVERY_COOKIE_NAME,
  adminAccountAuthVersion,
  adminCookieOptions,
  adminMfaPendingCookieOptions,
  adminMfaRecoveryCookieOptions,
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
  createAdminRecoveryDisplayValue,
  encryptAdminMfaValue,
  generateAdminRecoveryCodes,
  hashAdminRecoveryCode,
  verifyAdminTotp
} from "@/lib/checkout/admin-mfa";
import { logAdminSecurityEvent } from "@/lib/checkout/admin-security-log";
import {
  consumeAdminMfaStep,
  getAdminAccountByEmail,
  saveAdminMfaSetup
} from "@/lib/checkout/db";
import { readUrlEncodedForm } from "@/lib/checkout/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function setupRedirect(request: Request, error: string) {
  return NextResponse.redirect(
    new URL(`/admin/mfa/setup?error=${encodeURIComponent(error)}`, request.url),
    303
  );
}

export async function POST(request: Request) {
  const session = await getPendingAdminMfaRequestSession(request);
  if (!session?.setupSecret) {
    const existingSession = await getAdminRequestSession(request);
    return NextResponse.redirect(
      new URL(
        existingSession ? "/admin/mfa/recovery-codes" : "/admin/login",
        request.url
      ),
      303
    );
  }

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > 4 * 1024) return setupRedirect(request, "invalid");

  const account = await getAdminAccountByEmail(session.email);
  if (!account) return setupRedirect(request, "unavailable");
  if (account.mfa_enabled_at) {
    return NextResponse.redirect(new URL("/admin/mfa", request.url), 303);
  }

  const rateLimit = checkAdminMfaRateLimit(request, session.email);
  if (!rateLimit.allowed) {
    logAdminSecurityEvent("mfa_rate_limited", session.email);
    const response = setupRedirect(request, "rate-limit");
    response.headers.set("Retry-After", String(rateLimit.retryAfterSeconds));
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  const parsedForm = await readUrlEncodedForm(request, 4 * 1024);
  if (!parsedForm.ok) return setupRedirect(request, "invalid");
  const code = String(parsedForm.form.get("code") || "");
  const step = verifyAdminTotp(session.setupSecret, code);
  if (step === null) {
    recordAdminMfaFailure(request, session.email);
    logAdminSecurityEvent("mfa_failed", session.email);
    return setupRedirect(request, "invalid");
  }

  const encryptedSecret = encryptAdminMfaValue(session.setupSecret);
  const recoveryCodes = generateAdminRecoveryCodes();
  const recoveryHashes = recoveryCodes
    .map(hashAdminRecoveryCode)
    .filter((value): value is string => Boolean(value));
  const recoveryDisplay = createAdminRecoveryDisplayValue(recoveryCodes);
  if (
    !encryptedSecret ||
    recoveryHashes.length !== recoveryCodes.length ||
    !recoveryDisplay
  ) {
    return setupRedirect(request, "unavailable");
  }

  try {
    const savedAccount = await saveAdminMfaSetup({
      email: session.email,
      encryptedSecret,
      recoveryCodeHashes: recoveryHashes
    });
    if (!savedAccount) return setupRedirect(request, "unavailable");
    const verifiedAccount = await consumeAdminMfaStep(session.email, step);
    if (!verifiedAccount) return setupRedirect(request, "unavailable");

    const sessionValue = createAdminSessionValue(
      verifiedAccount.email,
      adminAccountAuthVersion(verifiedAccount)
    );
    if (!sessionValue) return setupRedirect(request, "unavailable");

    clearAdminMfaFailures(request, session.email);
    logAdminSecurityEvent("mfa_enrolled", session.email);
    const response = NextResponse.redirect(
      new URL("/admin/mfa/recovery-codes", request.url),
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
    response.cookies.set({
      name: ADMIN_MFA_RECOVERY_COOKIE_NAME,
      value: recoveryDisplay,
      ...adminMfaRecoveryCookieOptions()
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("[admin.mfa.setup]", error);
    return setupRedirect(request, "unavailable");
  }
}
