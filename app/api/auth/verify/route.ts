import { NextResponse } from "next/server";
import {
  CUSTOMER_COOKIE_NAME,
  createCustomerSessionValue,
  customerCookieOptions
} from "@/lib/checkout/customer-auth";
import { consumeCustomerLoginToken } from "@/lib/checkout/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const nextPath = url.searchParams.get("next");
  const siteUrl = url.origin;
  const redirectPath =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/my-programs";

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/login?error=missing-token`);
  }

  const user = await consumeCustomerLoginToken(token);
  if (!user) {
    return NextResponse.redirect(`${siteUrl}/login?error=invalid-token`);
  }

  const response = NextResponse.redirect(`${siteUrl}${redirectPath}`);
  response.cookies.set(
    CUSTOMER_COOKIE_NAME,
    createCustomerSessionValue(user.id),
    customerCookieOptions()
  );

  return response;
}
