import {createHmac, timingSafeEqual} from 'node:crypto';
import {annualPlan} from './loadpro-annual-policy';

// Non-secret IDs of the seller/application created by the owner for this QA.
// APP_USR also names live credentials: the prefix alone never permits preview.
export const ANNUAL_PIX_QA = {sellerId:'3692348994', applicationId:'6020550837096527'};
export const annualOrderId = (id: unknown): id is string => typeof id === 'string' && /^ORD[A-Z0-9]{26}$/.test(id);
export function annualOrdersConfig() {
  const env = process.env;
  const token = env.LOADPRO_ANNUAL_MP_ORDERS_ACCESS_TOKEN;
  const sellerId = env.LOADPRO_ANNUAL_MP_ORDERS_SELLER_ID || '';
  const applicationId = env.LOADPRO_ANNUAL_MP_ORDERS_APPLICATION_ID || '';
  const secret = env.LOADPRO_ANNUAL_MP_ORDERS_WEBHOOK_SECRET;
  const live = env.VERCEL_ENV === 'production';
  if (env.LOADPRO_ANNUAL_PIX_API !== 'orders' || !token || !secret || secret === 'disabled'
    || !/^\d+$/.test(sellerId) || !/^\d+$/.test(applicationId)
    || !token.startsWith(`APP_USR-${applicationId}-`) || !token.endsWith(`-${sellerId}`)) {
    throw new Error('Annual Orders is not configured');
  }
  if (!live && (env.LOADPRO_ANNUAL_PIX_SANDBOX !== 'true'
    || sellerId !== ANNUAL_PIX_QA.sellerId || applicationId !== ANNUAL_PIX_QA.applicationId)) {
    throw new Error('Preview Orders requires the pinned fictitious seller and application');
  }
  if (live && (env.LOADPRO_ANNUAL_MP_ORDERS_LIVE !== 'true'
    || sellerId === ANNUAL_PIX_QA.sellerId || applicationId === ANNUAL_PIX_QA.applicationId)) {
    throw new Error('Live Orders is not configured');
  }
  return {token, secret, sellerId, applicationId, live};
}

export function annualOrderReference(changeId: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(changeId)) throw new Error('Invalid annual change');
  return `loadpro-annual-${changeId}`;
}
export async function verifyAnnualOrdersSeller() {
  const config = annualOrdersConfig();
  const response = await fetch('https://api.mercadopago.com/users/me', {
    cache:'no-store', headers:{Authorization:`Bearer ${config.token}`}
  });
  if (!response.ok) throw new Error('Annual Orders seller is unavailable');
  const seller = await response.json();
  if (String(seller.id) !== config.sellerId || seller.site_id !== 'MLB'
    || (!config.live && seller.nickname !== 'TESTUSER4706885511902062454')) {
    throw new Error('Annual Orders seller mismatch');
  }
}
export function annualChangeFromOrder(order: Record<string, any>) {
  const reference = String(order.external_reference || '');
  const id = reference.slice('loadpro-annual-'.length);
  if (annualOrderReference(id) !== reference) throw new Error('Unrelated order');
  return id;
}

function cents(value: unknown) {
  if (typeof value !== 'string' || !/^\d+(?:\.\d{1,2})?$/.test(value)) return NaN;
  const [whole, fraction=''] = value.split('.');
  const result = Number(whole)*100 + Number(fraction.padEnd(2,'0'));
  return Number.isSafeInteger(result) ? result : NaN;
}

export function inspectAnnualOrder(order: Record<string, any>, changeId: string, planCode: string, live: boolean) {
  const config = annualOrdersConfig();
  const amount = annualPlan(planCode).annualCents;
  if (config.live !== live || !annualOrderId(order.id) || order.type !== 'online'
    || order.external_reference !== annualOrderReference(changeId) || cents(order.total_amount) !== amount
    || String(order.user_id) !== config.sellerId || String(order.integration_data?.application_id) !== config.applicationId
    || !['BR','BRA'].includes(order.country_code) || (order.currency_id != null && order.currency_id !== 'BRL')) {
    throw new Error('Annual order does not match the confirmed change');
  }
  const payments = order.transactions?.payments || [];
  // Orders may initially contain no payment/QR. That state never grants access.
  if (!Array.isArray(payments) || payments.length > 1) throw new Error('Unexpected annual transactions');
  const payment = payments[0];
  if (payment && (!/^PAY[A-Z0-9]{26}$/.test(payment.id || '') || cents(payment.amount) !== amount
    || payment.payment_method?.id !== 'pix' || payment.payment_method?.type !== 'bank_transfer')) {
    throw new Error('Annual transaction mismatch');
  }
  const paid = order.status === 'processed' && order.status_detail === 'accredited'
    && payment?.status === 'processed' && payment.status_detail === 'accredited';
  if (paid && (cents(order.total_paid_amount) !== amount || cents(payment.paid_amount) !== amount)) {
    throw new Error('Annual paid amount mismatch');
  }
  const updated = Date.parse(order.last_updated_date || '');
  const created = Date.parse(order.created_date || '');
  if (paid && (!Number.isFinite(updated) || !Number.isFinite(created) || updated < created || updated > Date.now()+60000)) {
    throw new Error('Annual provider timestamp needs reconciliation');
  }
  const qr = payment?.payment_method?.qr_code;
  const expiry = payment?.date_of_expiration;
  if (qr && (typeof qr !== 'string' || !Number.isFinite(Date.parse(expiry || '')))) throw new Error('Annual QR expiry missing');
  return {paid, failed:['failed','canceled','refunded'].includes(order.status), payment,
    provider:{payment_id:order.id, pix_api:'orders', payment_status:order.status,
      ...(payment ? {transaction_id:payment.id} : {}),
      ...(qr ? {pix_code:qr, pix_expires_at:expiry} : {})},
    // Orders has no date_approved field. Use its verified processed-state update
    // timestamp, never an invented Payments field or the browser return time.
    approvedAt:paid ? new Date(updated).toISOString() : null};
}

async function requestOrders(path: string, body?: Record<string, unknown>, key?: string) {
  const config = annualOrdersConfig();
  const response = await fetch(`https://api.mercadopago.com/v1/orders${path}`, {
    method:body ? 'POST':'GET', cache:'no-store',
    headers:{Authorization:`Bearer ${config.token}`, 'Content-Type':'application/json', ...(key ? {'X-Idempotency-Key':key} : {})},
    ...(body ? {body:JSON.stringify(body)} : {})
  });
  if (!response.ok) throw new Error(`Annual Orders reconciliation required (${response.status})`);
  return await response.json() as Record<string, any>;
}
export async function fetchAnnualOrder(id: string) {
  if (!annualOrderId(id)) throw new Error('Invalid annual order ID');
  const order = await requestOrders(`/${id}`);
  if (order.id !== id) throw new Error('Annual order resource mismatch');
  return order;
}
export async function createAnnualOrder(changeId: string, planCode: string, email: string, testApproval = false) {
  const config = annualOrdersConfig();
  const amount = (annualPlan(planCode).annualCents/100).toFixed(2);
  const payer = config.live ? {email} : {email:'test_user_br@testuser.com',
    ...(testApproval ? {first_name:'APRO'} : {})};
  const order = await requestOrders('', {type:'online', processing_mode:'automatic', total_amount:amount,
    external_reference:annualOrderReference(changeId), payer,
    transactions:{payments:[{amount, payment_method:{id:'pix',type:'bank_transfer'}, expiration_time:'PT30M'}]}
  }, `annual-order-${changeId}`);
  // Always verify a fresh server resource, including asynchronous creation.
  return fetchAnnualOrder(order.id);
}

export function verifyAnnualOrdersWebhook(id: string, requestId: string | null, signature: string | null) {
  let secret: string;
  try { secret = annualOrdersConfig().secret!; } catch { return false; }
  if (!annualOrderId(id) || !requestId || !signature) return false;
  const parts = Object.fromEntries(signature.split(',').map(p=>p.trim().split('=')));
  if (!/^\d+$/.test(parts.ts || '') || !/^[0-9a-f]{64}$/i.test(parts.v1 || '')) return false;
  const expected = createHmac('sha256',secret).update(`id:${id.toLowerCase()};request-id:${requestId};ts:${parts.ts};`).digest();
  return timingSafeEqual(Buffer.from(parts.v1,'hex'),expected);
}
