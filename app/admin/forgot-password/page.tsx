import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Recuperar senha",
  robots: { index: false, follow: false }
};

export default async function AdminForgotPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ sent?: "1" }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.06] p-6">
        <p className="text-sm font-bold uppercase text-gold">RumoAoPro</p>
        <h1 className="mt-3 font-display text-3xl uppercase">Definir senha</h1>
        <p className="mt-3 text-sm leading-6 text-white/65">
          Informe seu e-mail de administrador. Enviaremos um link seguro para
          criar ou redefinir sua senha.
        </p>

        {params.sent === "1" ? (
          <div className="mt-6 rounded-md bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-100">
            Se o e-mail estiver autorizado, o link será enviado em instantes.
            Verifique também a caixa de spam.
          </div>
        ) : (
          <form
            action="/api/admin/password/request"
            className="mt-6 grid gap-4"
            method="post"
          >
            <label className="grid gap-2 text-sm font-semibold">
              E-mail
              <input
                autoCapitalize="none"
                autoComplete="email"
                className="min-h-12 rounded-md border border-white/15 bg-white px-3 text-sm text-ink"
                inputMode="email"
                name="email"
                required
                spellCheck={false}
                type="email"
              />
            </label>
            <button
              className="focus-ring min-h-12 rounded-md bg-white px-5 text-sm font-bold uppercase text-ink"
              type="submit"
            >
              Enviar link seguro
            </button>
          </form>
        )}

        <Link
          className="mt-5 block text-center text-sm font-semibold text-white/75 underline decoration-white/30 underline-offset-4 hover:text-white"
          href="/admin/login"
        >
          Voltar ao login
        </Link>
      </section>
    </main>
  );
}
