import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/checkout/admin-auth";
import { getOrderById } from "@/lib/checkout/db";
import {
  createMercadoPagoCheckoutPreference,
  PaymentConfigurationError,
  PaymentGatewayError
} from "@/lib/checkout/payments";
import { getProductById } from "@/lib/checkout/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const order = await getOrderById(id);

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  if (order.status !== "pending") {
    return NextResponse.json(
      { error: "O link parcelado só pode ser gerado para pedidos pendentes." },
      { status: 409 }
    );
  }

  if (order.currency !== "BRL") {
    return NextResponse.json(
      { error: "O parcelamento pelo Mercado Pago está disponível em reais." },
      { status: 409 }
    );
  }

  const product = getProductById(order.product_id);

  if (!product) {
    return NextResponse.json(
      { error: "Produto do pedido não encontrado." },
      { status: 404 }
    );
  }

  try {
    const checkout = await createMercadoPagoCheckoutPreference(order, product);

    return NextResponse.json(
      {
        url: checkout.url,
        installments: 12
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    const message =
      error instanceof PaymentConfigurationError ||
      error instanceof PaymentGatewayError
        ? error.message
        : "Não foi possível gerar o link parcelado.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
