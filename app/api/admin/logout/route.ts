import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions
} from "@/lib/checkout/admin-auth";
import { isSameSiteRequest } from "@/lib/checkout/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameSiteRequest(request)) {
    return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  }

  const response = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    ...adminCookieOptions(),
    maxAge: 0
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
