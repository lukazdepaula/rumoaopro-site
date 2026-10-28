import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);

function load(file, mocks = {}, extras = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  vm.runInNewContext(code, {
    module, exports: module.exports, URL, URLSearchParams, Headers, Response, Date, Intl,
    process: { env: {} },
    require(id) {
      if (id in mocks) return mocks[id];
      if (id === "libphonenumber-js/min" || id === "node:crypto") return require(id);
      throw Error(`Unmocked dependency: ${id}`);
    },
    ...extras
  });
  return module.exports;
}

const products = load("lib/checkout/products.ts");
const pricing = load("lib/checkout/pricing.ts");
const countries = load("lib/checkout/countries.ts");
const validation = load("lib/checkout/validation.ts", {
  "@/lib/marketing/attribution": load("lib/marketing/attribution.ts")
});
const powerPro = products.getProductBySlug("power-pro");

function checkoutFixture() {
  const state = { orders: [], payments: [] };
  const gateway = (method) => async (order, product) => {
    state.payments.push({ method, order, product });
    return { url: `https://example.invalid/${method}`, qrCode: "test-only" };
  };
  const route = load("app/api/checkout/start/route.ts", {
    "next/server": { NextResponse: Response },
    "@/lib/preview-safety": {},
    "@/lib/checkout/checkout-access": {
      isCheckoutAccessConfigured: () => true,
      createCheckoutAccessToken: () => "local-test-token",
      createCheckoutReturnUrl: () => "http://localhost/checkout/success"
    },
    "@/lib/checkout/db": {
      createOrder: async (input) => {
        const order = { ...input, id: "local-test-order", status: "pending" };
        state.orders.push(order);
        return order;
      }
    },
    "@/lib/checkout/discounts": { discountMetadata: () => ({}) },
    "@/lib/checkout/order-events": {},
    "@/lib/checkout/loadpro": {},
    "@/lib/checkout/payments": {
      PaymentConfigurationError: class extends Error {},
      PaymentGatewayError: class extends Error {},
      createStripeCheckoutSession: gateway("stripe"),
      createMercadoPagoCheckoutPreference: gateway("mercado_pago"),
      createMercadoPagoPixPayment: gateway("pix")
    },
    "@/lib/checkout/pricing": pricing,
    "@/lib/checkout/products": products,
    "@/lib/checkout/request-security": {
      isSameSiteRequest: () => true,
      readJsonBody: async (request) => ({ ok: true, data: await request.json() })
    },
    "@/lib/checkout/validation": validation
  }, { process: { env: { CHECKOUT_GATEWAY_MODE: "live" } } });
  return {
    state,
    post: (body) => route.POST(new Request("http://localhost/api/checkout/start", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productSlug: "power-pro", name: "Checkout Test", email: "checkout@example.invalid",
        locale: "pt", ...body
      })
    }))
  };
}

test("Power Pro uses normal international routing without changing price or delivery", () => {
  assert.equal(powerPro.checkout_country_lock, undefined);
  assert.equal(powerPro.checkout_payment_methods, undefined);
  assert.equal(powerPro.price_brl, 199);
  assert.equal(powerPro.base_price_usd, 39.9);
  assert.equal(powerPro.delivery_type, "member_area");
  assert.equal(powerPro.discounts_enabled, false);
  assert.equal(countries.getCountryDialCode("PT"), "+351");
  assert.equal(countries.getPreferredPresentmentCurrency("PT"), "EUR");
});

for (const country of ["PT", "IE", "US"]) {
  test(`${country}: accepts non-Brazil billing without CPF/CEP and routes to Stripe`, async () => {
    const f = checkoutFixture();
    const response = await f.post({ country, paymentMethod: "mercado_pago" });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).gateway, "stripe");
    assert.equal(f.state.orders.length, 1);
    const order = f.state.orders[0];
    assert.equal(order.customer_country, country);
    assert.equal(order.customer_document, null);
    assert.equal(order.currency, "USD");
    assert.equal(order.amount, 39.9);
    assert.equal(order.product_id, "power_pro");
    assert.equal(order.status, "pending");
    assert.equal(f.state.payments[0].method, "stripe");
  });
}

for (const method of ["mercado_pago", "pix"]) {
  test(`Brazil retains ${method} and R$199`, async () => {
    const f = checkoutFixture();
    const response = await f.post({
      country: "BR", paymentMethod: method, document: "12345678909",
      postalCode: "01001000", address: "Endereco de teste, Sao Paulo, SP",
      whatsapp: "+5511999999999"
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).paymentMethod, method);
    assert.equal(f.state.orders[0].currency, "BRL");
    assert.equal(f.state.orders[0].amount, 199);
    assert.equal(f.state.payments[0].method, method);
  });
}

test("Brazil still requires local billing details", async () => {
  const f = checkoutFixture();
  assert.equal((await f.post({ country: "BR", paymentMethod: "pix" })).status, 400);
  assert.equal(f.state.orders.length, 0);
});

test("Stripe session keeps order/product metadata and adaptive currency conversion", async () => {
  let sent;
  const payments = load("lib/checkout/payments.ts", {
    "@/lib/preview-safety": { assertPreviewProvider: () => {} },
    "@/lib/checkout/checkout-access": {
      createCheckoutReturnUrl: () => "http://localhost/checkout/success"
    },
    "@/lib/checkout/db": { appendOrderLog: async () => {}, updateOrderGatewayIds: async () => {} },
    "@/lib/checkout/localization": { getLocalizedProductCopy: (product) => product },
    "@/lib/checkout/products": products,
    "@/lib/checkout/loadpro-billing-policy": {}
  }, {
    process: { env: { STRIPE_SECRET_KEY: "test-fixture-only" } },
    fetch: async (url, options) => {
      assert.equal(url, "https://api.stripe.com/v1/checkout/sessions");
      sent = options.body;
      return Response.json({ id: "cs_test_fixture", url: "https://example.invalid/stripe" });
    }
  });
  await payments.createStripeCheckoutSession({
    id: "local-test-order", customer_email: "checkout@example.invalid",
    customer_country: "PT", currency: "USD", amount: 39.9,
    metadata: { checkout_locale: "pt" }
  }, powerPro);
  assert.equal(sent.get("mode"), "payment");
  assert.equal(sent.get("line_items[0][price_data][unit_amount]"), "3990");
  assert.equal(sent.get("line_items[0][price_data][currency]"), "usd");
  assert.equal(sent.get("adaptive_pricing[enabled]"), "true");
  assert.equal(sent.get("metadata[checkout_country]"), "PT");
  assert.equal(sent.get("metadata[product_id]"), "power_pro");
  assert.equal(sent.get("metadata[order_id]"), "local-test-order");
  assert.equal(sent.get("payment_intent_data[metadata][order_id]"), "local-test-order");
});
