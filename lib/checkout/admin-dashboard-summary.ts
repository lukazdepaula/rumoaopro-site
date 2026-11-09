import type { ExternalReceiptTotals, FinancialPeriodMetrics } from "@/lib/checkout/financial-reporting";

export function monthlyRevenueProgress(revenue: number | null, goal: number, currentMonth: boolean) {
  if (!currentMonth || revenue === null || !Number.isFinite(revenue) || !Number.isFinite(goal) || goal <= 0) return null;
  const percent = Math.max(0, revenue / goal * 100);
  return {
    percent,
    ringPercent: Math.min(100, percent),
    remaining: Math.round(Math.max(0, goal - revenue) * 100) / 100,
    exceeded: Math.round(Math.max(0, revenue - goal) * 100) / 100
  };
}

// Same scope as the reconciled operation total: checkout + course + identified coaching.
// Transfers, outgoing payments, unclassified receipts and subscription forecasts stay out.
export function summarizeAdminRevenue(metrics: FinancialPeriodMetrics, ordersAvailable: boolean) {
  const externalSources = metrics.sources.filter(source => source.id === "stripe" || source.id === "mercado_pago");
  const externalReady = ordersAvailable && externalSources.length === 2 &&
    externalSources.every(source => source.state === "ready" && source.externalReceipts &&
      !source.externalReceipts.hasUnconvertedCurrencies);
  const siteReady = ordersAvailable && metrics.state === "ready" && !metrics.hasUnconvertedCurrencies;
  const ready = siteReady && externalReady;
  const sumCoaching = (field: keyof ExternalReceiptTotals) =>
    externalSources.reduce((sum, source) => sum + (source.externalReceipts?.coaching[field] ?? 0), 0);
  const round = (value: number) => Math.round(value * 100) / 100;
  const total = (field: "grossRevenueBrl" | "netRevenueBrl" | "feesBrl" | "refundsBrl" | "paymentCount") =>
    ready ? round(metrics[field] + sumCoaching(field)) : null;
  const gross = total("grossRevenueBrl");
  const count = total("paymentCount");
  const course = metrics.sources.find(source => source.id === "kiwify");
  const courseReady = ordersAvailable && course?.state === "ready" && !course.hasUnconvertedCurrencies;
  return {
    ready,
    grossRevenueBrl: gross,
    netRevenueBrl: total("netRevenueBrl"),
    feesBrl: total("feesBrl"),
    refundsBrl: total("refundsBrl"),
    paymentCount: count,
    averageTicketBrl: gross !== null && count !== null ? (count > 0 ? round(gross / count) : null) : null,
    siteAndCourseRevenueBrl: siteReady ? metrics.grossRevenueBrl : null,
    siteRevenueBrl: siteReady && courseReady ? round(metrics.grossRevenueBrl - course.grossRevenueBrl) : null,
    courseRevenueBrl: courseReady ? course.grossRevenueBrl : null,
    coachingRevenueBrl: externalReady ? round(sumCoaching("grossRevenueBrl")) : null,
    unclassifiedCount: externalReady
      ? externalSources.reduce((sum, source) => sum + (source.externalReceipts?.unclassified.transactionCount ?? 0), 0)
      : null
  };
}
