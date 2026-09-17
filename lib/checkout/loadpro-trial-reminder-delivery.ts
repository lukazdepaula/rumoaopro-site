import { reminderDb } from './loadpro-reminder-preferences';
import { reviewAnnualTrialReminder,reserveAnnualTrialReminder } from './loadpro-trial-reminder-reservation';
import { reminderDeliveryEnabled,reminderCommunication,reminderSender,submitReminderMail,verifyReminderMail,findReminderMail,type ReminderMail } from './loadpro-reminder-resend';

type Delivery={id:string;access_id:string;user_id:string;state:string;payload_hash:string;delivery_payload:ReminderMail|null;
  send_started_at:string|null;provider_email_id:string|null};
const validId=(id:string)=>/^[0-9a-f-]{36}$/i.test(id);
async function readDelivery(id:string):Promise<Delivery|null> {
  if(!validId(id)) throw new Error('Invalid reminder ID');
  const rows=await reminderDb('loadpro_trial_reminders?id=eq.'+encodeURIComponent(id)+'&limit=1');
  return rows[0] || null;
}
async function recordDelivery(id:string,proof:{id:string;event:string}) {
  return reminderDb('rpc/record_loadpro_reminder_delivery',{method:'POST',body:JSON.stringify({
    p_id:id,p_email_id:proof.id,p_event:proof.event
  })});
}

// Internal service only: no route, cron, campaign or automatic rollout is added.
export async function reconcileTrialReminder(id:string) {
  if(!reminderDeliveryEnabled()) return {status:'disabled'};
  const row=await readDelivery(id);
  if(!row?.send_started_at || !row.delivery_payload) return {status:row?.state || 'missing'};
  try {
    const proof=row.provider_email_id
      ? await verifyReminderMail(row.provider_email_id,row.delivery_payload,row.send_started_at)
      : await findReminderMail(row.delivery_payload,row.send_started_at);
    if(!proof) return {status:'uncertain'};
    await recordDelivery(row.id,proof);
    return {status:'recorded',event:proof.event};
  } catch {return {status:'uncertain'};}
}

export async function deliverReservedTrialReminder(id:string) {
  if(!reminderDeliveryEnabled()) return {status:'disabled'};
  const row=await readDelivery(id);
  if(!row || row.state!=='reserved' || row.send_started_at) {
    return row?.send_started_at ? reconcileTrialReminder(id) : {status:row?.state || 'missing'};
  }
  // Refresh provider, account and consent immediately before the atomic claim.
  const review=await reviewAnnualTrialReminder(row.access_id);
  if(!review || review.access.user_id!==row.user_id || review.payloadHash!==row.payload_hash) return {status:'ineligible'};
  const communication=await reminderCommunication(review.access.email);
  if(communication.status!=='allowed') return {status:communication.status};
  const payload:ReminderMail={from:reminderSender(),to:[review.draft.to],subject:review.draft.subject,text:review.draft.text,
    tags:[{name:'loadpro_reminder',value:row.id},{name:'payload_hash',value:row.payload_hash}]};
  const claim:Delivery|null=await reminderDb('rpc/claim_loadpro_reminder_delivery',{method:'POST',body:JSON.stringify({
    p_id:id,p_access_version:review.access.updated_at,p_preference_version:review.preference.version,
    p_payload_hash:review.payloadHash,p_payload:payload,p_checked_at:new Date(communication.checkedAt).toISOString()
  })});
  if(!claim) return {status:'not_claimed'};
  // The committed uncertain state precedes the only POST. Even a crash before
  // POST leaves a read-only reconciliation task, never a second send attempt.
  try {
    const emailId=await submitReminderMail(claim.delivery_payload!,`loadpro-trial-${id}`);
    await recordDelivery(id,{id:emailId,event:'accepted'});
    return {status:'accepted'};
  } catch {return {status:'uncertain'};}
}

export async function deliverAnnualTrialReminder(accessId:string) {
  if(!reminderDeliveryEnabled()) return {status:'disabled'};
  if(!validId(accessId)) throw new Error('Invalid access ID');
  const review=await reviewAnnualTrialReminder(accessId);
  if(!review) return {status:'ineligible'};
  const communication=await reminderCommunication(review.access.email);
  if(communication.status!=='allowed') return {status:communication.status};
  const reserved=await reserveAnnualTrialReminder(accessId,communication);
  if(!reserved) return {status:'not_reserved'};
  return deliverReservedTrialReminder(reserved.id);
}
