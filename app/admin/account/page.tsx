import type { Metadata } from "next";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/checkout/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Minha conta"
};

export default async function AdminAccountPage({
  searchParams
}: {
  searchParams: Promise<{ updated?: "1"; error?: "current" | "password" | "mismatch" }>;
}) {
  const session = await requireAdmin();
  const params = await searchParams;

  return (
    <AdminShell title="Minha conta">
      <section className="max-w-xl rounded-lg border border-ink/10 bg-white p-5">
        <p className="text-sm font-bold text-graphite/60">E-mail conectado</p>
        <p className="mt-1 font-semibold text-ink">{session.email}</p>

        {params.updated === "1" ? (
          <p className="mt-5 rounded-md bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            Senha atualizada com sucesso.
          </p>
        ) : null}

        <form
          action="/api/admin/password/change"
          className="mt-6 grid gap-4"
          method="post"
        >
          <label className="grid gap-2 text-sm font-bold text-ink">
            Senha atual
            <input
              autoComplete="current-password"
              className="min-h-12 rounded-md border border-ink/15 px-3"
              name="current_password"
              required
              type="password"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            Nova senha
            <input
              autoComplete="new-password"
              className="min-h-12 rounded-md border border-ink/15 px-3"
              minLength={12}
              name="password"
              required
              type="password"
            />
            <span className="text-xs font-medium text-graphite/60">
              Mínimo de 12 caracteres, com pelo menos uma letra e um número.
            </span>
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            Confirmar nova senha
            <input
              autoComplete="new-password"
              className="min-h-12 rounded-md border border-ink/15 px-3"
              minLength={12}
              name="confirm_password"
              required
              type="password"
            />
          </label>

          {params.error ? (
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
              {params.error === "current"
                ? "A senha atual está incorreta."
                : params.error === "mismatch"
                  ? "As senhas não são iguais."
                  : "A nova senha não atende aos requisitos de segurança."}
            </p>
          ) : null}

          <button
            className="min-h-12 rounded-md bg-ink px-5 text-sm font-bold uppercase text-white"
            type="submit"
          >
            Alterar minha senha
          </button>
        </form>
      </section>
    </AdminShell>
  );
}
