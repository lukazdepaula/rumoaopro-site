"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin.error_boundary]", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f6f7] px-4 py-10 text-ink">
      <section className="w-full max-w-lg rounded-xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-signal">RumoAoPro Admin</p>
        <h1 className="mt-3 text-2xl font-black tracking-tight">O painel encontrou uma instabilidade</h1>
        <p className="mt-3 text-sm leading-6 text-graphite/65">
          Seus dados continuam protegidos. Uma consulta externa falhou e o painel interrompeu o carregamento para não mostrar informações incorretas.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            className="min-h-11 rounded-lg bg-ink px-5 text-sm font-bold text-white transition hover:bg-black"
            onClick={reset}
            type="button"
          >
            Tentar novamente
          </button>
          <a
            className="min-h-11 rounded-lg border border-ink/15 px-5 py-3 text-center text-sm font-bold text-ink transition hover:bg-ink/5"
            href="/admin/login"
          >
            Voltar ao acesso
          </a>
        </div>
      </section>
    </main>
  );
}
