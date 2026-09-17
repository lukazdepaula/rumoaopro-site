import { requestLoadPro } from './loadpro';
export const TRIAL_OFFER_TERMS = 'loadpro-trial-offer-v1';
export type ReminderPreference = {user_id:string; annual_trial_offer:boolean; locale:'pt'|'en'; version:string; terms_version:string};
export async function reminderDb(path:string, init?:RequestInit) {
  const response=await requestLoadPro(`/rest/v1/${path}`,init);
  if(!response.ok) throw new Error('Reminder storage unavailable');
  return response.json();
}
export async function getReminderPreference(userId:string):Promise<ReminderPreference|null> {
  const rows=await reminderDb(`loadpro_communication_preferences?user_id=eq.${encodeURIComponent(userId)}&limit=1`);
  return rows[0] || null;
}
export async function setReminderPreference(userId:string,enabled:boolean,locale:'pt'|'en') {
  return reminderDb('rpc/set_loadpro_trial_offer_preference',{method:'POST',body:JSON.stringify({
    p_user_id:userId,p_enabled:enabled,p_locale:locale,p_terms_version:TRIAL_OFFER_TERMS
  })}) as Promise<ReminderPreference>;
}
