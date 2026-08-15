"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

type AdminCheckoutLinkCardProps = {
  checkoutUrl: string;
};

export function AdminCheckoutLinkCard({
  checkoutUrl
}: AdminCheckoutLinkCardProps) {
  const [copied, setCopied] = useState(false);

  async function copyCheckoutUrl() {
    await navigator.clipboard.writeText(checkoutUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
      <p className="min-w-0 break-all rounded-md border border-ink/10 bg-smoke px-3 py-3 text-sm font-semibold text-graphite">
        {checkoutUrl}
      </p>
      <button
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-signal px-4 text-sm font-bold text-white"
        onClick={copyCheckoutUrl}
        type="button"
      >
        {copied ? <Check aria-hidden="true" size={17} /> : <Copy aria-hidden="true" size={17} />}
        {copied ? "Copiado" : "Copiar link"}
      </button>
      <a
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink/15 px-4 text-sm font-bold text-ink"
        href={checkoutUrl}
        rel="noreferrer"
        target="_blank"
      >
        <ExternalLink aria-hidden="true" size={17} />
        Abrir
      </a>
    </div>
  );
}
