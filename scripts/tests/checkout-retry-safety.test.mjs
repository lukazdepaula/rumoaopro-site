import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
import { PGlite } from '@electric-sql/pglite';

const environment = { STRIPE_RETRY_SAFE_FULFILLMENT_ENABLED: 'true',
  CHECKOUT_DELIVERY_ENCRYPTION_KEY: 'synthetic-encryption-key-for-local-tests-only',
  STRIPE_SECRET_KEY: 'sk_test_fixture_not_a_credential', EMAIL_PROVIDER: 'resend',
  RESEND_API_KEY: 're_fixture', EMAIL_FROM: 'QA <qa@example.invalid>' };
function load(file, mocks = {}, env = environment, extras = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(file,'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, Request, Response, Headers, URL,
    Buffer, AbortSignal, Date, process: { env }, console: { info() {}, error() {} },
    fetch() { throw Error('Real network is forbidden'); },
    require(id) { if (id === 'node:crypto') return crypto; if (id in mocks) return mocks[id]; throw Error('Unmocked '+id); },
    ...extras });
  return module.exports;
}

function localStorage() {
  const db = new DatabaseSync(':memory:');
  // Use the application's actual new table definitions, not a separate test schema.
  const source = readFileSync('lib/checkout/db.ts','utf8');
  for (const name of ['checkout_retry_work','checkout_retry_email']) {
    db.exec(source.match(new RegExp(`CREATE TABLE IF NOT EXISTS ${name} \\([\\s\\S]*?\\);`))[0]);
  }
  db.exec('CREATE TABLE webhook_events (id TEXT,provider TEXT,event_id TEXT);');
  const storage = load('lib/checkout/retry-storage.ts', { './db': { checkoutRetryLocalDatabase: () => db } });
  return { db, storage, close: () => db.close() };
}

test('retry state is opt-in and missing configuration never silently enables it', () => {
  for (const env of [{},{STRIPE_RETRY_SAFE_FULFILLMENT_ENABLED:'false'}]) {
    assert.equal(load('lib/checkout/retry-storage.ts',{'./db':{}},env).stripeRetrySafetyEnabled(),false);
  }
});

test('SQLite claims serialize work, recover failure/expired leases and fence stale owners; legacy receipts stay closed', async () => {
  const f = localStorage();
  try {
    const key='stripe-event:evt_fixture';
    const claims=await Promise.all([f.storage.claimRetryWork(key),f.storage.claimRetryWork(key)]);
    assert.equal(claims.filter(x=>x.state==='claimed').length,1);
    assert.equal(claims.filter(x=>x.state==='busy').length,1);
    await f.storage.finishRetryWork(key,claims[0].token,false);
    const retry=await f.storage.claimRetryWork(key); assert.equal(retry.state,'claimed');
    await assert.rejects(f.storage.finishRetryWork(key,claims[0].token,true),/ownership/);
    f.db.prepare('UPDATE checkout_retry_work SET lease_until=?').run('2000-01-01T00:00:00.000Z');
    const recovered=await f.storage.claimRetryWork(key); assert.equal(recovered.state,'claimed');
    await assert.rejects(f.storage.finishRetryWork(key,retry.token,true),/ownership/);
    await f.storage.finishRetryWork(key,recovered.token,true);
    assert.equal((await f.storage.claimRetryWork(key)).state,'completed');
    f.db.exec("INSERT INTO webhook_events VALUES('legacy','stripe','evt_legacy')");
    assert.equal((await f.storage.claimRetryWork('stripe-event:evt_legacy','evt_legacy')).state,'completed');
  } finally {f.close();}
});

test('Postgres migration is repeatable, service-only, serializes claims and preserves completed events', async () => {
  const db = new PGlite();
  try {
    await db.exec('create role anon;create role authenticated;create role service_role;create table webhook_events(id text,provider text,event_id text);');
    const sql=readFileSync('supabase/checkout-retry-safety.sql','utf8');
    await db.exec(sql); await db.exec(sql);
    const storage=load('lib/checkout/retry-storage.ts',{'./db':{
      checkoutRetryLocalDatabase:()=>null,
      checkoutRetryRpc:async b=>(await db.query('select checkout_retry_operation($1,$2,$3,$4,$5) as result',
        [b.p_operation,b.p_key,b.p_token,b.p_payload,b.p_legacy_event_id])).rows[0].result
    }});
    await db.exec('set role service_role');
    const a=await storage.claimRetryWork('stripe-event:evt_pg');
    assert.equal(a.state,'claimed');
    assert.equal((await storage.claimRetryWork('stripe-event:evt_pg')).state,'busy');
    await storage.finishRetryWork('stripe-event:evt_pg',a.token,false);
    const b=await storage.claimRetryWork('stripe-event:evt_pg');
    await assert.rejects(storage.finishRetryWork('stripe-event:evt_pg',a.token,true),/ownership/);
    await storage.finishRetryWork('stripe-event:evt_pg',b.token,true);
    assert.equal((await storage.claimRetryWork('stripe-event:evt_pg')).state,'completed');
    await storage.prepareRetryEmail('raptor-welcome:fixture','encrypted-fixture');
    await storage.prepareRetryEmail('raptor-welcome:fixture','must-not-replace');
    assert.equal((await storage.readRetryEmail('raptor-welcome:fixture')).encrypted_payload,'encrypted-fixture');
    assert.ok((await storage.startRetryEmail('raptor-welcome:fixture')).first_attempt_at);
    const sent=await storage.markRetryEmailSent('raptor-welcome:fixture');
    assert.ok(sent.sent_at); assert.equal(sent.encrypted_payload,null);
    for(const role of ['anon','authenticated']) {
      await db.exec(`reset role;set role ${role}`);
      await assert.rejects(db.query('select * from checkout_retry_email'),/permission/);
      await assert.rejects(db.query('select checkout_retry_operation($1,$2)', ['get_email','raptor-welcome:fixture']),/permission/);
    }
    await db.exec('reset role');
    await db.exec("insert into webhook_events values('legacy','stripe','evt_legacy')");
    assert.equal((await storage.claimRetryWork('stripe-event:evt_legacy','evt_legacy')).state,'completed');
    assert.equal((await db.query("select count(*)::int as n from pg_class where relname in ('checkout_retry_work','checkout_retry_email') and relrowsecurity")).rows[0].n,2);
  } finally {await db.close();}
});

test('durable email encrypts the link, preserves exact payload/key across restart and removes it after success', async () => {
  const f=localStorage();
  try {
    const open=()=>load('lib/checkout/retry-email.ts',{'./retry-storage':f.storage});
    const input={body:{from:'qa@example.invalid',to:'owner@example.invalid',subject:'Test',html:'personal-link-fixture'},actionUrl:'https://auth.example.invalid/fixture',createdAt:Date.now()};
    const calls=[]; const send=async(body,key)=>{calls.push({body,key});return calls.length>1;};
    assert.equal(await open().sendRetrySafeRaptorEmail('fixture',input,()=>true,send),false);
    const encrypted=await f.storage.readRetryEmail('raptor-welcome:fixture');
    assert.doesNotMatch(encrypted.encrypted_payload,/personal-link|auth\.example/);
    assert.equal(await open().sendRetrySafeRaptorEmail('fixture',{...input,body:{...input.body,html:'different-new-link'}},()=>true,send),true);
    assert.equal(JSON.stringify(calls[0]),JSON.stringify(calls[1]));
    assert.equal((await f.storage.readRetryEmail('raptor-welcome:fixture')).encrypted_payload,null);
    assert.equal(await open().sendRetrySafeRaptorEmail('fixture',input,()=>true,send),true);
    assert.equal(calls.length,2);
  } finally {f.close();}
});

test('email ambiguity outside the retry window and a changed encryption key stop without a resend', async () => {
  const f=localStorage();
  try {
    const mail=load('lib/checkout/retry-email.ts',{'./retry-storage':f.storage});
    const input={body:{from:'qa@example.invalid',to:'owner@example.invalid',subject:'Test',html:'secret-link-fixture'},actionUrl:'https://auth.example.invalid/fixture',createdAt:Date.now()};
    await mail.sendRetrySafeRaptorEmail('fixture',input,()=>true,async()=>false);
    let sends=0;
    const badKey=load('lib/checkout/retry-email.ts',{'./retry-storage':f.storage},{...environment,CHECKOUT_DELIVERY_ENCRYPTION_KEY:'another-synthetic-key-with-more-than-32-chars'});
    await assert.rejects(badKey.sendRetrySafeRaptorEmail('fixture',input,()=>true,async()=>{sends++;return true;}),/decrypted/);
    f.db.prepare('UPDATE checkout_retry_email SET first_attempt_at=?').run('2000-01-01T00:00:00.000Z');
    await assert.rejects(mail.sendRetrySafeRaptorEmail('fixture',input,()=>true,async()=>{sends++;return true;}),/window closed/);
    assert.equal(sends,0);
  } finally {f.close();}
});

function integration(options={}) {
  const f=localStorage();
  const order={id:'fixture-order',product_id:'project_36',product_name:'Synthetic program',gateway:'stripe',
    customer_name:'QA',customer_email:'owner@example.invalid',status:'pending',amount:49.9,currency:'USD',
    delivery_status:'not_delivered',metadata:{checkout_gateway_mode:'sandbox'}};
  const state={lookups:0,providers:0,links:0,grants:0,sends:0,mailRequests:[],logs:[],accepted:new Map(),metadataFailed:false,finishFailed:false};
  const db={
    getOrderById:async()=>{state.lookups++;if(options.lookupFailure&&state.lookups===1)throw Error('Synthetic database interruption');return order;},
    getOrderByGatewayCheckoutId:async()=>order,getOrderByGatewayPaymentId:async()=>order,
    recordWebhookEvent:async(p,id)=>{const row=f.db.prepare('SELECT id FROM webhook_events WHERE event_id=?').get(id);
      if(row)return false;f.db.prepare('INSERT INTO webhook_events VALUES(?,?,?)').run(id,p,id);return true;},
    updateOrderStatus:async(id,status)=>{order.status=status;},
    updateOrderGatewayIds:async(id,data)=>{
      if(options.metadataFailure&&data.metadata.raptorpro_welcome_email_sent===true&&!state.metadataFailed){state.metadataFailed=true;throw Error('Synthetic persistence interruption');}
      Object.assign(order.metadata,data.metadata);
    },
    appendOrderLog:async(id,type)=>state.logs.push(type),findOtherPaidOrderForProducts:async()=>null
  };
  const safety={isPreviewEnvironment:()=>false,canProvisionRaptorProSandbox:()=>true,canProvisionLoadProSandbox:()=>false};
  const retryMail=load('lib/checkout/retry-email.ts',{'./retry-storage':f.storage});
  const email=load('lib/checkout/email.ts',{'@/lib/checkout/db':db,'@/lib/preview-safety':safety,'./retry-email':retryMail},environment,{
    fetch:async(url,init)=>{
      assert.equal(url,'https://api.resend.com/emails');
      const key=init.headers['Idempotency-Key'];assert.ok(key);state.mailRequests.push({key,body:init.body});
      if(options.mailFailure&&state.mailRequests.length===1)return Response.json({}, {status:429});
      if(state.accepted.has(key))assert.equal(state.accepted.get(key),init.body,'retry must not change the provider payload');
      else {state.accepted.set(key,init.body);state.sends++;}
      if(options.lostMailResponse&&state.mailRequests.length===1)throw Error('Synthetic lost response after acceptance');
      return Response.json({id:'synthetic-mail'});
    }
  });
  const events=load('lib/checkout/order-events.ts',{
    '@/lib/checkout/db':db,'./retry-storage':f.storage,'./retry-email':retryMail,
    '@/lib/preview-safety':safety,'@/lib/checkout/access':{grantProductAccess:async()=>state.grants++},
    '@/lib/checkout/delivery':{deliverOrder:async()=>{}},'@/lib/checkout/admin-push':{},
    '@/lib/checkout/email':{...email,...(options.mailDisabled?{isEmailDeliveryConfigured:()=>false}:{})},'@/lib/checkout/loadpro':{isLoadProOrder:()=>false},
    '@/lib/checkout/raptorpro':{
      isRaptorProProgramOrder:()=>true,getRaptorProProgramConfig:()=>({programId:'synthetic-program',programTitle:'Test'}),
      syncRaptorProProgramAccess:async value=>{
        state.providers++;
        if(options.provisionFailure&&state.providers===1)throw Error('Synthetic temporary provider failure');
        if(options.blockProvider)await options.blockProvider();
        const link=value.metadata.raptorpro_welcome_email_sent===true?null:`https://auth.example.invalid/link-${++state.links}`;
        return {handled:true,configured:true,programId:'synthetic-program',actionUrl:link,accountCreated:false};
      }
    }
  });
  const route=load('app/api/webhooks/stripe/route.ts',{
    'next/server':{NextResponse:{json:(body,init)=>({body,status:init?.status||200})}},
    '@/lib/checkout/retry-storage':{...f.storage,finishRetryWork:async(key,token,success)=>{
      if(options.finishFailure&&success&&!state.finishFailed){state.finishFailed=true;throw Error('Synthetic lost completion write');}
      return f.storage.finishRetryWork(key,token,success);
    }},'@/lib/checkout/db':db,'@/lib/checkout/order-events':events,
    '@/lib/checkout/loadpro-annual-policy':{isAnnualAmount:()=>false},'@/lib/checkout/loadpro-annual':{},
    '@/lib/checkout/payments':{verifyStripeWebhookSignature:()=>options.signatureValid!==false},
    '@/lib/marketing/order-events':{trackMetaPurchase:async()=>{}},'@/lib/marketing/loadpro-outcomes':{},
    '@/lib/checkout/loadpro':{isLoadProOrder:()=>false},'@/lib/checkout/loadpro-billing-policy':{stripeSubscriptionPeriod:()=>({})},
    '@/lib/checkout/email':{}
  });
  const send=(id='evt_fixture',patch={})=>route.POST(new Request('https://site.example.invalid/api/webhooks/stripe',{
    method:'POST',headers:{'stripe-signature':'synthetic'},body:JSON.stringify({id,type:'checkout.session.completed',livemode:false,
      data:{object:{id:'cs_test_fixture',payment_status:'paid',metadata:{order_id:order.id},status:'complete',amount_total:4990,currency:'usd'}},...patch})
  }));
  return {...f,order,state,send};
}

for(const fault of ['lookupFailure','provisionFailure','mailFailure','lostMailResponse','metadataFailure','finishFailure']) {
  test(`signed checkout recovers ${fault} without charging, losing the paid state or duplicating mail`,async()=>{
    const f=integration({[fault]:true});
    try {
      assert.equal((await f.send()).status,500);
      if(fault!=='lookupFailure')assert.equal(f.order.status,'paid');
      assert.equal((await f.send()).status,200);
      assert.equal(f.order.status,'paid');
      assert.equal(f.order.metadata.raptorpro_provisioning_status,'synced');
      assert.equal(f.order.metadata.raptorpro_welcome_email_sent,true);
      assert.equal(f.order.metadata.raptorpro_welcome_email_status,'sent');
      assert.equal(f.state.sends,1);
      assert.equal(f.state.links,1);
      assert.equal((await f.send()).body.duplicate,true);
      assert.equal(f.state.sends,1);
    } finally {f.close();}
  });
}

test('same-event and different-event concurrency both serialize one order and one welcome email',async()=>{
  let release;const gate=new Promise(resolve=>{release=resolve;});
  let entered;const started=new Promise(resolve=>{entered=resolve;});
  const f=integration({blockProvider:async()=>{entered();await gate;}});
  try {
    const first=f.send();await started;
    assert.equal((await f.send()).status,503);
    assert.equal((await f.send('evt_second')).status,500);
    release();assert.equal((await first).status,200);
    assert.equal((await f.send('evt_second')).status,200);
    assert.equal(f.state.sends,1);assert.equal(f.state.links,1);
  } finally {release();f.close();}
});

test('disabled mail or missing migration never falls back to unguarded provision or delivery',async()=>{
  const f=integration({mailDisabled:true});
  try{assert.equal((await f.send()).status,500);assert.equal(f.state.providers,0);assert.equal(f.state.sends,0);}finally{f.close();}
  const missing=integration();
  try{
    missing.db.exec('DROP TABLE checkout_retry_work');
    assert.equal((await missing.send()).status,500);
    assert.equal(missing.order.status,'pending');assert.equal(missing.state.providers,0);
  }finally{missing.close();}
});

test('signature/environment checks run before durable claims; unpaid events cannot grant access',async()=>{
  const invalid=integration({signatureValid:false});
  try{assert.equal((await invalid.send()).status,401);assert.equal(invalid.db.prepare('SELECT count(*) AS n FROM checkout_retry_work').get().n,0);}finally{invalid.close();}
  const f=integration();
  try {
    assert.equal((await f.send('evt_wrong',{livemode:true})).status,409);
    assert.equal((await f.send('evt_bad',{id:''})).status,400);
    assert.equal((await f.send('evt_unpaid',{type:'checkout.session.async_payment_succeeded',data:{object:{id:'cs_test',payment_status:'unpaid',metadata:{order_id:f.order.id}}}})).status,200);
    assert.equal(f.state.providers,0);assert.equal(f.state.sends,0);assert.equal(f.order.status,'pending');
  } finally {f.close();}
});

test('historical receipts and refunded orders are never automatically re-granted',async()=>{
  const f=integration();
  try {
    f.db.exec("INSERT INTO webhook_events VALUES('legacy','stripe','evt_legacy')");
    assert.equal((await f.send('evt_legacy')).body.duplicate,true);
    f.order.status='refunded';
    assert.equal((await f.send()).status,500);
    assert.equal(f.order.status,'refunded');assert.equal(f.state.providers,0);
  } finally {f.close();}
});
