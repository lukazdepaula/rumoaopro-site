import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/checkout/db";
import { markOrderAsFailed } from "@/lib/checkout/order-events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MockRouteProps = {
  params: Promise<{ orderId: string }>;
};

export async function POST(_request: Request, { params }: MockRouteProps) {
  try {
    const { orderId } = await params;
    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }

    if (order.gateway !== "mock") {
      return NextResponse.json(
        { error: "Este pedido não usa gateway mock." },
        { status: 400 }
      );
    }

    const updatedOrder = await markOrderAsFailed(order.id, {
      mock_result: "declined",
      mock_event_at: new Date().toISOString()
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("[checkout.mock.decline]", error);
    return NextResponse.json(
      { error: "Erro ao recusar pagamento mock." },
      { status: 500 }
    );
  }
}
