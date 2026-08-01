import Link from "next/link";
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/checkout/admin-auth";
import { listAnalyticsEvents, listOrders } from "@/lib/checkout/db";
import { checkoutProducts, formatMoney } from "@/lib/checkout/products";
import type { Gateway, Order } from "@/lib/checkout/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Painel"
};

const BRL_FALLBACK_RATE = 5.5;
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

function periodKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default async function AdminDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const now = new Date();
  const requestedPeriod: string = /^\d{4}-\d{2}$/.test(params.period || "")
    ? (params.period as string)
    : periodKey(now);
  const [requestedYear, requestedMonth] = requestedPeriod.split("-").map(Number);
  const requestedStart = new Date(requestedYear, requestedMonth - 1, 1);
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStart = requestedStart > currentMonthStart ? currentMonthStart : requestedStart;
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
  const lastMonthStart = new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1);
  const nextMonthKey = periodKey(monthEnd);
  const previousMonthKey = periodKey(lastMonthStart);
  const selectedPeriodKey = periodKey(monthStart);
  const isCurrentPeriod = selectedPeriodKey === periodKey(now);
  const [orders, monthAnalyticsEvents] = await Promise.all([
    listOrders({}),
    listAnalyticsEvents(monthStart)
  ]);
  const selectedAnalyticsEvents = monthAnalyticsEvents.filter(
    (event) => new Date(event.created_at) < monthEnd
  );
  const paidOrders = orders
    .filter((order) => order.status === "paid")
    .sort((a, b) => paidDate(b).getTime() - paidDate(a).getTime());

  const monthPaidOrders = paidOrders.filter((order) => {
    const date = paidDate(order);
    return date >= monthStart && date < monthEnd;
  });
  const monthOrders = orders.filter((order) => {
    const date = new Date(order.created_at);
    return date >= monthStart && date < monthEnd;
  });
  const monthConvertedOrders = monthOrders.filter((order) => order.status === "paid");
  const lastMonthPaidOrders = paidOrders.filter((order) => {
    const date = paidDate(order);
    return date >= lastMonthStart && date < monthStart;
  });
  const pendingOrders = orders.filter((order) => order.status === "pending");
  const monthConversion = monthOrders.length > 0
    ? (monthConvertedOrders.length / monthOrders.length) * 100
    : 0;
  const trackingStart = selectedAnalyticsEvents.length > 0
    ? new Date(
        Math.min(...selectedAnalyticsEvents.map((event) => new Date(event.created_at).getTime()))
      )
    : null;
  const trackedOrders = trackingStart
    ? monthOrders.filter((order) => new Date(order.created_at) >= trackingStart)
    : [];
  const trackedPaidOrders = trackedOrders.filter((order) => order.status === "paid");
  const eventCount = (type: "product_view" | "checkout_click" | "checkout_view" | "checkout_submit" | "checkout_error") =>
    selectedAnalyticsEvents.filter((event) => event.type === type).length;
  const productViews = eventCount("product_view");
  const checkoutClicks = eventCount("checkout_click");
  const checkoutViews = eventCount("checkout_view");
  const checkoutSubmits = eventCount("checkout_submit");
  const checkoutErrors = eventCount("checkout_error");
  const viewToSaleConversion = productViews > 0
    ? (trackedPaidOrders.length / productViews) * 100
    : 0;
  const monthRevenue = sumRevenue(monthPaidOrders);
  const lastMonthRevenue = sumRevenue(lastMonthPaidOrders);
  const averageTicket =
    monthPaidOrders.length > 0 ? monthRevenue / monthPaidOrders.length : 0;
  const revenueDelta =
    lastMonthRevenue > 0
      ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : null;

  const seriesEnd = isCurrentPeriod
    ? new Date(startOfDay(now).getTime() + 86400000)
    : monthEnd;
  const dayCount = Math.max(
    1,
    Math.round((seriesEnd.getTime() - monthStart.getTime()) / 86400000)
  );
  const dailySeries = Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(monthStart);
    date.setDate(monthStart.getDate() + index);
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

  const productFunnelRows = checkoutProducts
    .filter((product) => product.active && product.id !== "pix_webhook_test")
    .map((product) => {
      const productEvents = selectedAnalyticsEvents.filter(
        (event) => event.product_id === product.id
      );
      const productOrders = trackedOrders.filter(
        (order) => order.product_id === product.id
      );
      const views = productEvents.filter((event) => event.type === "product_view").length;
      const sales = productOrders.filter((order) => order.status === "paid").length;
      return {
        id: product.id,
        name: product.name,
        views,
        clicks: productEvents.filter((event) => event.type === "checkout_click").length,
        checkouts: productEvents.filter((event) => event.type === "checkout_view").length,
        submits: productEvents.filter((event) => event.type === "checkout_submit").length,
        errors: productEvents.filter((event) => event.type === "checkout_error").length,
        starts: productOrders.length,
        sales,
        conversion: views > 0 ? (sales / views) * 100 : 0
      };
    })
    .filter((row) => row.views > 0 || row.clicks > 0 || row.checkouts > 0 || row.starts > 0)
    .sort((a, b) => b.views - a.views);

  const localeRows = (["pt", "en"] as const).map((locale) => {
    const localeEvents = selectedAnalyticsEvents.filter((event) => event.locale === locale);
    const localeOrders = trackedOrders.filter(
      (order) => (order.metadata.checkout_locale === "en" ? "en" : "pt") === locale
    );
    return {
      locale,
      views: localeEvents.filter((event) => event.type === "product_view").length,
      starts: localeOrders.length,
      sales: localeOrders.filter((order) => order.status === "paid").length
    };
  });

  const countryRows = Array.from(
    trackedOrders.reduce((map, order) => {
      const country = order.customer_country || "—";
      const current = map.get(country) || { country, starts: 0, sales: 0 };
      current.starts += 1;
      if (order.status === "paid") current.sales += 1;
      map.set(country, current);
      return map;
    }, new Map<string, { country: string; starts: number; sales: number }>())
  )
    .map(([, value]) => value)
    .sort((a, b) => b.starts - a.starts);

  return (
    <AdminShell title="Painel">
      <section className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink/10 bg-white p-4">
        <div>
          <p className="text-xs font-bold uppercase text-graphite/55">Período dos resultados</p>
          <p className="mt-1 text-lg font-black capitalize text-ink">
            {monthStart.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link className="rounded-md border border-ink/15 px-3 py-2 text-xs font-bold text-ink" href={`/admin?period=${previousMonthKey}`}>
            ← Mês anterior
          </Link>
          {!isCurrentPeriod ? (
            <Link className="rounded-md bg-ink px-3 py-2 text-xs font-bold text-white" href={`/admin?period=${nextMonthKey}`}>
              Próximo mês →
            </Link>
          ) : null}
        </div>
      </section>
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
            Vendas confirmadas
          </p>
          <p className="mt-2 text-2xl font-black text-ink">
            {monthPaidOrders.length}
          </p>
          <p className="mt-2 text-xs font-semibold text-graphite/60">
            {formatBrl(monthRevenue)} no período selecionado
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
            Conversão do checkout
          </p>
          <p className="mt-2 text-2xl font-black text-ink">
            {monthConversion.toFixed(1)}%
          </p>
          <p className="mt-2 text-xs font-semibold text-graphite/60">
            {monthConvertedOrders.length} de {monthOrders.length} pedidos iniciados no mês
          </p>
        </article>
      </div>

      <section className="mt-5 rounded-lg border border-ink/10 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">Funil comercial do mês</h2>
            <p className="mt-1 text-sm text-graphite/60">
              Fonte: pedidos criados e confirmações recebidas pelos webhooks.
            </p>
          </div>
          <p className="rounded-full bg-smoke px-3 py-1 text-xs font-bold text-graphite/70">
            {pendingOrders.length} pendente{pendingOrders.length === 1 ? "" : "s"} no total
          </p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
          <div className="rounded-md bg-ink p-4 text-white">
            <p className="text-xs font-bold uppercase text-white/55">Visita no produto</p>
            <p className="mt-2 text-3xl font-black">{productViews}</p>
            <p className="mt-2 text-xs text-white/60">Sessões únicas por produto</p>
          </div>
          <div className="rounded-md border border-ink/10 bg-smoke p-4 text-ink">
            <p className="text-xs font-bold uppercase text-graphite/55">Clique em comprar</p>
            <p className="mt-2 text-3xl font-black">{checkoutClicks}</p>
            <p className="mt-2 text-xs text-graphite/60">{productViews > 0 ? ((checkoutClicks / productViews) * 100).toFixed(1) : "0.0"}% das visitas</p>
          </div>
          <div className="rounded-md border border-ink/10 bg-smoke p-4 text-ink">
            <p className="text-xs font-bold uppercase text-graphite/55">Abriu checkout</p>
            <p className="mt-2 text-3xl font-black">{checkoutViews}</p>
            <p className="mt-2 text-xs text-graphite/60">Página carregada</p>
          </div>
          <div className="rounded-md border border-ink/10 bg-smoke p-4 text-ink">
            <p className="text-xs font-bold uppercase text-graphite/55">Tentou pagar</p>
            <p className="mt-2 text-3xl font-black">{checkoutSubmits}</p>
            <p className="mt-2 text-xs text-graphite/60">Formulário enviado</p>
          </div>
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-ink">
            <p className="text-xs font-bold uppercase text-red-700">Erro no checkout</p>
            <p className="mt-2 text-3xl font-black">{checkoutErrors}</p>
            <p className="mt-2 text-xs text-red-700/70">Falha antes do gateway</p>
          </div>
          <div className="rounded-md border border-ink/10 bg-smoke p-4 text-ink">
            <p className="text-xs font-bold uppercase text-graphite/55">Iniciou pagamento</p>
            <p className="mt-2 text-3xl font-black">{trackedOrders.length}</p>
            <p className="mt-2 text-xs text-graphite/60">Pedido criado no gateway</p>
          </div>
          <div className="rounded-md bg-turf p-4 text-white">
            <p className="text-xs font-bold uppercase text-white/70">Venda confirmada</p>
            <p className="mt-2 text-3xl font-black">{trackedPaidOrders.length}</p>
            <p className="mt-2 text-xs text-white/75">{viewToSaleConversion.toFixed(1)}% das visitas rastreadas</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-graphite/55">
          {trackingStart
            ? `Janela rastreada desde ${trackingStart.toLocaleString("pt-BR")}.`
            : "A coleta começa após a publicação desta versão; ainda não há visitas rastreadas."}
        </p>
      </section>

      <section className="mt-5 rounded-lg border border-ink/10 bg-white">
        <div className="border-b border-ink/10 p-4">
          <h2 className="text-lg font-bold text-ink">Conversão por produto</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-smoke text-xs uppercase text-graphite/65">
              <tr><th className="px-4 py-3">Produto</th><th className="px-4 py-3">Visitas</th><th className="px-4 py-3">Cliques</th><th className="px-4 py-3">Checkout</th><th className="px-4 py-3">Tentativas</th><th className="px-4 py-3">Erros</th><th className="px-4 py-3">Pedidos</th><th className="px-4 py-3">Vendas</th><th className="px-4 py-3">Conversão</th></tr>
            </thead>
            <tbody>
              {productFunnelRows.map((row) => (
                <tr className="border-t border-ink/10" key={row.id}>
                  <td className="px-4 py-3 font-bold text-ink">{row.name}</td><td className="px-4 py-3">{row.views}</td><td className="px-4 py-3">{row.clicks}</td><td className="px-4 py-3">{row.checkouts}</td><td className="px-4 py-3">{row.submits}</td><td className="px-4 py-3">{row.errors}</td><td className="px-4 py-3">{row.starts}</td><td className="px-4 py-3">{row.sales}</td><td className="px-4 py-3 font-bold">{row.conversion.toFixed(1)}%</td>
                </tr>
              ))}
              {productFunnelRows.length === 0 ? <tr><td className="px-4 py-8 text-center text-graphite/60" colSpan={9}>Aguardando as primeiras visitas rastreadas.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-ink/10 bg-white">
          <div className="border-b border-ink/10 p-4"><h2 className="text-lg font-bold text-ink">Idioma</h2></div>
          <div className="divide-y divide-ink/10">{localeRows.map((row) => <div className="grid grid-cols-4 gap-2 p-4 text-sm" key={row.locale}><p className="font-bold text-ink">{row.locale === "en" ? "English" : "Português"}</p><p>{row.views} visitas</p><p>{row.starts} pedidos</p><p>{row.sales} vendas</p></div>)}</div>
        </section>
        <section className="rounded-lg border border-ink/10 bg-white">
          <div className="border-b border-ink/10 p-4"><h2 className="text-lg font-bold text-ink">País do checkout</h2></div>
          <div className="divide-y divide-ink/10">{countryRows.slice(0, 8).map((row) => <div className="grid grid-cols-3 gap-2 p-4 text-sm" key={row.country}><p className="font-bold text-ink">{row.country}</p><p>{row.starts} pedidos</p><p>{row.sales} vendas</p></div>)}{countryRows.length === 0 ? <p className="p-4 text-sm text-graphite/60">Aguardando novos pedidos rastreados.</p> : null}</div>
        </section>
      </div>

      <section className="mt-5 rounded-lg border border-ink/10 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">Vendas diárias</h2>
            <p className="mt-1 text-sm text-graphite/60">
              Período selecionado, em BRL estimado quando a venda foi em USD.
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
