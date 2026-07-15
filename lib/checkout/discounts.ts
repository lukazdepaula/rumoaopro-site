import type { CheckoutProduct, Discount } from "@/lib/checkout/types";

export type LocalizedPrice = {
  amount: number;
  currency: string;
  exchangeRateUsed: number | null;
  basePriceUsd: number;
  brlEstimate: number;
};

export type DiscountQuote = {
  discount: Discount;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
};

const roundMoney = (amount: number) => Math.round(amount * 100) / 100;

export function normalizeCouponCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function validateDiscountForCheckout(
  discount: Discount | null,
  product: CheckoutProduct,
  price: LocalizedPrice
) {
  if (!discount) return "Cupom inválido.";
  if (!discount.active) return "Cupom inativo.";

  const now = Date.now();
  if (discount.starts_at && new Date(discount.starts_at).getTime() > now) {
    return "Cupom ainda não está disponível.";
  }

  if (discount.expires_at && new Date(discount.expires_at).getTime() <= now) {
    return "Cupom expirado.";
  }

  if (discount.product_id && discount.product_id !== product.id) {
    return "Cupom não é válido para este produto.";
  }

  if (
    discount.max_redemptions !== null &&
    discount.times_redeemed >= discount.max_redemptions
  ) {
    return "Cupom esgotado.";
  }

  if (discount.type === "fixed" && discount.currency !== price.currency) {
    return `Cupom válido apenas para compras em ${discount.currency}.`;
  }

  if (discount.value <= 0) return "Cupom inválido.";
  if (discount.type === "percent" && discount.value > 100) {
    return "Cupom inválido.";
  }

  return null;
}

export function calculateDiscountQuote(
  discount: Discount,
  price: LocalizedPrice
): DiscountQuote {
  const discountAmount =
    discount.type === "percent"
      ? roundMoney(price.amount * (discount.value / 100))
      : roundMoney(Math.min(discount.value, price.amount));
  const finalAmount = roundMoney(Math.max(0.01, price.amount - discountAmount));

  return {
    discount,
    originalAmount: roundMoney(price.amount),
    discountAmount,
    finalAmount,
    currency: price.currency
  };
}

export function discountMetadata(quote: DiscountQuote | null) {
  if (!quote) return {};

  return {
    discount_id: quote.discount.id,
    discount_code: quote.discount.code,
    discount_type: quote.discount.type,
    discount_value: quote.discount.value,
    original_amount: quote.originalAmount,
    discount_amount: quote.discountAmount,
    final_amount: quote.finalAmount
  };
}
