import { NextResponse } from "next/server";
import {
  createCheckoutAccessToken,
  createCheckoutReturnUrl,
  isCheckoutAccessConfigured
} from "@/lib/checkout/checkout-access";
import { createOrder, getDiscountByCode } from "@/lib/checkout/db";
import {
  calculateDiscountQuote,
  discountMetadata,
  validateDiscountForCheckout
} from "@/lib/checkout/discounts";
import { markOrderAsFailed } from "@/lib/checkout/order-events";
import { assertLoadProProvisioningReady } from "@/lib/checkout/loadpro";
import {
  createMercadoPagoCheckoutPreference,
  createMercadoPagoPixPayment,
  createMercadoPagoSubscription,
  createStripeCheckoutSession,
  PaymentConfigurationError,
  PaymentGatewayError
} from "@/lib/checkout/payments";
import { calculateLocalizedPrice } from "@/lib/checkout/pricing";
import { getProductBySlug, isLoadProProductId } from "@/lib/checkout/products";
import {
  isSameSiteRequest,
  readJsonBody
} from "@/lib/checkout/request-security";
import {
  CheckoutValidationError,
  isBrazil,
  validateCheckoutInput
} from "@/lib/checkout/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function checkoutMode() {
  const mode = process.env.CHECKOUT_GATEWAY_MODE;
  if (mode === "live" || mode === "sandbox") return mode;
  if (process.env.NODE_ENV !== "production" && (!mode || mode === "mock")) {
    return "mock";
  }

  throw new PaymentConfigurationError(
    "O checkout está temporariamente indisponível."
  );
}

export async function POST(request: Request) {
  try {
    if (!isSameSiteRequest(request)) {
      return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
    }

    const body = await readJsonBody(request, 32 * 1024);
    if (!body.ok) {
      return NextResponse.json(
        {
          error: body.tooLarge
            ? "Os dados do checkout excederam o limite permitido."
            : "Dados do checkout inválidos."
        },
        { status: body.tooLarge ? 413 : 400 }
      );
    }

    const mode = checkoutMode();
    if (!isCheckoutAccessConfigured()) {
      throw new PaymentConfigurationError(
        "O checkout está temporariamente indisponível."
      );
    }

    const input = validateCheckoutInput(body.data);
    const product = getProductBySlug(input.productSlug);

    if (!product) {
      return NextResponse.json(
        { error: "Produto indisponível." },
        { status: 404 }
      );
    }

    if (
      product.checkout_country_lock &&
      input.country !== product.checkout_country_lock
    ) {
      return NextResponse.json(
        { error: "Este checkout está disponível apenas para clientes no Brasil." },
        { status: 400 }
      );
    }

    const checkoutCountry = product.checkout_country_lock || input.country;
    const brazil = isBrazil(checkoutCountry);
    const stripeOnly =
      isLoadProProductId(product.id) ||
      (product.checkout_payment_methods?.length === 1 &&
        product.checkout_payment_methods[0] === "stripe");
    const requestedPaymentMethod = mode === "sandbox"
      ? "stripe"
      : stripeOnly
      ? "stripe"
      : brazil
        ? input.paymentMethod
        : "stripe";
    const paymentMethod = product.checkout_payment_methods?.length
      ? product.checkout_payment_methods.includes(requestedPaymentMethod)
        ? requestedPaymentMethod
        : product.checkout_payment_methods[0]
      : requestedPaymentMethod;

    if (input.discountCode && product.discounts_enabled === false) {
      return NextResponse.json(
        { error: "Cupons não estão disponíveis para esta assinatura." },
        { status: 400 }
      );
    }
    if (product.type === "subscription" && paymentMethod === "pix") {
      return NextResponse.json(
        { error: "Assinaturas mensais exigem um cartão." },
        { status: 400 }
      );
    }

    if (mode === "live" && isLoadProProductId(product.id)) {
      try {
        await assertLoadProProvisioningReady();
      } catch (error) {
        console.error("[checkout.start.loadpro_preflight]", error);
        return NextResponse.json(
          {
            error:
              "As assinaturas do LoadPro estão temporariamente indisponíveis. Nenhuma cobrança foi realizada."
          },
          { status: 503 }
        );
      }
    }
    const localizedPrice = calculateLocalizedPrice(product, checkoutCountry);
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
    const marketingConsent = input.marketing.consent === "granted";
    const clientIpAddress = marketingConsent
      ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip")
      : null;
    const clientUserAgent = marketingConsent
      ? request.headers.get("user-agent")?.slice(0, 500) || null
      : null;
    const marketingFbc = marketingConsent
      ? input.marketing.fbc ||
        (input.marketing.fbclid
          ? `fb.1.${Date.now()}.${input.marketing.fbclid}`
          : null)
      : null;
    const order = await createOrder({
      product_id: product.id,
      product_name: product.name,
      customer_name: input.name,
      customer_email: input.email,
      customer_country: checkoutCountry,
      customer_document_type: input.documentType,
      customer_document: input.document,
      customer_postal_code: input.postalCode,
      customer_address: input.address,
      customer_whatsapp: input.whatsapp,
      gateway:
        mode !== "mock"
          ? paymentMethod === "stripe"
            ? "stripe"
            : "mercado_pago"
          : "mock",
      amount: discountQuote?.finalAmount ?? localizedPrice.amount,
      currency: localizedPrice.currency,
      exchange_rate_used: localizedPrice.exchangeRateUsed,
      fiscal_status: brazil ? "pending" : "not_required",
      metadata: {
        product_slug: product.slug,
        checkout_country: checkoutCountry,
        checkout_gateway_mode: mode,
        checkout_payment_method: paymentMethod,
        checkout_locale: input.locale,
        trial_days: product.trial_days || null,
        base_price_usd: localizedPrice.basePriceUsd,
        marketing_consent: marketingConsent ? "granted" : "denied",
        marketing_landing_url: input.marketing.landingUrl || null,
        marketing_utm_source: input.marketing.utmSource || null,
        marketing_utm_medium: input.marketing.utmMedium || null,
        marketing_utm_campaign: input.marketing.utmCampaign || null,
        marketing_utm_content: input.marketing.utmContent || null,
        marketing_utm_term: input.marketing.utmTerm || null,
        marketing_fbclid: input.marketing.fbclid || null,
        marketing_fbp: input.marketing.fbp || null,
        marketing_fbc: marketingFbc,
        marketing_client_ip_address: clientIpAddress,
        marketing_client_user_agent: clientUserAgent,
        marketing_attribution_recorded_at: marketingConsent
          ? new Date().toISOString()
          : null,
        ...discountMetadata(discountQuote)
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Não foi possível criar o pedido." },
        { status: 500 }
      );
    }

    const checkoutAccessToken = createCheckoutAccessToken(order.id);
    const checkoutReturnUrl = checkoutAccessToken
      ? createCheckoutReturnUrl(new URL(request.url).origin, order.id, {
          locale: input.locale,
          token: checkoutAccessToken
        })
      : null;

    if (!checkoutAccessToken || !checkoutReturnUrl) {
      await markOrderAsFailed(order.id, {
        checkout_error: "checkout_access_not_configured"
      });
      throw new PaymentConfigurationError(
        "O checkout está temporariamente indisponível."
      );
    }

    if (mode === "mock") {
      return NextResponse.json({
        gateway: "mock",
        orderId: order.id,
        redirectUrl: checkoutReturnUrl
      });
    }

    try {
      if (paymentMethod === "pix") {
        const pix = await createMercadoPagoPixPayment(order, product);
        return NextResponse.json({
          gateway: "mercado_pago",
          paymentMethod: "pix",
          orderId: order.id,
          checkoutAccessToken,
          returnUrl: checkoutReturnUrl,
          pix
        });
      }

      if (paymentMethod === "mercado_pago") {
        if (product.type === "subscription") {
          const subscription = await createMercadoPagoSubscription(order, product);
          return NextResponse.json({
            gateway: "mercado_pago",
            paymentMethod: "mercado_pago",
            orderId: order.id,
            redirectUrl: subscription.url
          });
        }
        const mercadoPago = await createMercadoPagoCheckoutPreference(
          order,
          product
        );
        return NextResponse.json({
          gateway: "mercado_pago",
          paymentMethod: "mercado_pago",
          orderId: order.id,
          redirectUrl: mercadoPago.url
        });
      }

      const stripe = await createStripeCheckoutSession(order, product);
      return NextResponse.json({
        gateway: "stripe",
        paymentMethod: "stripe",
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
    if (error instanceof PaymentConfigurationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 503 }
      );
    }

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
