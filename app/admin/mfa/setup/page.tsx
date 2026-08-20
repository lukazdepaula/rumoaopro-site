import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requirePendingAdminMfa } from "@/lib/checkout/admin-auth";
import { adminMfaOtpAuthUri } from "@/lib/checkout/admin-mfa";
import { getAdminAccountByEmail } from "@/lib/checkout/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Ativar verificação em duas etapas",
  robots: { index: false, follow: false }
};

export default async function AdminMfaSetupPage({
  searchParams
}: {
  searchParams: Promise<{ error?: "invalid" | "rate-limit" | "unavailable" }>;
}) {
  const session = await requirePendingAdminMfa();
  const account = await getAdminAccountByEmail(session.email);
  if (account?.mfa_enabled_at) redirect("/admin/mfa");
  if (!account || !session.setupSecret) redirect("/admin/login");
  const params = await searchParams;
  const otpAuthUri = adminMfaOtpAuthUri(account.email, session.setupSecret);

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4 py-10 text-white">
      <section className="w-full max-w-lg rounded-lg border border-white/10 bg-white/[0.06] p-6">
        <p className="text-sm font-bold uppercase text-gold">Proteção obrigatória</p>
        <h1 className="mt-3 font-display text-3xl uppercase">
          Ative o código de segurança
        </h1>
        <ol className="mt-4 grid gap-3 text-sm leading-6 text-white/70">
          <li>1. Abra Google Authenticator, Microsoft Authenticator ou 1Password.</li>
          <li>2. Escolha adicionar uma conta e informe a chave abaixo.</li>
          <li>3. Digite o código de 6 dígitos gerado pelo aplicativo.</li>
        </ol>

        <div className="mt-5 rounded-md border border-white/15 bg-black/25 p-4">
          <p className="text-xs font-bold uppercase text-white/55">Chave de configuração</p>
          <code className="mt-2 block break-all font-mono text-base font-bold tracking-wider text-white">
            {session.setupSecret}
          </code>
          <a
            className="mt-3 inline-flex text-sm font-semibold text-gold underline underline-offset-4"
            href={otpAuthUri}
          >
            Abrir diretamente no autenticador
          </a>
        </div>

        <form action="/api/admin/mfa/setup" className="mt-6 grid gap-4" method="post">
          <label className="grid gap-2 text-sm font-semibold">
            Código de 6 dígitos
            <input
              autoComplete="one-time-code"
              className="min-h-12 rounded-md border border-white/15 bg-white px-3 text-center font-mono text-lg tracking-[0.25em] text-ink"
              inputMode="numeric"
              maxLength={6}
              minLength={6}
              name="code"
              pattern="[0-9]{6}"
              required
            />
          </label>
          {params.error === "invalid" ? (
            <p className="rounded-md bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-100">
              O código não confere. Aguarde um novo código e tente novamente.
            </p>
          ) : null}
          {params.error === "rate-limit" ? (
            <p className="rounded-md bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-100">
              Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.
            </p>
          ) : null}
          {params.error === "unavailable" ? (
            <p className="rounded-md bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-100">
              Não foi possível concluir a ativação. Entre novamente e tente mais tarde.
            </p>
          ) : null}
          <button
            className="focus-ring min-h-12 rounded-md bg-white px-5 text-sm font-bold uppercase text-ink"
            type="submit"
          >
            Ativar proteção
          </button>
        </form>
      </section>
    </main>
  );
}
