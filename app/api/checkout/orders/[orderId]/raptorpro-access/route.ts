import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  CHECKOUT_ACCESS_COOKIE_NAME,
  checkoutAccessCookieOptions,
  verifyCheckoutAccessToken
} from "@/lib/checkout/checkout-access";
import { appendOrderLog, getOrderById } from "@/lib/checkout/db";
import { isSameSiteRequest } from "@/lib/checkout/request-security";
import {
  createRaptorProCheckoutAccessLink,
  isRaptorProProgramOrder
} from "@/lib/checkout/raptorpro";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ orderId: string }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  const { orderId } = await params;
  const fallbackUrl = new URL("/checkout/success", request.url);
  fallbackUrl.searchParams.set("order_id", orderId);

  try {
    if (!isSameSiteRequest(request)) {
      fallbackUrl.searchParams.set("access_error", "invalid_origin");
      return NextResponse.redirect(fallbackUrl, 303);
    }

    const cookieStore = await cookies();
    const checkoutAccessToken = cookieStore.get(
      CHECKOUT_ACCESS_COOKIE_NAME
    )?.value;
    if (!verifyCheckoutAccessToken(orderId, checkoutAccessToken)) {
      fallbackUrl.searchParams.set("access_error", "invalid_access");
      return NextResponse.redirect(fallbackUrl, 303);
    }

    const order = await getOrderById(orderId);
    if (!order || order.status !== "paid" || !isRaptorProProgramOrder(order)) {
      fallbackUrl.searchParams.set("access_error", "not_available");
      return NextResponse.redirect(fallbackUrl, 303);
    }

    const actionUrl = await createRaptorProCheckoutAccessLink(order);
    await appendOrderLog(
      order.id,
      "raptorpro.access.opened_from_checkout",
      "Cliente abriu o acesso seguro diretamente pela confirmação da compra."
    );
    const response = NextResponse.redirect(actionUrl, 303);
    response.cookies.set(CHECKOUT_ACCESS_COOKIE_NAME, "", {
      ...checkoutAccessCookieOptions(),
      maxAge: 0
    });
    return response;
  } catch (error) {
    console.error("[checkout.raptorpro-access]", error);
    await appendOrderLog(
      orderId,
      "raptorpro.access.direct_error",
      "Não foi possível abrir o acesso direto pela confirmação da compra.",
      { error: error instanceof Error ? error.message : String(error) }
    ).catch(() => undefined);
    fallbackUrl.searchParams.set("access_error", "generation_failed");
    return NextResponse.redirect(fallbackUrl, 303);
  }
}
