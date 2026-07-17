import type { Metadata } from "next";
import Link from "next/link";
import { PasswordField } from "@/components/password-field";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Login",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{
    error?: "invalid" | "rate-limit" | "unavailable";
    reset?: "success";
  }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.06] p-6">
        <p className="text-sm font-bold uppercase text-gold">RumoAoPro</p>
        <h1 className="mt-3 font-display text-3xl uppercase">
          Acesso admin
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/65">
          Área interna para acompanhar pedidos, entregas e dados fiscais.
        </p>
        <form action="/api/admin/login" className="mt-6 grid gap-4" method="post">
          <label className="grid gap-2 text-sm font-semibold">
            E-mail
            <input
              autoCapitalize="none"
              autoComplete="username"
              className="min-h-12 rounded-md border border-white/15 bg-white px-3 text-sm text-ink"
              inputMode="email"
              name="email"
              required
              spellCheck={false}
              type="email"
            />
          </label>
          <PasswordField
            autoComplete="current-password"
            label="Senha"
            name="password"
          />
          {params.error === "invalid" ? (
            <p className="rounded-md bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-100">
              E-mail ou senha inválidos.
            </p>
          ) : null}
          {params.error === "rate-limit" ? (
            <p className="rounded-md bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-100">
              Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.
            </p>
          ) : null}
          {params.error === "unavailable" ? (
            <p className="rounded-md bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-100">
              Acesso temporariamente indisponível. Tente novamente mais tarde.
            </p>
          ) : null}
          {params.reset === "success" ? (
            <p className="rounded-md bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-100">
              Senha criada com sucesso. Entre com sua nova senha.
            </p>
          ) : null}
          <button
            className="focus-ring min-h-12 rounded-md bg-white px-5 text-sm font-bold uppercase text-ink"
            type="submit"
          >
            Entrar
          </button>
          <Link
            className="text-center text-sm font-semibold text-white/75 underline decoration-white/30 underline-offset-4 hover:text-white"
            href="/admin/forgot-password"
          >
            Criar ou redefinir minha senha
          </Link>
        </form>
      </section>
    </main>
  );
}
