"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Copy, CreditCard, Loader2, QrCode } from "lucide-react";
import type { CheckoutProduct } from "@/lib/checkout/types";

type CheckoutFormProps = {
  product: CheckoutProduct;
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

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat(currency === "BRL" ? "pt-BR" : "en-US", {
    style: "currency",
    currency
  }).format(amount);

export function CheckoutForm({ product }: CheckoutFormProps) {
  const [country, setCountry] = useState("BR");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [document, setDocument] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pix, setPix] = useState<PixState | null>(null);
  const [pixStatus, setPixStatus] = useState<string | null>(null);

  const isBrazil = country === "BR";
  const price = useMemo(
    () =>
      formatMoney(
        isBrazil ? product.price_brl_estimated : product.base_price_usd,
        isBrazil ? "BRL" : "USD"
      ),
    [isBrazil, product.base_price_usd, product.price_brl_estimated]
  );
  const usdPrice = useMemo(
    () => formatMoney(product.base_price_usd, "USD"),
    [product.base_price_usd]
  );
  const brlEstimate = useMemo(
    () => formatMoney(product.price_brl_estimated, "BRL"),
    [product.price_brl_estimated]
  );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPix(null);
    setPixStatus(null);
    setLoading(true);

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
          document: isBrazil ? document : undefined
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error || "Não foi possível iniciar o checkout.");
        return;
      }

      if (payload.gateway === "mock" && payload.redirectUrl) {
        window.location.href = payload.redirectUrl;
        return;
      }

      if (payload.gateway === "stripe" && payload.redirectUrl) {
        window.location.href = payload.redirectUrl;
        return;
      }

      if (payload.gateway === "mercado_pago") {
        setPix({
          orderId: payload.orderId,
          ...payload.pix
        });
        setPixStatus("pending");
      }
    } catch {
      setError("Erro de conexão ao iniciar checkout.");
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
          )}`;
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
  }, [pix?.orderId]);

  return (
    <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-ink/10 pb-5">
        <div>
          <p className="text-sm font-bold uppercase text-signal">Checkout</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">{product.name}</h2>
          <p className="mt-2 text-sm leading-6 text-graphite/70">
            {product.description}
          </p>
        </div>
        <div className="rounded-md bg-ink px-3 py-2 text-right text-sm font-bold text-white">
          <p>{usdPrice}</p>
          <p className="mt-1 text-[11px] font-semibold text-white/65">
            aprox. {brlEstimate}
          </p>
        </div>
      </div>

      <form className="mt-5 grid gap-4" onSubmit={submit}>
        <div className="rounded-md border border-ink/10 bg-white p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-graphite/55">
                Pagamentos disponíveis
              </p>
              <p className="mt-1 text-sm font-semibold text-ink">
                Brasil no Pix. Exterior no cartão internacional.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div
                className={`flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm font-bold transition ${
                  !isBrazil
                    ? "border-[#635bff] bg-[#f4f2ff] text-[#302a85]"
                    : "border-ink/10 bg-smoke text-graphite/70"
                }`}
              >
                <CreditCard aria-hidden="true" className="h-4 w-4" />
                <span className="rounded-sm bg-[#635bff] px-2 py-1 text-xs font-black lowercase tracking-normal text-white">
                  stripe
                </span>
              </div>
              <div
                className={`flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm font-bold transition ${
                  isBrazil
                    ? "border-[#00a650] bg-[#ecfff5] text-[#006b3c]"
                    : "border-ink/10 bg-smoke text-graphite/70"
                }`}
              >
                <QrCode aria-hidden="true" className="h-4 w-4" />
                <span className="rounded-sm bg-[#00a650] px-2 py-1 text-xs font-black text-white">
                  Pix
                </span>
                <span className="hidden text-xs font-bold sm:inline">
                  Mercado Pago
                </span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs font-semibold text-graphite/60">
            Forma deste checkout: {isBrazil ? "Mercado Pago / Pix" : "Stripe / Cartão"}.
          </p>
        </div>

        <label className="grid gap-2 text-sm font-semibold text-ink">
          País
          <select
            className="min-h-12 rounded-md border border-ink/15 bg-white px-3 text-sm text-ink"
            onChange={(event) => setCountry(event.target.value)}
            value={country}
          >
            <option value="BR">Brasil</option>
            <option value="US">United States</option>
            <option value="PT">Portugal</option>
            <option value="GB">United Kingdom</option>
            <option value="ES">Spain</option>
            <option value="OTHER">Other country</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-ink">
          Nome completo
          <input
            className="min-h-12 rounded-md border border-ink/15 px-3 text-sm text-ink"
            onChange={(event) => setName(event.target.value)}
            required
            type="text"
            value={name}
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-ink">
          E-mail
          <input
            className="min-h-12 rounded-md border border-ink/15 px-3 text-sm text-ink"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>

        {isBrazil ? (
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
        ) : null}

        <div className="rounded-md border border-ink/10 bg-smoke px-3 py-2 text-sm text-graphite/75">
          <p>
            Preço internacional: <strong>{usdPrice}</strong>
          </p>
          <p className="mt-1">
            Brasil: aproximadamente <strong>{brlEstimate}</strong>. O valor
            final em BRL é calculado no checkout com a taxa configurada.
          </p>
          <p className="mt-1 font-bold text-ink">Valor desta compra: {price}</p>
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
          Continuar para pagamento
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </button>
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
