"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ArrowRight, Check, Copy, CreditCard, Globe2, Loader2, QrCode } from "lucide-react";
import type {
  CheckoutPaymentMethod,
  CheckoutProduct
} from "@/lib/checkout/types";
import { getLocalizedProductCopy } from "@/lib/checkout/localization";
import {
  getMarketingCheckoutContext,
  trackCheckoutEvent
} from "@/components/conversion-tracker";

type CheckoutFormProps = {
  product: CheckoutProduct;
  locale?: "pt" | "en";
};

type PixState = {
  orderId: string;
  qrCode?: unknown;
  qrCodeBase64?: unknown;
  ticketUrl?: unknown;
};

type OrderStatusResponse = {
  status?: string;
  deliveryStatus?: string;
  error?: string;
};

type DiscountPreview = {
  code: string;
  description: string;
  type: string;
  value: number;
  currency: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
};

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat(currency === "BRL" ? "pt-BR" : "en-US", {
    style: "currency",
    currency
  }).format(amount);

const formatPostalCode = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5
    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
    : digits;
};

const countryDialCodes: Record<string, string> = {
  BR: "+55",
  US: "+1",
  PT: "+351",
  GB: "+44",
  ES: "+34"
};

const dialCodeOptions = [
  { code: "+55", country: "BR" },
  { code: "+1", country: "US" },
  { code: "+351", country: "PT" },
  { code: "+44", country: "GB" },
  { code: "+34", country: "ES" },
  { code: "+33", country: "FR" },
  { code: "+49", country: "DE" },
  { code: "+39", country: "IT" },
  { code: "+966", country: "SA" },
  { code: "+971", country: "AE" }
];

function flagEmoji(code: string) {
  return String.fromCodePoint(
    ...Array.from(code).map((letter) => letter.charCodeAt(0) + 127397)
  );
}

type MarketOptionProps = {
  active: boolean;
  description: string;
  flag: string;
  label: string;
  onSelect: () => void;
};

function MarketOption({
  active,
  description,
  flag,
  label,
  onSelect
}: MarketOptionProps) {
  return (
    <button
      aria-checked={active}
      className={`grid min-h-[108px] gap-2 rounded-lg border p-4 text-left transition ${
        active
          ? "border-signal bg-signal/[0.045] shadow-sm"
          : "border-ink/10 bg-white hover:border-ink/25"
      }`}
      onClick={onSelect}
      role="radio"
      type="button"
    >
      <span className="flex items-start justify-between gap-3">
        <span aria-hidden="true" className="text-3xl">{flag}</span>
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full border ${
            active
              ? "border-signal bg-signal text-white"
              : "border-ink/15 text-transparent"
          }`}
        >
          <Check aria-hidden="true" className="h-3.5 w-3.5" />
        </span>
      </span>
      <span>
        <span className="block text-sm font-black text-ink">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-graphite/65">
          {description}
        </span>
      </span>
    </button>
  );
}

type PaymentOptionProps = {
  active: boolean;
  children: ReactNode;
  description: string;
  icon: ReactNode;
  label: string;
  name: string;
  onSelect: () => void;
  value: CheckoutPaymentMethod;
};

function PaymentOption({
  active,
  children,
  description,
  icon,
  label,
  name,
  onSelect,
  value
}: PaymentOptionProps) {
  return (
    <label
      className={`grid cursor-pointer gap-3 rounded-md border p-3 transition sm:grid-cols-[auto_1fr_auto] sm:items-center ${
        active
          ? "border-signal bg-signal/[0.035] shadow-sm"
          : "border-ink/10 bg-white hover:border-ink/25"
      }`}
    >
      <input
        checked={active}
        className="h-4 w-4 accent-signal"
        name={name}
        onChange={onSelect}
        type="radio"
        value={value}
      />
      <span className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 text-ink">{icon}</span>
        <span className="min-w-0">
          <span className="block text-sm font-bold text-ink">{label}</span>
          <span className="mt-1 block text-xs leading-5 text-graphite/65">
            {description}
          </span>
        </span>
      </span>
      <span className="flex flex-wrap items-center gap-1.5 sm:justify-end">
        {children}
      </span>
    </label>
  );
}

function MercadoPagoBadge() {
  return (
    <span className="inline-flex min-h-8 items-center rounded-sm bg-[#ffe600] px-2.5 text-xs font-black text-[#263238]">
      mercado pago
    </span>
  );
}

function PixBadge() {
  return (
    <span className="inline-flex min-h-8 items-center rounded-sm bg-[#32bcad] px-2.5 text-xs font-black text-white">
      Pix
    </span>
  );
}

function StripeBadge() {
  return (
    <span className="inline-flex min-h-8 items-center rounded-sm bg-[#635bff] px-2.5 text-xs font-black lowercase text-white">
      stripe
    </span>
  );
}

function CardNetworkBadges() {
  return (
    <>
      <span className="inline-flex min-h-8 items-center rounded-sm bg-[#1434cb] px-2 text-[10px] font-black italic text-white">
        VISA
      </span>
      <span className="inline-flex min-h-8 items-center rounded-sm bg-ink px-2 text-[10px] font-black text-white">
        Mastercard
      </span>
    </>
  );
}

export function CheckoutForm({ product, locale = "pt" }: CheckoutFormProps) {
  const isEnglish = locale === "en";
  const isLoadProSubscription =
    product.id === "loadpro_founders" || product.id === "loadpro_founders_50";
  const isCoachingSubscription = product.id === "online_coaching_monthly";
  const isProject36 =
    product.id === "project_36" || product.id === "projeto_36_2022_pt";
  const isPowerPro = product.id === "power_pro";
  const productCopy = getLocalizedProductCopy(product, locale);
  const initialCountry = product.checkout_country_lock || (isEnglish ? "US" : "BR");
  const initialPaymentMethod =
    product.checkout_payment_methods?.[0] ||
    (isEnglish || isLoadProSubscription ? "stripe" : "mercado_pago");
  const [country, setCountry] = useState(initialCountry);
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>(initialPaymentMethod);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [document, setDocument] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");
  const [dialCode, setDialCode] = useState(initialCountry === "BR" ? "+55" : "+1");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pix, setPix] = useState<PixState | null>(null);
  const [pixStatus, setPixStatus] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountPreview | null>(null);

  const isBrazil = country === "BR";
  const isSubscription = product.type === "subscription";
  const acceptsPaymentMethod = (method: CheckoutPaymentMethod) =>
    !product.checkout_payment_methods?.length ||
    product.checkout_payment_methods.includes(method);
  const checkoutCurrency = isBrazil ? "BRL" : "USD";
  const checkoutAmount = isBrazil
    ? product.price_brl_estimated
    : product.base_price_usd;
  const price = useMemo(
    () =>
      formatMoney(
        appliedDiscount?.finalAmount ?? checkoutAmount,
        checkoutCurrency
      ),
    [appliedDiscount?.finalAmount, checkoutAmount, checkoutCurrency]
  );
  const usdPrice = useMemo(
    () => formatMoney(product.base_price_usd, "USD"),
    [product.base_price_usd]
  );
  const brlEstimate = useMemo(
    () => formatMoney(product.price_brl_estimated, "BRL"),
    [product.price_brl_estimated]
  );
  const discountAmount = useMemo(
    () =>
      appliedDiscount
        ? formatMoney(appliedDiscount.discountAmount, appliedDiscount.currency)
        : null,
    [appliedDiscount]
  );

  useEffect(() => {
    setAppliedDiscount(null);
    setDiscountError("");
  }, [country, product.slug]);

  function selectMarket(nextMarket: "BR" | "INTL") {
    const nextCountry =
      nextMarket === "BR" ? "BR" : country === "BR" ? "US" : country;
    setCountry(nextCountry);
    setDialCode(
      countryDialCodes[nextCountry] || (nextMarket === "BR" ? "+55" : "+1")
    );
    setPaymentMethod(
      product.checkout_payment_methods?.[0] ||
        (isLoadProSubscription || nextMarket === "INTL" ? "stripe" : "mercado_pago")
    );
  }

  function selectCountry(nextCountry: string) {
    setCountry(nextCountry);
    if (countryDialCodes[nextCountry]) {
      setDialCode(countryDialCodes[nextCountry]);
    }
    setPaymentMethod(
      product.checkout_payment_methods?.[0] ||
        (isLoadProSubscription || nextCountry !== "BR" ? "stripe" : "mercado_pago")
    );
  }

  async function applyDiscount() {
    setDiscountError("");
    setAppliedDiscount(null);

    const code = discountCode.trim();
    if (!code) {
      setDiscountError(isEnglish ? "Enter a discount code." : "Informe um cupom.");
      return;
    }

    setDiscountLoading(true);

    try {
      const response = await fetch("/api/checkout/discount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productSlug: product.slug,
          country,
          discountCode: code
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        setDiscountError(
          payload.error || (isEnglish ? "Invalid discount code." : "Cupom inválido.")
        );
        return;
      }

      setAppliedDiscount(payload as DiscountPreview);
      setDiscountCode(String(payload.code || code));
    } catch {
      setDiscountError(
        isEnglish
          ? "We could not validate this discount code."
          : "Não foi possível validar o cupom."
      );
    } finally {
      setDiscountLoading(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPix(null);
    setPixStatus(null);
    setLoading(true);
    void trackCheckoutEvent("checkout_submit", product.slug, {
      country,
      paymentMethod
    });

    try {
      const response = await fetch("/api/checkout/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productSlug: product.slug,
          name,
          email,
          country,
          document: isBrazil ? document : undefined,
          postalCode,
          address,
          whatsapp: `${dialCode}${whatsappNumber.replace(/\D/g, "")}`,
          paymentMethod,
          locale,
          marketing: getMarketingCheckoutContext(),
          discountCode: appliedDiscount?.code || discountCode || undefined
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        void trackCheckoutEvent("checkout_error", product.slug, {
          country,
          paymentMethod,
          errorCode: `api_${response.status}`
        });
        setError(
          payload.error ||
            (isEnglish
              ? "We could not start the secure checkout."
              : "Não foi possível iniciar o checkout.")
        );
        return;
      }

      if (payload.gateway === "mock" && payload.redirectUrl) {
        window.location.href = payload.redirectUrl;
        return;
      }

      if (payload.redirectUrl) {
        window.location.href = payload.redirectUrl;
        return;
      }

      if (
        payload.gateway === "mercado_pago" &&
        payload.paymentMethod === "pix" &&
        payload.pix
      ) {
        setPix({
          orderId: payload.orderId,
          ...payload.pix
        });
        setPixStatus("pending");
      }
    } catch {
      void trackCheckoutEvent("checkout_error", product.slug, {
        country,
        paymentMethod,
        errorCode: "network"
      });
      setError(
        isEnglish
          ? "Connection error while starting checkout. Please try again."
          : "Erro de conexão ao iniciar checkout."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyPixCode() {
    if (typeof pix?.qrCode !== "string") return;
    await navigator.clipboard.writeText(pix.qrCode);
  }

  useEffect(() => {
    const orderId = pix?.orderId;
    if (!orderId) return;
    const activeOrderId: string = orderId;

    let stopped = false;

    async function checkPixStatus() {
      try {
        const response = await fetch(
          `/api/checkout/status/${encodeURIComponent(activeOrderId)}`,
          { cache: "no-store" }
        );

        if (!response.ok) return;

        const payload = (await response.json()) as OrderStatusResponse;
        if (stopped || typeof payload.status !== "string") return;

        setPixStatus(payload.status);

        if (payload.status === "paid") {
          window.location.href = `/checkout/success?order_id=${encodeURIComponent(
            activeOrderId
          )}${isEnglish ? "&locale=en" : ""}`;
        }
      } catch {
        // Keep the QR Code available if a transient status check fails.
      }
    }

    void checkPixStatus();
    const interval = window.setInterval(checkPixStatus, 4000);

    return () => {
      stopped = true;
      window.clearInterval(interval);
    };
  }, [isEnglish, pix?.orderId]);

  return (
    <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-ink/10 pb-5">
        <div>
          <p className="text-sm font-bold uppercase text-signal">Checkout</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">{productCopy.name}</h2>
          <p className="mt-2 text-sm leading-6 text-graphite/70">
            {productCopy.description}
          </p>
        </div>
        <div className="rounded-md bg-ink px-3 py-2 text-right text-sm font-bold text-white">
          <p>{isBrazil ? brlEstimate : usdPrice}</p>
          <p className="mt-1 text-[11px] font-semibold text-white/65">
            {isSubscription
              ? isEnglish
                ? isLoadProSubscription
                  ? "per month · 7-day free trial"
                  : "per month"
                : isCoachingSubscription
                  ? "a cada 30 dias"
                : isLoadProSubscription
                  ? "por mês · 7 dias grátis · preço fundador"
                  : "por mês · preço fundador"
              : isBrazil
              ? product.checkout_country_lock
                ? "Pagamento único"
                : `${usdPrice} internacional`
              : isEnglish
                ? "One-time payment"
                : `${brlEstimate} no Brasil`}
          </p>
        </div>
      </div>

      <form className="mt-5 grid gap-4" onSubmit={submit}>
        {product.checkout_country_lock ? (
          <div className="grid gap-2 text-sm font-semibold text-ink">
            <span>{isEnglish ? "Country" : "País de cobrança"}</span>
            <div className="flex min-h-12 items-center rounded-md border border-ink/15 bg-smoke px-3 text-sm text-ink">
              {flagEmoji("BR")} Brasil
            </div>
            <span className="text-xs font-normal leading-5 text-graphite/60">
              {isSubscription
                ? "Checkout brasileiro com dados fiscais e cobrança recorrente em reais."
                : "Checkout brasileiro com pagamento único em reais."}
            </span>
          </div>
        ) : (
        <fieldset className="grid gap-3">
          <legend className="text-sm font-black text-ink">
            {isEnglish ? "Where will you pay?" : "Onde você vai pagar?"}
          </legend>
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
            <MarketOption
              active={isBrazil}
              description={
                isLoadProSubscription
                  ? isEnglish
                    ? "BRL · card with a 7-day free trial"
                    : "R$ · cartão com 7 dias grátis"
                  : isEnglish
                    ? "BRL · Pix or card · Mercado Pago"
                    : "R$ · Pix ou cartão · Mercado Pago"
              }
              flag={flagEmoji("BR")}
              label={isEnglish ? "Paying in Brazil" : "Estou no Brasil"}
              onSelect={() => selectMarket("BR")}
            />
            <MarketOption
              active={!isBrazil}
              description={
                isEnglish
                  ? "USD · international card · Stripe"
                  : "US$ · cartão internacional · Stripe"
              }
              flag={String.fromCodePoint(0x1f30d)}
              label={isEnglish ? "Paying from abroad" : "Estou fora do Brasil"}
              onSelect={() => selectMarket("INTL")}
            />
          </div>
          <p className="text-xs font-normal leading-5 text-graphite/60">
            {isEnglish
              ? "This choice defines the currency and payment options. It does not change the site language."
              : "Essa escolha define a moeda e as formas de pagamento, sem alterar o idioma do site."}
          </p>
        </fieldset>
        )}

        {!product.checkout_country_lock && !isBrazil ? (
          <label className="grid gap-2 text-sm font-semibold text-ink">
            {isEnglish ? "Billing country" : "País de cobrança"}
            <select
              autoComplete="country"
              className="min-h-12 rounded-md border border-ink/15 bg-white px-3 text-sm text-ink"
              onChange={(event) => selectCountry(event.target.value)}
              value={country}
            >
              <option value="US">{isEnglish ? "United States" : "Estados Unidos"}</option>
              <option value="PT">Portugal</option>
              <option value="GB">{isEnglish ? "United Kingdom" : "Reino Unido"}</option>
              <option value="ES">{isEnglish ? "Spain" : "Espanha"}</option>
              <option value="OTHER">{isEnglish ? "Other country" : "Outro país"}</option>
            </select>
          </label>
        ) : null}

        <fieldset className="grid gap-3 rounded-md border border-ink/10 bg-white p-3">
          <legend className="px-1 text-xs font-bold uppercase text-graphite/55">
            {isEnglish ? "Secure payment" : "Escolha como pagar"}
          </legend>
          <p className="text-sm font-semibold text-ink">
            {isLoadProSubscription
              ? isEnglish
                ? "Add a card securely. You pay nothing today and can cancel anytime."
                : "Cadastre o cartão com segurança. Você não paga nada hoje e pode cancelar quando quiser."
              : isCoachingSubscription
              ? "R$ 399 a cada 30 dias no cartão. Cancele quando quiser."
              : isSubscription
              ? isEnglish
                ? "Monthly card subscription. Cancel anytime."
                : "Assinatura mensal no cartão. Cancele quando quiser."
              : isBrazil
              ? isEnglish
                ? "Pay with Pix or card through Mercado Pago."
                : "Pague com Pix ou cartão pelo Mercado Pago."
              : isEnglish
                ? "International card payment securely processed by Stripe."
                : "Pagamento internacional seguro via Stripe."}
          </p>

          {isCoachingSubscription && acceptsPaymentMethod("stripe") ? (
            <PaymentOption
              active
              description="Cobrança recorrente de R$ 399 processada com segurança pela Stripe."
              icon={<CreditCard aria-hidden="true" className="h-5 w-5" />}
              label="Assinatura da assessoria"
              name="payment-method"
              onSelect={() => setPaymentMethod("stripe")}
              value="stripe"
            >
              <StripeBadge />
              <CardNetworkBadges />
            </PaymentOption>
          ) : isLoadProSubscription ? (
            <PaymentOption
              active
              description={
                isEnglish
                  ? "Stripe securely stores your card. The first monthly charge happens after the 7-day free trial."
                  : "A Stripe protege os dados do cartão. A primeira mensalidade será cobrada somente após os 7 dias grátis."
              }
              icon={<CreditCard aria-hidden="true" className="h-5 w-5" />}
              label={isEnglish ? "Card · 7-day free trial" : "Cartão · 7 dias grátis"}
              name="payment-method"
              onSelect={() => setPaymentMethod("stripe")}
              value="stripe"
            >
              <StripeBadge />
              <CardNetworkBadges />
            </PaymentOption>
          ) : isBrazil ? (
            <div className="grid gap-2">
              <PaymentOption
                active={paymentMethod === "mercado_pago"}
                description={
                  isSubscription
                    ? isEnglish
                      ? "Automatic monthly billing while your subscription remains active."
                      : "Cobrança automática mensal enquanto a assinatura permanecer ativa."
                    : isEnglish
                      ? "Complete your payment through Mercado Pago. Installments and conditions appear before confirmation."
                      : isPowerPro
                        ? "Finalize com cartão no Mercado Pago e revise os dados antes da confirmação."
                        : "Finalize no Mercado Pago. Parcelas e condições aparecem antes da confirmação."
                }
                icon={<CreditCard aria-hidden="true" className="h-5 w-5" />}
                label={
                  isSubscription
                    ? isEnglish
                      ? "Card · monthly subscription"
                      : "Cartão · assinatura mensal"
                    : isEnglish
                      ? "Card and installments"
                      : isPowerPro
                        ? "Cartão pelo Mercado Pago"
                        : "Cartão e parcelamento"
                }
                name="payment-method"
                onSelect={() => setPaymentMethod("mercado_pago")}
                value="mercado_pago"
              >
                <MercadoPagoBadge />
                <CardNetworkBadges />
              </PaymentOption>
              {!isSubscription ? (
                <PaymentOption
                  active={paymentMethod === "pix"}
                  description={
                    isEnglish
                      ? "QR Code and Pix Copy and Paste with fast confirmation."
                      : "QR Code e Pix Copia e Cola, com aprovação rápida."
                  }
                  icon={<QrCode aria-hidden="true" className="h-5 w-5" />}
                  label="Pix"
                  name="payment-method"
                  onSelect={() => setPaymentMethod("pix")}
                  value="pix"
                >
                  <PixBadge />
                </PaymentOption>
              ) : null}
            </div>
          ) : (
            <PaymentOption
              active
              description={
                isEnglish
                  ? "You will complete payment on Stripe's secure checkout."
                  : "Cartão de crédito em checkout internacional seguro."
              }
              icon={<CreditCard aria-hidden="true" className="h-5 w-5" />}
              label="Credit or debit card"
              name="payment-method"
              onSelect={() => setPaymentMethod("stripe")}
              value="stripe"
            >
              <StripeBadge />
              <CardNetworkBadges />
            </PaymentOption>
          )}
        </fieldset>

        <label className="grid gap-2 text-sm font-semibold text-ink">
          {isEnglish ? "Full name" : "Nome completo"}
          <input
            autoComplete="name"
            className="min-h-12 rounded-md border border-ink/15 px-3 text-sm text-ink"
            onChange={(event) => setName(event.target.value)}
            required
            type="text"
            value={name}
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-ink">
          {isEnglish ? "Email" : "E-mail"}
          <input
            autoComplete="email"
            className="min-h-12 rounded-md border border-ink/15 px-3 text-sm text-ink"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-ink">
          WhatsApp
          <span className="grid grid-cols-[112px_1fr] gap-2">
            <span className="relative">
              <Globe2
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-graphite/45"
              />
              <select
                aria-label={isEnglish ? "WhatsApp country code" : "DDI do WhatsApp"}
                autoComplete="tel-country-code"
                className="min-h-12 w-full appearance-none rounded-md border border-ink/15 bg-white pl-9 pr-2 text-sm font-bold text-ink"
                onChange={(event) => setDialCode(event.target.value)}
                value={dialCode}
              >
                {dialCodeOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code}
                  </option>
                ))}
              </select>
            </span>
            <input
              autoComplete="tel-national"
              className="min-h-12 min-w-0 rounded-md border border-ink/15 px-3 text-sm text-ink"
              inputMode="tel"
              maxLength={22}
              onChange={(event) => setWhatsappNumber(event.target.value)}
              placeholder={
                isBrazil
                  ? "11 99999-9999"
                  : isEnglish
                    ? "555 123 4567"
                    : "número com DDD"
              }
              required
              type="tel"
              value={whatsappNumber}
            />
          </span>
          <span className="text-xs font-normal leading-5 text-graphite/60">
            {isEnglish
              ? "Include your country code so our team can help with your order if needed."
              : "Inclua o DDI para que nossa equipe possa ajudar com seu pedido, se necessário."}
          </span>
        </label>

        {isBrazil ? <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-ink">
            {isBrazil ? "CEP" : "Código postal / ZIP code"}
            <input
              autoComplete="postal-code"
              className="min-h-12 rounded-md border border-ink/15 px-3 text-sm text-ink"
              inputMode={isBrazil ? "numeric" : "text"}
              maxLength={20}
              onChange={(event) =>
                setPostalCode(
                  isBrazil
                    ? formatPostalCode(event.target.value)
                    : event.target.value.slice(0, 20)
                )
              }
              placeholder={isBrazil ? "00000-000" : "Postal code"}
              required
              type="text"
              value={postalCode}
            />
          </label>
        </div> : null}

        {isBrazil ? <label className="grid gap-2 text-sm font-semibold text-ink">
          Endereço completo
          <textarea
            autoComplete="street-address"
            className="min-h-24 rounded-md border border-ink/15 p-3 text-sm text-ink"
            maxLength={240}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Rua, número, complemento, cidade e região/estado"
            required
            value={address}
          />
        </label> : null}

        {isBrazil ? (
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-ink">
              CPF ou CNPJ
              <input
                className="min-h-12 rounded-md border border-ink/15 px-3 text-sm text-ink"
                inputMode="numeric"
                onChange={(event) => setDocument(event.target.value)}
                placeholder="Somente números"
                required
                type="text"
                value={document}
              />
            </label>
          </div>
        ) : null}

        {product.discounts_enabled !== false ? (
        <details className="group rounded-md border border-ink/10 bg-white p-3">
          <summary className="cursor-pointer list-none text-sm font-semibold text-graphite/75">
            {isEnglish ? "Have a discount code?" : "Tem um cupom de desconto?"}
            <span className="ml-2 text-signal group-open:hidden">+</span>
          </summary>
          <div className="mt-3 grid gap-2">
          <label className="sr-only" htmlFor="discount-code">
            {isEnglish ? "Discount code" : "Cupom de desconto"}
          </label>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              className="min-h-12 rounded-md border border-ink/15 px-3 text-sm uppercase text-ink"
              id="discount-code"
              onChange={(event) => {
                const value = event.target.value;
                setDiscountCode(value);
                setDiscountError("");
                if (
                  appliedDiscount &&
                  value.trim().toUpperCase().replace(/\s+/g, "") !== appliedDiscount.code
                ) {
                  setAppliedDiscount(null);
                }
              }}
              placeholder={isEnglish ? "Enter your code" : "Digite seu código"}
              type="text"
              value={discountCode}
            />
            <button
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-ink/15 px-4 text-sm font-bold text-ink hover:bg-smoke disabled:cursor-not-allowed disabled:opacity-60"
              disabled={discountLoading}
              onClick={applyDiscount}
              type="button"
            >
              {discountLoading ? (
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : null}
              {isEnglish ? "Apply" : "Aplicar"}
            </button>
          </div>
          {appliedDiscount ? (
            <p className="text-sm font-bold text-turf">
              {isEnglish
                ? `Code ${appliedDiscount.code} applied.`
                : `Cupom ${appliedDiscount.code} aplicado.`}
            </p>
          ) : null}
          {discountError ? (
            <p className="text-sm font-semibold text-red-700">{discountError}</p>
          ) : null}
          </div>
        </details>
        ) : null}

        <div className="rounded-md border border-ink/10 bg-smoke px-3 py-2 text-sm text-graphite/75">
          {isProject36 ? (
            <div className="mb-2 rounded-md border border-emerald-700/20 bg-emerald-50 px-3 py-2">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">
                {isEnglish
                  ? "Limited launch offer"
                  : "Oferta de lancamento por tempo limitado"}
              </p>
              <p className="mt-1 text-xs text-graphite/70">
                <span className="mr-2 line-through">R$ 249,90</span>
                <strong className="text-emerald-800">R$ 199,90</strong>
              </p>
            </div>
          ) : null}
          {product.checkout_country_lock && isSubscription ? (
            <p>
              Valor recorrente: <strong>{brlEstimate}</strong> a cada 30 dias
            </p>
          ) : product.checkout_country_lock ? (
            <p>
              Valor desta compra: <strong>{brlEstimate}</strong>
            </p>
          ) : isEnglish ? (
            <p>
              International price: <strong>{usdPrice}</strong>
            </p>
          ) : (
            <>
              <p>
                Preço internacional: <strong>{usdPrice}</strong>
              </p>
              <p className="mt-1">
                Preço no Brasil: <strong>{brlEstimate}</strong>
              </p>
            </>
          )}
          {appliedDiscount ? (
            <>
              <p className="mt-1">
                {isEnglish ? "Original price:" : "Valor original:"}{" "}
                <strong>
                  {formatMoney(appliedDiscount.originalAmount, appliedDiscount.currency)}
                </strong>
              </p>
              <p className="mt-1 text-turf">
                {isEnglish ? "Discount:" : "Desconto:"} <strong>-{discountAmount}</strong>
              </p>
            </>
          ) : null}
          <p className="mt-1 font-bold text-ink">
            {isLoadProSubscription
              ? isEnglish
                ? "Due today:"
                : "Cobrança hoje:"
              : isCoachingSubscription
                ? "Assinatura da assessoria:"
              : isSubscription
              ? isEnglish
                ? "Monthly subscription:"
                : "Assinatura mensal:"
              : isEnglish
                ? "Total today:"
                : "Valor desta compra:"} {isLoadProSubscription ? formatMoney(0, checkoutCurrency) : price}
          </p>
          {isLoadProSubscription ? (
            <p className="mt-1 font-semibold text-ink">
              {isEnglish
                ? `After 7 days: ${price} per month.`
                : `Depois de 7 dias: ${price} por mês.`}
            </p>
          ) : null}
          {isSubscription ? (
            <p className="mt-1 text-xs text-graphite/65">
              {isEnglish
                ? "The founding price remains locked while the subscription stays active."
                : isCoachingSubscription
                  ? "A cobrança é renovada automaticamente a cada 30 dias até o cancelamento."
                  : "O preço fundador permanece protegido enquanto a assinatura continuar ativa."}
            </p>
          ) : null}
        </div>

        {error ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <button
          className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-signal px-5 text-sm font-bold uppercase text-white transition hover:bg-[#b90f20] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
          {isSubscription
            ? isLoadProSubscription
              ? isEnglish
                ? "Start 7-day free trial"
                : "Começar 7 dias grátis"
              : isEnglish
                ? "Start subscription"
                : isCoachingSubscription
                  ? "Assinar assessoria"
                  : "Assinar com segurança"
            : isEnglish
              ? "Continue to secure payment"
              : "Continuar para pagamento"}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </button>
        <p className="text-center text-xs leading-5 text-graphite/60">
          {isLoadProSubscription
            ? isEnglish
              ? "Stripe will request a valid card, but no charge is made today. Cancel before the trial ends to avoid the first monthly charge."
              : "A Stripe solicitará um cartão válido, mas não haverá cobrança hoje. Cancele antes do fim do teste para evitar a primeira mensalidade."
            : isCoachingSubscription
              ? "Você será redirecionado para a Stripe e poderá revisar os dados antes de confirmar a assinatura recorrente."
            : isEnglish
            ? "You will review the payment securely with Stripe before any charge is confirmed."
            : paymentMethod === "pix"
              ? "O Pix será gerado nesta página. O acesso é liberado após a confirmação."
              : `Você será redirecionado para ${paymentMethod === "stripe" ? "a Stripe" : "o Mercado Pago"} e poderá revisar antes de confirmar.`}
          {" "}
          <a className="font-semibold underline" href={isEnglish ? "/en/refunds" : "/reembolsos"}>
            {isEnglish ? "Refund policy" : "Política de reembolso"}
          </a>
        </p>
      </form>

      {pix ? (
        <div className="mt-6 rounded-lg border border-turf/20 bg-turf/5 p-4">
          <p className="text-sm font-bold uppercase text-turf">Pix gerado</p>
          <p className="mt-2 text-sm leading-6 text-graphite/72">
            Pedido {pix.orderId}. Mantenha esta tela aberta: quando o Mercado
            Pago confirmar o Pix, o acesso será liberado automaticamente e você
            também receberá o e-mail de acesso.
          </p>
          <div className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md border border-ink/10 bg-white px-3 text-sm font-bold text-ink">
            {pixStatus === "paid" ||
            pixStatus === "failed" ||
            pixStatus === "cancelled" ? null : (
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin text-turf" />
            )}
            {pixStatus === "paid"
              ? "Pagamento recebido. Redirecionando..."
              : pixStatus === "failed" || pixStatus === "cancelled"
                ? "Pagamento não confirmado. Gere um novo Pix se necessário."
                : "Aguardando confirmação do Pix..."}
          </div>
          {typeof pix.qrCodeBase64 === "string" ? (
            <img
              alt="QR Code Pix"
              className="mt-4 h-48 w-48 rounded-md border border-ink/10 bg-white p-2"
              src={`data:image/png;base64,${pix.qrCodeBase64}`}
            />
          ) : null}
          {typeof pix.qrCode === "string" ? (
            <div className="mt-4 grid gap-2">
              <textarea
                className="min-h-28 rounded-md border border-ink/15 bg-white p-3 text-xs text-graphite"
                readOnly
                value={pix.qrCode}
              />
              <button
                className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-white"
                onClick={copyPixCode}
                type="button"
              >
                <Copy aria-hidden="true" className="h-4 w-4" />
                Copiar código Pix
              </button>
            </div>
          ) : null}
          {typeof pix.ticketUrl === "string" ? (
            <a
              className="mt-4 inline-flex text-sm font-bold text-signal underline"
              href={pix.ticketUrl}
              rel="noreferrer"
              target="_blank"
            >
              Abrir página do pagamento
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
