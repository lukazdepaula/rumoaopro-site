import Link from "next/link";
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/checkout/admin-auth";
import { listOrders } from "@/lib/checkout/db";
import { checkoutProducts, formatMoney } from "@/lib/checkout/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Pedidos"
};

const statusClass = (status: string) => {
  if (status === "paid") return "bg-turf/10 text-turf";
  if (status === "failed" || status === "cancelled") return "bg-red-50 text-red-700";
  if (status === "refunded") return "bg-gold/15 text-ink";
  return "bg-ink/10 text-graphite";
};

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams: Promise<{
    status?: string;
    gateway?: string;
    country?: string;
    product?: string;
    deleted?: string;
  }>;
}) {
  await requireAdmin();
  const filters = await searchParams;
  const orders = await listOrders(filters);

  return (
    <AdminShell title="Pedidos">
      {filters.deleted ? (
        <p className="mb-5 rounded-lg border border-turf/20 bg-turf/10 px-4 py-3 text-sm font-bold text-turf">
          Pedido excluído.
        </p>
      ) : null}

      <form className="grid gap-3 rounded-lg border border-ink/10 bg-white p-4 md:grid-cols-5" method="get">
        <select className="min-h-11 rounded-md border border-ink/15 px-3 text-sm" name="status" defaultValue={filters.status || ""}>
          <option value="">Todos os status</option>
          <option value="pending">pending</option>
          <option value="paid">paid</option>
          <option value="failed">failed</option>
          <option value="cancelled">cancelled</option>
          <option value="refunded">refunded</option>
        </select>
        <select className="min-h-11 rounded-md border border-ink/15 px-3 text-sm" name="gateway" defaultValue={filters.gateway || ""}>
          <option value="">Todos os gateways</option>
          <option value="mock">Mock</option>
          <option value="mercado_pago">Mercado Pago</option>
          <option value="stripe">Stripe</option>
        </select>
        <input className="min-h-11 rounded-md border border-ink/15 px-3 text-sm" defaultValue={filters.country || ""} name="country" placeholder="País, ex: BR" />
        <select className="min-h-11 rounded-md border border-ink/15 px-3 text-sm" name="product" defaultValue={filters.product || ""}>
          <option value="">Todos os produtos</option>
          {checkoutProducts.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
        <button className="min-h-11 rounded-md bg-ink px-4 text-sm font-bold text-white" type="submit">
          Filtrar
        </button>
      </form>

      <div className="mt-5 overflow-x-auto rounded-lg border border-ink/10 bg-white">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-smoke text-xs uppercase text-graphite/65">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Gateway</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Entrega</th>
              <th className="px-4 py-3">Fiscal</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Câmbio</th>
              <th className="px-4 py-3">Ação</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr className="border-t border-ink/10" key={order.id}>
                <td className="px-4 py-3 text-graphite/70">
                  {new Date(order.created_at).toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3">
                  <Link className="font-bold text-ink underline" href={`/admin/orders/${order.id}`}>
                    {order.customer_name}
                  </Link>
                  <p className="text-xs text-graphite/60">{order.customer_email}</p>
                </td>
                <td className="px-4 py-3 text-graphite/80">{order.product_name}</td>
                <td className="px-4 py-3 text-graphite/80">{order.gateway}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-md px-2 py-1 text-xs font-bold ${statusClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-graphite/80">{order.delivery_status}</td>
                <td className="px-4 py-3 text-graphite/80">{order.fiscal_status}</td>
                <td className="px-4 py-3 font-bold text-ink">
                  {formatMoney(order.amount, order.currency)}
                </td>
                <td className="px-4 py-3 text-graphite/80">
                  {order.exchange_rate_used ? order.exchange_rate_used.toFixed(4) : "-"}
                </td>
                <td className="px-4 py-3">
                  <Link
                    className="rounded-md border border-ink/15 px-3 py-2 text-xs font-bold text-ink"
                    href={`/admin/orders/${order.id}`}
                  >
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-graphite/60" colSpan={10}>
                  Nenhum pedido encontrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
