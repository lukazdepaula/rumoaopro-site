import { NextResponse } from "next/server";
import { createOrder, getDiscountByCode } from "@/lib/checkout/db";
import {
  calculateDiscountQuote,
  discountMetadata,
  validateDiscountForCheckout
} from "@/lib/checkout/discounts";
import { markOrderAsFailed } from "@/lib/checkout/order-events";
import {
  createMercadoPagoPixPayment,
  createStripeCheckoutSession,
  PaymentConfigurationError,
  PaymentGatewayError
} from "@/lib/checkout/payments";
import { calculateLocalizedPrice } from "@/lib/checkout/pricing";
import { getProductBySlug } from "@/lib/checkout/products";
import {
  CheckoutValidationError,
  isBrazil,
  validateCheckoutInput
} from "@/lib/checkout/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function checkoutMode() {
  return process.env.CHECKOUT_GATEWAY_MODE === "live" ? "live" : "mock";
}

export async function POST(request: Request) {
  try {
    const input = validateCheckoutInput(await request.json());
    const product = getProductBySlug(input.productSlug);

    if (!product) {
      return NextResponse.json(
        { error: "Produto indisponível." },
        { status: 404 }
      );
    }

    const brazil = isBrazil(input.country);
    const localizedPrice = calculateLocalizedPrice(product, brazil ? "BR" : input.country);
    const discount = input.discountCode
      ? await getDiscountByCode(input.discountCode)
      : null;
    const discountError = input.discountCode
      ? validateDiscountForCheckout(discount, product, localizedPrice)
      : null;

    if (discountError) {
      return NextResponse.json(
        { error: discountError, field: "discountCode" },
        { status: 400 }
      );
    }

    const discountQuote = discount
      ? calculateDiscountQuote(discount, localizedPrice)
      : null;
    const order = await createOrder({
      product_id: product.id,
      product_name: product.name,
      customer_name: input.name,
      customer_email: input.email,
      customer_country: brazil ? "BR" : input.country,
      customer_document_type: input.documentType,
      customer_document: input.document,
      gateway:
        checkoutMode() === "live"
          ? brazil
            ? "mercado_pago"
            : "stripe"
          : "mock",
      amount: discountQuote?.finalAmount ?? localizedPrice.amount,
      currency: localizedPrice.currency,
      exchange_rate_used: localizedPrice.exchangeRateUsed,
      fiscal_status: brazil ? "pending" : "not_required",
      metadata: {
        product_slug: product.slug,
        checkout_country: input.country,
        checkout_gateway_mode: checkoutMode(),
        base_price_usd: localizedPrice.basePriceUsd,
        ...discountMetadata(discountQuote)
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Não foi possível criar o pedido." },
        { status: 500 }
      );
    }

    if (checkoutMode() === "mock") {
      return NextResponse.json({
        gateway: "mock",
        orderId: order.id,
        redirectUrl: `/checkout/success?order_id=${order.id}&mock=1`
      });
    }

    try {
      if (brazil) {
        const pix = await createMercadoPagoPixPayment(order, product);
        return NextResponse.json({
          gateway: "mercado_pago",
          orderId: order.id,
          pix
        });
      }

      const stripe = await createStripeCheckoutSession(order, product);
      return NextResponse.json({
        gateway: "stripe",
        orderId: order.id,
        redirectUrl: stripe.url
      });
    } catch (error) {
      await markOrderAsFailed(order.id, {
        checkout_error:
          error instanceof Error ? error.message : "Erro desconhecido."
      });

      if (error instanceof PaymentConfigurationError) {
        return NextResponse.json(
          {
            error: error.message,
            orderId: order.id
          },
          { status: 503 }
        );
      }

      if (error instanceof PaymentGatewayError) {
        return NextResponse.json(
          {
            error: error.message,
            orderId: order.id
          },
          { status: 502 }
        );
      }

      throw error;
    }
  } catch (error) {
    if (error instanceof CheckoutValidationError) {
      return NextResponse.json(
        { error: error.message, field: error.field },
        { status: 400 }
      );
    }

    console.error("[checkout.start]", error);
    return NextResponse.json(
      { error: "Erro ao iniciar checkout." },
      { status: 500 }
    );
  }
}
