import { NextResponse } from "next/server";
import {
  CHECKOUT_ACCESS_COOKIE_NAME,
  checkoutAccessCookieOptions,
  verifyCheckoutAccessToken
} from "@/lib/checkout/checkout-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const orderId = requestUrl.searchParams.get("order_id") || "";
  const token = requestUrl.searchParams.get("token");
  const locale = requestUrl.searchParams.get("locale") === "en" ? "en" : null;
  const successUrl = new URL("/checkout/success", requestUrl.origin);

  if (orderId) successUrl.searchParams.set("order_id", orderId);
  if (locale) successUrl.searchParams.set("locale", locale);

  if (!verifyCheckoutAccessToken(orderId, token)) {
    successUrl.searchParams.set("access_error", "invalid_return");
    return NextResponse.redirect(successUrl, 303);
  }

  const response = NextResponse.redirect(successUrl, 303);
  response.cookies.set(
    CHECKOUT_ACCESS_COOKIE_NAME,
    token!,
    checkoutAccessCookieOptions()
  );
  return response;
}
