import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Nova senha",
  robots: { index: false, follow: false }
};

export default async function AdminResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{
    token?: string;
    error?: "invalid" | "password" | "mismatch";
  }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.06] p-6">
        <p className="text-sm font-bold uppercase text-gold">RumoAoPro</p>
        <h1 className="mt-3 font-display text-3xl uppercase">Nova senha</h1>
        <p className="mt-3 text-sm leading-6 text-white/65">
          Use pelo menos 12 caracteres, incluindo uma letra e um número.
        </p>

        {!params.token || params.error === "invalid" ? (
          <div className="mt-6 grid gap-4">
            <p className="rounded-md bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-100">
              Este link é inválido ou expirou. Solicite um novo link.
            </p>
            <Link
              className="focus-ring flex min-h-12 items-center justify-center rounded-md bg-white px-5 text-sm font-bold uppercase text-ink"
              href="/admin/forgot-password"
            >
              Solicitar novo link
            </Link>
          </div>
        ) : (
          <form
            action="/api/admin/password/reset"
            className="mt-6 grid gap-4"
            method="post"
          >
            <input name="token" type="hidden" value={params.token} />
            <label className="grid gap-2 text-sm font-semibold">
              Nova senha
              <input
                autoComplete="new-password"
                className="min-h-12 rounded-md border border-white/15 bg-white px-3 text-sm text-ink"
                minLength={12}
                name="password"
                required
                type="password"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Confirmar nova senha
              <input
                autoComplete="new-password"
                className="min-h-12 rounded-md border border-white/15 bg-white px-3 text-sm text-ink"
                minLength={12}
                name="confirm_password"
                required
                type="password"
              />
            </label>
            {params.error === "password" ? (
              <p className="rounded-md bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-100">
                A senha precisa ter 12 caracteres, uma letra e um número.
              </p>
            ) : null}
            {params.error === "mismatch" ? (
              <p className="rounded-md bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-100">
                As senhas não são iguais.
              </p>
            ) : null}
            <button
              className="focus-ring min-h-12 rounded-md bg-white px-5 text-sm font-bold uppercase text-ink"
              type="submit"
            >
              Salvar nova senha
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
