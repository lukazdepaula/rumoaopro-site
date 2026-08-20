import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requirePendingAdminMfa } from "@/lib/checkout/admin-auth";
import { getAdminAccountByEmail } from "@/lib/checkout/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Verificação em duas etapas",
  robots: { index: false, follow: false }
};

export default async function AdminMfaPage({
  searchParams
}: {
  searchParams: Promise<{ error?: "invalid" | "rate-limit" | "unavailable" }>;
}) {
  const session = await requirePendingAdminMfa();
  const account = await getAdminAccountByEmail(session.email);
  if (!account?.mfa_enabled_at || !account.mfa_secret_encrypted) {
    redirect(session.setupSecret ? "/admin/mfa/setup" : "/admin/login");
  }
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.06] p-6">
        <p className="text-sm font-bold uppercase text-gold">Segunda etapa</p>
        <h1 className="mt-3 font-display text-3xl uppercase">
          Confirme seu acesso
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/65">
          Digite o código de 6 dígitos do seu aplicativo autenticador. Se perdeu
          o aparelho, use um dos códigos de recuperação.
        </p>
        <form action="/api/admin/mfa/verify" className="mt-6 grid gap-4" method="post">
          <label className="grid gap-2 text-sm font-semibold">
            Código de segurança
            <input
              autoCapitalize="characters"
              autoComplete="one-time-code"
              className="min-h-12 rounded-md border border-white/15 bg-white px-3 text-center font-mono text-lg tracking-[0.2em] text-ink"
              maxLength={14}
              name="code"
              required
              spellCheck={false}
            />
          </label>
          {params.error === "invalid" ? (
            <p className="rounded-md bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-100">
              Código inválido, expirado ou já utilizado.
            </p>
          ) : null}
          {params.error === "rate-limit" ? (
            <p className="rounded-md bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-100">
              Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.
            </p>
          ) : null}
          {params.error === "unavailable" ? (
            <p className="rounded-md bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-100">
              Verificação temporariamente indisponível. Entre novamente.
            </p>
          ) : null}
          <button
            className="focus-ring min-h-12 rounded-md bg-white px-5 text-sm font-bold uppercase text-ink"
            type="submit"
          >
            Verificar e entrar
          </button>
        </form>
      </section>
    </main>
  );
}
