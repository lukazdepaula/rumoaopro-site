import { NextResponse } from "next/server";
import {
  CUSTOMER_COOKIE_NAME,
  createCustomerSessionValue,
  customerCookieOptions
} from "@/lib/checkout/customer-auth";
import { getOrderById } from "@/lib/checkout/db";
import { markOrderAsPaid } from "@/lib/checkout/order-events";

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

    const updatedOrder = await markOrderAsPaid(order.id, {
      mock_result: "approved",
      mock_event_at: new Date().toISOString()
    });

    const response = NextResponse.json({ order: updatedOrder });
    if (updatedOrder?.user_id) {
      response.cookies.set(
        CUSTOMER_COOKIE_NAME,
        createCustomerSessionValue(updatedOrder.user_id),
        customerCookieOptions()
      );
    }

    return response;
  } catch (error) {
    console.error("[checkout.mock.approve]", error);
    return NextResponse.json(
      { error: "Erro ao aprovar pagamento mock." },
      { status: 500 }
    );
  }
}
