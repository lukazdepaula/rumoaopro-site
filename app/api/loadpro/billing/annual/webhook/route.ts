import { NextResponse } from "next/server";
import { verifyMercadoPagoWebhookSignature } from "@/lib/checkout/payments";
import { reconcileAnnualPix } from "@/lib/checkout/loadpro-annual";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function POST(request:Request) {
  const body=await request.json().catch(()=>({}));
  const id=String(body.data?.id || new URL(request.url).searchParams.get("data.id") || "");
  if (!id || !verifyMercadoPagoWebhookSignature(id,request.headers.get("x-request-id"),request.headers.get("x-signature"))) {
    return NextResponse.json({error:"Invalid signature"},{status:401});
  }
  try {
    await reconcileAnnualPix(id);
    return NextResponse.json({received:true});
  } catch {return NextResponse.json({error:"Reconciliation pending"},{status:503});}
}
