import { annualDb, getAnnualChange } from './loadpro-annual';
import { annualCardPrice, annualStripe, validateMonthlySubscription } from './loadpro-annual-provider';
import { stripeSubscriptionPeriod } from './loadpro-billing-policy';
import { annualPlan } from './loadpro-annual-policy';
import { getOrderByGatewayPaymentId } from './db';
import { syncLoadProAccess, type LoadProBillingAccess } from './loadpro';

// The Stripe portal cannot cancel a subscription with a future scheduled change.
// This path removes that future annual phase atomically and ends the same
// subscription at the end of its current trial/paid monthly period.
async function context(access: LoadProBillingAccess, userId: string) {
  const accepted=access.metadata.annual_change as Record<string,unknown> | undefined;
  if (access.user_id!==userId || access.billing_provider!=='stripe' || access.access_kind==='lifetime'
    || access.metadata.billing_interval==='year' || accepted?.payment_method!=='card'
    || typeof accepted.id!=='string' || !access.provider_subscription_id) throw new Error('Cancellation requires review');
  const change=await getAnnualChange(accepted.id,userId);
  const plan=annualPlan(access.plan_code);
  if (change.access_id!==access.id || change.method!=='card' || change.state!=='scheduled' || !change.confirmed_at
    || change.quote.plan_code!==access.plan_code || change.quote.price_cents!==plan.annualCents
    || change.provider.subscription_id!==access.provider_subscription_id
    || change.provider.customer_id!==access.provider_customer_id) throw new Error('Cancellation owner changed');
  const subscription=await annualStripe('subscriptions/'+encodeURIComponent(access.provider_subscription_id));
  if (subscription.id!==access.provider_subscription_id || !subscription.schedule) throw new Error('Scheduled change unavailable');
  const schedule=await annualStripe('subscription_schedules/'+encodeURIComponent(subscription.schedule));
  const end=stripeSubscriptionPeriod(subscription).end;
  const cancelled=schedule.metadata?.loadpro_cancel_change===change.id && schedule.end_behavior==='cancel';
  const item=validateMonthlySubscription({...subscription,cancel_at_period_end:cancelled ? false : subscription.cancel_at_period_end},access.provider_customer_id,access.plan_code);
  if (!end || schedule.id!==change.provider.schedule_id || schedule.subscription!==subscription.id
    || schedule.customer!==access.provider_customer_id || schedule.status!=='active'
    || schedule.metadata?.loadpro_annual_change!==change.id
    || schedule.current_phase?.end_date!==end || !Number.isFinite(schedule.current_phase?.start_date)
    || end!==Date.parse(change.quote.effective_at)/1000) throw new Error('Cancellation boundary changed');
  const phases=schedule.phases;
  const phase=phases?.[0];
  if (!Array.isArray(phases) || phases.length!==(cancelled ? 1 : 2)
    || phase?.start_date!==schedule.current_phase.start_date || phase?.end_date!==end
    || phase?.items?.length!==1 || phase.items[0].price!==item.price.id || phase.items[0].quantity!==1
    || phase.add_invoice_items?.length || phase.discounts?.length || phase.default_tax_rates?.length
    || phase.application_fee_percent!=null || phase.transfer_data || phase.items[0].tax_rates?.length
    || phase.items[0].discounts?.length || phase.default_payment_method || phase.default_source
    || phase.billing_thresholds || phase.items[0].billing_thresholds || phase.automatic_tax?.enabled
    || phase.on_behalf_of || phase.collection_method==='send_invoice') throw new Error('Scheduled phase requires review');
  if (!cancelled) {
    if (subscription.cancel_at || end*1000-Date.now()<15*60*1000
      || phases[1].start_date!==end || phases[1].items?.length!==1 || phases[1].items[0].quantity!==1
      || phases[1].items[0].price!==await annualCardPrice(access.plan_code)) throw new Error('Cancellation needs reconciliation');
  }
  return {change,subscription,schedule,item,end,cancelled};
}

export async function quoteAnnualCancellation(access:LoadProBillingAccess,userId:string) {
  const value=await context(access,userId);
  return {id:value.change.id,cancel_at:new Date(value.end*1000).toISOString(),
    access_until:new Date(value.end*1000).toISOString(),amount_cents:0,cancelled:value.cancelled};
}

export async function cancelScheduledAnnual(access:LoadProBillingAccess,userId:string,id:string,expectedEnd:string) {
  const value=await context(access,userId);
  const {change,subscription,schedule,item,end}=value;
  if (change.id!==id || expectedEnd!==new Date(end*1000).toISOString()) throw new Error('Review cancellation date');
  const order=await getOrderByGatewayPaymentId('stripe',subscription.id);
  if (!order || order.customer_email.trim().toLowerCase()!==access.email) throw new Error('Cancellation order mismatch');
  await annualDb('rpc/lock_loadpro_billing',{method:'POST',body:JSON.stringify({p_access_id:access.id,p_operation_id:id})});
  // Store consent before touching the provider. Retrying a lost response uses
  // this same boundary and idempotency key, never a new charge or subscription.
  const intent=change.provider.cancellation;
  if (intent && intent.cancel_at!==expectedEnd) throw new Error('Cancellation intent changed');
  if (!intent) await annualDb('loadpro_annual_changes?id=eq.'+encodeURIComponent(id)+'&user_id=eq.'+encodeURIComponent(userId),{
    method:'PATCH',body:JSON.stringify({provider:{...change.provider,cancellation:{cancel_at:expectedEnd,confirmed_at:new Date().toISOString()}},updated_at:new Date().toISOString()})
  });
  if (!value.cancelled) {
    const params=new URLSearchParams({end_behavior:'cancel',proration_behavior:'none',
      'metadata[loadpro_cancel_change]':id,
      'phases[0][start_date]':String(schedule.current_phase.start_date),'phases[0][end_date]':String(end),
      'phases[0][items][0][price]':item.price.id,'phases[0][items][0][quantity]':'1',
      'phases[0][proration_behavior]':'none'});
    if(subscription.status==='trialing') params.set('phases[0][trial_end]',String(end));
    const updated=await annualStripe('subscription_schedules/'+encodeURIComponent(schedule.id),params,`annual:${id}:cancel-before-annual`);
    if(updated.subscription!==subscription.id || updated.end_behavior!=='cancel'
      || updated.phases?.length!==1 || updated.phases[0].end_date!==end
      || updated.metadata?.loadpro_cancel_change!==id) throw new Error('Cancellation needs reconciliation');
  }
  const latest=await annualStripe('subscriptions/'+encodeURIComponent(subscription.id));
  validateMonthlySubscription({...latest,cancel_at_period_end:false},access.provider_customer_id,access.plan_code);
  if(latest.id!==subscription.id || stripeSubscriptionPeriod(latest).end!==end
    || !(latest.cancel_at===end || latest.cancel_at_period_end===true)) throw new Error('Cancellation not confirmed');
  await syncLoadProAccess(order,{status:'active',providerSubscriptionId:latest.id,providerCustomerId:access.provider_customer_id,
    currentPeriodStart:stripeSubscriptionPeriod(latest).start,currentPeriodEnd:end,
    trialStart:latest.trial_start,trialEnd:latest.trial_end,providerSubscriptionStatus:latest.status,
    planCode:access.plan_code,priceCents:item.price.unit_amount,currency:'BRL',billingInterval:'month',
    cancelAtPeriodEnd:true,eventId:'annual-cancellation:'+id});
  await annualDb('rpc/unlock_loadpro_billing',{method:'POST',body:JSON.stringify({p_operation_id:id})});
  return {id,cancelled:true,cancel_at:expectedEnd,access_until:expectedEnd,amount_cents:0};
}
