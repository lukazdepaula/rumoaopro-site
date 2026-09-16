import { NextResponse } from 'next/server';
import { resolveLoadProBillingAccess } from '@/lib/checkout/loadpro';
import { quoteAnnualCancellation, cancelScheduledAnnual } from '@/lib/checkout/loadpro-annual-cancellation';
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
    if(request.method==='GET') return json(request,{cancellation:await quoteAnnualCancellation(resolved.access,resolved.identity.id)});
    const body=await request.json();
    if(body.confirmed!==true || typeof body.id!=='string' || typeof body.cancel_at!=='string')
      return json(request,{code:'CONFIRMATION_REQUIRED'},400);
    const cancellation=await cancelScheduledAnnual(resolved.access,resolved.identity.id,body.id,body.cancel_at);
    const latest=await resolveLoadProBillingAccess(token);
    if(!latest || latest.identity.id!==resolved.identity.id) throw new Error('Refresh cancellation status');
    return json(request,{cancellation,access:latest.access});
  } catch {
    return json(request,{code:'REVIEW_OR_RECONCILE'},409);
  }
}
