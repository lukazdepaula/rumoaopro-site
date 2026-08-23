import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/checkout/db";
import { markOrderAsFailed } from "@/lib/checkout/order-events";
import { isSameSiteRequest } from "@/lib/checkout/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MockRouteProps = {
  params: Promise<{ orderId: string }>;
};

export async function POST(request: Request, { params }: MockRouteProps) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Rota não encontrada." }, { status: 404 });
  }
  if (!isSameSiteRequest(request)) {
    return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  }

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
