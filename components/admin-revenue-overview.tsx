import Link from "next/link";
import { AdminRevenueGoal } from "@/components/admin-revenue-goal";
import { ArrowDownLeft, ArrowUpRight, CalendarDays, Check, CircleDollarSign, ReceiptText, Wallet } from "lucide-react";
import { summarizeAdminRevenue } from "@/lib/checkout/admin-dashboard-summary";
import type { FinancialPeriod, FinancialPeriodMetrics } from "@/lib/checkout/financial-reporting";
import { formatMoney } from "@/lib/checkout/products";

const money = (value: number | null) => value === null ? "—" : formatMoney(value, "BRL");

export function AdminRevenueOverview({ metrics, ordersAvailable, comparisonMetrics, comparisonPeriod }: {
  metrics: FinancialPeriodMetrics;
  ordersAvailable: boolean;
  comparisonMetrics: FinancialPeriodMetrics | null;
  comparisonPeriod: FinancialPeriod;
}) {
  const summary = summarizeAdminRevenue(metrics, ordersAvailable);
  const previous = comparisonMetrics ? summarizeAdminRevenue(comparisonMetrics, ordersAvailable) : null;
  const delta = summary.grossRevenueBrl !== null && previous?.grossRevenueBrl != null && previous.grossRevenueBrl > 0
    ? (summary.grossRevenueBrl / previous.grossRevenueBrl - 1) * 100 : null;
  const parts = [
    { label: "Site e aplicativos", detail: "Programas e assinaturas recebidas", value: summary.siteRevenueBrl, color: "#c82439" },
    { label: "Curso · Preparador PRO", detail: "Recebimentos da Kiwify", value: summary.courseRevenueBrl, color: "#40434b" },
    { label: "Assessoria identificada", detail: "Recebimentos fora do checkout", value: summary.coachingRevenueBrl, color: "#979ba5" }
  ];
  return (
    <>
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]" aria-label="Resumo do faturamento">
        <article className="admin-revenue-hero relative overflow-hidden rounded-3xl p-6 text-white sm:p-8">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-xs font-semibold text-white/90"><CalendarDays className="h-4 w-4" />{metrics.period.label} · Brasília</p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-[11px] font-semibold">
                {summary.ready ? <Check className="h-3 w-3" /> : null}{summary.ready ? "Receita identificada" : "Conferência parcial"}
              </span>
            </div>
            <h2 className="mt-7 text-base font-semibold sm:text-lg">{metrics.period.isCurrentMonth ? "Faturamento do mês até hoje" : "Faturamento do período"}</h2>
            <p className="mt-2 break-words text-[clamp(2.5rem,4.6vw,4rem)] font-bold leading-tight tracking-[-0.045em] tabular-nums" data-testid="operation-revenue">{money(summary.grossRevenueBrl)}</p>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/90">{summary.ready
              ? "Total bruto recebido · site, curso e assessoria identificada."
              : "O total aguarda a conferência de todas as fontes. Os valores disponíveis estão separados ao lado."}</p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/25 pt-4 text-xs">
              <span className="max-w-sm leading-5 text-white/90">{delta !== null
                ? `${delta >= 0 ? "+" : ""}${delta.toFixed(1).replace(".", ",")}% em relação a ${comparisonPeriod.label}`
                : comparisonMetrics ? "Comparação sem base completa ou sem recebimentos anteriores." : "Valores em reais · atualização sob demanda"}</span>
              <Link href="#recebimentos" className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 font-semibold hover:bg-white/25">Ver composição <ArrowDownLeft className="h-3.5 w-3.5" /></Link>
            </div>
          </div>
        </article>

        <AdminRevenueGoal revenue={summary.grossRevenueBrl} currentMonth={metrics.period.isCurrentMonth} />
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Receita líquida", value: money(summary.netRevenueBrl), icon: Wallet, detail: "Após taxas e reembolsos · antes dos custos" },
          { label: "Pagamentos confirmados", value: summary.paymentCount ?? "—", icon: ReceiptText, detail: "Inclui site, curso e assessoria identificada" },
          { label: "Ticket médio", value: money(summary.averageTicketBrl), icon: CircleDollarSign, detail: "Faturamento bruto por pagamento confirmado" },
          { label: "Taxas e reembolsos", value: money(summary.feesBrl === null || summary.refundsBrl === null ? null : summary.feesBrl + summary.refundsBrl), icon: ArrowUpRight, detail: `Taxas ${money(summary.feesBrl)} · reembolsos ${money(summary.refundsBrl)}` }
        ].map(item => <article className="admin-glass-panel p-5" key={item.label}><div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold text-graphite/70">{item.label}</p><item.icon className="h-4 w-4 shrink-0 text-signal/75" /></div><p className="mt-3 text-2xl font-bold tracking-tight tabular-nums">{item.value}</p><p className="mt-2 text-[11px] leading-5 text-graphite/65">{item.detail}</p></article>)}
      </div>
        <article className="admin-glass-panel flex flex-col p-5 mt-4" id="recebimentos">
          <div className="flex items-center justify-between gap-3"><h2 className="text-base font-bold">De onde veio a receita</h2><Wallet className="h-4 w-4 text-signal" /></div>
          <p className="mt-1 text-xs leading-5 text-graphite/65">No mesmo período do total em destaque.</p>
          <div className="mt-4 grid gap-5 md:grid-cols-3">
            {parts.map(part => <div key={part.label}>
              <div className="flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2 font-semibold"><span className="h-2 w-2 shrink-0 rounded-full" style={{ background: part.color }} />{part.label}</span><span className="whitespace-nowrap font-bold tabular-nums">{money(part.value)}</span></div>
              <p className="mt-1 pl-4 text-[11px] text-graphite/65">{part.detail}</p>
            </div>)}
          </div>
          {summary.ready && summary.grossRevenueBrl! > 0 ? <div className="admin-composition-track mt-4 flex h-1.5 overflow-hidden rounded-full" aria-hidden="true">{parts.map(part => <span key={part.label} style={{ width: `${(part.value ?? 0) / summary.grossRevenueBrl! * 100}%`, background: part.color }} />)}</div> : null}
          <p className="mt-auto pt-4 text-[11px] leading-5 text-graphite/65">Transferências próprias e valores sem classificação ficam fora. Receita prevista não entra no faturamento.</p>
          {summary.unclassifiedCount !== null && summary.unclassifiedCount > 0 ? <Link className="mt-2 text-xs font-semibold text-amber-800 underline" href="#conciliacao">{summary.unclassifiedCount} {summary.unclassifiedCount === 1 ? "movimentação aguardando" : "movimentações aguardando"} classificação</Link> : null}
        </article>
      <p className="mb-5 mt-3 text-[11px] leading-5 text-graphite/65">Atualizado às {new Date(metrics.updatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })} de Brasília. Faturamento e receita líquida não representam saldo bancário nem lucro.</p>
    </>
  );
}
