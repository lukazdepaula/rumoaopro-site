import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
const require=createRequire(import.meta.url);
function load(file,mocks={},extras={}) {
  const module={exports:{}};
  const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(code,{module,exports:module.exports,require:id=>{
    if(id in mocks)return mocks[id]; if(id.startsWith('node:'))return require(id); throw Error('Unexpected dependency '+id);
  },Date,Buffer,URL,Request,Response,...extras});
  return module.exports;
}
const policy=load('lib/checkout/loadpro-annual-policy.ts');
const changeId='20000000-0000-4000-8000-000000000001';
const orderId='ORDTST01M2K04H97BM62G7P1F3V79JWR';
function fixture() {
  const env={VERCEL_ENV:'preview',LOADPRO_ANNUAL_PIX_API:'orders',LOADPRO_ANNUAL_PIX_SANDBOX:'true',
    LOADPRO_ANNUAL_MP_ORDERS_ACCESS_TOKEN:'APP_USR-6020550837096527-fixture-3692348994',
    LOADPRO_ANNUAL_MP_ORDERS_APPLICATION_ID:'6020550837096527',LOADPRO_ANNUAL_MP_ORDERS_SELLER_ID:'3692348994',
    LOADPRO_ANNUAL_MP_ORDERS_WEBHOOK_SECRET:'fixture-only'};
  const calls=[];
  const adapter=load('lib/checkout/loadpro-annual-orders.ts',{'./loadpro-annual-policy':policy},{process:{env},fetch:async(url,init)=>{
    calls.push({url,...init});return Response.json(order());
  }});
  function order() { return {id:orderId,type:'online',external_reference:adapter.annualOrderReference(changeId),
    user_id:'3692348994',integration_data:{application_id:'6020550837096527'},country_code:'BR',total_amount:'499.00',total_paid_amount:'499.00',
    status:'processed',status_detail:'accredited',created_date:new Date(Date.now()-1000).toISOString(),last_updated_date:new Date().toISOString(),
    transactions:{payments:[{id:'PAY01J67CQQH5904WDBVZEM4JMEP3',amount:'499.00',paid_amount:'499.00',status:'processed',status_detail:'accredited',
      date_of_expiration:new Date(Date.now()+1800000).toISOString(),payment_method:{id:'pix',type:'bank_transfer',qr_code:'NONPAYABLE-FIXTURE'}}]}}; }
  return {env,calls,adapter,order};
}

test('Orders credentials require the exact fictitious seller/application and never fall back to legacy secrets',()=>{
  for(const patch of [{LOADPRO_ANNUAL_PIX_SANDBOX:'false'},{LOADPRO_ANNUAL_PIX_API:'payments'},
    {LOADPRO_ANNUAL_MP_ORDERS_SELLER_ID:'375473814'},{LOADPRO_ANNUAL_MP_ORDERS_APPLICATION_ID:'8899432396009304'},
    {LOADPRO_ANNUAL_MP_ORDERS_ACCESS_TOKEN:'TEST-fixture'},{LOADPRO_ANNUAL_MP_ORDERS_ACCESS_TOKEN:''},
    {LOADPRO_ANNUAL_MP_ORDERS_WEBHOOK_SECRET:''},{VERCEL_ENV:'production',LOADPRO_ANNUAL_MP_ORDERS_LIVE:'true'}]) {
    const f=fixture();Object.assign(f.env,patch);assert.throws(()=>f.adapter.annualOrdersConfig());assert.equal(f.calls.length,0);
  }
});
test('hosted sandbox Order IDs can be reconciled but never accepted in production',async()=>{
  const f=fixture();
  assert.equal(f.adapter.annualOrderId(orderId),true);
  assert.equal(f.adapter.annualOrderId('ORD01J49MMW3SSBK5PSV3DFR32959'),true);
  for(const id of [orderId.toLowerCase(),orderId+'X',orderId.slice(0,-1),'ORDTST/../../users',null]) {
    assert.equal(f.adapter.annualOrderId(id),false);
  }
  await f.adapter.fetchAnnualOrder(orderId);
  assert.equal(f.calls.length,1);
  f.env.VERCEL_ENV='production';
  assert.equal(f.adapter.annualOrderId(orderId),false);
  assert.equal(f.adapter.annualOrderId('ORD01J49MMW3SSBK5PSV3DFR32959'),true);
  await assert.rejects(f.adapter.fetchAnnualOrder(orderId),/Invalid annual order ID/);
  assert.equal(f.calls.length,1,'reject test IDs before calling the production provider');
});
test('Orders reject cross-account, wrong-currency/amount, extra transactions, partial payment and invalid dates',()=>{
  const f=fixture();const inspect=value=>f.adapter.inspectAnnualOrder(value,changeId,'loadpro_founders',false);
  assert.equal(inspect(f.order()).paid,true);
  for(const mutate of [o=>o.user_id='wrong',o=>o.integration_data.application_id='wrong',o=>o.currency_id='USD',o=>o.country_code='ARG',
    o=>o.total_amount='699.00',o=>o.total_amount='4.99e2',o=>o.total_paid_amount='498.00',o=>o.external_reference='loadpro-annual-00000000-0000-4000-8000-000000000001',
    o=>o.transactions.payments.push(o.transactions.payments[0]),o=>o.transactions.payments[0].paid_amount='498.00',
    o=>o.transactions.payments[0].payment_method.id='visa',o=>o.transactions.payments[0].payment_method.type='credit_card',
    o=>o.last_updated_date='invalid',o=>o.last_updated_date=new Date(Date.now()+120000).toISOString()]) {
    const value=f.order();mutate(value);assert.throws(()=>inspect(value));
  }
  assert.throws(()=>f.adapter.inspectAnnualOrder(f.order(),changeId,'loadpro_founders_50',false));
  assert.throws(()=>f.adapter.inspectAnnualOrder(f.order(),changeId,'loadpro_founders',true));
});
test('asynchronous, rejected and refunded Orders never grant access',()=>{
  const f=fixture();
  for(const status of ['processing','action_required','failed','canceled','refunded']) {
    const value=f.order();value.status=status;
    assert.equal(f.adapter.inspectAnnualOrder(value,changeId,'loadpro_founders',false).paid,false);
  }
  const value=f.order();value.status='processing';value.transactions.payments=[];
  const result=f.adapter.inspectAnnualOrder(value,changeId,'loadpro_founders',false);
  assert.equal(result.paid,false);assert.equal(result.provider.pix_code,undefined);
});
test('Orders requests have stable idempotency and sandbox payer, with APRO only in explicit test configuration',async()=>{
  const f=fixture();
  await f.adapter.createAnnualOrder(changeId,'loadpro_founders','private@example.invalid');
  await f.adapter.createAnnualOrder(changeId,'loadpro_founders','private@example.invalid');
  const posts=f.calls.filter(c=>c.method==='POST');assert.equal(posts.length,2);
  assert.equal(posts[0].body,posts[1].body);assert.equal(posts[0].headers['X-Idempotency-Key'],posts[1].headers['X-Idempotency-Key']);
  const body=JSON.parse(posts[0].body);assert.equal(body.payer.email,'test_user_br@testuser.com');assert.equal(body.payer.first_name,undefined);
  assert.equal(body.transactions.payments[0].expiration_time,'PT30M');assert.equal(body.total_amount,'499.00');
  assert.match(body.external_reference,/^[a-z0-9-]+$/);
  f.env.LOADPRO_ANNUAL_MP_ORDERS_TEST_APPROVAL='true';
  await f.adapter.createAnnualOrder(changeId,'loadpro_founders','private@example.invalid');
  assert.equal(JSON.parse(f.calls.filter(c=>c.method==='POST').at(-1).body).payer.first_name,undefined,'environment changes cannot change a retried body');
  await f.adapter.createAnnualOrder(changeId,'loadpro_founders','private@example.invalid',true);
  assert.equal(JSON.parse(f.calls.filter(c=>c.method==='POST').at(-1).body).payer.first_name,'APRO');
});
test('Orders webhook validates lowercase HMAC manifest and refetches instead of trusting approved callback data',async()=>{
  const f=fixture();const calls=[];
  const route=load('app/api/loadpro/billing/annual/orders/webhook/route.ts',{
    'next/server':{NextResponse:Response},'@/lib/checkout/loadpro-annual-orders':f.adapter,
    '@/lib/checkout/loadpro-annual':{reconcileAnnualOrder:async id=>{calls.push(id);}}
  },{process:{env:f.env}});
  const signature=createHmac('sha256',f.env.LOADPRO_ANNUAL_MP_ORDERS_WEBHOOK_SECRET).update(`id:${orderId.toLowerCase()};request-id:fixture;ts:12345;`).digest('hex');
  const request=(patch={},sig=signature)=>new Request(`https://preview.invalid/api/loadpro/billing/annual/orders/webhook?data.id=${orderId}`,{
    method:'POST',headers:{'x-request-id':'fixture','x-signature':`ts=12345,v1=${sig}`},
    body:JSON.stringify({type:'order',live_mode:false,user_id:'3692348994',application_id:'6020550837096527',data:{id:orderId,status:'processed'},...patch})
  });
  assert.equal((await route.POST(request())).status,200);
  assert.equal((await route.POST(request())).status,200);
  for(const patch of [{live_mode:true},{user_id:'wrong'},{application_id:'wrong'},{type:'payment'},{data:{id:'ORD01J49MMW3SSBK5PSV3DFR32950'}}]) {
    assert.equal((await route.POST(request(patch))).status,401);
  }
  assert.equal((await route.POST(request({},'0'.repeat(64)))).status,401);
  assert.deepEqual(calls,[orderId,orderId]);
});

test('authenticated refresh dispatches Orders to its own adapter and returns access after reconciliation',async()=>{
  let paid=false;
  const calls=[];
  const route=load('app/api/loadpro/billing/annual/route.ts',{
    'next/server':{NextResponse:Response},'@/lib/checkout/loadpro-annual-policy':policy,
    '@/lib/checkout/loadpro':{resolveLoadProBillingAccess:async()=>({identity:{id:'user'},access:{user_id:'user',metadata:paid ? {
      billing_interval:'year',annual_change:{id:changeId,state:'paid'}
    } : {}}})},
    '@/lib/checkout/loadpro-annual':{
      annualEnabled:()=>true,getAnnualChange:async(id,user)=>{assert.equal(user,'user');return {id,method:'pix',provider:{pix_api:'orders',payment_id:orderId}};},
      reconcileAnnualPix:()=>{throw Error('Wrong API');},reconcileAnnualOrder:async id=>{calls.push(id);paid=true;},
      annualStatus:async()=>({id:changeId,state:paid ? 'paid':'awaiting_payment'})
    }
  },{process:{env:{LOADPRO_ANNUAL_ALLOWED_ORIGINS:'https://app.preview.invalid'}}});
  const response=await route.POST(new Request('https://preview.invalid/api/loadpro/billing/annual',{
    method:'POST',headers:{origin:'https://app.preview.invalid',authorization:'Bearer fixture-only'},
    body:JSON.stringify({action:'refresh',id:changeId})
  }));
  assert.equal(response.status,200);const result=await response.json();
  assert.equal(result.change.state,'paid');assert.equal(result.access.metadata.billing_interval,'year');assert.deepEqual(calls,[orderId]);
});
