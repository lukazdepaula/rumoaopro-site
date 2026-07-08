import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Login"
};

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
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
            Senha
            <input
              className="min-h-12 rounded-md border border-white/15 bg-white px-3 text-sm text-ink"
              name="password"
              required
              type="password"
            />
          </label>
          {params.error ? (
            <p className="rounded-md bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-100">
              Senha inválida ou ADMIN_PASSWORD não configurado.
            </p>
          ) : null}
          <button
            className="focus-ring min-h-12 rounded-md bg-white px-5 text-sm font-bold uppercase text-ink"
            type="submit"
          >
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}
