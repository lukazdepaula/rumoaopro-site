"use client";

import { Check, Copy, ExternalLink, Link2 } from "lucide-react";
import { useState } from "react";

type AdminPaymentLinkButtonProps = {
  orderId: string;
};

type PaymentLinkResponse = {
  url?: string;
  error?: string;
};

export function AdminPaymentLinkButton({
  orderId
}: AdminPaymentLinkButtonProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  async function copyLink(paymentUrl: string) {
    try {
      await navigator.clipboard.writeText(paymentUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function generateLink() {
    setLoading(true);
    setError("");
    setCopied(false);

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/payment-link`,
        { method: "POST" }
      );
      const payload = (await response.json()) as PaymentLinkResponse;

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Não foi possível gerar o link.");
      }

      setUrl(payload.url);
      await copyLink(payload.url);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível gerar o link."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!url) {
    return (
      <div className="grid gap-2">
        <button
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#009ee3] px-4 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-65"
          disabled={loading}
          onClick={generateLink}
          type="button"
        >
          <Link2 aria-hidden="true" size={18} />
          {loading ? "Gerando link..." : "Gerar link parcelado"}
        </button>
        {error ? <p className="text-xs font-semibold text-red-700">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="grid gap-2 rounded-md border border-[#009ee3]/20 bg-[#009ee3]/5 p-3">
      <p className="text-xs font-bold text-ink">
        Link do Mercado Pago em até 12x
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          className="flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#009ee3] px-3 text-xs font-bold text-white"
          onClick={() => copyLink(url)}
          type="button"
        >
          {copied ? <Check aria-hidden="true" size={16} /> : <Copy aria-hidden="true" size={16} />}
          {copied ? "Copiado" : "Copiar link"}
        </button>
        <a
          className="flex min-h-10 items-center justify-center gap-2 rounded-md border border-ink/15 px-3 text-xs font-bold text-ink"
          href={url}
          rel="noreferrer"
          target="_blank"
        >
          <ExternalLink aria-hidden="true" size={16} />
          Abrir
        </a>
      </div>
      <p className="break-all text-[11px] leading-4 text-graphite/65">{url}</p>
    </div>
  );
}
