import { NextResponse } from "next/server";
import { isAllowedAdminEmail } from "@/lib/checkout/admin-auth";
import {
  createAdminResetToken,
  hashAdminResetToken
} from "@/lib/checkout/admin-password";
import {
  checkAdminResetRateLimit,
  recordAdminResetRequest
} from "@/lib/checkout/admin-login-rate-limit";
import { createAdminPasswordResetToken } from "@/lib/checkout/db";
import { sendAdminPasswordResetEmail } from "@/lib/checkout/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const redirectUrl = new URL("/admin/forgot-password?sent=1", request.url);

  if (
    email.includes("@") &&
    isAllowedAdminEmail(email) &&
    checkAdminResetRateLimit(request, email)
  ) {
    try {
      recordAdminResetRequest(request, email);
      const token = createAdminResetToken();
      await createAdminPasswordResetToken({
        email,
        tokenHash: hashAdminResetToken(token),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      });

      const resetUrl = new URL("/admin/reset-password", request.url);
      resetUrl.searchParams.set("token", token);
      await sendAdminPasswordResetEmail({ to: email, resetUrl: resetUrl.toString() });
    } catch (error) {
      console.error("[admin.password.request]", error);
    }
  }

  const response = NextResponse.redirect(redirectUrl, 303);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
