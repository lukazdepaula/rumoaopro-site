import { createHash } from 'node:crypto';
import type { LoadProBillingAccess } from './loadpro';
import { reminderDb,getReminderPreference,TRIAL_OFFER_TERMS } from './loadpro-reminder-preferences';
import { prepareAnnualTrialReminder } from './loadpro-annual-reminder';
import { annualStripe,validateMonthlySubscription } from './loadpro-annual-provider';
import { publicLoadProAppUrl } from '@/lib/preview-safety';

// Internal preparation only. No scheduler, mail transport or public invocation.
// The existing Stripe trial warning owns the channel by default. Switching the
// channel requires separately reviewing/disabling that warning, never here.
export async function reserveAnnualTrialReminder(accessId:string, communication:{
  status:'allowed'|'suppressed'|'unknown'; checkedAt:number;
}) {
  const now=Date.now();
  if(process.env.LOADPRO_TRIAL_REMINDER_OWNER!=='loadpro' || process.env.LOADPRO_STRIPE_TRIAL_REMINDER_DISABLED!=='true'
    || communication.status!=='allowed' || !Number.isFinite(communication.checkedAt)
    || communication.checkedAt>now || now-communication.checkedAt>60_000) return null;
  const rows=await reminderDb(`billing_access?id=eq.${encodeURIComponent(accessId)}&limit=1`);
  const access=rows[0] as LoadProBillingAccess|undefined;
  if(!access?.user_id || access.billing_provider!=='stripe' || !access.provider_subscription_id) return null;
  const preference=await getReminderPreference(access.user_id);
  if(!preference?.annual_trial_offer || preference.terms_version!==TRIAL_OFFER_TERMS) return null;
  const appUrl=publicLoadProAppUrl();
  if(!appUrl)return null;
  const draft=prepareAnnualTrialReminder(access,{now,locale:preference.locale,offerConsent:true,suppressed:false,
    existingTrialReminder:false,deliveredKeys:new Set(),appUrl});
  if(!draft)return null;
  // Do not trust a delayed subscription webhook when describing a future charge.
  const subscription=await annualStripe(`subscriptions/${encodeURIComponent(access.provider_subscription_id)}`);
  validateMonthlySubscription(subscription,access.provider_customer_id!,access.plan_code);
  const meta=access.metadata;
  const trialEnd=typeof meta.trial_end==='number'?meta.trial_end*1000:Date.parse(String(meta.trial_end));
  if(subscription.id!==access.provider_subscription_id || subscription.status!=='trialing'
    || subscription.schedule || subscription.cancel_at || subscription.cancel_at_period_end
    || subscription.trial_end*1000!==trialEnd) return null;
  const payloadHash=createHash('sha256').update(JSON.stringify(draft)).digest('hex');
  const id=await reminderDb('rpc/reserve_loadpro_trial_reminder',{method:'POST',body:JSON.stringify({
    p_access_id:access.id,p_access_version:access.updated_at,p_preference_version:preference.version,
    p_trial_end:new Date(trialEnd).toISOString(),p_payload_hash:payloadHash
  })});
  return id ? {id,draft,status:'reserved_for_review' as const} : null;
}
