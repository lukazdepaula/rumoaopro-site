import Link from "next/link";
import type { Metadata } from "next";
import { CircleDollarSign, CreditCard, ShieldCheck } from "lucide-react";
import { AdminDateRangeFilter } from "@/components/admin-date-range-filter";
import { AdminExternalReceipts } from "@/components/admin-external-receipts";
import { AdminLiveVisitors } from "@/components/admin-live-visitors";
import { AdminMonthlyExpenses } from "@/components/admin-monthly-expenses";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/checkout/admin-auth";
import { summarizeFunnel } from "@/lib/checkout/analytics-funnel";
import { listActiveSitePresence, listAnalyticsEvents, listOrders } from "@/lib/checkout/db";
import { getMonthlyExpenseMetrics } from "@/lib/checkout/expense-reporting";
import {
  financialOrderDate,
  financialOrderValueBrl,
  getFinancialPeriodMetrics,
  previousFinancialPeriod,
  resolveFinancialPeriod
} from "@/lib/checkout/financial-reporting";
import { checkoutProducts, formatMoney } from "@/lib/checkout/products";
import { getStripeRecurringMetrics } from "@/lib/checkout/stripe-reporting";
import type { Gateway, Order } from "@/lib/checkout/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Painel"
};

const gatewayLabels: Record<Gateway, string> = {
  mercado_pago: "Mercado Pago",
  mock: "Mock",
  stripe: "Stripe",
  shopify_legacy: "Shopify legado"
};

const productTypeById = new Map(
  checkoutProducts.flatMap((product) => [
    [product.id, product.type] as const,
    ...(product.aliases || []).map((alias) => [alias, product.type] as const)
  ])
);

function paidDate(order: Order) {
  return financialOrderDate(order);
}

function orderValueBrl(order: Order) {
  return financialOrderValueBrl(order) || 0;
}

function formatBrl(value: number) {
  return formatMoney(value, "BRL");
}

function percentDelta(current: number, previous: number) {
  return previous > 0 ? ((current - previous) / previous) * 100 : null;
}

async function loadAdminData<T>(
  source: string,
  loader: () => Promise<T>,
  fallback: T
) {
  try {
    return { available: true as const, value: await loader() };
  } catch (error) {
    console.error(`[admin.dashboard.${source}]`, error);
    return { available: false as const, value: fallback };
  }
}

function financialSourceStatusLabel(
  source: Awaited<ReturnType<typeof getFinancialPeriodMetrics>>["sources"][number]
) {
  if (source.id === "shopify_legacy") return "histórico local";
  if (source.state === "ready") return "conciliado";
  if (source.state === "missing") return "configuração pendente";
  if (source.state === "error") return "indisponível";
  return "fallback";
}

export default async function AdminDashboardPage({
  searchParams
}: {
  searchParams: Promise<{
    range?: string;
    from?: string;
    to?: string;
    compare?: string;
    refresh?: string;
    period?: string;
  }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const now = new Date();
  const financialPeriod = resolveFinancialPeriod(params, now);
  const comparisonEnabled = params.compare !== "0";
  const bypassCache = params.refresh === "1";
  const currentMonthPeriod = resolveFinancialPeriod({ range: "current_month" }, now);
  const expensePeriodKey =
    financialPeriod.startKey.slice(0, 7) === financialPeriod.endKey.slice(0, 7)
      ? financialPeriod.startKey.slice(0, 7)
      : currentMonthPeriod.startKey.slice(0, 7);
  const [ordersData, analyticsData, presenceData, recurringMetrics, expenseMetrics] = await Promise.all([
    loadAdminData("orders", () => listOrders({}, { complete: true }), [] as Order[]),
    loadAdminData("analytics", () => listAnalyticsEvents(financialPeriod.start,
      new Date(Math.min(financialPeriod.end.getTime(), now.getTime()))), []),
    loadAdminData(
      "presence",
      () => listActiveSitePresence(new Date(Date.now() - 2 * 60 * 1000)),
      []
    ),
    getStripeRecurringMetrics({ bypassCache }),
    getMonthlyExpenseMetrics(expensePeriodKey, { bypassCache })
  ]);
  const orders = ordersData.value;
  const monthAnalyticsEvents = analyticsData.value;
  const activePresence = presenceData.value;
  const unavailableData = [
    !ordersData.available ? "pedidos" : null,
    !analyticsData.available ? "analytics" : null,
    !presenceData.available ? "visitantes ao vivo" : null
  ].filter((value): value is string => Boolean(value));
  const comparisonPeriod = previousFinancialPeriod(financialPeriod);
  const [financialMetrics, comparisonMetrics] = await Promise.all([
    getFinancialPeriodMetrics(financialPeriod, orders, { bypassCache }),
    comparisonEnabled
      ? getFinancialPeriodMetrics(comparisonPeriod, orders, { bypassCache })
      : Promise.resolve(null)
  ]);
  const selectedAnalyticsEvents = monthAnalyticsEvents.filter(
    (event) => new Date(event.created_at) < financialPeriod.end
  );
  const paidOrders = orders
    .filter((order) => order.status === "paid")
    .sort((a, b) => paidDate(b).getTime() - paidDate(a).getTime());

  const monthPaidOrders = paidOrders.filter((order) => {
    const date = paidDate(order);
    return date >= financialPeriod.start && date < financialPeriod.end;
  });
  const monthOrders = orders.filter((order) => {
    const date = new Date(order.created_at);
    return date >= financialPeriod.start && date < financialPeriod.end;
  });
  const monthConvertedOrders = monthOrders.filter((order) => order.status === "paid");
  const monthConversion = monthOrders.length > 0
    ? (monthConvertedOrders.length / monthOrders.length) * 100
    : null;
  const funnel = summarizeFunnel(selectedAnalyticsEvents, monthOrders);
  const funnelAvailable = ordersData.available && analyticsData.available;
  const formatConversion = (value: number | null) =>
    funnelAvailable && value !== null ? `${value.toFixed(1)}%` : "—";
  const stageValue = (value: number) => analyticsData.available ? value : "—";
  const grossRevenueDelta = comparisonMetrics
    ? percentDelta(financialMetrics.grossRevenueBrl, comparisonMetrics.grossRevenueBrl)
    : null;
  const kiwifySource = financialMetrics.sources.find((source) => source.id === "kiwify");
  const localProgramSalesBrl = monthPaidOrders
    .filter((order) => productTypeById.get(order.product_id) === "training_program")
    .reduce((total, order) => total + orderValueBrl(order), 0);
  const courseSalesBrl = kiwifySource?.state === "ready" && !kiwifySource.hasUnconvertedCurrencies
    ? kiwifySource.grossRevenueBrl : null;
  const programSalesBrl = localProgramSalesBrl;
  const combinedMonthlyRevenueBrl =
    financialPeriod.isCurrentMonth && recurringMetrics.state === "ready" &&
    financialMetrics.state === "ready" && ordersData.available &&
    !financialMetrics.hasUnconvertedCurrencies && !recurringMetrics.hasUnconvertedCurrencies
      ? recurringMetrics.mrrBrlEstimate + programSalesBrl
      : null;
  const confirmedMonthNetRevenueBrl =
    financialPeriod.isCurrentMonth && financialMetrics.state === "ready" &&
    !financialMetrics.hasUnconvertedCurrencies && ordersData.available
      ? financialMetrics.netRevenueBrl
      : null;
  const dailySeries = financialMetrics.daily.map((day) => ({
    key: day.key,
    label: day.label,
    count: day.paymentCount,
    revenue: day.grossRevenueBrl
  }));
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
  if (kiwifySource?.state === "ready") {
    productRows.push({
      count: kiwifySource.paymentCount,
      name: "Preparador PRO",
      revenue: kiwifySource.grossRevenueBrl
    });
    productRows.sort((a, b) => b.revenue - a.revenue);
  }

  const gatewayRows = financialMetrics.sources
    .filter((source) => source.id !== "shopify_legacy" || source.grossRevenueBrl > 0)
    .sort((a, b) => b.grossRevenueBrl - a.grossRevenueBrl);

  const productFunnelRows = checkoutProducts
    .filter((product) => product.active && product.id !== "pix_webhook_test")
    .map((product) => {
      const productEvents = selectedAnalyticsEvents.filter(
        (event) => event.product_id === product.id
      );
      const productOrders = monthOrders.filter(
        (order) => order.product_id === product.id
      );
      return {
        id: product.id,
        name: product.name,
        ...summarizeFunnel(productEvents, productOrders)
      };
    })
    .filter((row) => row.views > 0 || row.clicks > 0 || row.checkouts > 0 || row.starts > 0)
    .sort((a, b) => b.views - a.views);

  const localeRows = (["pt", "en"] as const).map((locale) => {
    const localeEvents = selectedAnalyticsEvents.filter((event) => event.locale === locale);
    const localeOrders = monthOrders.filter(
      (order) => (order.metadata.checkout_locale === "en" ? "en" : "pt") === locale
    );
    return {
      locale,
      views: summarizeFunnel(localeEvents, localeOrders).views,
      starts: localeOrders.length,
      sales: localeOrders.filter((order) => order.status === "paid").length
    };
  });

  const countryRows = Array.from(
    monthOrders.reduce((map, order) => {
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

  const livePages = Array.from(
    activePresence.reduce((map, visitor) => {
      map.set(visitor.path, (map.get(visitor.path) || 0) + 1);
      return map;
    }, new Map<string, number>())
  )
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count || a.path.localeCompare(b.path))
    .slice(0, 5);

  return (
    <AdminShell title="Painel">
      {unavailableData.length > 0 ? (
        <section className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-950 shadow-sm">
          <p className="text-sm font-black">Parte dos dados está temporariamente indisponível</p>
          <p className="mt-1 text-xs leading-5 text-amber-900/75">
            Falha momentânea ao consultar {unavailableData.join(", ")}. O restante do painel continua funcionando e nenhuma informação indisponível foi inventada. Atualize em alguns instantes.
          </p>
        </section>
      ) : null}
      <section className="mb-5 grid gap-5 xl:grid-cols-[minmax(250px,0.72fr)_minmax(0,1.65fr)]">
        <AdminLiveVisitors
          initialData={{
            activeVisitors: activePresence.length,
            pages: livePages,
            updatedAt: new Date().toISOString()
          }}
        />

        <article className="overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-5 py-4">
            <div>
              <div className="flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4 text-turf" />
                <h2 className="text-sm font-bold text-ink">MRR atual</h2>
              </div>
              <p className="mt-1 text-xs text-graphite/55">Assinaturas ativas; atrasos e testes separados</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${
              recurringMetrics.state === "ready"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}>
              {recurringMetrics.state === "ready"
                ? recurringMetrics.livemode
                  ? "Stripe conectada"
                  : "Stripe em modo teste"
                : recurringMetrics.state === "missing"
                  ? "Configuração pendente"
                  : "Consulta indisponível"}
            </span>
          </div>

          <div className="grid md:grid-cols-3">
            <div className="bg-[#1f1f1f] p-5 text-white md:min-h-36">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/55">MRR após descontos</p>
              <p className="mt-2 text-3xl font-black tracking-tight">
                {recurringMetrics.state === "ready" ? formatBrl(recurringMetrics.mrrBrlEstimate) : "—"}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-white/55">
                {recurringMetrics.state === "ready"
                  ? `Bruto ${formatBrl(recurringMetrics.grossMrrBrlEstimate)} · descontos ${formatBrl(recurringMetrics.discountBrlEstimate)}.`
                  : "Aguardando uma leitura válida da conta Stripe."}
              </p>
            </div>
            <div className="border-b border-ink/10 p-5 md:border-b-0 md:border-r">
              <div className="flex items-center gap-2 text-graphite/50">
                <CreditCard className="h-4 w-4" />
                <p className="text-[11px] font-bold uppercase tracking-[0.12em]">Assinaturas</p>
              </div>
              <p className="mt-2 text-3xl font-black text-ink">
                {recurringMetrics.state === "ready" ? recurringMetrics.activeSubscriptions : "—"}
              </p>
              <p className="mt-3 text-xs text-graphite/55">
                {recurringMetrics.state === "ready"
                  ? `${recurringMetrics.activeSubscribers} cliente${recurringMetrics.activeSubscribers === 1 ? "" : "s"} pagante${recurringMetrics.activeSubscribers === 1 ? "" : "s"}`
                  : "Aguardando a conta Stripe"}
              </p>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 text-graphite/50">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-[11px] font-bold uppercase tracking-[0.12em]">Saúde</p>
              </div>
              <p className="mt-2 text-3xl font-black text-ink">
                {recurringMetrics.state === "ready" ? recurringMetrics.pastDueSubscriptions : "—"}
              </p>
              <p className="mt-3 text-xs text-graphite/55">
                {recurringMetrics.state === "ready"
                  ? `${recurringMetrics.pastDueSubscriptions} em atraso · ${recurringMetrics.trialingSubscriptions} em teste`
                  : recurringMetrics.state === "error"
                    ? "Tente atualizar o painel em instantes"
                    : "A chave permanece protegida no servidor"}
              </p>
            </div>
          </div>

          <div className="border-t border-ink/10 bg-[#fafafa]">
            {recurringMetrics.products.map((product) => (
              <div className="grid gap-2 border-b border-ink/10 px-5 py-3 last:border-b-0 sm:grid-cols-[1fr_auto_auto] sm:items-center" key={product.id}>
                <div>
                  <p className="text-sm font-bold text-ink">{product.name}</p>
                  <p className="mt-0.5 text-xs text-graphite/50">
                    {product.subscriptions} assinatura{product.subscriptions === 1 ? "" : "s"}
                    {product.discountBrlEstimate > 0 ? ` · ${formatBrl(product.discountBrlEstimate)} em descontos` : ""}
                  </p>
                </div>
                <p className="text-xs font-semibold text-graphite/55 sm:text-right">
                  {product.amounts.map((amount) => formatMoney(amount.amount, amount.currency)).join(" + ") || "Sem MRR"}
                </p>
                <p className="text-sm font-black text-ink sm:min-w-28 sm:text-right">
                  {formatBrl(product.mrrBrlEstimate)}
                </p>
              </div>
            ))}
          </div>

          {recurringMetrics.state === "ready" ? (
            <p className="border-t border-ink/10 px-5 py-3 text-[11px] leading-relaxed text-graphite/50">
              MRR normalizado com descontos recorrentes ativos; atrasos, testes, impostos e uso medido ficam fora. Não representa dinheiro recebido. Valores em USD são estimados a R$ {recurringMetrics.usdBrlRate.toFixed(2).replace(".", ",")}.
              {recurringMetrics.hasUnconvertedCurrencies ? " Outras moedas permanecem fora do total estimado em BRL." : ""}
              {` Atualizado às ${new Date(recurringMetrics.updatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })} (Brasília).`}
            </p>
          ) : null}
        </article>
      </section>

      <AdminDateRangeFilter
        compare={comparisonEnabled}
        maxDate={currentMonthPeriod.endKey}
        period={financialPeriod}
      />

      <section className={`mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 ${
        financialMetrics.state === "ready"
          ? "border-emerald-200 bg-emerald-50"
          : "border-amber-200 bg-amber-50"
      }`}>
        <div>
          <p className="text-xs font-black text-ink">
            {financialMetrics.state === "ready"
              ? "Vendas do site conciliadas com os gateways"
              : "Faturamento parcial — falta conciliar uma fonte"}
          </p>
          <p className="mt-1 text-[11px] text-graphite/60">
            {financialMetrics.officialSourceCount}/3 gateways conectados · cada fonte é limitada aos produtos desta operação
          </p>
        </div>
        <p className="text-[11px] font-semibold text-graphite/55">
          Atualizado às {new Date(financialMetrics.updatedAt).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Sao_Paulo"
          })}
        </p>
      </section>

      <article className="mb-4 overflow-hidden rounded-lg bg-ink text-white shadow-sm">
        <div className="grid gap-5 p-5 lg:grid-cols-[1.15fr_1fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/55">
              Indicador mensal combinado
            </p>
            <p className="mt-2 text-3xl font-black sm:text-4xl">
              {combinedMonthlyRevenueBrl === null
                ? "—"
                : formatBrl(combinedMonthlyRevenueBrl)}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
              MRR atual mais vendas avulsas de programas no mês. Indicador gerencial, não faturamento recebido nem lucro.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-bold uppercase text-white/45">MRR atual</p>
              <p className="mt-2 text-xl font-black">
                {recurringMetrics.state === "ready"
                  ? formatBrl(recurringMetrics.mrrBrlEstimate)
                  : "—"}
              </p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-bold uppercase text-white/45">Programas no período</p>
              <p className="mt-2 text-xl font-black">{ordersData.available ? formatBrl(programSalesBrl) : "—"}</p>
              <p className="mt-1 text-xs text-white/55">Pedidos locais pagos · sem o curso</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-4 sm:col-span-2">
              <p className="text-xs font-bold uppercase text-white/45">Curso · Preparador PRO</p>
              <p className="mt-2 text-xl font-black">{courseSalesBrl === null ? "—" : formatBrl(courseSalesBrl)}</p>
              <p className="mt-1 text-xs text-white/55">Bruto sem juros do comprador · líquido {courseSalesBrl === null ? "—" : formatBrl(kiwifySource!.netRevenueBrl)}</p>
              <p className="mt-1 text-xs text-white/55">Kiwify no período · separado do indicador combinado</p>
            </div>
          </div>
        </div>
        <p className="border-t border-white/10 px-5 py-3 text-[11px] leading-relaxed text-white/45">
          {financialPeriod.isCurrentMonth
            ? "Indicador gerencial: o MRR é uma fotografia atual e as vendas de programas são acumuladas até hoje."
            : "Selecione Mês atual para calcular o total combinado sem misturar períodos diferentes."}
        </p>
      </article>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-lg border border-ink/10 bg-white p-4">
          <p className="text-xs font-bold uppercase text-graphite/55">
            Faturamento recebido
          </p>
          <p className="mt-2 text-2xl font-black text-ink">
            {formatBrl(financialMetrics.grossRevenueBrl)}
          </p>
          <p className="mt-2 text-xs font-semibold text-graphite/60">
            Pagamentos efetivamente confirmados no período
            {grossRevenueDelta === null
              ? ""
              : ` · ${grossRevenueDelta >= 0 ? "+" : ""}${grossRevenueDelta.toFixed(1)}% vs período anterior`}
          </p>
        </article>
        <article className="rounded-lg border border-ink/10 bg-white p-4">
          <p className="text-xs font-bold uppercase text-graphite/55">
            Faturamento líquido
          </p>
          <p className="mt-2 text-2xl font-black text-ink">
            {formatBrl(financialMetrics.netRevenueBrl)}
          </p>
          <p className="mt-2 text-xs font-semibold text-graphite/60">
            {formatBrl(financialMetrics.feesBrl)} em taxas · {formatBrl(financialMetrics.refundsBrl)} reembolsado
          </p>
        </article>
        <article className="rounded-lg border border-ink/10 bg-white p-4">
          <p className="text-xs font-bold uppercase text-graphite/55">
            Vendas confirmadas
          </p>
          <p className="mt-2 text-2xl font-black text-ink">
            {financialMetrics.paymentCount}
          </p>
          <p className="mt-2 text-xs font-semibold text-graphite/60">
            Stripe + Mercado Pago + Kiwify + Shopify conciliados
          </p>
        </article>
        <article className="rounded-lg border border-ink/10 bg-white p-4">
          <p className="text-xs font-bold uppercase text-graphite/55">
            Ticket médio
          </p>
          <p className="mt-2 text-2xl font-black text-ink">
            {formatBrl(financialMetrics.averageTicketBrl)}
          </p>
          <p className="mt-2 text-xs font-semibold text-graphite/60">
            Bruto dividido pelos pagamentos aprovados
          </p>
        </article>
      </div>

      <div className="mt-5">
        <AdminExternalReceipts metrics={financialMetrics} ordersAvailable={ordersData.available} />
        <p className="mt-4 text-xs text-graphite/55">O saldo abaixo usa apenas a receita líquida vinculada ao site e ao curso; a assessoria externa é apresentada separadamente acima.</p>
        <AdminMonthlyExpenses
          initialData={expenseMetrics}
          confirmedNetRevenueBrl={confirmedMonthNetRevenueBrl}
        />
      </div>

      <section className="mt-5 rounded-lg border border-ink/10 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">Funil comercial no período</h2>
            <p className="mt-1 text-sm text-graphite/60">
              Etapas por sessão e produto; pedidos locais criados no período e seu status atual.
            </p>
          </div>
          <p className="rounded-full bg-smoke px-3 py-1 text-xs font-bold text-graphite/70">
            {ordersData.available && monthConversion !== null ? `${monthConversion.toFixed(1)}%` : "—"} dos pedidos locais pagos
          </p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
          <div className="rounded-md bg-ink p-4 text-white">
            <p className="text-xs font-bold uppercase text-white/55">Visita no produto</p>
            <p className="mt-2 text-3xl font-black">{stageValue(funnel.views)}</p>
            <p className="mt-2 text-xs text-white/60">Sessões únicas por produto</p>
          </div>
          <div className="rounded-md border border-ink/10 bg-smoke p-4 text-ink">
            <p className="text-xs font-bold uppercase text-graphite/55">Clique em comprar</p>
            <p className="mt-2 text-3xl font-black">{stageValue(funnel.clicks)}</p>
            <p className="mt-2 text-xs text-graphite/60">Sessões com clique</p>
          </div>
          <div className="rounded-md border border-ink/10 bg-smoke p-4 text-ink">
            <p className="text-xs font-bold uppercase text-graphite/55">Abriu checkout</p>
            <p className="mt-2 text-3xl font-black">{stageValue(funnel.checkouts)}</p>
            <p className="mt-2 text-xs text-graphite/60">Página carregada</p>
          </div>
          <div className="rounded-md border border-ink/10 bg-smoke p-4 text-ink">
            <p className="text-xs font-bold uppercase text-graphite/55">Tentou pagar</p>
            <p className="mt-2 text-3xl font-black">{stageValue(funnel.submits)}</p>
            <p className="mt-2 text-xs text-graphite/60">Formulário enviado</p>
          </div>
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-ink">
            <p className="text-xs font-bold uppercase text-red-700">Erro no checkout</p>
            <p className="mt-2 text-3xl font-black">{stageValue(funnel.errors)}</p>
            <p className="mt-2 text-xs text-red-700/70">Falha antes do gateway</p>
          </div>
          <div className="rounded-md border border-ink/10 bg-smoke p-4 text-ink">
            <p className="text-xs font-bold uppercase text-graphite/55">Iniciou pagamento</p>
            <p className="mt-2 text-3xl font-black">{ordersData.available ? monthOrders.length : "—"}</p>
            <p className="mt-2 text-xs text-graphite/60">Pedido criado no gateway</p>
          </div>
          <div className="rounded-md bg-turf p-4 text-white">
            <p className="text-xs font-bold uppercase text-white/70">Venda confirmada</p>
            <p className="mt-2 text-3xl font-black">{ordersData.available ? monthConvertedOrders.length : "—"}</p>
            <p className="mt-2 text-xs text-white/75">{formatConversion(funnel.conversion)} de conversão mensurável</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-graphite/55">
          {funnelAvailable
            ? `Conversão: ${funnel.convertedSessions} sessões com venda entre ${funnel.measurableViews} visitas com consentimento. ${funnel.unlinkedSales} venda(s) sem visita vinculada ficam fora da taxa. Etapas podem incluir acessos diretos; não representam uma sequência obrigatória. Eventos antigos não coletados não são reconstruídos.`
            : "Conversão indisponível: é necessário carregar os pedidos e o histórico completo de eventos."}
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
                  <td className="px-4 py-3 font-bold text-ink">{row.name}</td><td className="px-4 py-3">{stageValue(row.views)}</td><td className="px-4 py-3">{stageValue(row.clicks)}</td><td className="px-4 py-3">{stageValue(row.checkouts)}</td><td className="px-4 py-3">{stageValue(row.submits)}</td><td className="px-4 py-3">{stageValue(row.errors)}</td><td className="px-4 py-3">{ordersData.available ? row.starts : "—"}</td><td className="px-4 py-3">{ordersData.available ? row.sales : "—"}</td><td className="px-4 py-3 font-bold" title={`${row.convertedSessions} de ${row.measurableViews} sessões com consentimento`}>{formatConversion(row.conversion)}</td>
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
              Somente vendas vinculadas ao site; valores em USD são convertidos para BRL.
            </p>
          </div>
          <Link
            className="rounded-md border border-ink/15 px-3 py-2 text-xs font-bold text-ink"
            href="/admin/orders?status=paid"
          >
            Ver pedidos pagos
          </Link>
        </div>
        <div
          className="mt-6 grid min-h-56 items-end gap-2 overflow-x-auto"
          style={{ gridTemplateColumns: `repeat(${dailySeries.length}, minmax(3.5rem, 1fr))` }}
        >
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
            <h2 className="text-lg font-bold text-ink">Novas vendas por produto</h2>
            <p className="mt-1 text-xs text-graphite/55">Pedidos iniciais do período; renovações já estão no faturamento total.</p>
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
                Nenhuma nova venda paga no período.
              </p>
            ) : null}
          </div>
        </section>

        <section className="rounded-lg border border-ink/10 bg-white">
          <div className="border-b border-ink/10 p-4">
            <h2 className="text-lg font-bold text-ink">Faturamento por origem</h2>
          </div>
          <div className="divide-y divide-ink/10">
            {gatewayRows.map((row) => (
              <div className="grid gap-2 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center" key={row.id}>
                <div>
                  <p className="font-bold text-ink">{row.name}</p>
                  <p className="mt-1 text-xs text-graphite/50">{row.detail}</p>
                </div>
                <p className="text-sm text-graphite/70">
                  {row.paymentCount} pagamento{row.paymentCount === 1 ? "" : "s"} · {financialSourceStatusLabel(row)}
                </p>
                <div className="sm:text-right">
                  <p className="font-bold text-ink">{formatBrl(row.grossRevenueBrl)}</p>
                  <p className="mt-1 text-xs text-graphite/50">Líquido {formatBrl(row.netRevenueBrl)}</p>
                </div>
              </div>
            ))}
            {gatewayRows.length === 0 ? (
              <p className="p-4 text-sm text-graphite/60">
                Nenhum pagamento confirmado no período.
              </p>
            ) : null}
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-lg border border-ink/10 bg-white">
        <div className="border-b border-ink/10 p-4">
          <h2 className="text-lg font-bold text-ink">Últimos pedidos pagos</h2>
          <p className="mt-1 text-xs text-graphite/55">Pedidos iniciais registrados no site; renovações aparecem nos totais dos gateways.</p>
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
