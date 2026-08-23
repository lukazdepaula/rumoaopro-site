import { NextResponse } from "next/server";
import { verifyCheckoutAccessToken } from "@/lib/checkout/checkout-access";
import { getOrderById } from "@/lib/checkout/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutStatusRouteProps = {
  params: Promise<{ orderId: string }>;
};

export async function GET(request: Request, { params }: CheckoutStatusRouteProps) {
  const { orderId } = await params;
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : null;

  if (!verifyCheckoutAccessToken(orderId, token)) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  const order = await getOrderById(orderId);

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    orderId: order.id,
    status: order.status,
    deliveryStatus: order.delivery_status,
    paidAt: order.paid_at
  });
}
