import type { Metadata } from "next";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/checkout/admin-auth";
import { listAdminAccounts } from "@/lib/checkout/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Equipe"
};

export default async function AdminTeamPage({
  searchParams
}: {
  searchParams: Promise<{ invited?: string; error?: string }>;
}) {
  await requireAdmin();
  const [accounts, params] = await Promise.all([listAdminAccounts(), searchParams]);

  return (
    <AdminShell title="Equipe administrativa">
      {params.invited ? (
        <p className="mb-5 rounded-lg border border-turf/20 bg-turf/10 px-4 py-3 text-sm font-bold text-turf">
          Convite enviado. O novo administrador deve abrir o e-mail e criar a própria senha.
        </p>
      ) : null}
      {params.error ? (
        <p className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          Não foi possível enviar o convite. Confira o e-mail e tente novamente.
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.7fr)]">
        <section className="rounded-lg border border-ink/10 bg-white">
          <div className="border-b border-ink/10 p-4">
            <h2 className="text-lg font-bold text-ink">Administradores ativos</h2>
          </div>
          <div className="divide-y divide-ink/10">
            {accounts.map((account) => (
              <div className="flex flex-wrap items-center justify-between gap-3 p-4" key={account.id}>
                <div>
                  <p className="font-bold text-ink">{account.email}</p>
                  <p className="mt-1 text-xs text-graphite/60">
                    Criado em {new Date(account.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${account.active ? "bg-turf/10 text-turf" : "bg-red-50 text-red-700"}`}>
                  {account.active ? "Ativo" : "Inativo"}
                </span>
              </div>
            ))}
            {accounts.length === 0 ? (
              <p className="p-4 text-sm text-graphite/60">Nenhuma conta individual criada ainda.</p>
            ) : null}
          </div>
        </section>

        <section className="rounded-lg border border-ink/10 bg-white p-5">
          <p className="text-xs font-bold uppercase text-signal">Novo acesso</p>
          <h2 className="mt-2 text-xl font-bold text-ink">Convidar administrador</h2>
          <p className="mt-2 text-sm leading-6 text-graphite/65">
            A pessoa receberá um link seguro e definirá a própria senha. Não compartilhe sua senha pessoal.
          </p>
          <form action="/api/admin/team/invite" className="mt-5 grid gap-4" method="post">
            <label className="grid gap-2 text-sm font-semibold text-ink">
              E-mail do novo administrador
              <input autoCapitalize="none" autoComplete="email" className="min-h-12 rounded-md border border-ink/15 px-3 text-sm" name="email" required spellCheck={false} type="email" />
            </label>
            <button className="min-h-12 rounded-md bg-ink px-5 text-sm font-bold uppercase text-white" type="submit">
              Enviar convite
            </button>
          </form>
        </section>
      </div>
    </AdminShell>
  );
}
