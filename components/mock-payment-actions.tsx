"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

type MockPaymentActionsProps = {
  orderId: string;
};

export function MockPaymentActions({ orderId }: MockPaymentActionsProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<"approve" | "decline" | null>(null);
  const [error, setError] = useState("");

  async function simulate(action: "approve" | "decline") {
    setError("");
    setLoadingAction(action);

    try {
      const response = await fetch(`/api/checkout/mock/${orderId}/${action}`, {
        method: "POST"
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(payload.error || "Não foi possível simular o pagamento.");
        return;
      }

      router.push(
        action === "approve"
          ? `/checkout/success?order_id=${orderId}`
          : `/checkout/cancelled?order_id=${orderId}`
      );
      router.refresh();
    } catch {
      setError("Erro de conexão ao simular pagamento.");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="mt-8 rounded-lg border border-white/15 bg-white/10 p-4 text-left">
      <p className="text-sm font-bold uppercase text-gold">Gateway mock</p>
      <p className="mt-2 text-sm leading-6 text-white/72">
        Ambiente de teste: escolha um resultado para validar pedido, status e
        entrega antes de conectar Mercado Pago e Stripe.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-turf px-4 text-sm font-bold uppercase text-ink disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loadingAction !== null}
          onClick={() => simulate("approve")}
          type="button"
        >
          {loadingAction === "approve" ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
          )}
          Aprovar
        </button>
        <button
          className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/20 px-4 text-sm font-bold uppercase text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loadingAction !== null}
          onClick={() => simulate("decline")}
          type="button"
        >
          {loadingAction === "decline" ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle aria-hidden="true" className="h-4 w-4" />
          )}
          Recusar
        </button>
      </div>
      {error ? (
        <p className="mt-3 rounded-md bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-100">
          {error}
        </p>
      ) : null}
    </div>
  );
}
