"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ArrowRight, Copy, CreditCard, Loader2, QrCode } from "lucide-react";
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
  const isLoadProFounders = product.id === "loadpro_founders";
  const isProject36 =
    product.id === "project_36" || product.id === "projeto_36_2022_pt";
  const productCopy = getLocalizedProductCopy(product, locale);
  const [country, setCountry] = useState(isEnglish ? "US" : "BR");
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>(
      isEnglish || isLoadProFounders ? "stripe" : "mercado_pago"
    );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [document, setDocument] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
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
          whatsapp,
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
                ? isLoadProFounders
                  ? "per month · 7-day free trial"
                  : "per month"
                : isLoadProFounders
                  ? "por mês · 7 dias grátis · preço fundador"
                  : "por mês · preço fundador"
              : isBrazil
              ? `${usdPrice} internacional`
              : isEnglish
                ? "One-time payment"
                : `${brlEstimate} no Brasil`}
          </p>
        </div>
      </div>

      <form className="mt-5 grid gap-4" onSubmit={submit}>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          {isEnglish ? "Country" : "País"}
          <select
            autoComplete="country"
            className="min-h-12 rounded-md border border-ink/15 bg-white px-3 text-sm text-ink"
            onChange={(event) => {
              const nextCountry = event.target.value;
              setCountry(nextCountry);
              setPaymentMethod(
                isLoadProFounders || nextCountry !== "BR"
                  ? "stripe"
                  : "mercado_pago"
              );
            }}
            value={country}
          >
            {!isEnglish ? <option value="BR">Brasil</option> : null}
            <option value="US">United States</option>
            <option value="PT">Portugal</option>
            <option value="GB">United Kingdom</option>
            <option value="ES">Spain</option>
            <option value="OTHER">Other country</option>
          </select>
          <span className="text-xs font-normal leading-5 text-graphite/60">
            {isEnglish
              ? "Your country defines the currency and available payment method."
              : "O país define a moeda e as formas de pagamento disponíveis."}
          </span>
        </label>

        <fieldset className="grid gap-3 rounded-md border border-ink/10 bg-white p-3">
          <legend className="px-1 text-xs font-bold uppercase text-graphite/55">
            {isEnglish ? "Secure payment" : "Escolha como pagar"}
          </legend>
          <p className="text-sm font-semibold text-ink">
            {isLoadProFounders
              ? isEnglish
                ? "Add a card securely. You pay nothing today and can cancel anytime."
                : "Cadastre o cartão com segurança. Você não paga nada hoje e pode cancelar quando quiser."
              : isSubscription
              ? isEnglish
                ? "Monthly card subscription. Cancel anytime."
                : "Assinatura mensal no cartão. Cancele quando quiser."
              : isBrazil
              ? "Cartão parcelado, Pix ou cartão internacional."
              : isEnglish
                ? "International card payment securely processed by Stripe."
                : "Pagamento internacional seguro via Stripe."}
          </p>

          {isLoadProFounders ? (
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
                    ? "Cobrança automática mensal de R$ 49,90 enquanto a assinatura permanecer ativa."
                    : "Finalize no Mercado Pago. Parcelas e condições aparecem antes da confirmação."
                }
                icon={<CreditCard aria-hidden="true" className="h-5 w-5" />}
                label={isSubscription ? "Cartão · assinatura mensal" : "Cartão e parcelamento"}
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
                  description="QR Code e Pix Copia e Cola, com aprovação rápida."
                  icon={<QrCode aria-hidden="true" className="h-5 w-5" />}
                  label="Pix"
                  name="payment-method"
                  onSelect={() => setPaymentMethod("pix")}
                  value="pix"
                >
                  <PixBadge />
                </PaymentOption>
              ) : null}
              <PaymentOption
                active={paymentMethod === "stripe"}
                description={
                  isSubscription
                    ? "Alternativa de assinatura mensal processada com segurança pela Stripe."
                    : "Cartão de crédito em checkout internacional seguro."
                }
                icon={<CreditCard aria-hidden="true" className="h-5 w-5" />}
                label="Cartão via Stripe"
                name="payment-method"
                onSelect={() => setPaymentMethod("stripe")}
                value="stripe"
              >
                <StripeBadge />
              </PaymentOption>
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

        {isBrazil ? <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-ink">
            WhatsApp com código do país (DDI)
            <input
              autoComplete="tel"
              className="min-h-12 rounded-md border border-ink/15 px-3 text-sm text-ink"
              inputMode="tel"
              maxLength={24}
              onChange={(event) => setWhatsapp(event.target.value)}
              placeholder={isBrazil ? "+55 11 99999-9999" : "+1 555 123 4567"}
              required
              type="tel"
              value={whatsapp}
            />
          </label>
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
          {isEnglish ? (
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
            {isLoadProFounders
              ? isEnglish
                ? "Due today:"
                : "Cobrança hoje:"
              : isSubscription
              ? isEnglish
                ? "Monthly subscription:"
                : "Assinatura mensal:"
              : isEnglish
                ? "Total today:"
                : "Valor desta compra:"} {isLoadProFounders ? formatMoney(0, checkoutCurrency) : price}
          </p>
          {isLoadProFounders ? (
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
            ? isLoadProFounders
              ? isEnglish
                ? "Start 7-day free trial"
                : "Começar 7 dias grátis"
              : isEnglish
                ? "Start subscription"
                : "Assinar com segurança"
            : isEnglish
              ? "Continue to secure payment"
              : "Continuar para pagamento"}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </button>
        <p className="text-center text-xs leading-5 text-graphite/60">
          {isLoadProFounders
            ? isEnglish
              ? "Stripe will request a valid card, but no charge is made today. Cancel before the trial ends to avoid the first monthly charge."
              : "A Stripe solicitará um cartão válido, mas não haverá cobrança hoje. Cancele antes do fim do teste para evitar a primeira mensalidade."
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
