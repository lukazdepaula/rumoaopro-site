import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../lib/checkout/discounts.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
});
const { calculateDiscountQuote, validateDiscountForCheckout, normalizeCouponCode } =
  await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

const product = { id: "de_volta_aos_gramados_pt" };
const price = { amount: 199.9, currency: "BRL", basePriceUsd: 38.95, brlEstimate: 199.9, exchangeRateUsed: null };
const coupon = {
  code: "DVG30-TEST", type: "percent", value: 30, product_id: product.id,
  active: true, max_redemptions: 1, times_redeemed: 0,
  starts_at: null, expires_at: new Date(Date.now() + 86400000).toISOString()
};
assert.equal(normalizeCouponCode(" dvg30-test "), "DVG30-TEST");
assert.equal(validateDiscountForCheckout(coupon, product, price), null);
assert.deepEqual(
  ["originalAmount", "discountAmount", "finalAmount"].map(key => calculateDiscountQuote(coupon, price)[key]),
  [199.9, 59.97, 139.93]
);
assert.equal(calculateDiscountQuote(coupon, { ...price, amount: 38.95, currency: "USD" }).finalAmount, 27.26);
assert.match(validateDiscountForCheckout({ ...coupon, expires_at: "2000-01-01T00:00:00Z" }, product, price), /expirado/);
assert.match(validateDiscountForCheckout({ ...coupon, times_redeemed: 1 }, product, price), /esgotado/);
assert.match(validateDiscountForCheckout({ ...coupon, active: false }, product, price), /inativo/);
assert.match(validateDiscountForCheckout(coupon, { id: "project_36" }, price), /produto/);
assert.match(validateDiscountForCheckout(null, product, price), /inválido/);
console.log("PASS: rounding, normalization, currency, expiry, use limit, inactive, wrong product and missing coupon.");
