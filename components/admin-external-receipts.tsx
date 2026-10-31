import type { FinancialPeriodMetrics } from "@/lib/checkout/financial-reporting";
import { formatMoney } from "@/lib/checkout/products";

export function AdminExternalReceipts({ metrics, ordersAvailable }: { metrics: FinancialPeriodMetrics; ordersAvailable: boolean }) {
  const sources = metrics.sources.filter(source => source.id === "stripe" || source.id === "mercado_pago");
  const ready = ordersAvailable && sources.length === 2 && sources.every(source => source.state === "ready" &&
    source.externalReceipts && !source.externalReceipts.hasUnconvertedCurrencies);
  const sum = (category: "coaching" | "internal_transfer" | "outgoing_payment" | "unclassified", field: "grossRevenueBrl" | "netRevenueBrl" | "transactionCount") =>
    sources.reduce((total, source) => total + (source.externalReceipts?.[category][field] || 0), 0);
  const money = (value: number) => formatMoney(value, "BRL");
  const amount = (category: "coaching" | "internal_transfer" | "outgoing_payment" | "unclassified", field: "grossRevenueBrl" | "netRevenueBrl") =>
    ready ? money(sum(category, field)) : "—";
  return (
    <section className="mt-5 rounded-lg border border-ink/10 bg-white p-5">
      <h2 className="text-lg font-bold text-ink">Movimentações fora do checkout</h2>
      <p className="mt-1 text-sm text-graphite/60">Classificação por produto ou transação conferida. Cada movimentação pertence a um único grupo.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-md bg-smoke p-4">
          <p className="text-xs font-bold uppercase text-graphite/60">Assessoria identificada</p>
          <p className="mt-2 text-2xl font-black text-ink">{amount("coaching", "grossRevenueBrl")}</p>
          <p className="mt-2 text-xs text-graphite/60">Líquido {amount("coaching", "netRevenueBrl")} · separado do curso e dos programas</p>
        </div>
        <div className="rounded-md bg-smoke p-4">
          <p className="text-xs font-bold uppercase text-graphite/60">Transferências entre contas</p>
          <p className="mt-2 text-2xl font-black text-ink">{amount("internal_transfer", "netRevenueBrl")}</p>
          <p className="mt-2 text-xs text-graphite/60">Repasses conferidos · não são novas vendas</p>
        </div>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-bold uppercase text-graphite/60">Classificação pendente</p>
          <p className="mt-2 text-2xl font-black text-ink">{ready ? sum("unclassified", "transactionCount") : "—"}</p>
          <p className="mt-2 text-xs text-graphite/60">Movimentações · líquido {amount("unclassified", "netRevenueBrl")} · fora da receita até conferência</p>
        </div>
        <div className="rounded-md bg-smoke p-4">
          <p className="text-xs font-bold uppercase text-graphite/60">Saídas conferidas</p>
          <p className="mt-2 text-2xl font-black text-ink">{amount("outgoing_payment", "netRevenueBrl")}</p>
          <p className="mt-2 text-xs text-graphite/60">Pagamentos de contas e compras · fora da receita. A conciliação de custos é separada.</p>
        </div>
      </div>
      <div className="mt-3 space-y-1 text-xs text-graphite/60">
        {sources.map(source => <p key={source.id}>{source.name}: {ordersAvailable && source.state === "ready" && source.externalReceipts && !source.externalReceipts.hasUnconvertedCurrencies
          ? `${source.externalReceipts.coaching.paymentCount} recebimento(s) de assessoria · ${money(source.externalReceipts.coaching.grossRevenueBrl)} bruto`
          : "conferência indisponível"}</p>)}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-graphite/60">
        {ready && metrics.state === "ready" && !metrics.hasUnconvertedCurrencies
          ? `Receita identificada do site, curso e assessoria externa: ${money(metrics.grossRevenueBrl + sum("coaching", "grossRevenueBrl"))}.`
          : "Total da operação indisponível até carregar as fontes oficiais."} Valores ainda sem classificação não entram nesse total. A conferência usa o período selecionado; não representa saldo bancário ou lucro.
      </p>
    </section>
  );
}
