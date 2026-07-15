import { NextResponse } from "next/server";
import { getDiscountByCode } from "@/lib/checkout/db";
import {
  calculateDiscountQuote,
  validateDiscountForCheckout
} from "@/lib/checkout/discounts";
import { calculateLocalizedPrice } from "@/lib/checkout/pricing";
import { getProductBySlug } from "@/lib/checkout/products";
import { isBrazil, normalizeCountry, normalizeDiscountCode } from "@/lib/checkout/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      productSlug?: string;
      country?: string;
      discountCode?: string;
    };
    const productSlug = typeof body.productSlug === "string" ? body.productSlug : "";
    const discountCode = normalizeDiscountCode(body.discountCode);
    const country = normalizeCountry(typeof body.country === "string" ? body.country : "");
    const product = getProductBySlug(productSlug);

    if (!product) {
      return NextResponse.json(
        { error: "Produto indisponível." },
        { status: 404 }
      );
    }

    if (!discountCode) {
      return NextResponse.json(
        { error: "Informe um cupom." },
        { status: 400 }
      );
    }

    const localizedPrice = calculateLocalizedPrice(
      product,
      isBrazil(country) ? "BR" : country
    );
    const discount = await getDiscountByCode(discountCode);
    const discountError = validateDiscountForCheckout(discount, product, localizedPrice);

    if (discountError || !discount) {
      return NextResponse.json(
        { error: discountError || "Cupom inválido." },
        { status: 400 }
      );
    }

    const quote = calculateDiscountQuote(discount, localizedPrice);

    return NextResponse.json({
      code: discount.code,
      description: discount.description,
      type: discount.type,
      value: discount.value,
      currency: quote.currency,
      originalAmount: quote.originalAmount,
      discountAmount: quote.discountAmount,
      finalAmount: quote.finalAmount
    });
  } catch (error) {
    console.error("[checkout.discount]", error);
    return NextResponse.json(
      { error: "Não foi possível validar o cupom." },
      { status: 500 }
    );
  }
}
