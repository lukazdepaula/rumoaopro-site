import { NextResponse } from 'next/server';
import { resolveLoadProBillingAccess } from '@/lib/checkout/loadpro';
import { getReminderPreference,setReminderPreference,TRIAL_OFFER_TERMS } from '@/lib/checkout/loadpro-reminder-preferences';
export const runtime='nodejs';
export const dynamic='force-dynamic';
function origin(request:Request) {
  const value=request.headers.get('origin') || '';
  const allowed=['https://loadpro.rumoaopro.com.br',...(process.env.LOADPRO_ANNUAL_ALLOWED_ORIGINS || '').split(',').map(x=>x.trim())];
  return allowed.includes(value) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(value) ? value : '';
}
function json(request:Request,body:unknown,status=200) {
  return NextResponse.json(body,{status,headers:{'Access-Control-Allow-Origin':origin(request),
    'Access-Control-Allow-Headers':'Authorization, Content-Type','Access-Control-Allow-Methods':'GET, POST, OPTIONS',
    'Cache-Control':'no-store',Vary:'Origin'}});
}
export async function OPTIONS(request:Request) {return json(request,{},origin(request)?200:403);}
export async function GET(request:Request) {return handle(request);}
export async function POST(request:Request) {return handle(request);}
async function handle(request:Request) {
  if(!origin(request))return json(request,{code:'ORIGIN_DENIED'},403);
  const token=(request.headers.get('authorization') || '').match(/^Bearer (.+)$/)?.[1];
  if(!token)return json(request,{code:'AUTH_REQUIRED'},401);
  try {
    const resolved=await resolveLoadProBillingAccess(token);
    if(!resolved || resolved.access.user_id!==resolved.identity.id)return json(request,{code:'AUTH_REQUIRED'},401);
    let preference;
    if(request.method==='POST') {
      const body=await request.json();
      if(typeof body.enabled!=='boolean' || !['pt','en'].includes(body.locale) || body.terms_version!==TRIAL_OFFER_TERMS)
        return json(request,{code:'PREFERENCE_REQUIRED'},400);
      preference=await setReminderPreference(resolved.identity.id,body.enabled,body.locale);
    } else preference=await getReminderPreference(resolved.identity.id);
    return json(request,{preference:{enabled:preference?.annual_trial_offer===true,terms_version:TRIAL_OFFER_TERMS}});
  } catch {return json(request,{code:'PREFERENCE_UNAVAILABLE'},503);}
}
