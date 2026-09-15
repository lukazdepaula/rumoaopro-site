import { NextResponse } from "next/server";
import { verifyMercadoPagoWebhookSignature } from "@/lib/checkout/payments";
import { reconcileAnnualPix } from "@/lib/checkout/loadpro-annual";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function POST(request:Request) {
  const body=await request.json().catch(()=>({}));
  const queryId = new URL(request.url).searchParams.get("data.id");
  const bodyId = body?.data?.id == null ? null : String(body.data.id);
  const id = queryId || bodyId || "";
  // The annual endpoint always requires HMAC, including sandbox. The legacy
  // checkout verifier's unconfigured-sandbox fallback must not apply here.
  if (!process.env.MERCADO_PAGO_WEBHOOK_SECRET || !/^[0-9]+$/.test(id)
    || (queryId !== null && bodyId !== null && queryId !== bodyId)
    || !verifyMercadoPagoWebhookSignature(id,request.headers.get("x-request-id"),request.headers.get("x-signature"))) {
    return NextResponse.json({error:"Invalid signature"},{status:401});
  }
  try {
    await reconcileAnnualPix(id);
    return NextResponse.json({received:true});
  } catch {return NextResponse.json({error:"Reconciliation pending"},{status:503});}
}
