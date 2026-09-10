import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function load(file, mocks = {}, extras = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
  }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: id => {
    if (id in mocks) return mocks[id];
    if (id.startsWith('node:')) return require(id);
    throw new Error(`Unmocked dependency ${id}`);
  }, process: { env: { STRIPE_SECRET_KEY: 'sk_test_fixture', STRIPE_LOADPRO_FOUNDERS_50_PRICE_ID: 'price_brl', LOADPRO_SUPABASE_URL: 'https://loadpro.invalid', LOADPRO_SUPABASE_SERVICE_ROLE_KEY: 'test-only' } },
  URLSearchParams, Headers, Response, Request, console, ...extras });
  return module.exports;
}
const policy = load('lib/checkout/loadpro-billing-policy.ts');
const product = { id: 'loadpro_founders_50', price_brl: 69.9, base_price_usd: 13.9, type: 'subscription', trial_days: 7, name: 'LoadPro 50', description: 'Test', billing_interval: 'month', players_per_team_limit: 50, team_limit: 2 };
const products = { getProductById: () => product, isLoadProProductId: id => ['loadpro_founders','loadpro_founders_50'].includes(id) };

test('upgrade price preserves BRL and USD; unsupported currencies fail closed', () => {
  assert.equal(policy.loadProUpgradePrice('usd',69.9,13.9).priceCents,1390);
  assert.equal(policy.loadProUpgradePrice('BRL',69.9,13.9).priceCents,6990);
  assert.throws(() => policy.loadProUpgradePrice('EUR',69.9,13.9));
});
test('paid renewals ignore old trial dates and support Stripe item-level periods', () => {
  assert.equal(policy.stripeSubscriptionPeriod({status:'active',trial_end:100,items:{data:[{current_period_start:200,current_period_end:300}]}}).end,300);
  assert.equal(policy.stripeSubscriptionPeriod({status:'trialing',trial_end:200,current_period_end:300}).end,200);
  assert.equal(policy.stripeSubscriptionPeriod({status:'canceled',ended_at:250,current_period_end:300}).end,250);
});
test('duplicate subscription events cannot change the selected entitlement', () => {
  const input = {currentSubscription:'sub_main',incomingSubscription:'sub_duplicate',currentStatus:'active',incomingStatus:'canceled',currentOrderCreatedAt:'2026-08-01',incomingOrderCreatedAt:'2026-09-01'};
  assert.equal(policy.canReplaceLoadProSubscription(input),false);
  assert.equal(policy.canReplaceLoadProSubscription({...input,incomingStatus:'active'}),false);
  assert.equal(policy.canReplaceLoadProSubscription({...input,incomingSubscription:'sub_main'}),true);
  assert.equal(policy.canReplaceLoadProSubscription({...input,currentStatus:'canceled',incomingStatus:'active'}),true);
  assert.equal(policy.canReplaceLoadProSubscription({...input,currentStatus:'canceled',incomingStatus:'active',incomingOrderCreatedAt:'2026-07-01'}),false);
});
test('Stripe upgrade uses USD price_data, unchanged billing anchor and no proration/trial', async () => {
  const calls = [];
  const payments = load('lib/checkout/payments.ts', {
    '@/lib/checkout/checkout-access': {}, '@/lib/checkout/db': {},
    '@/lib/checkout/localization': {}, '@/lib/checkout/products': products,
    '@/lib/checkout/loadpro-billing-policy': policy
  }, {fetch: async (url,init) => { calls.push({url,init}); return Response.json(url.includes('/prices/') ? {product:'prod_50',currency:'brl',unit_amount:6990} : {status:'active'}); }});
  await payments.changeStripeLoadProPlan({subscriptionId:'sub_main',subscriptionItemId:'si_main',planCode:'loadpro_founders_50',currency:'USD'});
  const body = calls[1].init.body;
  assert.equal(body.get('items[0][price_data][currency]'),'usd');
  assert.equal(body.get('items[0][price_data][unit_amount]'),'1390');
  assert.equal(body.get('items[0][price_data][product]'),'prod_50');
  assert.equal(body.get('items[0][quantity]'),'1');
  assert.equal(body.get('proration_behavior'),'none');
  assert.equal(body.get('billing_cycle_anchor'),'unchanged');
  assert.equal(body.has('trial_end'),false);
  assert.equal(body.has('trial_period_days'),false);
  assert.match(calls[1].init.headers['Idempotency-Key'],/:v2:.*USD:1390$/);
  calls.length = 0;
  await payments.changeStripeLoadProPlan({subscriptionId:'sub_main',subscriptionItemId:'si_main',planCode:'loadpro_founders_50',currency:'BRL'});
  assert.equal(calls[1].init.body.get('items[0][price]'),'price_brl');
});
test('returning customer checkout has no trial; first checkout preserves trial and bounded expiry', async () => {
  const calls=[];
  const payments=load('lib/checkout/payments.ts',{
    '@/lib/checkout/checkout-access':{createCheckoutReturnUrl:()=> 'https://merchant.invalid/return'},
    '@/lib/checkout/db':{updateOrderGatewayIds:async()=>{},appendOrderLog:async()=>{}},
    '@/lib/checkout/localization':{getLocalizedProductCopy:()=>product}, '@/lib/checkout/products':products,
    '@/lib/checkout/loadpro-billing-policy':policy
  },{process:{env:{STRIPE_SECRET_KEY:'test',STRIPE_WEBHOOK_SECRET:'test'}},fetch:async(url,init)=>{calls.push(init);return Response.json({id:'cs_test',url:'https://checkout.stripe.com/test'});}});
  const order={id:'order',currency:'USD',amount:13.9,customer_country:'US',customer_email:'fixture@example.invalid',metadata:{loadpro_trial_eligible:false,loadpro_checkout_expires_at:2000000000}};
  await payments.createStripeCheckoutSession(order,product);
  assert.equal(calls[0].body.has('subscription_data[trial_period_days]'),false);
  assert.equal(calls[0].body.get('expires_at'),'2000000000');
  await payments.createStripeCheckoutSession({...order,metadata:{loadpro_trial_eligible:true}},product);
  assert.equal(calls[1].body.get('subscription_data[trial_period_days]'),'7');
});
test('stale cancellation never writes billing_access or touches club/player data', async () => {
  const writes=[];
  const loadpro=load('lib/checkout/loadpro.ts',{
    '@/lib/checkout/db':{appendOrderLog:async()=>{},updateOrderGatewayIds:async()=>{},getOrderById:async()=>({created_at:'2026-08-01'})},
    '@/lib/checkout/email':{},'@/lib/checkout/products':products,'@/lib/checkout/loadpro-billing-policy':policy
  },{fetch:async(url,init)=>{if(init.method && init.method!=='GET')writes.push(url);return Response.json([{id:'access',status:'active',access_kind:'subscription',provider_subscription_id:'sub_main',order_id:'order_main'}]);}});
  const result=await loadpro.syncLoadProAccess({id:'duplicate',product_id:'loadpro_founders_50',currency:'USD',customer_email:'fixture@example.invalid',created_at:'2026-09-01',metadata:{},gateway:'stripe'}, {status:'canceled',providerSubscriptionId:'sub_duplicate'});
  assert.equal(result.ignored,true);
  assert.equal(writes.length,0);
});
test('quote endpoint is read-only and requires explicit matching currency/amount for USD', async () => {
  let writes=0;
  const subscription={customer:'cus_main',status:'active',trial_end:100,current_period_end:2000000000,items:{data:[{id:'si_main',quantity:1,price:{currency:'usd',unit_amount:990,recurring:{interval:'month',interval_count:1}}}]}};
  const access={plan_code:'loadpro_founders',access_kind:'subscription',billing_provider:'stripe',provider_customer_id:'cus_main',provider_subscription_id:'sub_main'};
  const route=load('app/api/loadpro/billing/change-plan/route.ts',{
    'next/server':{NextResponse:Response}, '@/lib/checkout/db':{getOrderByGatewayPaymentId:async()=>({id:'order',customer_email:'fixture@example.invalid'}),updateOrderGatewayIds:async()=>{writes++;}},
    '@/lib/checkout/loadpro':{resolveLoadProBillingAccess:async()=>({access,identity:{email:'fixture@example.invalid'}}),isLoadProOrder:()=>true,syncLoadProAccess:async()=>{writes++;}},
    '@/lib/checkout/payments':{fetchStripeSubscription:async()=>subscription,getLoadProUpgradePrice:()=>({currency:'USD',priceCents:1390}),changeStripeLoadProPlan:async()=>{writes++;throw Error('must not mutate');}},
    '@/lib/checkout/loadpro-billing-policy':policy
  });
  const headers={origin:'https://loadpro.rumoaopro.com.br',authorization:'Bearer test','content-type':'application/json'};
  const quote=await route.GET(new Request('https://merchant.invalid/api',{headers}));
  assert.equal(quote.status,200); assert.equal((await quote.json()).quote.price_cents,1390); assert.equal(writes,0);
  for(const body of [{plan_code:'loadpro_founders_50'},{plan_code:'loadpro_founders_50',currency:'BRL',price_cents:6990}]) {
    const response=await route.POST(new Request('https://merchant.invalid/api',{method:'POST',headers,body:JSON.stringify(body)}));
    assert.equal(response.status,409); assert.equal(writes,0);
  }
});
