import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  createAdminSessionValue,
  getAdminRequestSession,
  verifyAdminCredentials
} from "@/lib/checkout/admin-auth";
import {
  hashAdminPassword,
  passwordValidationError
} from "@/lib/checkout/admin-password";
import { saveAdminAccountPassword } from "@/lib/checkout/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function accountRedirect(request: Request, error: string) {
  return NextResponse.redirect(
    new URL(`/admin/account?error=${error}`, request.url),
    303
  );
}

export async function POST(request: Request) {
  const session = await getAdminRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const currentPassword = String(formData.get("current_password") || "");
  const password = String(formData.get("password") || "");
  const confirmation = String(formData.get("confirm_password") || "");

  const currentCredentials = await verifyAdminCredentials(
    session.email,
    currentPassword
  );
  if (!currentCredentials) return accountRedirect(request, "current");
  if (password !== confirmation) return accountRedirect(request, "mismatch");
  if (passwordValidationError(password)) {
    return accountRedirect(request, "password");
  }

  const passwordHash = await hashAdminPassword(password);
  const account = await saveAdminAccountPassword(session.email, passwordHash);
  if (!account) return accountRedirect(request, "password");

  const sessionValue = createAdminSessionValue(
    session.email,
    account.password_updated_at
  );
  if (!sessionValue) return accountRedirect(request, "password");

  const response = NextResponse.redirect(
    new URL("/admin/account?updated=1", request.url),
    303
  );
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: sessionValue,
    ...adminCookieOptions()
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
