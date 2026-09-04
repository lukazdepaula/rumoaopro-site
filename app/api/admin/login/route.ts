import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_MFA_PENDING_COOKIE_NAME,
  adminCookieOptions,
  adminMfaPendingCookieOptions,
  createPendingAdminMfaValue,
  isAdminAuthConfigured,
  verifyAdminCredentials
} from "@/lib/checkout/admin-auth";
import { hashAdminPassword } from "@/lib/checkout/admin-password";
import {
  generateAdminMfaSecret,
  isAdminMfaConfigured
} from "@/lib/checkout/admin-mfa";
import { logAdminSecurityEvent } from "@/lib/checkout/admin-security-log";
import {
  checkAdminLoginRateLimit,
  clearAdminLoginFailures,
  recordAdminLoginFailure
} from "@/lib/checkout/admin-login-rate-limit";
import {
  getAdminAccountByEmail,
  saveAdminAccountPassword
} from "@/lib/checkout/db";
import {
  isSameSiteRequest,
  readUrlEncodedForm
} from "@/lib/checkout/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authenticateAdmin(email: string, password: string) {
  const authorizedAdmin = await verifyAdminCredentials(email, password);
  if (!authorizedAdmin) return { state: "invalid" as const };

  let account = await getAdminAccountByEmail(authorizedAdmin.email);
  if (!authorizedAdmin.usesIndividualPassword) {
    const passwordHash = await hashAdminPassword(password);
    account = await saveAdminAccountPassword(authorizedAdmin.email, passwordHash);
  }

  return account
    ? { state: "ready" as const, account }
    : { state: "unavailable" as const };
}

export async function POST(request: Request) {
  if (!isSameSiteRequest(request)) {
    return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > 8 * 1024) {
    return NextResponse.json({ error: "Solicitação muito grande." }, { status: 413 });
  }

  const parsedForm = await readUrlEncodedForm(request, 8 * 1024);
  if (!parsedForm.ok) {
    return NextResponse.json(
      { error: parsedForm.tooLarge ? "Solicitação muito grande." : "Solicitação inválida." },
      { status: parsedForm.tooLarge ? 413 : 400 }
    );
  }
  const email = String(parsedForm.form.get("email") || "").trim().toLowerCase();
  const password = String(parsedForm.form.get("password") || "");
  const requestedReturnTo = String(parsedForm.form.get("returnTo") || "");
  const safeReturnTo =
    requestedReturnTo.startsWith("/admin") && !requestedReturnTo.startsWith("//")
      ? requestedReturnTo
      : "/admin";
  const redirectTo = new URL(safeReturnTo, request.url);

  const redirectToLogin = (error: "invalid" | "rate-limit" | "unavailable") => {
    redirectTo.pathname = "/admin/login";
    redirectTo.search = "";
    redirectTo.searchParams.set("error", error);
    if (safeReturnTo !== "/admin") {
      redirectTo.searchParams.set("returnTo", safeReturnTo);
    }
  };

  if (!isAdminAuthConfigured() || !isAdminMfaConfigured()) {
    console.error("[admin.login] Variáveis de autenticação incompletas.");
    redirectToLogin("unavailable");
    return NextResponse.redirect(redirectTo, 303);
  }

  const rateLimit = checkAdminLoginRateLimit(request, email);
  if (!rateLimit.allowed) {
    logAdminSecurityEvent("password_rate_limited", email);
    redirectToLogin("rate-limit");
    const response = NextResponse.redirect(redirectTo, 303);
    response.headers.set("Retry-After", String(rateLimit.retryAfterSeconds));
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  let authentication: Awaited<ReturnType<typeof authenticateAdmin>>;
  try {
    authentication = await authenticateAdmin(email, password);
  } catch (error) {
    console.error("[admin.login.provider]", error);
    redirectToLogin("unavailable");
    const response = NextResponse.redirect(redirectTo, 303);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  if (authentication.state === "invalid") {
    recordAdminLoginFailure(request, email);
    logAdminSecurityEvent("password_failed", email);
    redirectToLogin("invalid");
    const response = NextResponse.redirect(redirectTo, 303);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  if (authentication.state === "unavailable") {
    redirectToLogin("unavailable");
    return NextResponse.redirect(redirectTo, 303);
  }
  const account = authentication.account;

  const mfaEnabled = Boolean(
    account.mfa_enabled_at &&
      account.mfa_updated_at &&
      account.mfa_secret_encrypted
  );
  const pendingValue = createPendingAdminMfaValue({
    email: account.email,
    authVersion: account.password_updated_at,
    returnTo: safeReturnTo,
    setupSecret: mfaEnabled ? undefined : generateAdminMfaSecret()
  });
  if (!pendingValue) {
    redirectToLogin("unavailable");
    return NextResponse.redirect(redirectTo, 303);
  }

  clearAdminLoginFailures(request, email);
  logAdminSecurityEvent("password_verified", account.email);
  redirectTo.pathname = mfaEnabled ? "/admin/mfa" : "/admin/mfa/setup";
  redirectTo.search = "";
  const response = NextResponse.redirect(redirectTo, 303);
  response.cookies.set({
    name: ADMIN_MFA_PENDING_COOKIE_NAME,
    value: pendingValue,
    ...adminMfaPendingCookieOptions()
  });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    ...adminCookieOptions(),
    maxAge: 0
  });
  response.headers.set("Cache-Control", "no-store");

  return response;
}
