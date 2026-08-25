"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Database,
  Gauge,
  Github,
  Megaphone,
  RefreshCw,
  TrendingUp,
  WalletCards
} from "lucide-react";
import type {
  MonthlyExpenseMetrics,
  MonthlyExpenseSource
} from "@/lib/checkout/expense-reporting";

function formatMoney(amount: number, currency = "BRL") {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
      maximumFractionDigits: 2
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2).replace(".", ",")}`;
  }
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value);
}

function sourceStatus(source: MonthlyExpenseSource) {
  switch (source.state) {
    case "ready":
      return { label: "Conectado", className: "bg-emerald-50 text-emerald-700" };
    case "estimate":
      return { label: "Estimativa", className: "bg-blue-50 text-blue-700" };
    case "error":
      return { label: "Indisponível", className: "bg-rose-50 text-rose-700" };
    default:
      return { label: "Configuração pendente", className: "bg-amber-50 text-amber-700" };
  }
}

function SourceIcon({ source }: { source: MonthlyExpenseSource }) {
  if (source.id === "meta_ads") return <Megaphone className="h-4 w-4" />;
  if (source.id === "github") return <Github className="h-4 w-4" />;
  return <Database className="h-4 w-4" />;
}

function sourceValue(source: MonthlyExpenseSource) {
  if (
    (source.state !== "ready" && source.state !== "estimate") ||
    source.amount === null ||
    !source.currency
  ) {
    return "—";
  }

  return formatMoney(source.amount, source.currency);
}

export function AdminMonthlyExpenses({
  initialData
}: {
  initialData: MonthlyExpenseMetrics;
}) {
  const [data, setData] = useState(initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [reachable, setReachable] = useState(true);

  const refresh = useCallback(async (force = false) => {
    setRefreshing(true);
    try {
      const params = new URLSearchParams({ period: initialData.period });
      if (force) params.set("refresh", "1");
      const response = await fetch(`/api/admin/expenses?${params}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Expense data unavailable");
      setData((await response.json()) as MonthlyExpenseMetrics);
      setReachable(true);
    } catch {
      setReachable(false);
    } finally {
      setRefreshing(false);
    }
  }, [initialData.period]);

  useEffect(() => {
    const interval = window.setInterval(() => void refresh(false), 5 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const configuredSources = data.sources.filter(
    (source) => source.state === "ready" || source.state === "estimate"
  ).length;
  const hasEstimatedSource = data.sources.some((source) => source.state === "estimate");
  const budgetRemaining =
    data.budgetBrl === null ? null : Math.max(0, data.budgetBrl - data.totalBrlEstimate);

  return (
    <section className="mb-5 overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <WalletCards className="h-4 w-4 text-turf" />
            <h2 className="text-sm font-bold text-ink">Despesas do mês</h2>
          </div>
          <p className="mt-1 text-xs text-graphite/55">
            Marketing, infraestrutura e ferramentas em uma visão única
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${
            reachable && configuredSources === data.sources.length
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}>
            {configuredSources}/{data.sources.length} fontes com valor
          </span>
          <button
            aria-label="Atualizar despesas"
            className="rounded-md border border-ink/10 p-2 text-graphite/60 transition hover:border-ink/20 hover:text-ink disabled:cursor-wait disabled:opacity-50"
            disabled={refreshing}
            onClick={() => void refresh(true)}
            type="button"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.08fr_1fr_1fr]">
        <div className="bg-[#1f1f1f] p-5 text-white lg:min-h-40">
          <div className="flex items-center gap-2 text-white/55">
            <WalletCards className="h-4 w-4" />
            <p className="text-[11px] font-bold uppercase tracking-[0.12em]">Acumulado no mês</p>
          </div>
          <p className="mt-2 text-3xl font-black tracking-tight">
            {data.hasSpendData ? formatMoney(data.totalBrlEstimate) : "—"}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-white/55">
            Total convertido para BRL com as fontes disponíveis.
          </p>
        </div>
        <div className="border-b border-ink/10 p-5 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2 text-graphite/50">
            <TrendingUp className="h-4 w-4" />
            <p className="text-[11px] font-bold uppercase tracking-[0.12em]">
              {data.isCurrentPeriod ? "Projeção de fechamento" : "Fechamento do período"}
            </p>
          </div>
          <p className="mt-2 text-3xl font-black text-ink">
            {data.hasSpendData ? formatMoney(data.projectedBrlEstimate) : "—"}
          </p>
          <p className="mt-3 text-xs text-graphite/55">
            {data.isCurrentPeriod
              ? "Ritmo atual dos gastos variáveis + custos fixos."
              : "Total registrado para o mês selecionado."}
          </p>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 text-graphite/50">
            <Gauge className="h-4 w-4" />
            <p className="text-[11px] font-bold uppercase tracking-[0.12em]">Orçamento consumido</p>
          </div>
          <p className="mt-2 text-3xl font-black text-ink">
            {data.budgetUsedPercent === null ? "—" : `${formatPercent(data.budgetUsedPercent)}%`}
          </p>
          {data.budgetBrl === null ? (
            <p className="mt-3 text-xs text-graphite/55">Defina o orçamento mensal para acompanhar o limite.</p>
          ) : (
            <>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10">
                <div
                  className={`h-full rounded-full ${
                    (data.budgetUsedPercent || 0) > 100 ? "bg-rose-500" : "bg-turf"
                  }`}
                  style={{ width: `${Math.min(100, data.budgetUsedPercent || 0)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-graphite/55">
                {budgetRemaining === 0
                  ? "Orçamento mensal atingido"
                  : `${formatMoney(budgetRemaining || 0)} disponíveis de ${formatMoney(data.budgetBrl)}`}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-ink/10 bg-[#fafafa]">
        {data.sources.map((source) => {
          const status = sourceStatus(source);
          return (
            <div
              className="grid gap-3 border-b border-ink/10 px-5 py-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center"
              key={source.id}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-graphite/45"><SourceIcon source={source} /></span>
                  <p className="text-sm font-bold text-ink">{source.name}</p>
                  <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-bold text-graphite/55">
                    {source.category}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-graphite/50">{source.detail}</p>
              </div>
              <span className={`w-fit rounded-full px-3 py-1 text-[11px] font-bold ${status.className}`}>
                {status.label}
              </span>
              <div className="md:min-w-36 md:text-right">
                <p className="text-sm font-black text-ink">{sourceValue(source)}</p>
                {source.brlEstimate !== null && source.currency !== "BRL" ? (
                  <p className="mt-0.5 text-[11px] font-semibold text-graphite/45">
                    ≈ {formatMoney(source.brlEstimate)}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <p className="border-t border-ink/10 px-5 py-3 text-[11px] leading-relaxed text-graphite/50">
        Atualização automática a cada 5 minutos; consultas externas ficam protegidas no servidor por 15 minutos.
        {hasEstimatedSource ? " A estimativa do Supabase segue o ciclo de faturamento da organização." : ""}
        {data.hasUnconvertedCurrencies ? " Valores em moedas sem taxa configurada ficaram fora do total em BRL." : ""}
        {` Última leitura: ${new Date(data.updatedAt).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Sao_Paulo"
        })} (Brasília).`}
      </p>
    </section>
  );
}
