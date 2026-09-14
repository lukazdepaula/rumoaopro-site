// Monetary and calendar rules shared by the server and isolated tests.
export const ANNUAL_PLANS = {
  loadpro_founders: { monthlyCents: 4990, annualCents: 49900, players: 30, priceEnv: "STRIPE_LOADPRO_ANNUAL_PRICE_ID" },
  loadpro_founders_50: { monthlyCents: 6990, annualCents: 69900, players: 50, priceEnv: "STRIPE_LOADPRO_FOUNDERS_50_ANNUAL_PRICE_ID" }
} as const;
export type AnnualPlanCode = keyof typeof ANNUAL_PLANS;
export function annualPlan(code: string) {
  if (!Object.prototype.hasOwnProperty.call(ANNUAL_PLANS, code)) throw new Error("Unsupported annual plan");
  return ANNUAL_PLANS[code as AnnualPlanCode];
}
export function isAnnualAmount(amount: unknown) {
  return Object.values(ANNUAL_PLANS).some(plan => plan.annualCents === amount);
}
export function matchesAnnualPayment(planCode: unknown, priceCents: unknown, amountPaid: unknown, currency: unknown) {
  if (typeof planCode !== 'string' || !Object.prototype.hasOwnProperty.call(ANNUAL_PLANS,planCode)) return false;
  const plan=annualPlan(planCode);
  return priceCents===plan.annualCents && amountPaid===plan.annualCents && currency==='BRL';
}
export const ANNUAL_TERMS = "loadpro-annual-v1";
export type AnnualMethod = "card" | "pix";

export function addCalendarYear(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error("Invalid access date");
  const month = date.getUTCMonth();
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  if (date.getUTCMonth() !== month) date.setUTCDate(0);
  return date.toISOString();
}

export function annualTerms(input: {
  planCode: string; method: AnnualMethod; periodEnd: string | null; now?: number;
}) {
  const plan = annualPlan(input.planCode);
  const now = input.now ?? Date.now();
  const paidUntil = Date.parse(input.periodEnd || "");
  const start = new Date(Math.max(now, Number.isFinite(paidUntil) ? paidUntil : now)).toISOString();
  return {
    terms_version: ANNUAL_TERMS, plan_code: input.planCode, currency: "BRL",
    price_cents: plan.annualCents, billing_interval: "year", payment_method: input.method,
    renewal_mode: input.method === "pix" ? "manual" : "automatic",
    charge_at: input.method === "pix" ? new Date(now).toISOString() : start,
    effective_at: start, access_until: addCalendarYear(start),
    protected_until: input.periodEnd,
    monthly_renewal: input.method === "pix" ? "stop_on_confirmation" : "replace_at_period_end"
  };
}

export function assertAnnualEligible(access: {
  plan_code: string; currency: string | null; access_kind: string;
  price_cents: number | null; metadata: Record<string, unknown>;
}) {
  const plan = annualPlan(access.plan_code);
  const manualAnnual = access.metadata.billing_interval === 'year' && access.metadata.payment_method === 'pix' && access.price_cents === plan.annualCents;
  if (access.currency !== "BRL"
    || access.access_kind === "lifetime" || (access.metadata.billing_interval === "year" && !manualAnnual)
    || (access.price_cents !== plan.monthlyCents && !manualAnnual)) throw new Error("Subscription is not eligible for this offer");
}

export function assertApprovedAnnualPix(payment: Record<string, unknown>, reference: string, live: boolean, planCode: string) {
  const plan = annualPlan(planCode);
  if (payment.status !== "approved" || payment.payment_method_id !== "pix"
    || payment.currency_id !== "BRL" || payment.transaction_amount !== plan.annualCents / 100
    || payment.external_reference !== reference || payment.live_mode !== live
    || !payment.id || !Number.isFinite(Date.parse(String(payment.date_approved || "")))) {
    throw new Error("Annual Pix has not been verified");
  }
}
