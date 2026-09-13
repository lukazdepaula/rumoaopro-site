import { randomUUID } from "node:crypto";
import { requestLoadPro, syncLoadProAccess, type LoadProBillingAccess } from "./loadpro";
import { getOrderByGatewayPaymentId } from "./db";
import { annualTerms, assertAnnualEligible, assertApprovedAnnualPix, type AnnualMethod } from "./loadpro-annual-policy";
import { annualCardPrice, annualStripe, annualMercadoPago, validateMonthlySubscription, scheduleAnnualCard, stopMonthlyForPix } from "./loadpro-annual-provider";
import { stripeSubscriptionPeriod } from "./loadpro-billing-policy";

type Change = {
  id: string; access_id: string; user_id: string; state: string; method: AnnualMethod;
  quote: ReturnType<typeof annualTerms>; provider: Record<string, any>; confirmed_at: string | null;
};
export async function annualDb(path: string, init?: RequestInit) {
  if (process.env.VERCEL_ENV !== 'production' && process.env.LOADPRO_SUPABASE_URL?.includes('iqkzqdoyvxblnsgnsfbz.supabase.co')) throw new Error('Preview must use an isolated LoadPro database');
  const response = await requestLoadPro(`/rest/v1/${path}`, init);
  if (!response.ok) throw new Error(`Annual billing storage needs reconciliation (${response.status})`);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
export function annualEnabled() { return process.env.LOADPRO_ANNUAL_ENABLED === "true"; }

async function currentSubscription(access: LoadProBillingAccess) {
  if (access.billing_provider !== "stripe" || !access.provider_subscription_id || !access.provider_customer_id) {
    throw new Error("This subscription needs assisted migration");
  }
  const subscription = await annualStripe(`subscriptions/${encodeURIComponent(access.provider_subscription_id)}`);
  validateMonthlySubscription(subscription, access.provider_customer_id);
  if (subscription.schedule) throw new Error("Another subscription change is scheduled");
  return subscription;
}

export async function quoteAnnual(access: LoadProBillingAccess, userId: string, method: AnnualMethod) {
  assertAnnualEligible(access);
  const renewal=access.metadata.billing_interval==='year' && access.metadata.payment_method==='pix';
  if (renewal && method!=='pix') throw new Error('Manual renewal uses Pix');
  if (access.user_id !== userId || (access.metadata.annual_change && !renewal)) throw new Error("Subscription change already exists");
  if (method === "card") await annualCardPrice();
  if (method === "pix" && (!process.env.MERCADO_PAGO_ACCESS_TOKEN || !process.env.MERCADO_PAGO_WEBHOOK_SECRET
    || !process.env.LOADPRO_ANNUAL_WEBHOOK_ORIGIN?.startsWith('https://')
    || (process.env.VERCEL_ENV !== 'production' && (process.env.LOADPRO_ANNUAL_PIX_SANDBOX !== 'true' || !process.env.MERCADO_PAGO_ACCESS_TOKEN.startsWith('TEST-'))))) {
    throw new Error("Pix is not configured");
  }
  const subscription = renewal ? null : await currentSubscription(access);
  const end = subscription ? stripeSubscriptionPeriod(subscription).end! : Math.max(Date.now()/1000,Date.parse(access.current_period_end || '')/1000);
  // Avoid scheduling or stopping a renewal while an invoice may already be issuing.
  if (!renewal && end * 1000 - Date.now() < 15 * 60 * 1000) throw new Error("Renewal is processing; refresh after payment reconciliation");
  const quote = annualTerms({ method, periodEnd: new Date(end * 1000).toISOString() });
  if (renewal) quote.monthly_renewal="none";
  const id = randomUUID();
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await annualDb("loadpro_annual_changes", { method: "POST", body: JSON.stringify({
    id, access_id: access.id, user_id: userId, method, access_version: access.updated_at,
    quote, expires_at, provider: { subscription_id: renewal ? null : access.provider_subscription_id, customer_id: access.provider_customer_id,
      email: access.email, live: process.env.VERCEL_ENV === "production" }
  }) });
  return { ...quote, id, expires_at, team_limit: access.team_limit, players_per_team_limit: access.players_per_team_limit };
}

export async function getAnnualChange(id: string, userId?: string): Promise<Change> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Invalid change ID");
  const rows = await annualDb(`loadpro_annual_changes?id=eq.${encodeURIComponent(id)}${userId ? `&user_id=eq.${encodeURIComponent(userId)}` : ""}&limit=1`);
  if (!rows?.[0]) throw new Error("Change not found");
  return rows[0];
}
function publicChange(change: Change) {
  return { id: change.id, state: change.state, quote: change.quote,
    pix_code: change.provider.pix_code || null, pix_expires_at: change.provider.pix_expires_at || null };
}
export async function annualStatus(id: string, userId: string) { return publicChange(await getAnnualChange(id,userId)); }

export async function confirmAnnual(id: string, userId: string) {
  let change: Change = await annualDb("rpc/confirm_loadpro_annual", { method: "POST", body: JSON.stringify({ p_id:id,p_user_id:userId }) });
  if (change.state !== "processing") return publicChange(change);
  const provider = change.provider;
  if (change.method === "card") {
    const scheduleId = await scheduleAnnualCard(id, provider.subscription_id, provider.customer_id, Date.parse(change.quote.effective_at)/1000);
    change = await finishAnnual(id,"scheduled",{ schedule_id:scheduleId });
  } else {
    // An accepted Pix quote explicitly stops monthly renewal. Even if Pix is
    // abandoned there is no unexpected monthly debit; existing days remain.
    const origin = process.env.LOADPRO_ANNUAL_WEBHOOK_ORIGIN;
    if (!origin || !/^https:\/\/[^/]+$/.test(origin)) throw new Error("Annual webhook origin is not configured");
    if (provider.subscription_id) await stopMonthlyForPix(id,provider.subscription_id,provider.customer_id,Date.parse(change.quote.effective_at)/1000);
    const payment = await annualMercadoPago("payments", {
      transaction_amount:499,description:"LoadPro Fundadores 30 · Anual",payment_method_id:"pix",
      external_reference:`loadpro-annual:${id}`,notification_url:`${origin}/api/loadpro/billing/annual/webhook`,
      date_of_expiration:new Date(Date.now()+30*60*1000).toISOString(),
      payer:{email:provider.email}
    },`annual-${id}`);
    if (!payment.id || !payment.point_of_interaction?.transaction_data?.qr_code) throw new Error("Pix response incomplete");
    change = await finishAnnual(id,"awaiting_payment",{payment_id:String(payment.id),
      pix_code:payment.point_of_interaction.transaction_data.qr_code,pix_expires_at:payment.date_of_expiration});
  }
  return publicChange(change);
}
export async function finishAnnual(id:string,state:string,provider:Record<string,unknown>):Promise<Change> {
  return annualDb("rpc/finish_loadpro_annual",{method:"POST",body:JSON.stringify({p_id:id,p_state:state,p_provider:provider})});
}
export async function reconcileAnnualPix(paymentId:string) {
  const payment = await annualMercadoPago(`payments/${encodeURIComponent(paymentId)}`);
  const reference = String(payment.external_reference || "");
  if (!reference.startsWith("loadpro-annual:")) throw new Error("Unrelated payment");
  const change = await getAnnualChange(reference.slice("loadpro-annual:".length));
  if (change.method!=="pix" || !change.confirmed_at || (change.provider.payment_id && change.provider.payment_id!==String(payment.id))) {
    throw new Error("Payment does not belong to confirmed change");
  }
  if (change.state === "paid") return publicChange(change);
  if (payment.status === "approved") {
    assertApprovedAnnualPix(payment,reference,change.provider.live===true);
    return publicChange(await finishAnnual(change.id,"paid",{payment_id:String(payment.id),verified:true,
      amount_cents:49900,currency:"BRL",approved_at:payment.date_approved}));
  }
  if (["rejected","cancelled"].includes(payment.status)) {
    return publicChange(await finishAnnual(change.id,"failed",{payment_id:String(payment.id),payment_status:payment.status}));
  }
  return publicChange(change);
}

// Reconcile verified card invoices before the legacy webhook deduplication
// shortcut. Replays can repair a database failure without replaying sales mail.
export async function reconcileAnnualCard(subscriptionId:string, invoiceId?:string) {
  const rows=await annualDb('billing_access?provider_subscription_id=eq.'+encodeURIComponent(subscriptionId)+'&billing_provider=eq.stripe&limit=1');
  const access=rows?.[0] as LoadProBillingAccess | undefined;
  if (!access?.metadata.annual_change || access.plan_code!=='loadpro_founders') return false;
  const subscription=await annualStripe('subscriptions/'+encodeURIComponent(subscriptionId));
  const item=subscription.items?.data?.[0], invoice=subscription.latest_invoice;
  if (subscription.customer!==access.provider_customer_id || subscription.status!=='active'
    || item?.price?.recurring?.interval!=='year' || item?.price?.unit_amount!==49900 || item?.price?.currency!=='brl'
    || !invoice || typeof invoice!=='object' || invoice.status!=='paid' || invoice.amount_paid!==49900 || invoice.currency!=='brl'
    || (invoiceId && invoice.id!==invoiceId)) return false;
  const order=await getOrderByGatewayPaymentId('stripe',subscriptionId);
  if (!order || order.customer_email.trim().toLowerCase()!==access.email) throw new Error('Annual order reconciliation required');
  const period=stripeSubscriptionPeriod(subscription);
  if (!period.start || !period.end) throw new Error('Annual period missing');
  await syncLoadProAccess(order,{status:'active',currentPeriodStart:period.start,currentPeriodEnd:period.end,
    providerSubscriptionStatus:'active',providerSubscriptionId:subscriptionId,providerCustomerId:access.provider_customer_id,
    planCode:'loadpro_founders',priceCents:49900,currency:'BRL',billingInterval:'year',annualPaymentConfirmed:true,
    cancelAtPeriodEnd:subscription.cancel_at_period_end===true,eventId:'annual-reconcile:'+invoice.id});
  return true;
}
