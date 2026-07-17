import { NextResponse } from "next/server";
import { isAllowedAdminEmail } from "@/lib/checkout/admin-auth";
import {
  hashAdminPassword,
  hashAdminResetToken,
  passwordValidationError
} from "@/lib/checkout/admin-password";
import {
  consumeAdminPasswordResetToken,
  saveAdminAccountPassword
} from "@/lib/checkout/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resetRedirect(request: Request, token: string, error: string) {
  const url = new URL("/admin/reset-password", request.url);
  if (token) url.searchParams.set("token", token);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirmation = String(formData.get("confirm_password") || "");

  if (!token) return resetRedirect(request, "", "invalid");
  if (password !== confirmation) return resetRedirect(request, token, "mismatch");
  if (passwordValidationError(password)) {
    return resetRedirect(request, token, "password");
  }

  try {
    const passwordHash = await hashAdminPassword(password);
    const email = await consumeAdminPasswordResetToken(
      hashAdminResetToken(token)
    );

    if (!email || !isAllowedAdminEmail(email)) {
      return resetRedirect(request, "", "invalid");
    }

    await saveAdminAccountPassword(email, passwordHash);
    const response = NextResponse.redirect(
      new URL("/admin/login?reset=success", request.url),
      303
    );
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("[admin.password.reset]", error);
    return resetRedirect(request, "", "invalid");
  }
}
