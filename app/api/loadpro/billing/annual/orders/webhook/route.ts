import {NextResponse} from 'next/server';
import {reconcileAnnualOrder} from '@/lib/checkout/loadpro-annual';
import {annualOrdersConfig, annualOrderId, verifyAnnualOrdersWebhook} from '@/lib/checkout/loadpro-annual-orders';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(()=>({}));
  const queryId = new URL(request.url).searchParams.get('data.id');
  const bodyId = typeof body?.data?.id === 'string' ? body.data.id : null;
  const id = queryId || bodyId || '';
  if (!annualOrderId(id) || (queryId !== null && bodyId !== null && queryId !== bodyId)
    || !verifyAnnualOrdersWebhook(id,request.headers.get('x-request-id'),request.headers.get('x-signature'))) {
    return NextResponse.json({error:'Invalid signature'},{status:401});
  }
  const config = annualOrdersConfig();
  if (body.type !== 'order' || body.live_mode !== config.live || String(body.user_id) !== config.sellerId
    || String(body.application_id) !== config.applicationId) return NextResponse.json({error:'Unexpected order context'},{status:401});
  try {
    // The signed notification is only a hint. Amount, status and ownership are
    // re-read from Mercado Pago; callback content alone never grants access.
    await reconcileAnnualOrder(id);
    return NextResponse.json({received:true});
  } catch { return NextResponse.json({error:'Reconciliation pending'},{status:503}); }
}
