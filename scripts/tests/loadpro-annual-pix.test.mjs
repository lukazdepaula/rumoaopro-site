import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
import {PGlite} from '@electric-sql/pglite';

const require = createRequire(import.meta.url);
function load(file, mocks = {}, extras = {}) {
  const module = {exports: {}};
  const code = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true}
  }).outputText;
  vm.runInNewContext(code, {module, exports: module.exports, require: id => {
    if (id in mocks) return mocks[id];
    if (id.startsWith('node:')) return require(id);
    throw Error('Unmocked dependency: ' + id);
  }, URL, URLSearchParams, Response, Request, Headers, Buffer, Date, ...extras});
  return module.exports;
}
const policy = load('lib/checkout/loadpro-annual-policy.ts');
const billing = load('lib/checkout/loadpro-billing-policy.ts');

// Real annual service, provider adapter and SQL; only HTTP is replaced. No test
// can contact a payment provider, database server, email service or customer.
async function fixture(t, planCode, status = 'trialing', api = 'payments') {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(`create role anon; create role authenticated; create role service_role;
    create schema auth; create table auth.users(id uuid primary key);
    create table billing_access(id uuid primary key,email text,user_id uuid,status text,access_kind text,
      plan_code text,current_period_end timestamptz,billing_provider text,provider_customer_id text,
      provider_subscription_id text,price_cents int,currency text,team_limit int,players_per_team_limit int,
      metadata jsonb not null default '{}',updated_at timestamptz not null default now());`);
  await db.exec(readFileSync('supabase/loadpro-annual-billing.sql', 'utf8'));
  const plan = policy.annualPlan(planCode);
  const userId = '20000000-0000-4000-8000-000000000001';
  const accessId = '10000000-0000-4000-8000-000000000001';
  const end = Math.floor(Date.now() / 1000) + (status === 'trialing' ? 7 : 23) * 86400;
  await db.query('insert into auth.users values($1)', [userId]);
  await db.query(`insert into billing_access values($1,'fixture@example.invalid',$2,'active','subscription',
    $3,to_timestamp($4),'stripe','cus_fixture','sub_fixture',$5,'BRL',2,$6,'{"existing_setting":"preserved"}',now())`,
    [accessId, userId, planCode, end, plan.monthlyCents, plan.players]);
  const env = {VERCEL_ENV: 'preview', LOADPRO_ANNUAL_PIX_SANDBOX: 'true',
    MERCADO_PAGO_ACCESS_TOKEN: 'TEST-fixture', MERCADO_PAGO_WEBHOOK_SECRET: 'fixture-only',
    STRIPE_SECRET_KEY: 'sk_test_fixture', LOADPRO_ANNUAL_WEBHOOK_ORIGIN: 'https://preview.example.invalid'};
  const state = {now: Date.now(), loseResponse: false, failSave: false, payment: null, calls: [], requests: new Map()};
  if (api === 'orders') Object.assign(env, {LOADPRO_ANNUAL_PIX_API:'orders',
    LOADPRO_ANNUAL_MP_ORDERS_ACCESS_TOKEN:'APP_USR-6020550837096527-fixture-3692348994',
    LOADPRO_ANNUAL_MP_ORDERS_SELLER_ID:'3692348994',LOADPRO_ANNUAL_MP_ORDERS_APPLICATION_ID:'6020550837096527',
    LOADPRO_ANNUAL_MP_ORDERS_WEBHOOK_SECRET:'fixture-only'});
  class Clock extends Date { static now() { return state.now; } }
  const subscription = {id: 'sub_fixture', customer: 'cus_fixture', status, current_period_end: end,
    trial_end: status === 'trialing' ? end : null, latest_invoice: {status: 'paid'},
    items: {data: [{quantity: 1, price: {currency: 'brl', unit_amount: plan.monthlyCents,
      recurring: {interval: 'month', interval_count: 1}}}]}};
  const extras = {Date: Clock, process: {env}, fetch: async (url, init) => {
    state.calls.push({url, method: init.method, body: init.body});
    if (url === 'https://api.mercadopago.com/users/me') return Response.json({id:3692348994,site_id:'MLB',nickname:'TESTUSER4706885511902062454'});
    if (url === 'https://api.mercadopago.com/v1/orders' && init.method === 'POST') {
      const key=init.headers['X-Idempotency-Key'];
      if (state.requests.has(key)) assert.equal(state.requests.get(key),init.body);
      else {
        state.requests.set(key,init.body);
        const body=JSON.parse(init.body);
        state.payment={...body,id:'ORD01J49MMW3SSBK5PSV3DFR32959',user_id:'3692348994',integration_data:{application_id:'6020550837096527'},
          country_code:'BR',status:'action_required',status_detail:'waiting_transfer',created_date:new Date().toISOString(),
          transactions:{payments:[{...body.transactions.payments[0],id:'PAY01J67CQQH5904WDBVZEM4JMEP3',status:'action_required',status_detail:'waiting_transfer',
            date_of_expiration:new Date(Date.now()+1800000).toISOString(),payment_method:{id:'pix',type:'bank_transfer',qr_code:'FICTIONAL-NONPAYABLE-QR'}}]}};
      }
      if (state.loseResponse) { state.loseResponse=false; throw Error('Simulated lost provider response'); }
      return Response.json(state.payment);
    }
    if (url === 'https://api.mercadopago.com/v1/orders/ORD01J49MMW3SSBK5PSV3DFR32959') return Response.json(state.payment);
    if (url.startsWith('https://api.stripe.com/v1/subscriptions/sub_fixture')) {
      if (init.method === 'POST') {
        subscription.cancel_at_period_end = true;
        subscription.metadata = {loadpro_annual_pix: init.body.get('metadata[loadpro_annual_pix]')};
      }
      return Response.json(subscription);
    }
    if (url === 'https://api.mercadopago.com/v1/payments' && init.method === 'POST') {
      const key = init.headers['X-Idempotency-Key'];
      assert.ok(key);
      if (state.requests.has(key)) {
        if (state.requests.get(key) !== init.body) return Response.json({error: 'idempotency body mismatch'}, {status: 409});
      } else {
        state.requests.set(key, init.body);
        const body = JSON.parse(init.body);
        state.payment = {...body, id: 123456789, status: 'pending', currency_id: 'BRL', live_mode: false,
          point_of_interaction: {transaction_data: {qr_code: 'FICTIONAL-NONPAYABLE-QR'}}};
      }
      if (state.loseResponse) { state.loseResponse = false; throw Error('Simulated lost provider response'); }
      return Response.json(state.payment);
    }
    if (url === 'https://api.mercadopago.com/v1/payments/123456789' && init.method === 'GET') return Response.json(state.payment);
    throw Error('Unexpected network request: ' + url);
  }};
  const provider = load('lib/checkout/loadpro-annual-provider.ts', {
    './loadpro-annual-policy': policy, './loadpro-billing-policy': billing
  }, extras);
  const readAccess = async () => (await db.query('select * from billing_access')).rows[0];
  const readChange = async () => (await db.query('select * from loadpro_annual_changes')).rows[0];
  const service = load('lib/checkout/loadpro-annual.ts', {
    './loadpro-annual-orders':load('lib/checkout/loadpro-annual-orders.ts',{'./loadpro-annual-policy':policy},extras),
    './loadpro-annual-policy': policy, './loadpro-billing-policy': billing,
    './loadpro-annual-provider': provider, './db': {},
    './loadpro': {requestLoadPro: async (path, init) => {
      const body = init?.body ? JSON.parse(init.body) : null;
      if (path === '/rest/v1/loadpro_annual_changes' && init.method === 'POST') {
        await db.query(`insert into loadpro_annual_changes(id,access_id,user_id,method,access_version,quote,expires_at,provider)
          values($1,$2,$3,$4,$5,$6,$7,$8)`,
        [body.id, body.access_id, body.user_id, body.method, body.access_version, JSON.stringify(body.quote), body.expires_at, JSON.stringify(body.provider)]);
        return new Response(null, {status: 201});
      }
      if (path === '/rest/v1/rpc/confirm_loadpro_annual') {
        const result = await db.query('select to_jsonb(confirm_loadpro_annual($1,$2)) as value', [body.p_id, body.p_user_id]);
        return Response.json(result.rows[0].value);
      }
      if (path === '/rest/v1/rpc/finish_loadpro_annual') {
        if (state.failSave) { state.failSave = false; return new Response(null, {status: 503}); }
        const result = await db.query('select to_jsonb(finish_loadpro_annual($1,$2,$3)) as value', [body.p_id, body.p_state, JSON.stringify(body.p_provider)]);
        return Response.json(result.rows[0].value);
      }
      if (path.startsWith('/rest/v1/loadpro_annual_changes?')) {
        const id = new URL('https://db.invalid' + path).searchParams.get('id').slice(3);
        return Response.json((await db.query('select * from loadpro_annual_changes where id=$1', [id])).rows);
      }
      throw Error('Unexpected database operation: ' + path);
    }}
  }, extras);
  const quote = await service.quoteAnnual(await readAccess(), userId, 'pix');
  return {db, env, state, plan, subscription, service, quote, userId, end, readAccess, readChange};
}

for (const planCode of Object.keys(policy.ANNUAL_PLANS)) {
  test(`Pix ${planCode}: recover lost response and database failure with one stable payment`, async t => {
    const f = await fixture(t, planCode);
    f.state.loseResponse = true;
    await assert.rejects(f.service.confirmAnnual(f.quote.id, f.userId), /lost provider response/);
    f.state.now += 2000;
    f.state.failSave = true;
    await assert.rejects(f.service.confirmAnnual(f.quote.id, f.userId), /storage needs reconciliation/);
    f.state.now += 2000;
    assert.equal((await f.service.confirmAnnual(f.quote.id, f.userId)).state, 'awaiting_payment');
    assert.equal((await f.service.confirmAnnual(f.quote.id, f.userId)).state, 'awaiting_payment');
    assert.equal(f.state.requests.size, 1);
    const requests = f.state.calls.filter(c => c.url.endsWith('/payments') && c.method === 'POST');
    assert.equal(requests.length, 3);
    assert.ok(requests.every(c => c.body === requests[0].body));
    assert.equal(f.state.calls.filter(c => c.url.includes('api.stripe.com') && c.method === 'POST').length, 1);
    const change = await f.readChange();
    assert.equal(Date.parse(JSON.parse(requests[0].body).date_of_expiration), new Date(change.confirmed_at).getTime() + 30 * 60000);
    assert.equal((await f.readAccess()).price_cents, f.plan.monthlyCents);
  });

  for (const status of ['trialing', 'active']) {
    test(`Pix ${planCode}/${status}: only verified approval grants one year after remaining days`, async t => {
      const f = await fixture(t, planCode, status);
      const before = await f.readAccess();
      assert.equal(f.state.calls.filter(c => c.method === 'POST').length, 0, 'quote alone cannot stop or charge');
      await f.service.confirmAnnual(f.quote.id, f.userId);
      for (const paymentStatus of ['pending', 'rejected', 'cancelled']) {
        f.state.payment.status = paymentStatus;
        await f.service.reconcileAnnualPix('123456789');
        const access = await f.readAccess();
        assert.equal(new Date(access.current_period_end).getTime(), new Date(before.current_period_end).getTime());
        assert.equal(access.price_cents, before.price_cents);
        assert.equal(access.provider_subscription_id, 'sub_fixture');
      }
      f.state.payment.status = 'approved';
      f.state.payment.date_approved = new Date().toISOString();
      await f.service.reconcileAnnualPix('123456789');
      const paid = await f.readAccess();
      assert.equal(new Date(paid.current_period_end).toISOString(), policy.addCalendarYear(new Date(f.end * 1000).toISOString()));
      assert.equal(paid.price_cents, f.plan.annualCents);
      assert.equal(paid.user_id, before.user_id);
      assert.equal(paid.team_limit, before.team_limit);
      assert.equal(paid.players_per_team_limit, before.players_per_team_limit);
      assert.equal(paid.metadata.existing_setting, 'preserved');
      assert.equal(paid.metadata.renewal_mode, 'manual');
      await f.service.reconcileAnnualPix('123456789');
      f.state.payment.status = 'cancelled'; // A late notification cannot undo an already recorded grant.
      await f.service.reconcileAnnualPix('123456789');
      assert.deepEqual(await f.readAccess(), paid);
      assert.equal(f.subscription.cancel_at_period_end, true);
    });
  }
}

test('Pix retry refuses expired or missing configuration before any monthly/provider mutation', async t => {
  const f = await fixture(t, 'loadpro_founders');
  delete f.env.MERCADO_PAGO_WEBHOOK_SECRET;
  await assert.rejects(f.service.confirmAnnual(f.quote.id, f.userId), /configured/);
  assert.equal(f.state.calls.filter(c => c.method === 'POST').length, 0);
  f.env.MERCADO_PAGO_WEBHOOK_SECRET = 'fixture-only';
  f.state.now = Date.parse((await f.readChange()).confirmed_at) + 31 * 60000;
  await assert.rejects(f.service.confirmAnnual(f.quote.id, f.userId), /expired/);
  assert.equal(f.state.calls.filter(c => c.method === 'POST').length, 0);
});

for (const planCode of Object.keys(policy.ANNUAL_PLANS)) {
  for (const status of ['trialing','active']) test(`Orders ${planCode}/${status}: one payment, preserved days and idempotent verified access`,async t=>{
    const f=await fixture(t,planCode,status,'orders');
    f.state.loseResponse=true;
    await assert.rejects(f.service.confirmAnnual(f.quote.id,f.userId),/lost provider/);
    f.env.LOADPRO_ANNUAL_MP_ORDERS_TEST_APPROVAL='true';
    f.state.failSave=true;
    await assert.rejects(f.service.confirmAnnual(f.quote.id,f.userId),/storage/);
    const pending=await f.service.confirmAnnual(f.quote.id,f.userId);
    assert.equal(pending.state,'awaiting_payment');
    assert.equal(f.state.requests.size,1);
    assert.equal(f.state.calls.filter(c=>c.url.startsWith('https://api.stripe.com/') && c.method==='POST').length,1);
    assert.equal(JSON.parse([...f.state.requests.values()][0]).payer.first_name,undefined,'the quote freezes the sandbox scenario');
    assert.equal(f.subscription.cancel_at_period_end,true);
    assert.equal(new Date((await f.readAccess()).current_period_end).getTime(),f.end*1000);
    const order=f.state.payment, payment=order.transactions.payments[0];
    order.status='processed'; order.status_detail='accredited'; order.total_paid_amount=order.total_amount;
    order.last_updated_date=new Date().toISOString();
    payment.status='processed'; payment.status_detail='accredited'; payment.paid_amount=payment.amount;
    const paid=await f.service.reconcileAnnualOrder(order.id);
    assert.equal(paid.state,'paid');
    const access=await f.readAccess();
    assert.equal(new Date(access.current_period_end).toISOString(),policy.addCalendarYear(new Date(f.end*1000).toISOString()));
    assert.equal(access.team_limit,2); assert.equal(access.players_per_team_limit,f.plan.players);
    assert.equal(access.user_id,f.userId); assert.equal(access.metadata.existing_setting,'preserved');
    assert.equal(access.metadata.renewal_mode,'manual');
    await f.service.reconcileAnnualOrder(order.id);
    assert.equal(new Date((await f.readAccess()).current_period_end).getTime(),new Date(access.current_period_end).getTime());
  });
}

test('Orders refuse changed configuration before stopping any monthly renewal',async t=>{
  const f=await fixture(t,'loadpro_founders','trialing','orders');
  f.env.LOADPRO_ANNUAL_MP_ORDERS_SELLER_ID='375473814';
  await assert.rejects(f.service.confirmAnnual(f.quote.id,f.userId));
  assert.equal(f.state.calls.filter(c=>c.method==='POST').length,0);
  assert.equal(f.subscription.cancel_at_period_end,undefined);
  assert.equal(new Date((await f.readAccess()).current_period_end).getTime(),f.end*1000);
});

test('Pix reconciliation rejects mismatched resource, plan, environment and payment method even for failed status', async t => {
  const f = await fixture(t, 'loadpro_founders');
  await f.service.confirmAnnual(f.quote.id, f.userId);
  const original = {...f.state.payment, status: 'rejected'};
  for (const patch of [{id: 999}, {transaction_amount: 699}, {live_mode: true}, {payment_method_id: 'credit_card'}, {currency_id: 'USD'}]) {
    f.state.payment = {...original, ...patch};
    await assert.rejects(f.service.reconcileAnnualPix('123456789'));
    assert.equal((await f.readChange()).state, 'awaiting_payment');
  }
});

test('annual Pix webhook requires a configured secret and matching signed resource; retries re-fetch provider', async () => {
  const env = {MERCADO_PAGO_WEBHOOK_SECRET: 'fixture-only', CHECKOUT_GATEWAY_MODE: 'sandbox'};
  const payments = load('lib/checkout/payments.ts', {
    '@/lib/preview-safety': {}, '@/lib/checkout/checkout-access': {}, '@/lib/checkout/db': {},
    '@/lib/checkout/localization': {}, '@/lib/checkout/products': {}, '@/lib/checkout/loadpro-billing-policy': billing
  }, {process: {env}});
  const calls = [];
  let fail = false;
  const route = load('app/api/loadpro/billing/annual/webhook/route.ts', {
    'next/server': {NextResponse: Response}, '@/lib/checkout/payments': payments,
    '@/lib/checkout/loadpro-annual': {reconcileAnnualPix: async id => {calls.push(id); if (fail) throw Error('provider unavailable');}}
  }, {process: {env}});
  const signature = createHmac('sha256', env.MERCADO_PAGO_WEBHOOK_SECRET)
    .update('id:123456789;request-id:request-fixture;ts:12345;').digest('hex');
  const request = (body = {data: {id: 123456789}}, query = '?data.id=123456789', sig = signature) =>
    new Request('https://preview.example.invalid/api/loadpro/billing/annual/webhook' + query, {
      method: 'POST', headers: {'content-type': 'application/json', 'x-request-id': 'request-fixture', 'x-signature': `ts=12345,v1=${sig}`},
      body: JSON.stringify(body)
    });
  assert.equal((await route.POST(request())).status, 200);
  assert.equal((await route.POST(request())).status, 200);
  assert.deepEqual(calls, ['123456789', '123456789']);
  assert.equal((await route.POST(request(undefined, undefined, '0'.repeat(64)))).status, 401);
  assert.equal((await route.POST(request(undefined, '?data.id=999'))).status, 401);
  assert.equal((await route.POST(request({data: {id: 999}}))).status, 401);
  delete env.MERCADO_PAGO_WEBHOOK_SECRET;
  assert.equal((await route.POST(request())).status, 401);
  assert.equal(calls.length, 2);
  env.MERCADO_PAGO_WEBHOOK_SECRET = 'fixture-only';
  fail = true;
  assert.equal((await route.POST(request())).status, 503, 'provider failure must request redelivery');
});
