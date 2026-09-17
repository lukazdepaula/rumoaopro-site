import { isPreviewEnvironment } from '@/lib/preview-safety';
import { annualReminderChannelEnabled } from './loadpro-trial-reminder-reservation';

export type ReminderMail = {from:string;to:string[];subject:string;text:string;tags:Array<{name:string;value:string}>};
export function reminderDeliveryEnabled() {
  return process.env.VERCEL_ENV==='production' && !isPreviewEnvironment()
    && process.env.LOADPRO_ANNUAL_ENABLED==='true'
    && process.env.LOADPRO_TRIAL_REMINDER_DELIVERY_ENABLED==='true' && annualReminderChannelEnabled();
}
function config() {
  // Separate explicit opt-in; inherited Resend credentials can never send from QA.
  if(!reminderDeliveryEnabled()) throw new Error('Trial reminder delivery disabled');
  const key=(process.env.LOADPRO_REMINDER_RESEND_API_KEY || process.env.RESEND_API_KEY)?.trim();
  const from=(process.env.LOADPRO_REMINDER_EMAIL_FROM || process.env.EMAIL_FROM)?.trim();
  if(!key || !from || /[\r\n]/.test(from) || !from.includes('@')) throw new Error('Trial reminder delivery not configured');
  return {key,from};
}
async function request(path:string,init:RequestInit={}) {
  const {key}=config();
  return fetch('https://api.resend.com/'+path,{...init,cache:'no-store',signal:AbortSignal.timeout(10_000),
    headers:{Authorization:'Bearer '+key,'Content-Type':'application/json',...init.headers}});
}
export function reminderSender() {return config().from;}

// Read only: never creates a contact, re-subscribes, or removes a suppression.
export async function reminderCommunication(email:string) {
  const normalized=email.trim().toLowerCase();
  const result=(status:'allowed'|'suppressed'|'unknown')=>({status,email:normalized,checkedAt:Date.now()});
  if(!reminderDeliveryEnabled() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return result('unknown');
  try {
    const contactResponse=await request('contacts/'+encodeURIComponent(normalized));
    if(!contactResponse.ok) return result('unknown');
    const contact=await contactResponse.json();
    if(contact.object!=='contact' || contact.email?.toLowerCase()!==normalized || typeof contact.unsubscribed!=='boolean') return result('unknown');
    if(contact.unsubscribed) return result('suppressed');
    const suppressionResponse=await request('suppressions/'+encodeURIComponent(normalized));
    const suppression=await suppressionResponse.json();
    if(suppressionResponse.ok && suppression.object==='suppression' && suppression.email?.toLowerCase()===normalized) return result('suppressed');
    if(suppressionResponse.status===404 && suppression.name==='not_found') {
      // A generic 404 can also mean an unavailable endpoint. Only a complete,
      // successful list can prove absence; unknown/truncated lists stay closed.
      const listResponse=await request('suppressions');
      if(!listResponse.ok) return result('unknown');
      const list=await listResponse.json();
      if(list.object!=='list' || !Array.isArray(list.data) || typeof list.has_more!=='boolean'
        || !list.data.every((item:{email?:unknown})=>typeof item.email==='string')) return result('unknown');
      if(list.data.some((item:{email:string})=>item.email.toLowerCase()===normalized)) return result('suppressed');
      return result(list.has_more ? 'unknown' : 'allowed');
    }
    return result('unknown');
  } catch {return result('unknown');}
}

export async function submitReminderMail(payload:ReminderMail,key:string) {
  const response=await request('emails',{method:'POST',headers:{'Idempotency-Key':key},body:JSON.stringify(payload)});
  if(!response.ok) throw new Error('Reminder submission needs reconciliation');
  const body=await response.json();
  if(typeof body.id!=='string' || !/^[0-9a-f-]{36}$/i.test(body.id)) throw new Error('Reminder response needs reconciliation');
  return body.id as string;
}

export async function verifyReminderMail(id:string,payload:ReminderMail,startedAt:string) {
  if(!/^[0-9a-f-]{36}$/i.test(id)) throw new Error('Invalid reminder email ID');
  const response=await request('emails/'+encodeURIComponent(id));
  if(!response.ok) throw new Error('Reminder lookup unavailable');
  const mail=await response.json();
  const created=Date.parse(mail.created_at),started=Date.parse(startedAt);
  if(mail.id!==id || mail.object!=='email' || mail.from!==payload.from || mail.subject!==payload.subject
    || mail.text!==payload.text || !Array.isArray(mail.to) || mail.to.length!==1 || mail.to[0]!==payload.to[0]
    || mail.cc?.length || mail.bcc?.length || mail.scheduled_at
    || !Number.isFinite(created) || !Number.isFinite(started) || created<started-60_000 || created>started+15*60_000
    || !Array.isArray(mail.tags) || !payload.tags.every(tag=>mail.tags.some((t:{name:string;value:string})=>t.name===tag.name&&t.value===tag.value))
    || !['sent','delivered','delivery_delayed','opened','clicked','bounced','complained','failed','suppressed'].includes(mail.last_event)) {
    throw new Error('Reminder email identity mismatch');
  }
  return {id,event:mail.last_event as string};
}

// Missing/uncertain responses use GET only. Resend's 24h idempotency window is
// not a durable duplicate guard: this integration never POSTs the reservation twice.
export async function findReminderMail(payload:ReminderMail,startedAt:string) {
  let after='';
  for(let page=0;page<5;page++) {
    const response=await request('emails?limit=100'+(after?'&after='+encodeURIComponent(after):''));
    if(!response.ok) throw new Error('Reminder lookup unavailable');
    const list=await response.json();
    if(list.object!=='list' || !Array.isArray(list.data) || typeof list.has_more!=='boolean') throw new Error('Invalid reminder lookup');
    for(const item of list.data) {
      if(item.from!==payload.from || item.subject!==payload.subject || item.to?.length!==1 || item.to[0]!==payload.to[0]) continue;
      const time=Date.parse(item.created_at);
      if(!Number.isFinite(time) || time<Date.parse(startedAt)-60_000 || time>Date.parse(startedAt)+15*60_000) continue;
      try {return await verifyReminderMail(item.id,payload,startedAt);} catch { /* An unrelated email is not proof. */ }
    }
    if(!list.has_more || !list.data.length) return null;
    const cursor=list.data.at(-1)?.id;
    if(typeof cursor!=='string' || cursor===after) return null;
    after=cursor;
  }
  return null;
}
