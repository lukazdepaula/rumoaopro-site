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

  return {
    amount: isBrazil
      ? usdToBrl(product.base_price_usd, exchangeRate || undefined)
      : product.base_price_usd,
    currency: isBrazil ? "BRL" : "USD",
    exchangeRateUsed: exchangeRate,
    basePriceUsd: product.base_price_usd,
    brlEstimate: usdToBrl(product.base_price_usd)
  };
}
