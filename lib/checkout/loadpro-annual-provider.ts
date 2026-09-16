import { annualPlan, addCalendarYear } from "./loadpro-annual-policy";
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

export async function annualCardPrice(planCode: string) {
  const plan = annualPlan(planCode);
  const id = process.env[plan.priceEnv];
  if (!id) throw new Error("Annual Stripe price is not configured");
  const price = await annualStripe(`prices/${encodeURIComponent(id)}`);
  if (!price.active || price.currency !== "brl" || price.unit_amount !== plan.annualCents
    || price.recurring?.interval !== "year" || price.recurring?.interval_count !== 1) {
    throw new Error("Annual Stripe price does not match this plan");
  }
  return id;
}

export function validateMonthlySubscription(subscription: Record<string, any>, customer: string | null, planCode: string) {
  const plan = annualPlan(planCode);
  const item = subscription.items?.data?.[0];
  if (subscription.discount || subscription.discounts?.length || subscription.automatic_tax?.enabled || subscription.default_tax_rates?.length || subscription.pause_collection
    || (subscription.status==='active' && subscription.latest_invoice?.status !== 'paid')
    || subscription.customer !== customer || !["active", "trialing"].includes(subscription.status)
    || subscription.cancel_at_period_end || subscription.pending_update
    || subscription.items?.data?.length !== 1 || item?.quantity !== 1
    || item?.price?.currency !== "brl" || item?.price?.unit_amount !== plan.monthlyCents
    || item?.price?.recurring?.interval !== "month" || item?.price?.recurring?.interval_count !== 1
    || !stripeSubscriptionPeriod(subscription).end) throw new Error("Monthly subscription needs review");
  return item;
}

// A schedule changes the existing subscription at its boundary; it never creates
// a second subscription or resets a paid monthly period to today.
export async function scheduleAnnualCard(id: string, subscriptionId: string, customerId: string | null, boundary: number, planCode: string) {
  const price = await annualCardPrice(planCode);
  const subscription = await annualStripe(`subscriptions/${encodeURIComponent(subscriptionId)}`);
  const item = validateMonthlySubscription(subscription, customerId, planCode);
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
    "phases[1][metadata][plan_code]": planCode,
    "phases[1][metadata][loadpro_annual_change]": id
  });
  if (subscription.status === "trialing") params.set("phases[0][trial_end]", String(boundary));
  const updated = await annualStripe(`subscription_schedules/${schedule.id}`, params, `annual:${id}:phases`);
  const annualPhase = updated.phases?.[1];
  if (updated.subscription !== subscriptionId || annualPhase?.start_date !== boundary
    || annualPhase?.items?.[0]?.price !== price) throw new Error("Annual schedule needs reconciliation");
  return updated.id as string;
}

// Called only after a fresh, verified Pix approval. Never from QR creation.
// The same subscription is retained until its current boundary. If the Stripe
// period advanced while the Pix notification was delayed, reconcile its invoices
// before granting the year: preserve a paid month, stop an unpaid duplicate.
export async function stopMonthlyForPix(id: string, subscriptionId: string, customerId: string | null, boundary: number, planCode: string) {
  const path = 'subscriptions/'+encodeURIComponent(subscriptionId);
  const plan = annualPlan(planCode);
  const validate = (sub: Record<string,any>) => {
    if (sub.id!==subscriptionId || !['active','trialing','past_due','unpaid','canceled'].includes(sub.status)
      || sub.schedule || (sub.metadata?.loadpro_annual_pix && sub.metadata.loadpro_annual_pix!==id)) throw new Error('Monthly renewal needs review');
    // Cancellation and an invoice in flight are expected here. Still validate
    // identity, exact monthly product/amount and every unsupported override.
    const end=stripeSubscriptionPeriod(sub.status==='trialing'?sub:{...sub,status:'active'}).end!;
    validateMonthlySubscription({...sub,status:'trialing',trial_end:end,cancel_at_period_end:false},customerId,planCode);
    if (!Number.isFinite(boundary) || end<boundary) throw new Error('Protected monthly period changed');
    return end;
  };
  let sub=await annualStripe(path);
  validate(sub);
  if (!sub.cancel_at_period_end && sub.status!=='canceled') {
    await annualStripe(path,new URLSearchParams({cancel_at_period_end:'true','metadata[loadpro_annual_pix]':id}),
      'annual:'+id+':stop-monthly-after-payment');
  }
  // A lost POST response is recovered by reading Stripe, never by trusting a
  // local flag or assuming that a cancellation request succeeded.
  sub=await annualStripe(path);
  const end=validate(sub);
  if (!sub.cancel_at_period_end && sub.status!=='canceled') throw new Error('Monthly renewal was not stopped');
  let paidUntil=boundary;
  const reconciled: Record<string,unknown>[]=[];
  if (end>boundary) {
    const invoices=await annualStripe('invoices?subscription='+encodeURIComponent(subscriptionId)+'&limit=100&created[gte]='+Math.floor(boundary-3600));
    if (!Array.isArray(invoices.data) || invoices.has_more!==false) throw new Error('Monthly invoice history needs reconciliation');
    let currentFound=false;
    for (const entry of invoices.data) {
      const invoicePath='invoices/'+encodeURIComponent(entry.id);
      let invoice=await annualStripe(invoicePath);
      const line=invoice.lines?.data?.[0];
      if (invoice.subscription!==subscriptionId || invoice.customer!==customerId || invoice.currency!=='brl'
        || invoice.billing_reason!=='subscription_cycle' || invoice.lines?.has_more!==false || invoice.lines?.data?.length!==1
        || line?.subscription!==subscriptionId || line?.proration!==false || line?.quantity!==1
        || line?.price?.unit_amount!==plan.monthlyCents || line?.price?.currency!=='brl'
        || line?.price?.recurring?.interval!=='month' || line?.price?.recurring?.interval_count!==1
        || line?.amount!==plan.monthlyCents || !Number.isFinite(line?.period?.start) || !Number.isFinite(line?.period?.end)
        || line.period.start<boundary || line.period.end> end || line.period.end<=line.period.start) {
        throw new Error('Monthly invoice does not match the protected subscription');
      }
      if (line.period.end===end) currentFound=true;
      if (['draft','open'].includes(invoice.status)) {
        // Stop collection first. Never finalize a draft or initiate a payment.
        // Open invoices are voided; a draft stays frozen with an audit marker.
        await annualStripe(invoicePath,new URLSearchParams({auto_advance:'false','metadata[loadpro_annual_pix]':id}),
          'annual:'+id+':freeze:'+invoice.id);
        invoice=await annualStripe(invoicePath);
        if (invoice.status==='open') {
          try { await annualStripe(invoicePath+'/void',new URLSearchParams(),'annual:'+id+':void:'+invoice.id); }
          catch { /* A concurrent payment may have won. Verify its final state. */ }
          invoice=await annualStripe(invoicePath);
        }
      }
      if (invoice.status==='paid' && invoice.amount_paid===plan.monthlyCents && invoice.amount_remaining===0) {
        paidUntil=Math.max(paidUntil,line.period.end);
      } else if (!(invoice.status==='void' && invoice.amount_paid===0)
        && !(invoice.status==='draft' && invoice.auto_advance===false && invoice.amount_paid===0
          && invoice.metadata?.loadpro_annual_pix===id)) {
        throw new Error('Monthly invoice is still processing; retry reconciliation');
      }
      reconciled.push({id:invoice.id,status:invoice.status,period_end:line.period.end});
    }
    if (!currentFound) throw new Error('Renewal invoice is still being created; retry reconciliation');
    const latest=await annualStripe(path);
    if (validate(latest)!==end || (!latest.cancel_at_period_end && latest.status!=='canceled')) throw new Error('Monthly period changed during reconciliation');
  }
  return {monthly_renewal_stopped:true,monthly_subscription_id:subscriptionId,
    monthly_paid_until:new Date(paidUntil*1000).toISOString(),monthly_invoices:reconciled};
}

export function assertAnnualPixConfigured() {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token || token === "disabled" || !process.env.MERCADO_PAGO_WEBHOOK_SECRET) throw new Error("Pix is not configured");
  // Payments API preview remains restricted to explicit test configuration.
  // Orders API credentials must not be enabled by relaxing this boundary.
  if (process.env.VERCEL_ENV !== "production" && (process.env.LOADPRO_ANNUAL_PIX_SANDBOX !== "true" || !token.startsWith("TEST-"))) {
    throw new Error("Preview Pix sandbox is not configured");
  }
}

export async function annualMercadoPago(path: string, data?: Record<string, unknown>, key?: string) {
  assertAnnualPixConfigured();
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN!;
  const response = await fetch(`https://api.mercadopago.com/v1/${path}`, {
    method: data ? "POST" : "GET", cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json",
      ...(key ? { "X-Idempotency-Key": key } : {}) },
    ...(data ? { body: JSON.stringify(data) } : {})
  });
  if (!response.ok) throw new Error(`Pix reconciliation required (${response.status})`);
  return await response.json() as Record<string, any>;
}
