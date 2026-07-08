import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionValue,
  verifyAdminPassword
} from "@/lib/checkout/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") || "");
  const redirectTo = new URL("/admin", request.url);

  if (!verifyAdminPassword(password)) {
    redirectTo.pathname = "/admin/login";
    redirectTo.searchParams.set("error", "1");
    return NextResponse.redirect(redirectTo, 303);
  }

  const response = NextResponse.redirect(redirectTo, 303);
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: createAdminSessionValue(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  return response;
}
