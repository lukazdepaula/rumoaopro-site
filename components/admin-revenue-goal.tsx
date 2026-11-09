import { Target } from "lucide-react";
import { monthlyRevenueProgress } from "@/lib/checkout/admin-dashboard-summary";
import { formatMoney } from "@/lib/checkout/products";

export function AdminRevenueGoal({ revenue, currentMonth, goal = 15000 }: {
  revenue: number | null;
  currentMonth: boolean;
  goal?: number;
}) {
  const progress = monthlyRevenueProgress(revenue, goal, currentMonth);
  const label = progress ? `${progress.percent.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%` : "—";
  return <article className="admin-goal relative flex flex-col items-center rounded-3xl p-6 text-white" aria-label="Meta mensal de faturamento">
    <div className="flex w-full items-center justify-between gap-2">
      <h2 className="text-sm font-semibold">Meta do mês</h2><Target className="h-5 w-5 text-red-400" />
    </div>
    <div className="admin-goal-ring relative my-4 h-44 w-44" data-admin-reveal>
      <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="90" cy="90" r="74" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="10" />
        {progress ? <circle className="admin-ring-progress" cx="90" cy="90" r="74" fill="none" stroke="#f13a51" strokeWidth="10" strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset={100-progress.ringPercent} /> : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tracking-tight tabular-nums" data-testid="monthly-goal-progress">{label}</span>
        <span className="mt-1 text-xs text-white/70">{progress ? "da meta alcançada" : "progresso indisponível"}</span>
      </div>
    </div>
    <p className="text-xl font-bold tabular-nums">{formatMoney(goal, "BRL")}</p>
    <p className="mt-2 text-center text-xs leading-5 text-white/75">{progress
      ? progress.remaining > 0 ? `Faltam ${formatMoney(progress.remaining, "BRL")} para chegar lá.` : `Meta alcançada${progress.exceeded > 0 ? ` · ${formatMoney(progress.exceeded, "BRL")} acima` : ""}!`
      : currentMonth ? "Aguardando a conferência completa dos recebimentos." : "Selecione Mês atual para acompanhar esta meta."}</p>
    <p className="mt-auto pt-4 text-[11px] text-white/60">Receita identificada · sem projeções</p>
  </article>;
}
