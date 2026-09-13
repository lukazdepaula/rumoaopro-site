import { ANNUAL_CENTS, addCalendarYear } from "./loadpro-annual-policy";
import { stripeSubscriptionPeriod } from "./loadpro-billing-policy";

export async function annualStripe(path: string, params?: URLSearchParams, key?: string) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("Stripe is not configured");
  if (process.env.VERCEL_ENV !== "production" && !secret.startsWith("sk_test_")) {
    throw new Error("Preview requires Stripe test credentials");
  }
  const expanded = !params && path.startsWith('subscriptions/') ? path+'?expand[]=latest_invoice' : path;
  const response = await fetch(`https://api.stripe.com/v1/${expanded}`, {
    method: params ? "POST" : "GET", cache: "no-store",
    headers: { Authorization: `Bearer ${secret}`, "Stripe-Version": "2024-06-20",
      ...(params ? { "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": key! } : {}) },
    ...(params ? { body: params } : {})
  });
  if (!response.ok) throw new Error(`Stripe reconciliation required (${response.status})`);
  return await response.json() as Record<string, any>;
}

export async function annualCardPrice() {
  const id = process.env.STRIPE_LOADPRO_ANNUAL_PRICE_ID;
  if (!id) throw new Error("Annual Stripe price is not configured");
  const price = await annualStripe(`prices/${encodeURIComponent(id)}`);
  if (!price.active || price.currency !== "brl" || price.unit_amount !== ANNUAL_CENTS
    || price.recurring?.interval !== "year" || price.recurring?.interval_count !== 1) {
    throw new Error("Annual Stripe price must be BRL 499.00 per year");
  }
  return id;
}

export function validateMonthlySubscription(subscription: Record<string, any>, customer: string | null) {
  const item = subscription.items?.data?.[0];
  if (subscription.discount || subscription.discounts?.length || subscription.automatic_tax?.enabled || subscription.default_tax_rates?.length || subscription.pause_collection
    || (subscription.status==='active' && subscription.latest_invoice?.status !== 'paid')
    || subscription.customer !== customer || !["active", "trialing"].includes(subscription.status)
    || subscription.cancel_at_period_end || subscription.pending_update
    || subscription.items?.data?.length !== 1 || item?.quantity !== 1
    || item?.price?.currency !== "brl" || item?.price?.unit_amount !== 4990
    || item?.price?.recurring?.interval !== "month" || item?.price?.recurring?.interval_count !== 1
    || !stripeSubscriptionPeriod(subscription).end) throw new Error("Monthly subscription needs review");
  return item;
}

// A schedule changes the existing subscription at its boundary; it never creates
// a second subscription or resets a paid monthly period to today.
export async function scheduleAnnualCard(id: string, subscriptionId: string, customerId: string | null, boundary: number) {
  const price = await annualCardPrice();
  const subscription = await annualStripe(`subscriptions/${encodeURIComponent(subscriptionId)}`);
  const item = validateMonthlySubscription(subscription, customerId);
  if (stripeSubscriptionPeriod(subscription).end !== boundary || boundary * 1000 <= Date.now()) {
    throw new Error("Charge date changed; review new terms");
  }
  const createSchedule = () => annualStripe("subscription_schedules", new URLSearchParams({from_subscription:subscriptionId}), `annual:${id}:schedule`);
  let schedule: Record<string, any>;
  if (subscription.schedule) {
    schedule = await annualStripe(`subscription_schedules/${encodeURIComponent(subscription.schedule)}`);
    if (schedule.metadata?.loadpro_annual_change !== id) {
      // Recover a create response lost before metadata was written. The same
      // provider idempotency key can only return this operation's schedule.
      const recovered=await createSchedule();
      if (recovered.id!==schedule.id) throw new Error('Another schedule exists');
    }
  } else {
    schedule = await createSchedule();
  }
  const params = new URLSearchParams({
    end_behavior: "release", proration_behavior: "none",
    "metadata[loadpro_annual_change]": id,
    "phases[0][start_date]": String(schedule.current_phase.start_date),
    "phases[0][end_date]": String(boundary),
    "phases[0][items][0][price]": item.price.id,
    "phases[0][items][0][quantity]": "1", "phases[0][proration_behavior]": "none",
    "phases[1][start_date]": String(boundary), "phases[1][end_date]": String(Date.parse(addCalendarYear(new Date(boundary*1000).toISOString()))/1000),
    "phases[1][items][0][price]": price, "phases[1][items][0][quantity]": "1",
    "phases[1][billing_cycle_anchor]": "phase_start", "phases[1][proration_behavior]": "none",
    "phases[1][metadata][plan_code]": "loadpro_founders",
    "phases[1][metadata][loadpro_annual_change]": id
  });
  if (subscription.status === "trialing") params.set("phases[0][trial_end]", String(boundary));
  const updated = await annualStripe(`subscription_schedules/${schedule.id}`, params, `annual:${id}:phases`);
  const annualPhase = updated.phases?.[1];
  if (updated.subscription !== subscriptionId || annualPhase?.start_date !== boundary
    || annualPhase?.items?.[0]?.price !== price) throw new Error("Annual schedule needs reconciliation");
  return updated.id as string;
}

export async function stopMonthlyForPix(id: string, subscriptionId: string, customerId: string | null, boundary: number) {
  const subscription = await annualStripe(`subscriptions/${encodeURIComponent(subscriptionId)}`);
  if (subscription.metadata?.loadpro_annual_pix === id && subscription.cancel_at_period_end) return;
  validateMonthlySubscription(subscription, customerId);
  if (subscription.schedule || stripeSubscriptionPeriod(subscription).end !== boundary
    || boundary * 1000 <= Date.now()) throw new Error("Monthly renewal needs review");
  const updated = await annualStripe(`subscriptions/${encodeURIComponent(subscriptionId)}`, new URLSearchParams({
    cancel_at_period_end: "true", "metadata[loadpro_annual_pix]": id
  }), `annual:${id}:stop-monthly`);
  if (!updated.cancel_at_period_end) throw new Error("Monthly renewal was not stopped");
}

export async function annualMercadoPago(path: string, data?: Record<string, unknown>, key?: string) {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token || !process.env.MERCADO_PAGO_WEBHOOK_SECRET) throw new Error("Pix is not configured");
  // Mercado Pago test credentials do not have a reliable prefix. Preview calls
  // require a separately configured, explicitly declared sandbox environment.
  if (process.env.VERCEL_ENV !== "production" && (process.env.LOADPRO_ANNUAL_PIX_SANDBOX !== "true" || !token.startsWith("TEST-"))) {
    throw new Error("Preview Pix sandbox is not configured");
  }
  const response = await fetch(`https://api.mercadopago.com/v1/${path}`, {
    method: data ? "POST" : "GET", cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json",
      ...(key ? { "X-Idempotency-Key": key } : {}) },
    ...(data ? { body: JSON.stringify(data) } : {})
  });
  if (!response.ok) throw new Error(`Pix reconciliation required (${response.status})`);
  return await response.json() as Record<string, any>;
}
