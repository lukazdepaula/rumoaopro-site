import Link from "next/link";
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/checkout/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Migrações Shopify"
};

type LegacyAccessPageProps = {
  searchParams: Promise<{
    status?: string;
    orderId?: string;
  }>;
};

const statusMessages: Record<string, { className: string; text: string }> = {
  sent: {
    className: "border-turf/20 bg-turf/10 text-turf",
    text: "Compra antiga registrada, acesso liberado no site e no RaptorPro, e convite enviado ao cliente."
  },
  already_migrated: {
    className: "border-gold/30 bg-gold/10 text-ink",
    text: "Esse pedido do Shopify já havia sido migrado. Nenhum acesso duplicado foi criado."
  },
  invalid: {
    className: "border-red-200 bg-red-50 text-red-700",
    text: "Revise os dados informados. A migração não foi executada."
  },
  email_unavailable: {
    className: "border-red-200 bg-red-50 text-red-700",
    text: "O acesso foi preparado, mas o serviço de e-mail não está disponível. Abra o pedido e tente novamente."
  },
  email_error: {
    className: "border-red-200 bg-red-50 text-red-700",
    text: "O acesso foi preparado, mas o convite não foi enviado. Abra o pedido e reprocesse o acesso."
  },
  error: {
    className: "border-red-200 bg-red-50 text-red-700",
    text: "Não foi possível concluir a migração. Nenhuma cobrança foi criada."
  }
};

export default async function LegacyAccessPage({ searchParams }: LegacyAccessPageProps) {
  await requireAdmin("/admin/legacy-access");
  const query = await searchParams;
  const message = query.status ? statusMessages[query.status] : null;

  return (
    <AdminShell title="Migrações do Shopify">
      <div className="grid gap-6 lg:grid-cols-[0.7fr_0.3fr]">
        <section className="rounded-lg border border-ink/10 bg-white p-5 sm:p-6">
          <p className="text-sm leading-6 text-graphite/75">
            Use este formulário somente depois de confirmar que o pedido antigo está como pago no Shopify.
            A operação não cobra o cliente: ela registra a referência antiga, cria um acesso revogável no novo
            site, libera o programa no RaptorPro e envia um convite.
          </p>

          {message ? (
            <div className={`mt-5 rounded-lg border px-4 py-3 text-sm font-bold ${message.className}`}>
              <p>{message.text}</p>
              {query.orderId ? (
                <Link className="mt-2 inline-block underline" href={`/admin/orders/${query.orderId}`}>
                  Abrir registro da migração
                </Link>
              ) : null}
            </div>
          ) : null}

          <form action="/api/admin/legacy-access" className="mt-6 grid gap-4" method="post">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-ink">
                Nome do cliente
                <input className="min-h-11 rounded-md border border-ink/15 px-3 font-normal" name="customerName" required type="text" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-ink">
                E-mail da compra
                <input className="min-h-11 rounded-md border border-ink/15 px-3 font-normal" name="customerEmail" required type="email" />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-ink">
                Programa atual
                <select className="min-h-11 rounded-md border border-ink/15 px-3 font-normal" name="productId" required>
                  <option value="">Selecione</option>
                  <option value="offseason_30_days">Offseason 30 Days</option>
                  <option value="project_36">Speed Pro</option>
                  <option value="elanga_in_season">In-Season Pro</option>
                  <option value="de_volta_aos_gramados_pt">De Volta aos Gramados</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-ink">
                Idioma do convite
                <select className="min-h-11 rounded-md border border-ink/15 px-3 font-normal" defaultValue="pt" name="locale">
                  <option value="pt">Português</option>
                  <option value="en">English</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-ink">
                Número do pedido Shopify
                <input className="min-h-11 rounded-md border border-ink/15 px-3 font-normal" name="shopifyOrderNumber" placeholder="#15430" required type="text" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-ink">
                Data da compra original
                <input className="min-h-11 rounded-md border border-ink/15 px-3 font-normal" name="shopifyPurchaseDate" required type="date" />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-ink">
                Produto como aparecia no Shopify
                <input className="min-h-11 rounded-md border border-ink/15 px-3 font-normal" name="shopifyProductName" required type="text" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-ink">
                Valor pago no Shopify (R$)
                <input className="min-h-11 rounded-md border border-ink/15 px-3 font-normal" min="0" name="shopifyAmount" required step="0.01" type="number" />
              </label>
            </div>

            <button className="min-h-12 rounded-md bg-signal px-5 text-sm font-bold text-white" type="submit">
              Registrar compra e liberar acesso
            </button>
          </form>
        </section>

        <aside className="self-start rounded-lg border border-ink/10 bg-white p-5">
          <h2 className="text-lg font-bold text-ink">O que será registrado</h2>
          <ul className="mt-3 grid gap-3 text-sm leading-6 text-graphite/75">
            <li>• Pedido interno de valor R$ 0,00, sem nova cobrança.</li>
            <li>• Número, data, produto e valor da compra antiga nos metadados.</li>
            <li>• Acesso revogável na área do cliente.</li>
            <li>• Matrícula no programa correto do RaptorPro.</li>
            <li>• Log do convite enviado por e-mail.</li>
          </ul>
        </aside>
      </div>
    </AdminShell>
  );
}
