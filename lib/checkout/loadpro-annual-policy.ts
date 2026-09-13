// Monetary and calendar rules shared by the server and isolated tests.
export const ANNUAL_CENTS = 49900;
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
  method: AnnualMethod; periodEnd: string | null; now?: number;
}) {
  const now = input.now ?? Date.now();
  const paidUntil = Date.parse(input.periodEnd || "");
  const start = new Date(Math.max(now, Number.isFinite(paidUntil) ? paidUntil : now)).toISOString();
  return {
    terms_version: ANNUAL_TERMS, plan_code: "loadpro_founders", currency: "BRL",
    price_cents: ANNUAL_CENTS, billing_interval: "year", payment_method: input.method,
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
  const manualAnnual = access.metadata.billing_interval === 'year' && access.metadata.payment_method === 'pix' && access.price_cents === 49900;
  if (access.plan_code !== "loadpro_founders" || access.currency !== "BRL"
    || access.access_kind === "lifetime" || (access.metadata.billing_interval === "year" && !manualAnnual)
    || (access.price_cents !== 4990 && !manualAnnual)) throw new Error("Subscription is not eligible for this offer");
}

export function assertApprovedAnnualPix(payment: Record<string, unknown>, reference: string, live: boolean) {
  if (payment.status !== "approved" || payment.payment_method_id !== "pix"
    || payment.currency_id !== "BRL" || payment.transaction_amount !== ANNUAL_CENTS / 100
    || payment.external_reference !== reference || payment.live_mode !== live
    || !payment.id || !Number.isFinite(Date.parse(String(payment.date_approved || "")))) {
    throw new Error("Annual Pix has not been verified");
  }
}
