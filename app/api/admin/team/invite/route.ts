import { NextResponse } from "next/server";
import { getAdminRequestSession } from "@/lib/checkout/admin-auth";
import { createAdminResetToken, hashAdminResetToken } from "@/lib/checkout/admin-password";
import { createAdminPasswordResetToken } from "@/lib/checkout/db";
import { sendAdminPasswordResetEmail } from "@/lib/checkout/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getAdminRequestSession(request);
  const redirectUrl = new URL("/admin/team", request.url);
  if (!session) return NextResponse.redirect(new URL("/admin/login", request.url), 303);

  const formData = await request.formData();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirectUrl.searchParams.set("error", "email");
    return NextResponse.redirect(redirectUrl, 303);
  }

  try {
    const token = createAdminResetToken();
    await createAdminPasswordResetToken({
      email,
      tokenHash: hashAdminResetToken(token),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    });
    const resetUrl = new URL("/admin/reset-password", request.url);
    resetUrl.searchParams.set("token", token);
    await sendAdminPasswordResetEmail({ to: email, resetUrl: resetUrl.toString() });
    redirectUrl.searchParams.set("invited", "1");
  } catch (error) {
    console.error("[admin.team.invite]", error);
    redirectUrl.searchParams.set("error", "send");
  }

  return NextResponse.redirect(redirectUrl, 303);
}
