import { NextResponse } from "next/server";
import { resolveLoadProBillingAccess } from "@/lib/checkout/loadpro";
import { ANNUAL_TERMS } from "@/lib/checkout/loadpro-annual-policy";
import { annualEnabled, annualStatus, quoteAnnual, confirmAnnual, getAnnualChange, reconcileAnnualPix, reconcileAnnualCard, reconcileAnnualOrder } from "@/lib/checkout/loadpro-annual";
export const runtime="nodejs";
export const dynamic="force-dynamic";
function origin(request:Request) {
  const value=request.headers.get("origin") || "";
  const allowed=["https://loadpro.rumoaopro.com.br",...(process.env.LOADPRO_ANNUAL_ALLOWED_ORIGINS || "").split(",")];
  return allowed.includes(value) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(value) ? value : "";
}
function json(request:Request,body:unknown,status=200) {return NextResponse.json(body,{status,headers:{
  "Access-Control-Allow-Origin":origin(request),"Access-Control-Allow-Headers":"Authorization, Content-Type",
  "Access-Control-Allow-Methods":"GET, POST, OPTIONS","Cache-Control":"no-store",Vary:"Origin"
}});}
export async function OPTIONS(request:Request) {return json(request,{},origin(request)?200:403);}
export async function GET(request:Request) {return handle(request);}
export async function POST(request:Request) {return handle(request);}
async function handle(request:Request) {
  if (!origin(request)) return json(request,{code:"ORIGIN_DENIED"},403);
  if (!annualEnabled()) return json(request,{code:"ANNUAL_UNAVAILABLE"},503);
  const token=(request.headers.get("authorization") || "").match(/^Bearer (.+)$/)?.[1];
  if (!token) return json(request,{code:"AUTH_REQUIRED"},401);
  try {
    const resolved=await resolveLoadProBillingAccess(token);
    if (!resolved || resolved.access.user_id!==resolved.identity.id) return json(request,{code:"AUTH_REQUIRED"},401);
    if (request.method==="GET") {
      const params=new URL(request.url).searchParams;
      if (params.get("id")) return json(request,{change:await annualStatus(params.get("id")!,resolved.identity.id),access:resolved.access});
      const method=params.get("method");
      if (method!=="card" && method!=="pix") return json(request,{code:"METHOD_REQUIRED"},400);
      return json(request,{quote:await quoteAnnual(resolved.access,resolved.identity.id,method)});
    }
    const body=await request.json();
    if (body.action==="refresh" && typeof body.id==="string") {
      const change=await getAnnualChange(body.id,resolved.identity.id);
      if (change.method==="pix" && change.provider.payment_id) {
        if (change.provider.pix_api==='orders') await reconcileAnnualOrder(change.provider.payment_id);
        else await reconcileAnnualPix(change.provider.payment_id);
      }
      if (change.method==="card") await reconcileAnnualCard(change.provider.subscription_id);
      const refreshed=await resolveLoadProBillingAccess(token);
      const status=await annualStatus(body.id,resolved.identity.id);
      if (refreshed?.access.metadata.billing_interval==='year' && (refreshed.access.metadata.annual_change as {id?:string,state?:string})?.id===body.id
        && (refreshed.access.metadata.annual_change as {state?:string}).state==='paid') status.state='paid';
      return json(request,{change:status,access:refreshed?.access});
    }
    if (body.confirmed!==true || body.terms_version!==ANNUAL_TERMS || typeof body.id!=="string") return json(request,{code:"CONFIRMATION_REQUIRED"},400);
    const change=await confirmAnnual(body.id,resolved.identity.id);
    const refreshed=await resolveLoadProBillingAccess(token);
    return json(request,{change,access:refreshed?.access});
  } catch {
    // A timeout may follow a successful provider change. Never claim that no
    // charge changed; the durable operation can be retried with the same ID.
    return json(request,{code:"REVIEW_OR_RECONCILE",error:"Refresh subscription status before trying again."},409);
  }
}
