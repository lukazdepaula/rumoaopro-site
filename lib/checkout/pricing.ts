import type { CheckoutProduct } from "@/lib/checkout/types";

const fallbackUsdToBrlRate = 5.5;

export function getUsdToBrlRate() {
  const configured = Number(process.env.USD_TO_BRL_RATE);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : fallbackUsdToBrlRate;
}

export function usdToBrl(amountUsd: number, rate = getUsdToBrlRate()) {
  return Math.round(amountUsd * rate * 100) / 100;
}

export function calculateLocalizedPrice(
  product: CheckoutProduct,
  country: string
) {
  const isBrazil = country.trim().toUpperCase() === "BR";
  const exchangeRate = isBrazil ? getUsdToBrlRate() : null;
  const brlAmount =
    Number.isFinite(product.price_brl) && product.price_brl > 0
      ? Math.round(product.price_brl * 100) / 100
      : usdToBrl(product.base_price_usd, exchangeRate || undefined);
  const convertedBrlAmount = usdToBrl(
    product.base_price_usd,
    exchangeRate || undefined
  );
  const usesConvertedBrl =
    isBrazil && Math.abs(brlAmount - convertedBrlAmount) < 0.01;

  return {
    amount: isBrazil ? brlAmount : product.base_price_usd,
    currency: isBrazil ? "BRL" : "USD",
    exchangeRateUsed: usesConvertedBrl ? exchangeRate : null,
    basePriceUsd: product.base_price_usd,
    brlEstimate: product.price_brl_estimated
  };
}
