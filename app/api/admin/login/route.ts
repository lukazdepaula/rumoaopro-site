import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  createAdminSessionValue,
  isAdminAuthConfigured,
  verifyAdminCredentials
} from "@/lib/checkout/admin-auth";
import {
  checkAdminLoginRateLimit,
  clearAdminLoginFailures,
  recordAdminLoginFailure
} from "@/lib/checkout/admin-login-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const redirectTo = new URL("/admin", request.url);

  if (!isAdminAuthConfigured()) {
    console.error("[admin.login] Variáveis de autenticação incompletas.");
    redirectTo.pathname = "/admin/login";
    redirectTo.searchParams.set("error", "unavailable");
    return NextResponse.redirect(redirectTo, 303);
  }

  const rateLimit = checkAdminLoginRateLimit(request, email);
  if (!rateLimit.allowed) {
    redirectTo.pathname = "/admin/login";
    redirectTo.searchParams.set("error", "rate-limit");
    const response = NextResponse.redirect(redirectTo, 303);
    response.headers.set("Retry-After", String(rateLimit.retryAfterSeconds));
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  const authorizedAdmin = await verifyAdminCredentials(email, password);
  if (!authorizedAdmin) {
    recordAdminLoginFailure(request, email);
    redirectTo.pathname = "/admin/login";
    redirectTo.searchParams.set("error", "invalid");
    const response = NextResponse.redirect(redirectTo, 303);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  const sessionValue = createAdminSessionValue(
    authorizedAdmin.email,
    authorizedAdmin.authVersion
  );
  if (!sessionValue) {
    redirectTo.pathname = "/admin/login";
    redirectTo.searchParams.set("error", "unavailable");
    return NextResponse.redirect(redirectTo, 303);
  }

  clearAdminLoginFailures(request, email);
  const response = NextResponse.redirect(redirectTo, 303);
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: sessionValue,
    ...adminCookieOptions()
  });
  response.headers.set("Cache-Control", "no-store");

  return response;
}
