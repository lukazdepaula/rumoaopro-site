import { NextResponse } from "next/server";
import {
  ADMIN_MFA_RECOVERY_COOKIE_NAME,
  adminMfaRecoveryCookieOptions,
  getAdminRequestSession
} from "@/lib/checkout/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getAdminRequestSession(request);
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  const response = NextResponse.redirect(
    new URL("/admin/account?mfa=enabled", request.url),
    303
  );
  response.cookies.set({
    name: ADMIN_MFA_RECOVERY_COOKIE_NAME,
    value: "",
    ...adminMfaRecoveryCookieOptions(),
    maxAge: 0
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
