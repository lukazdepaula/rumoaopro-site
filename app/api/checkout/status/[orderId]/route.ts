import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/checkout/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutStatusRouteProps = {
  params: Promise<{ orderId: string }>;
};

export async function GET(_request: Request, { params }: CheckoutStatusRouteProps) {
  const { orderId } = await params;
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
