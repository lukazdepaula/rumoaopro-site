import Link from "next/link";
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/checkout/admin-auth";
import { listOrders } from "@/lib/checkout/db";
import { formatMoney } from "@/lib/checkout/products";
import type { Gateway, Order } from "@/lib/checkout/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Painel"
};

const BRL_FALLBACK_RATE = 5.5;
const DAY_COUNT = 14;

const gatewayLabels: Record<Gateway, string> = {
  mercado_pago: "Mercado Pago",
  mock: "Mock",
  stripe: "Stripe"
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function paidDate(order: Order) {
  return new Date(order.paid_at || order.created_at);
}

function orderValueBrl(order: Order) {
  if (order.currency === "BRL") return order.amount;
  return order.amount * (order.exchange_rate_used || BRL_FALLBACK_RATE);
}

function sumRevenue(orders: Order[]) {
  return orders.reduce((total, order) => total + orderValueBrl(order), 0);
}

function formatBrl(value: number) {
  return formatMoney(value, "BRL");
}

export default async function AdminDashboardPage() {
  await requireAdmin();
  const orders = await listOrders({});
  const paidOrders = orders
    .filter((order) => order.status === "paid")
    .sort((a, b) => paidDate(b).getTime() - paidDate(a).getTime());

  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const monthPaidOrders = paidOrders.filter((order) => paidDate(order) >= monthStart);
  const lastMonthPaidOrders = paidOrders.filter((order) => {
    const date = paidDate(order);
    return date >= lastMonthStart && date < monthStart;
  });
  const todayPaidOrders = paidOrders.filter((order) => paidDate(order) >= todayStart);
  const pendingOrders = orders.filter((order) => order.status === "pending");
  const monthRevenue = sumRevenue(monthPaidOrders);
  const lastMonthRevenue = sumRevenue(lastMonthPaidOrders);
  const todayRevenue = sumRevenue(todayPaidOrders);
  const averageTicket =
    monthPaidOrders.length > 0 ? monthRevenue / monthPaidOrders.length : 0;
  const revenueDelta =
    lastMonthRevenue > 0
      ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : null;

  const dailySeries = Array.from({ length: DAY_COUNT }, (_, index) => {
    const date = startOfDay(now);
    date.setDate(todayStart.getDate() - (DAY_COUNT - 1 - index));
    const key = dateKey(date);
    const dayOrders = paidOrders.filter((order) => dateKey(paidDate(order)) === key);
    return {
      key,
      label: date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit"
      }),
      count: dayOrders.length,
      revenue: sumRevenue(dayOrders)
    };
  });
  const maxDailyRevenue = Math.max(...dailySeries.map((day) => day.revenue), 1);

  const productRows = Array.from(
    monthPaidOrders.reduce((map, order) => {
      const current = map.get(order.product_id) || {
        count: 0,
        name: order.product_name,
        revenue: 0
      };
      current.count += 1;
      current.revenue += orderValueBrl(order);
      map.set(order.product_id, current);
      return map;
    }, new Map<string, { count: number; name: string; revenue: number }>())
  )
    .map(([, value]) => value)
    .sort((a, b) => b.revenue - a.revenue);

  const gatewayRows = Array.from(
    monthPaidOrders.reduce((map, order) => {
      const current = map.get(order.gateway) || {
        count: 0,
        gateway: order.gateway,
        revenue: 0
      };
      current.count += 1;
      current.revenue += orderValueBrl(order);
      map.set(order.gateway, current);
      return map;
    }, new Map<Gateway, { count: number; gateway: Gateway; revenue: number }>())
  )
    .map(([, value]) => value)
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <AdminShell title="Painel">
      <div className="grid gap-4 md:grid-cols-4">
        <article className="rounded-lg border border-ink/10 bg-white p-4">
          <p className="text-xs font-bold uppercase text-graphite/55">
            Faturamento do mês
          </p>
          <p className="mt-2 text-2xl font-black text-ink">
            {formatBrl(monthRevenue)}
          </p>
          <p className="mt-2 text-xs font-semibold text-graphite/60">
            {monthPaidOrders.length} venda{monthPaidOrders.length === 1 ? "" : "s"} paga{monthPaidOrders.length === 1 ? "" : "s"}
            {revenueDelta === null
              ? ""
              : ` · ${revenueDelta >= 0 ? "+" : ""}${revenueDelta.toFixed(1)}% vs mês anterior`}
          </p>
        </article>
        <article className="rounded-lg border border-ink/10 bg-white p-4">
          <p className="text-xs font-bold uppercase text-graphite/55">
            Hoje
          </p>
          <p className="mt-2 text-2xl font-black text-ink">
            {formatBrl(todayRevenue)}
          </p>
          <p className="mt-2 text-xs font-semibold text-graphite/60">
            {todayPaidOrders.length} venda{todayPaidOrders.length === 1 ? "" : "s"} confirmada{todayPaidOrders.length === 1 ? "" : "s"}
          </p>
        </article>
        <article className="rounded-lg border border-ink/10 bg-white p-4">
          <p className="text-xs font-bold uppercase text-graphite/55">
            Ticket médio
          </p>
          <p className="mt-2 text-2xl font-black text-ink">
            {formatBrl(averageTicket)}
          </p>
          <p className="mt-2 text-xs font-semibold text-graphite/60">
            Base: vendas pagas do mês
          </p>
        </article>
        <article className="rounded-lg border border-ink/10 bg-white p-4">
          <p className="text-xs font-bold uppercase text-graphite/55">
            Pendentes
          </p>
          <p className="mt-2 text-2xl font-black text-ink">
            {pendingOrders.length}
          </p>
          <p className="mt-2 text-xs font-semibold text-graphite/60">
            Pix ou checkout aguardando confirmação
          </p>
        </article>
      </div>

      <section className="mt-5 rounded-lg border border-ink/10 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">Vendas diárias</h2>
            <p className="mt-1 text-sm text-graphite/60">
              Últimos {DAY_COUNT} dias, em BRL estimado quando a venda foi em USD.
            </p>
          </div>
          <Link
            className="rounded-md border border-ink/15 px-3 py-2 text-xs font-bold text-ink"
            href="/admin/orders?status=paid"
          >
            Ver pedidos pagos
          </Link>
        </div>
        <div className="mt-6 grid min-h-56 grid-cols-[repeat(14,minmax(3.5rem,1fr))] items-end gap-2 overflow-x-auto">
          {dailySeries.map((day) => {
            const height = Math.max(8, Math.round((day.revenue / maxDailyRevenue) * 160));
            return (
              <div className="grid min-w-14 gap-2" key={day.key}>
                <div className="flex h-40 items-end rounded-md bg-smoke px-1">
                  <div
                    className="w-full rounded-t-md bg-signal"
                    style={{ height: `${height}px` }}
                    title={`${day.label}: ${formatBrl(day.revenue)} em ${day.count} venda(s)`}
                  />
                </div>
                <p className="text-center text-[11px] font-bold text-graphite/55">
                  {day.label}
                </p>
                <p className="text-center text-[11px] font-semibold text-ink">
                  {day.count}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-ink/10 bg-white">
          <div className="border-b border-ink/10 p-4">
            <h2 className="text-lg font-bold text-ink">Produtos no mês</h2>
          </div>
          <div className="divide-y divide-ink/10">
            {productRows.map((row) => (
              <div className="grid gap-2 p-4 sm:grid-cols-[1fr_auto_auto]" key={row.name}>
                <p className="font-bold text-ink">{row.name}</p>
                <p className="text-sm text-graphite/70">
                  {row.count} venda{row.count === 1 ? "" : "s"}
                </p>
                <p className="font-bold text-ink">{formatBrl(row.revenue)}</p>
              </div>
            ))}
            {productRows.length === 0 ? (
              <p className="p-4 text-sm text-graphite/60">
                Nenhuma venda paga neste mês.
              </p>
            ) : null}
          </div>
        </section>

        <section className="rounded-lg border border-ink/10 bg-white">
          <div className="border-b border-ink/10 p-4">
            <h2 className="text-lg font-bold text-ink">Gateways no mês</h2>
          </div>
          <div className="divide-y divide-ink/10">
            {gatewayRows.map((row) => (
              <div className="grid gap-2 p-4 sm:grid-cols-[1fr_auto_auto]" key={row.gateway}>
                <p className="font-bold text-ink">{gatewayLabels[row.gateway]}</p>
                <p className="text-sm text-graphite/70">
                  {row.count} venda{row.count === 1 ? "" : "s"}
                </p>
                <p className="font-bold text-ink">{formatBrl(row.revenue)}</p>
              </div>
            ))}
            {gatewayRows.length === 0 ? (
              <p className="p-4 text-sm text-graphite/60">
                Nenhum pagamento confirmado neste mês.
              </p>
            ) : null}
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-lg border border-ink/10 bg-white">
        <div className="border-b border-ink/10 p-4">
          <h2 className="text-lg font-bold text-ink">Últimas vendas pagas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-smoke text-xs uppercase text-graphite/65">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Gateway</th>
                <th className="px-4 py-3">Valor</th>
              </tr>
            </thead>
            <tbody>
              {paidOrders.slice(0, 8).map((order) => (
                <tr className="border-t border-ink/10" key={order.id}>
                  <td className="px-4 py-3 text-graphite/70">
                    {paidDate(order).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <Link className="font-bold text-ink underline" href={`/admin/orders/${order.id}`}>
                      {order.customer_name}
                    </Link>
                    <p className="text-xs text-graphite/60">{order.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 text-graphite/80">{order.product_name}</td>
                  <td className="px-4 py-3 text-graphite/80">
                    {gatewayLabels[order.gateway]}
                  </td>
                  <td className="px-4 py-3 font-bold text-ink">
                    {formatMoney(order.amount, order.currency)}
                  </td>
                </tr>
              ))}
              {paidOrders.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-graphite/60" colSpan={5}>
                    Nenhuma venda paga ainda.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
