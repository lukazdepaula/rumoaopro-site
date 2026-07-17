import Link from "next/link";
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/checkout/admin-auth";
import { listPaidOrders } from "@/lib/checkout/db";
import { formatMoney } from "@/lib/checkout/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Fiscal"
};

export default async function AdminFiscalPage() {
  await requireAdmin();
  const orders = await listPaidOrders();

  return (
    <AdminShell title="Fiscal">
      <div className="flex flex-col justify-between gap-3 rounded-lg border border-ink/10 bg-white p-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-lg font-bold text-ink">Vendas pagas</h2>
          <p className="mt-1 text-sm text-graphite/65">
            Base inicial para emissão de nota fiscal. Brasil exige CPF/CNPJ no
            checkout; exterior fica como not_required por enquanto.
          </p>
        </div>
        <a
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-ink px-4 text-sm font-bold text-white"
          href="/api/admin/fiscal/export"
        >
          Exportar CSV
        </a>
      </div>

      <div className="mt-5 overflow-x-auto rounded-lg border border-ink/10 bg-white">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-smoke text-xs uppercase text-graphite/65">
            <tr>
              <th className="px-4 py-3">Pago em</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Documento</th>
              <th className="px-4 py-3">CEP</th>
              <th className="px-4 py-3">País</th>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Câmbio</th>
              <th className="px-4 py-3">Gateway</th>
              <th className="px-4 py-3">Fiscal</th>
              <th className="px-4 py-3">Ação</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr className="border-t border-ink/10" key={order.id}>
                <td className="px-4 py-3 text-graphite/70">
                  {order.paid_at
                    ? new Date(order.paid_at).toLocaleString("pt-BR")
                    : "-"}
                </td>
                <td className="px-4 py-3">
                  <Link className="font-bold text-ink underline" href={`/admin/orders/${order.id}`}>
                    {order.customer_name}
                  </Link>
                  <p className="text-xs text-graphite/60">{order.customer_email}</p>
                  <p className="text-xs text-graphite/60">
                    {order.customer_whatsapp || "Sem WhatsApp"}
                  </p>
                </td>
                <td className="px-4 py-3 text-graphite/80">
                  {order.customer_document || "-"}
                </td>
                <td className="px-4 py-3 text-graphite/80">
                  {order.customer_postal_code || "-"}
                  {order.customer_address ? (
                    <p className="mt-1 max-w-56 text-xs text-graphite/60">
                      {order.customer_address}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-graphite/80">{order.customer_country}</td>
                <td className="px-4 py-3 text-graphite/80">{order.product_name}</td>
                <td className="px-4 py-3 font-bold text-ink">
                  {formatMoney(order.amount, order.currency)}
                </td>
                <td className="px-4 py-3 text-graphite/80">
                  {order.exchange_rate_used ? order.exchange_rate_used.toFixed(4) : "-"}
                </td>
                <td className="px-4 py-3 text-graphite/80">{order.gateway}</td>
                <td className="px-4 py-3 text-graphite/80">{order.fiscal_status}</td>
                <td className="px-4 py-3">
                  {order.fiscal_status !== "issued" ? (
                    <form action={`/api/admin/orders/${order.id}/fiscal`} method="post">
                      <button className="rounded-md bg-ink px-3 py-2 text-xs font-bold text-white" type="submit">
                        Marcar issued
                      </button>
                    </form>
                  ) : (
                    <span className="rounded-md bg-turf/10 px-2 py-1 text-xs font-bold text-turf">
                      issued
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-graphite/60" colSpan={11}>
                  Nenhuma venda paga ainda.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
