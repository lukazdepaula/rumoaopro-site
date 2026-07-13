import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/checkout/admin-auth";
import { getOrderById, listOrderLogs } from "@/lib/checkout/db";
import { formatMoney } from "@/lib/checkout/products";

export const dynamic = "force-dynamic";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Admin - Pedido"
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  await requireAdmin();
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const logs = await listOrderLogs(id);
  const rows = [
    ["Pedido", order.id],
    ["Produto", order.product_name],
    ["Usuário", order.user_id || "-"],
    ["Cliente", order.customer_name],
    ["E-mail", order.customer_email],
    ["País", order.customer_country],
    ["Documento", order.customer_document ? `${order.customer_document_type}: ${order.customer_document}` : "-"],
    ["Gateway", order.gateway],
    ["Gateway payment", order.gateway_payment_id || "-"],
    ["Gateway checkout", order.gateway_checkout_id || "-"],
    ["Valor", formatMoney(order.amount, order.currency)],
    ["Câmbio usado", order.exchange_rate_used ? order.exchange_rate_used.toFixed(4) : "-"],
    ["Pagamento", order.status],
    ["Entrega", order.delivery_status],
    ["Fiscal", order.fiscal_status],
    ["Criado em", new Date(order.created_at).toLocaleString("pt-BR")],
    ["Pago em", order.paid_at ? new Date(order.paid_at).toLocaleString("pt-BR") : "-"]
  ];

  return (
    <AdminShell title="Detalhe do pedido">
      <Link className="text-sm font-bold text-signal underline" href="/admin/orders">
        Voltar para pedidos
      </Link>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.45fr]">
        <section className="rounded-lg border border-ink/10 bg-white">
          {rows.map(([label, value]) => (
            <div className="grid gap-2 border-b border-ink/10 p-4 last:border-b-0 sm:grid-cols-[0.28fr_1fr]" key={label}>
              <p className="text-xs font-bold uppercase text-graphite/55">{label}</p>
              <p className="text-sm font-semibold text-ink">{value}</p>
            </div>
          ))}
        </section>

        <aside className="grid gap-3 self-start rounded-lg border border-ink/10 bg-white p-4">
          <h2 className="text-lg font-bold text-ink">Ações</h2>
          <form action={`/api/admin/orders/${order.id}/fiscal`} method="post">
            <button className="min-h-11 w-full rounded-md bg-ink px-4 text-sm font-bold text-white" type="submit">
              Marcar nota como emitida
            </button>
          </form>
          <form action={`/api/admin/orders/${order.id}/delivery`} method="post">
            <button className="min-h-11 w-full rounded-md border border-ink/15 px-4 text-sm font-bold text-ink" type="submit">
              Reenviar entrega/e-mail
            </button>
          </form>
          <form action={`/api/admin/orders/${order.id}/delete`} method="post">
            <button className="min-h-11 w-full rounded-md border border-red-200 px-4 text-sm font-bold text-red-700" type="submit">
              Excluir pedido
            </button>
          </form>
          <p className="text-xs leading-5 text-graphite/60">
            Reenvio só entrega PDF se o pedido estiver paid e o arquivo privado
            existir no diretório configurado.
          </p>
          <p className="rounded-md bg-red-50 p-3 text-xs leading-5 text-red-700">
            Excluir remove o pedido, os logs e qualquer acesso liberado por esse
            pedido. Use principalmente para testes ou duplicados.
          </p>
        </aside>
      </div>

      <section className="mt-6 rounded-lg border border-ink/10 bg-white">
        <div className="border-b border-ink/10 p-4">
          <h2 className="text-lg font-bold text-ink">Logs</h2>
        </div>
        <div className="divide-y divide-ink/10">
          {logs.map((log) => (
            <div className="grid gap-2 p-4 sm:grid-cols-[0.22fr_0.24fr_1fr]" key={log.id}>
              <p className="text-xs text-graphite/60">
                {new Date(log.created_at).toLocaleString("pt-BR")}
              </p>
              <p className="text-xs font-bold uppercase text-signal">{log.type}</p>
              <p className="text-sm text-graphite/75">{log.message}</p>
            </div>
          ))}
          {logs.length === 0 ? (
            <p className="p-4 text-sm text-graphite/60">Sem logs.</p>
          ) : null}
        </div>
      </section>
    </AdminShell>
  );
}
