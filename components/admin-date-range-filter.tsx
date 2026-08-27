import Link from "next/link";
import { CalendarDays, RefreshCw } from "lucide-react";

import type { FinancialPeriod, FinancialRangePreset } from "@/lib/checkout/financial-reporting";

const presets: Array<{ id: FinancialRangePreset; label: string }> = [
  { id: "current_month", label: "Mês atual" },
  { id: "today", label: "Hoje" },
  { id: "last_7_days", label: "7 dias" },
  { id: "last_30_days", label: "30 dias" },
  { id: "previous_month", label: "Mês anterior" },
  { id: "current_year", label: "Ano atual" }
];

function hrefFor(range: FinancialRangePreset, compare: boolean) {
  const params = new URLSearchParams({ range });
  if (!compare) params.set("compare", "0");
  return `/admin?${params.toString()}`;
}

export function AdminDateRangeFilter({
  period,
  compare,
  maxDate
}: {
  period: FinancialPeriod;
  compare: boolean;
  maxDate: string;
}) {
  const currentParams = new URLSearchParams({ range: period.preset });
  if (period.preset === "custom") {
    currentParams.set("from", period.startKey);
    currentParams.set("to", period.endKey);
  }
  currentParams.set("compare", compare ? "0" : "1");

  const refreshParams = new URLSearchParams({ range: period.preset, refresh: "1" });
  if (period.preset === "custom") {
    refreshParams.set("from", period.startKey);
    refreshParams.set("to", period.endKey);
  }
  if (!compare) refreshParams.set("compare", "0");

  return (
    <section className="mb-5 rounded-lg border border-ink/10 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-graphite/55">
            <CalendarDays className="h-4 w-4" />
            <p className="text-[11px] font-bold uppercase tracking-[0.12em]">Período financeiro</p>
          </div>
          <p className="mt-1 text-lg font-black text-ink">{period.label}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            className={`rounded-md border px-3 py-2 text-xs font-bold ${
              compare
                ? "border-turf/25 bg-turf/10 text-turf"
                : "border-ink/15 text-ink"
            }`}
            href={`/admin?${currentParams.toString()}`}
          >
            {compare ? "Comparação ativa" : "Comparar período"}
          </Link>
          <Link
            className="inline-flex items-center gap-2 rounded-md border border-ink/15 px-3 py-2 text-xs font-bold text-ink"
            href={`/admin?${refreshParams.toString()}`}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Atualizar
          </Link>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {presets.map((preset) => {
          const active = period.preset === preset.id;
          return (
            <Link
              className={`rounded-full px-3 py-2 text-xs font-bold transition ${
                active ? "bg-ink text-white" : "bg-smoke text-graphite/70 hover:text-ink"
              }`}
              href={hrefFor(preset.id, compare)}
              key={preset.id}
            >
              {preset.label}
            </Link>
          );
        })}
      </div>

      <form className="mt-4 grid gap-3 border-t border-ink/10 pt-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end" method="get">
        <input name="range" type="hidden" value="custom" />
        <input name="compare" type="hidden" value={compare ? "1" : "0"} />
        <label className="grid gap-1.5 text-xs font-bold text-graphite/65">
          De
          <input
            className="min-w-0 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-turf"
            defaultValue={period.startKey}
            max={maxDate}
            name="from"
            required
            type="date"
          />
        </label>
        <label className="grid gap-1.5 text-xs font-bold text-graphite/65">
          Até
          <input
            className="min-w-0 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-turf"
            defaultValue={period.endKey}
            max={maxDate}
            name="to"
            required
            type="date"
          />
        </label>
        <button className="rounded-md bg-ink px-4 py-2.5 text-xs font-bold text-white" type="submit">
          Aplicar datas
        </button>
      </form>
      <p className="mt-3 text-[11px] leading-relaxed text-graphite/50">
        Intervalos personalizados aceitam até 366 dias. O Mercado Pago disponibiliza pesquisa financeira dos últimos 12 meses.
      </p>
    </section>
  );
}
