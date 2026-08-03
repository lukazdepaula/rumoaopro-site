import crypto from "node:crypto";
import type { CheckoutProduct, Order, OrderStatus } from "@/lib/checkout/types";
import { appendOrderLog, updateOrderGatewayIds } from "@/lib/checkout/db";
import { getLocalizedProductCopy } from "@/lib/checkout/localization";

export class PaymentConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentConfigurationError";
  }
}

export class PaymentGatewayError extends Error {
  constructor(
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "PaymentGatewayError";
  }
}

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL?.replace(/^/, "https://") ||
    "http://127.0.0.1:3000"
  ).replace(/\/$/, "");
}

function requireEnv(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new PaymentConfigurationError(
      `Configure a variável de ambiente ${key}.`
    );
  }
  return value;
}

function idempotencyKey(order: Order, suffix: string) {
  return `${order.id}:${suffix}`;
}

function stripeCatalogPriceId(order: Order, product: CheckoutProduct) {
  if (product.id !== "loadpro_founders" || order.currency !== "BRL") {
    return null;
  }

  const configuredAmount = Math.round(product.price_brl * 100);
  const orderAmount = Math.round(order.amount * 100);
  const hasDiscount = typeof order.metadata.discount_code === "string";

  if (hasDiscount || configuredAmount !== orderAmount) return null;
  return requireEnv("STRIPE_LOADPRO_FOUNDERS_PRICE_ID");
}

export async function createMercadoPagoPixPayment(
  order: Order,
  product: CheckoutProduct
) {
  const accessToken = requireEnv("MERCADO_PAGO_ACCESS_TOKEN");
  const siteUrl = getSiteUrl();
  const documentType = order.customer_document_type?.toUpperCase();

  const response = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": idempotencyKey(order, "pix")
    },
    body: JSON.stringify({
      transaction_amount: order.amount,
      description: product.name,
      payment_method_id: "pix",
      external_reference: order.id,
      notification_url: `${siteUrl}/api/webhooks/mercado-pago`,
      payer: {
        email: order.customer_email,
        first_name: order.customer_name.split(" ")[0],
        last_name: order.customer_name.split(" ").slice(1).join(" "),
        identification:
          documentType && order.customer_document
            ? {
                type: documentType,
                number: order.customer_document
              }
            : undefined
      },
      metadata: {
        order_id: order.id,
        product_id: product.id,
        discount_code:
          typeof order.metadata.discount_code === "string"
            ? order.metadata.discount_code
            : undefined
      }
    })
  });

  const payload = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (!response.ok) {
    await appendOrderLog(order.id, "payment.mercado_pago.error", "Erro ao criar Pix.", {
      status: response.status,
      payload
    });
    throw new PaymentGatewayError("Mercado Pago recusou a criação do Pix.", payload);
  }

  const paymentId = String(payload.id || "");
  const transactionData =
    typeof payload.point_of_interaction === "object" &&
    payload.point_of_interaction !== null &&
    "transaction_data" in payload.point_of_interaction
      ? (payload.point_of_interaction as {
          transaction_data?: Record<string, unknown>;
        }).transaction_data || {}
      : {};

  await updateOrderGatewayIds(order.id, {
    gateway_payment_id: paymentId,
    metadata: {
      mercado_pago_status: payload.status,
      mercado_pago_status_detail: payload.status_detail
    }
  });

  await appendOrderLog(
    order.id,
    "payment.mercado_pago.created",
    "Pagamento Pix criado no Mercado Pago.",
    { paymentId }
  );

  return {
    paymentId,
    status: payload.status,
    qrCode: transactionData.qr_code,
    qrCodeBase64: transactionData.qr_code_base64,
    ticketUrl: transactionData.ticket_url
  };
}

export async function createMercadoPagoCheckoutPreference(
  order: Order,
  product: CheckoutProduct
) {
  const accessToken = requireEnv("MERCADO_PAGO_ACCESS_TOKEN");
  const siteUrl = getSiteUrl();
  const nameParts = order.customer_name.trim().split(/\s+/);

  const response = await fetch(
    "https://api.mercadopago.com/checkout/preferences",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotencyKey(order, "checkout")
      },
      body: JSON.stringify({
        items: [
          {
            id: product.id,
            title: product.name,
            description: product.description,
            quantity: 1,
            currency_id: "BRL",
            unit_price: order.amount
          }
        ],
        payer: {
          name: nameParts[0] || order.customer_name,
          surname: nameParts.slice(1).join(" "),
          email: order.customer_email
        },
        external_reference: order.id,
        notification_url: `${siteUrl}/api/webhooks/mercado-pago`,
        back_urls: {
          success: `${siteUrl}/checkout/success?order_id=${order.id}`,
          pending: `${siteUrl}/checkout/success?order_id=${order.id}`,
          failure: `${siteUrl}/checkout/${product.slug}?payment=failed`
        },
        auto_return: "approved",
        payment_methods: {
          installments: 12
        },
        metadata: {
          order_id: order.id,
          product_id: product.id,
          discount_code:
            typeof order.metadata.discount_code === "string"
              ? order.metadata.discount_code
              : undefined
        }
      })
    }
  );

  const payload = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (!response.ok) {
    await appendOrderLog(
      order.id,
      "payment.mercado_pago.checkout.error",
      "Erro ao criar checkout no Mercado Pago.",
      { status: response.status, payload }
    );
    throw new PaymentGatewayError(
      "Mercado Pago recusou a criação do checkout.",
      payload
    );
  }

  const preferenceId = String(payload.id || "");
  const url = String(payload.init_point || payload.sandbox_init_point || "");

  if (!preferenceId || !url) {
    throw new PaymentGatewayError(
      "Mercado Pago não retornou o endereço do checkout.",
      payload
    );
  }

  await updateOrderGatewayIds(order.id, {
    gateway_checkout_id: preferenceId,
    metadata: {
      mercado_pago_preference_id: preferenceId
    }
  });

  await appendOrderLog(
    order.id,
    "payment.mercado_pago.checkout.created",
    "Checkout com cartão e parcelamento criado no Mercado Pago.",
    { preferenceId }
  );

  return { preferenceId, url };
}

export async function createMercadoPagoSubscription(
  order: Order,
  product: CheckoutProduct
) {
  const accessToken = requireEnv("MERCADO_PAGO_ACCESS_TOKEN");
  requireEnv("MERCADO_PAGO_WEBHOOK_SECRET");
  const siteUrl = getSiteUrl();

  const response = await fetch("https://api.mercadopago.com/preapproval", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": idempotencyKey(order, "subscription")
    },
    body: JSON.stringify({
      reason: product.name,
      external_reference: order.id,
      payer_email: order.customer_email,
      back_url: `${siteUrl}/checkout/success?order_id=${order.id}`,
      notification_url: `${siteUrl}/api/webhooks/mercado-pago`,
      status: "pending",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: order.amount,
        currency_id: "BRL"
      }
    })
  });

  const payload = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (!response.ok) {
    await appendOrderLog(
      order.id,
      "subscription.mercado_pago.error",
      "Erro ao criar assinatura no Mercado Pago.",
      { status: response.status, payload }
    );
    throw new PaymentGatewayError(
      "Mercado Pago recusou a criação da assinatura.",
      payload
    );
  }

  const subscriptionId = String(payload.id || "");
  const url = String(payload.init_point || "");
  if (!subscriptionId || !url) {
    throw new PaymentGatewayError(
      "Mercado Pago não retornou o endereço da assinatura.",
      payload
    );
  }

  await updateOrderGatewayIds(order.id, {
    gateway_checkout_id: subscriptionId,
    metadata: {
      billing_type: "subscription",
      billing_interval: product.billing_interval || "month",
      mercado_pago_subscription_id: subscriptionId,
      subscription_status: payload.status || "pending"
    }
  });
  await appendOrderLog(
    order.id,
    "subscription.mercado_pago.created",
    "Assinatura mensal criada no Mercado Pago.",
    { subscriptionId }
  );

  return { subscriptionId, url, status: payload.status };
}

export async function createStripeCheckoutSession(
  order: Order,
  product: CheckoutProduct
) {
  const secretKey = requireEnv("STRIPE_SECRET_KEY");
  const siteUrl = getSiteUrl();
  const params = new URLSearchParams();
  const international =
    order.metadata.checkout_locale === "en" || order.customer_country !== "BR";

  const isSubscription = product.type === "subscription";
  const locale = order.metadata.checkout_locale === "en" ? "en" : "pt";
  const productCopy = getLocalizedProductCopy(product, locale);
  const trialDays = isSubscription
    ? Math.max(0, Math.floor(product.trial_days || 0))
    : 0;
  const catalogPriceId = stripeCatalogPriceId(order, product);
  if (isSubscription) requireEnv("STRIPE_WEBHOOK_SECRET");
  params.set("mode", isSubscription ? "subscription" : "payment");
  params.set("customer_email", order.customer_email);
  params.set("client_reference_id", order.id);
  params.set(
    "success_url",
    `${siteUrl}/checkout/success?order_id=${order.id}${international ? "&locale=en" : ""}`
  );
  params.set(
    "cancel_url",
    international
      ? `${siteUrl}/en/checkout/${product.slug}?cancelled=1`
      : `${siteUrl}/checkout/${product.slug}?cancelled=1`
  );
  params.set("metadata[order_id]", order.id);
  params.set("metadata[product_id]", product.id);
  if (trialDays > 0) {
    params.set("metadata[trial_days]", String(trialDays));
  }
  if (typeof order.metadata.discount_code === "string") {
    params.set("metadata[discount_code]", order.metadata.discount_code);
  }
  params.set("line_items[0][quantity]", "1");
  if (catalogPriceId) {
    params.set("line_items[0][price]", catalogPriceId);
  } else {
    params.set("line_items[0][price_data][currency]", order.currency.toLowerCase());
    params.set(
      "line_items[0][price_data][unit_amount]",
      String(Math.round(order.amount * 100))
    );
    params.set("line_items[0][price_data][product_data][name]", productCopy.name);
    params.set(
      "line_items[0][price_data][product_data][description]",
      productCopy.description
    );
  }
  if (isSubscription) {
    if (!catalogPriceId) {
      params.set(
        "line_items[0][price_data][recurring][interval]",
        product.billing_interval || "month"
      );
    }
    if (trialDays > 0) {
      params.set("payment_method_collection", "always");
      params.set("subscription_data[trial_period_days]", String(trialDays));
      params.set("subscription_data[metadata][trial_days]", String(trialDays));
    }
    params.set("subscription_data[metadata][order_id]", order.id);
    params.set("subscription_data[metadata][product_id]", product.id);
    params.set("subscription_data[metadata][plan_code]", product.id);
  } else {
    params.set("payment_intent_data[metadata][order_id]", order.id);
    params.set("payment_intent_data[metadata][product_id]", product.id);
    if (typeof order.metadata.discount_code === "string") {
      params.set(
        "payment_intent_data[metadata][discount_code]",
        order.metadata.discount_code
      );
    }
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": idempotencyKey(order, "checkout")
    },
    body: params
  });

  const payload = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (!response.ok) {
    await appendOrderLog(order.id, "payment.stripe.error", "Erro ao criar sessão Stripe.", {
      status: response.status,
      payload
    });
    throw new PaymentGatewayError("Stripe recusou a criação do checkout.", payload);
  }

  const sessionId = String(payload.id || "");
  const url = String(payload.url || "");

  await updateOrderGatewayIds(order.id, {
    gateway_checkout_id: sessionId,
    metadata: {
      billing_type: isSubscription ? "subscription" : "one_time",
      billing_interval: isSubscription ? product.billing_interval || "month" : null,
      stripe_catalog_price_id: catalogPriceId,
      trial_days: trialDays || null,
      stripe_payment_status: payload.payment_status,
      stripe_session_status: payload.status
    }
  });

  await appendOrderLog(
    order.id,
    "payment.stripe.created",
    "Checkout Session criada na Stripe.",
    { sessionId }
  );

  return { sessionId, url };
}

export function verifyStripeWebhookSignature(
  payload: string,
  signatureHeader: string | null
) {
  const secret = requireEnv("STRIPE_WEBHOOK_SECRET");
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    })
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  return timingSafeEqualHex(signature, expected);
}

export function verifyMercadoPagoWebhookSignature(
  dataId: string,
  requestId: string | null,
  signatureHeader: string | null
) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) return process.env.CHECKOUT_GATEWAY_MODE !== "live";
  if (!requestId || !signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key.trim(), value?.trim()];
    })
  );

  const timestamp = parts.ts;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp};`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  return timingSafeEqualHex(signature, expected);
}

function timingSafeEqualHex(a: string, b: string) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");

  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export async function fetchMercadoPagoPayment(paymentId: string) {
  const accessToken = requireEnv("MERCADO_PAGO_ACCESS_TOKEN");
  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  const payload = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (!response.ok) {
    throw new PaymentGatewayError("Não foi possível confirmar o pagamento.", {
      status: response.status,
      payload
    });
  }

  return payload;
}

export async function fetchMercadoPagoSubscription(subscriptionId: string) {
  const accessToken = requireEnv("MERCADO_PAGO_ACCESS_TOKEN");
  const response = await fetch(
    `https://api.mercadopago.com/preapproval/${encodeURIComponent(subscriptionId)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
  const payload = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  if (!response.ok) {
    throw new PaymentGatewayError("Não foi possível confirmar a assinatura.", {
      status: response.status,
      payload
    });
  }
  return payload;
}

export async function fetchMercadoPagoAuthorizedPayment(
  authorizedPaymentId: string
) {
  const accessToken = requireEnv("MERCADO_PAGO_ACCESS_TOKEN");
  const response = await fetch(
    `https://api.mercadopago.com/authorized_payments/${encodeURIComponent(
      authorizedPaymentId
    )}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
  const payload = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  if (!response.ok) {
    throw new PaymentGatewayError(
      "Não foi possível confirmar a cobrança recorrente.",
      {
        status: response.status,
        payload
      }
    );
  }
  return payload;
}

export async function fetchStripeSubscription(subscriptionId: string) {
  const secretKey = requireEnv("STRIPE_SECRET_KEY");
  const response = await fetch(
    `https://api.stripe.com/v1/subscriptions/${encodeURIComponent(subscriptionId)}`,
    { headers: { Authorization: `Bearer ${secretKey}` } }
  );
  const payload = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  if (!response.ok) {
    throw new PaymentGatewayError("Não foi possível confirmar a assinatura Stripe.", {
      status: response.status,
      payload
    });
  }
  return payload;
}

export function mapMercadoPagoStatus(status: unknown): OrderStatus | null {
  switch (status) {
    case "approved":
      return "paid";
    case "rejected":
      return "failed";
    case "cancelled":
      return "cancelled";
    case "refunded":
    case "charged_back":
      return "refunded";
    default:
      return null;
  }
}
