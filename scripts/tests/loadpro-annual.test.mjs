import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
import {PGlite} from '@electric-sql/pglite';
const require=createRequire(import.meta.url);
function load(file,mocks={},extras={}) {
  const module={exports:{}};
  const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  vm.runInNewContext(code,{module,exports:module.exports,require:id=>{
    if(id in mocks)return mocks[id];if(id.startsWith('node:'))return require(id);throw Error('Unmocked '+id);
  },process:{env:{LOADPRO_ANNUAL_ENABLED:'true',STRIPE_SECRET_KEY:'sk_test_fixture',STRIPE_LOADPRO_ANNUAL_PRICE_ID:'price_annual',STRIPE_LOADPRO_FOUNDERS_50_ANNUAL_PRICE_ID:'price_annual_50'}},URL,URLSearchParams,Headers,Response,Request,Date,console,...extras});
  return module.exports;
}
const policy=load('lib/checkout/loadpro-annual-policy.ts');
const billing=load('lib/checkout/loadpro-billing-policy.ts');
const baseTemplate={id:'10000000-0000-4000-8000-000000000001',user_id:'20000000-0000-4000-8000-000000000001',email:'fixture@example.invalid',plan_code:'loadpro_founders',access_kind:'subscription',currency:'BRL',price_cents:4990,team_limit:2,players_per_team_limit:30,status:'active',metadata:{},updated_at:'2030-01-01T00:00:00Z'};

for (const [planCode,plan] of Object.entries(policy.ANNUAL_PLANS)) {
const base={...baseTemplate,plan_code:planCode,price_cents:plan.monthlyCents,players_per_team_limit:plan.players};
const annualCents=plan.annualCents, priceId=plan.players===30?'price_annual':'price_annual_50';
test('annual amount, monthly eligibility, currency, founders50 and leap-year rules',()=>{
 const q=policy.annualTerms({planCode:base.plan_code,method:'pix',periodEnd:'2032-02-29T12:00:00Z',now:Date.parse('2032-02-01')});
 assert.equal(q.price_cents,annualCents);assert.equal(q.access_until,'2033-02-28T12:00:00.000Z');assert.equal(q.renewal_mode,'manual');
 assert.equal(policy.annualTerms({planCode:base.plan_code,method:'card',periodEnd:'2030-06-01Z',now:0}).charge_at,'2030-06-01T00:00:00.000Z');
 for(const patch of [{plan_code:plan.players===30?'loadpro_founders_50':'loadpro_founders'},{currency:'USD'},{price_cents:3990},{access_kind:'lifetime'}])assert.throws(()=>policy.assertAnnualEligible({...base,...patch}));
});
test('Pix requires provider approval, exact currency/amount, matching reference and environment',()=>{
 const p={id:1,status:'approved',payment_method_id:'pix',currency_id:'BRL',transaction_amount:annualCents/100,external_reference:'annual:1',live_mode:false,date_approved:'2030-01-01Z'};
 policy.assertApprovedAnnualPix(p,'annual:1',false,base.plan_code);
 for(const patch of [{status:'pending'},{status:'rejected'},{currency_id:'USD'},{transaction_amount:49.9},{external_reference:'other'},{live_mode:true},{date_approved:null}])assert.throws(()=>policy.assertApprovedAnnualPix({...p,...patch},'annual:1',false,base.plan_code));
});
test('card scheduling preserves existing subscription, paid days/trial, and prevents duplicate monthly subscriptions',async()=>{
 for(const status of ['active','trialing']) {
  const calls=[];const end=2200000000;
  const subscription={id:'sub_1',customer:'cus_1',latest_invoice:{status:'paid'},status,trial_end:status==='trialing'?end:null,current_period_end:end,items:{data:[{id:'si_1',quantity:1,price:{id:'price_monthly',currency:'brl',unit_amount:base.price_cents,recurring:{interval:'month',interval_count:1}}}]}};
  const provider=load('lib/checkout/loadpro-annual-provider.ts',{'./loadpro-annual-policy':policy,'./loadpro-billing-policy':billing},{fetch:async(url,init)=>{
   calls.push({url,init});
   if(url.includes('/prices/'))return Response.json({active:true,currency:'brl',unit_amount:annualCents,recurring:{interval:'year',interval_count:1}});
   if(url.includes('/subscriptions/'))return Response.json(subscription);
   if(url.endsWith('/subscription_schedules'))return Response.json({id:'sched_1',current_phase:{start_date:end-30*86400}});
   return Response.json({id:'sched_1',subscription:'sub_1',phases:[{}, {start_date:end,items:[{price:priceId}]}]});
  }});
  assert.equal(await provider.scheduleAnnualCard('op_1','sub_1','cus_1',end,base.plan_code),'sched_1');
  assert.equal(calls.filter(x=>x.init.method==='POST' && /\/subscriptions\/?$/.test(x.url)).length,0);
  const body=calls.at(-1).init.body;
  assert.equal(body.get('phases[0][end_date]'),String(end));assert.equal(body.get('phases[1][start_date]'),String(end));
  assert.equal(body.get('phases[1][items][0][price]'),priceId);assert.equal(body.get('proration_behavior'),'none');
  assert.equal(body.get('phases[0][trial_end]'),status==='trialing'?String(end):null);
  assert.equal(calls[2].init.body.get('from_subscription'),'sub_1');
 }
});
test('preview rejects live Stripe credentials before any network operation',async()=>{
 const provider=load('lib/checkout/loadpro-annual-provider.ts',{'./loadpro-annual-policy':policy,'./loadpro-billing-policy':billing},{process:{env:{STRIPE_SECRET_KEY:'sk_live_NOT_A_KEY'}},fetch:()=>{throw Error('network must not be reached');}});
 await assert.rejects(provider.annualStripe('subscriptions/sub_1'),/Preview/);
});
test('reminder stays a draft; preferences, suppression, existing annual and duplicate keys exclude it',()=>{
 const reminder=load('lib/checkout/loadpro-annual-reminder.ts',{'./loadpro-annual-policy':policy});const now=Date.parse('2030-01-06');
 const access={...base,metadata:{provider_subscription_status:'trialing',trial_start:'2030-01-01Z',trial_end:'2030-01-08Z'}};
 const options={now,existingTrialReminder:false,offerConsent:true,suppressed:false,deliveredKeys:new Set(),appUrl:'https://loadpro.example.invalid'};
 const draft=reminder.prepareAnnualTrialReminder(access,options);assert.ok(draft);assert.match(draft.text,/view=setup&settings=security/);assert.ok(draft.text.includes(plan.players===30?'R$ 49,90':'R$ 69,90'));
 assert.ok(draft.text.includes(plan.players===30?'Economize R$ 99,80':'Economize R$ 139,80'));
 const en=reminder.prepareAnnualTrialReminder(access,{...options,locale:'en'});assert.ok(en.text.includes(plan.players===30?'R$499/year':'R$699/year'));
 for(const patch of [{existingTrialReminder:true},{existingTrialReminder:undefined},{offerConsent:false},{suppressed:true},{now:Date.parse('2030-01-09')},{deliveredKeys:new Set([draft.idempotencyKey])}])assert.equal(reminder.prepareAnnualTrialReminder(access,{...options,...patch}),null);
 assert.equal(reminder.prepareAnnualTrialReminder({...access,metadata:{...access.metadata,annual_change:{state:'paid'}}},options),null);
});

test('real PostgreSQL migration: RLS, quote freshness, concurrency, pending access and idempotent annual credit',async()=>{
 const db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create role service_role;
 create schema auth;create table auth.users(id uuid primary key);
 create table public.billing_access(id uuid primary key,email text,user_id uuid,status text,access_kind text,plan_code text,current_period_end timestamptz,billing_provider text,provider_customer_id text,provider_subscription_id text,price_cents int,currency text,team_limit int,players_per_team_limit int,metadata jsonb not null default '{}',updated_at timestamptz not null default now());`);
 const sql=readFileSync('supabase/loadpro-annual-billing.sql','utf8');await db.exec(sql);await db.exec(sql);
 await db.query('insert into auth.users values($1)',[base.user_id]);
 await db.query(`insert into billing_access(id,email,user_id,status,access_kind,plan_code,current_period_end,billing_provider,provider_subscription_id,price_cents,currency,team_limit,players_per_team_limit) values($1,$2,$3,'active','subscription','${planCode}','2030-02-01Z','stripe','sub_1',${base.price_cents},'BRL',2,${plan.players})`,[base.id,base.email,base.user_id]);
 const quote=policy.annualTerms({planCode:base.plan_code,method:'pix',periodEnd:'2030-02-01Z',now:Date.parse('2030-01-01')});
 const op='30000000-0000-4000-8000-000000000001';
 await db.query(`insert into loadpro_annual_changes(id,access_id,user_id,method,access_version,quote,expires_at) select $1,id,user_id,'pix',updated_at,$2,now()+interval '10 minutes' from billing_access`,[op,JSON.stringify(quote)]);
 await assert.rejects(db.query('select confirm_loadpro_annual($1,$2)',[op,'20000000-0000-4000-8000-000000000002']));
 await db.query("update loadpro_annual_changes set expires_at=now()-interval '1 second' where id=$1",[op]);
 await assert.rejects(db.query('select confirm_loadpro_annual($1,$2)',[op,base.user_id]),/QUOTE_CHANGED/);
 await db.query("update loadpro_annual_changes set expires_at=now()+interval '10 minutes' where id=$1",[op]);
 await db.query("update billing_access set updated_at=updated_at+interval '1 second' where id=$1",[base.id]);
 await assert.rejects(db.query('select confirm_loadpro_annual($1,$2)',[op,base.user_id]),/QUOTE_CHANGED/);
 await db.query("update loadpro_annual_changes set access_version=(select updated_at from billing_access where id=$1) where id=$2",[base.id,op]);
 const otherCode=plan.players===30?'loadpro_founders_50':'loadpro_founders';
 const otherQuote=policy.annualTerms({planCode:otherCode,method:'pix',periodEnd:'2030-02-01Z',now:Date.parse('2030-01-01')});
 await db.query('update loadpro_annual_changes set quote=$2 where id=$1',[op,JSON.stringify(otherQuote)]);
 await assert.rejects(db.query('select confirm_loadpro_annual($1,$2)',[op,base.user_id]),/INELIGIBLE/);
 await assert.rejects(db.query('update loadpro_annual_changes set quote=$2 where id=$1',[op,JSON.stringify({...quote,price_cents:null})]),/check constraint/);
 await db.query('update loadpro_annual_changes set quote=$2 where id=$1',[op,JSON.stringify(quote)]);
 await db.query('select confirm_loadpro_annual($1,$2)',[op,base.user_id]);
 await db.query('select confirm_loadpro_annual($1,$2)',[op,base.user_id]);
 await assert.rejects(db.query('select lock_loadpro_billing($1,$2)',[base.id,'30000000-0000-4000-8000-000000000002']),/BILLING_BUSY/);
 await db.query(`select finish_loadpro_annual($1,'awaiting_payment',$2)`,[op,JSON.stringify({payment_id:'pix_1'})]);
 const read=async()=> (await db.query('select * from billing_access')).rows[0];
 assert.equal((await read()).price_cents,base.price_cents);assert.equal(new Date((await read()).current_period_end).toISOString(),'2030-02-01T00:00:00.000Z');
 await assert.rejects(db.query(`select finish_loadpro_annual($1,'paid',$2)`,[op,JSON.stringify({verified:false,payment_id:'pix_1'})]),/PAYMENT_NOT_VERIFIED/);
 await assert.rejects(db.query(`select finish_loadpro_annual($1,'paid',$2)`,[op,JSON.stringify({payment_id:'pix_1',amount_cents:annualCents,currency:'BRL',approved_at:'2030-01-03Z'})]),/PAYMENT_NOT_VERIFIED/);
 await assert.rejects(db.query(`select finish_loadpro_annual($1,'paid',$2)`,[op,JSON.stringify({verified:true,payment_id:'pix_1',amount_cents:annualCents===49900?69900:49900,currency:'BRL',approved_at:'2030-01-03Z'})]),/PAYMENT_NOT_VERIFIED/);
 const payment={verified:true,payment_id:'pix_1',amount_cents:annualCents,currency:'BRL',approved_at:'2030-01-03Z'};
 await db.query(`select finish_loadpro_annual($1,'paid',$2)`,[op,JSON.stringify(payment)]);
 await db.query(`select finish_loadpro_annual($1,'paid',$2)`,[op,JSON.stringify(payment)]);
 const access=await read();assert.equal(new Date(access.current_period_end).toISOString(),'2031-02-01T00:00:00.000Z');
 assert.equal(access.team_limit,2);assert.equal(access.players_per_team_limit,plan.players);assert.equal(access.user_id,base.user_id);assert.equal(access.metadata.renewal_mode,'manual');assert.equal(access.provider_subscription_id,'pix:pix_1');
 await db.exec('set role authenticated');
 await assert.rejects(db.query('select * from loadpro_annual_changes'),/permission denied/);
 await assert.rejects(db.query('select confirm_loadpro_annual($1,$2)',[op,base.user_id]),/permission denied/);
 await db.close();
});

test('annual API rejects missing authentication and unconfirmed choices before provider calls',async()=>{
 let writes=0;
 const route=load('app/api/loadpro/billing/annual/route.ts',{
  'next/server':{NextResponse:Response},'@/lib/checkout/loadpro':{resolveLoadProBillingAccess:async()=>({access:base,identity:{id:base.user_id}})},
  '@/lib/checkout/loadpro-annual-policy':policy,
  '@/lib/checkout/loadpro-annual':{annualEnabled:()=>true,confirmAnnual:async()=>{writes++;},quoteAnnual:async()=>{writes++;}}
 });
 const headers={origin:'https://loadpro.rumoaopro.com.br','content-type':'application/json'};
 assert.equal((await route.GET(new Request('https://backend.invalid/api?method=card',{headers}))).status,401);
 assert.equal((await route.POST(new Request('https://backend.invalid/api',{method:'POST',headers:{...headers,authorization:'Bearer fixture'},body:JSON.stringify({id:'x',confirmed:false})}))).status,400);
 assert.equal((await route.GET(new Request('https://backend.invalid/api?method=card',{headers:{...headers,origin:'https://attacker.invalid',authorization:'Bearer fixture'}}))).status,403);
 assert.equal(writes,0);
});
test('annual card reconciliation repairs a verified current invoice, never an old or pending invoice',async()=>{
 let writes=[];
 const access={...base,provider_customer_id:'cus_1',metadata:{annual_change:{id:'op_1',plan_code:base.plan_code,price_cents:annualCents,payment_method:'card'}}};
 const subscription={customer:'cus_1',status:'active',current_period_start:2200000000,current_period_end:2231536000,items:{data:[{quantity:1,price:{unit_amount:annualCents,currency:'brl',recurring:{interval:'year',interval_count:1}}}]},latest_invoice:{id:'in_current',status:'paid',amount_paid:annualCents,currency:'brl'}};
 const service=load('lib/checkout/loadpro-annual.ts',{
  './loadpro-annual-orders':{},
  './loadpro':{requestLoadPro:async()=>Response.json([access]),syncLoadProAccess:async(order,data)=>{writes.push(data);}},
  './db':{getOrderByGatewayPaymentId:async()=>({customer_email:base.email})},
  './loadpro-annual-policy':policy,'./loadpro-billing-policy':billing,
  './loadpro-annual-provider':{annualStripe:async()=>subscription}
 });
 assert.equal(await service.reconcileAnnualCard('sub_1','in_old'),false);assert.equal(writes.length,0);
 subscription.latest_invoice.status='open';assert.equal(await service.reconcileAnnualCard('sub_1','in_current'),false);assert.equal(writes.length,0);
 subscription.latest_invoice.status='paid';assert.equal(await service.reconcileAnnualCard('sub_1','in_current'),true);assert.equal(writes[0].annualPaymentConfirmed,true);assert.equal(writes[0].currentPeriodEnd,2231536000);
 await service.reconcileAnnualCard('sub_1','in_current');assert.equal(writes[1].currentPeriodEnd,writes[0].currentPeriodEnd);
 assert.equal(writes[0].planCode,planCode);assert.equal(writes[0].priceCents,annualCents);
 for (const patch of [{status:'past_due'},{customer:'other_customer'}]) {
  const previous={...subscription};Object.assign(subscription,patch);assert.equal(await service.reconcileAnnualCard('sub_1','in_current'),false);Object.assign(subscription,previous);
 }
 subscription.items.data[0].price.unit_amount=plan.players===30?69900:49900;
 assert.equal(await service.reconcileAnnualCard('sub_1','in_current'),false);assert.equal(writes.length,2);
});


test(`Pix ${plan.players}: stop only the confirmed monthly renewal; retry cannot add a second cancellation`,async()=>{
 const end=2200000000,calls=[];
 let sub={id:'sub_1',customer:'cus_1',latest_invoice:{status:'paid'},status:'active',current_period_end:end,items:{data:[{quantity:1,price:{unit_amount:base.price_cents,currency:'brl',recurring:{interval:'month',interval_count:1}}}]}};
 const provider=load('lib/checkout/loadpro-annual-provider.ts',{'./loadpro-annual-policy':policy,'./loadpro-billing-policy':billing},{fetch:async(url,init)=>{
  calls.push({url,init});if(init.method==='POST')sub={...sub,cancel_at_period_end:true,metadata:{loadpro_annual_pix:'op_pix'}};return Response.json(sub);
 }});
 await provider.stopMonthlyForPix('op_pix','sub_1','cus_1',end,planCode);
 await provider.stopMonthlyForPix('op_pix','sub_1','cus_1',end,planCode);
 assert.equal(calls.filter(c=>c.init.method==='POST').length,1);
 assert.equal(sub.current_period_end,end);assert.equal(sub.items.data[0].price.unit_amount,base.price_cents);
 await assert.rejects(provider.stopMonthlyForPix('op_other','sub_1','cus_1',end,planCode));
 await assert.rejects(provider.stopMonthlyForPix('op_pix','sub_1','other_customer',end,planCode));
});
}

test('annual invoice amounts cannot be swapped between tiers',()=>{
 for(const [code,plan] of Object.entries(policy.ANNUAL_PLANS)) {
  assert.equal(policy.matchesAnnualPayment(code,plan.annualCents,plan.annualCents,'BRL'),true);
  for(const amount of [0,plan.monthlyCents,plan.annualCents===49900?69900:49900]) assert.equal(policy.matchesAnnualPayment(code,plan.annualCents,amount,'BRL'),false);
  assert.equal(policy.matchesAnnualPayment(code,plan.annualCents,plan.annualCents,'USD'),false);
 }
});

test('portal payment changes cannot be overwritten by an owned annual schedule',async()=>{
 for (const [code,plan] of Object.entries(policy.ANNUAL_PLANS)) {
  const access={...baseTemplate,plan_code:code,provider_customer_id:'cus_1',metadata:{annual_change:{id:'op_1',state:'scheduled',plan_code:code,price_cents:plan.annualCents,payment_method:'card'}}};
  const sub={id:'sub_1',customer:'cus_1',status:'active',schedule:'sched_1',default_payment_method:null};
  const schedule={id:'sched_1',customer:'cus_1',subscription:'sub_1',status:'active',metadata:{loadpro_annual_change:'op_1'},default_settings:{default_payment_method:'pm_old'},phases:[{default_payment_method:null},{default_payment_method:null}]};
  const writes=[];let loseResponse=false;
  const service=load('lib/checkout/loadpro-annual.ts',{
   './loadpro-annual-orders':{},'./db':{},'./loadpro-annual-policy':policy,'./loadpro-billing-policy':billing,
   './loadpro':{requestLoadPro:async path=>{assert.match(path,/provider_subscription_id=eq.sub_1&billing_provider=eq.stripe/);return Response.json([access]);}},
   './loadpro-annual-provider':{annualStripe:async(path,params,key)=>{
    if(!params)return path==='subscriptions/sub_1'?sub:schedule;
    writes.push({path,body:Object.fromEntries(params),key});
    schedule.default_settings.default_payment_method=params.get('default_settings[default_payment_method]') || null;
    if(loseResponse)throw Error('Lost response after successful update');
    return schedule;
   }}
  });
  await service.syncAnnualSchedulePaymentMethod('sub_1','evt_portal');
  assert.equal(writes.length,1);
  assert.deepEqual(writes[0],{path:'subscription_schedules/sched_1',body:{'default_settings[default_payment_method]':''},key:'annual:op_1:payment-method:evt_portal'});
  await service.syncAnnualSchedulePaymentMethod('sub_1','evt_portal');assert.equal(writes.length,1);
  // Reconciliation also works after the first annual payment, without changing
  // dates, prices, access or creating another subscription/payment.
  access.metadata.annual_change.state='paid';sub.default_payment_method='pm_new';loseResponse=true;
  await assert.rejects(service.syncAnnualSchedulePaymentMethod('sub_1','evt_new'),/Lost response/);
  loseResponse=false;await service.syncAnnualSchedulePaymentMethod('sub_1','evt_new');assert.equal(writes.length,2);
  sub.default_payment_method='pm_other';
  for(const patch of [{customer:'cus_other'},{subscription:'sub_other'},{status:'released'},{metadata:{loadpro_annual_change:'other'}}]) {
   const before={...schedule};Object.assign(schedule,patch);
   assert.equal(await service.syncAnnualSchedulePaymentMethod('sub_1','evt_denied'),false);Object.assign(schedule,before);
  }
  schedule.phases[1].default_payment_method='pm_manual';
  await assert.rejects(service.syncAnnualSchedulePaymentMethod('sub_1','evt_override'),/review/);
  schedule.phases[1].default_payment_method=null;
  sub.customer='cus_other';assert.equal(await service.syncAnnualSchedulePaymentMethod('sub_1','evt_owner'),false);
  sub.customer='cus_1';access.metadata.annual_change.payment_method='pix';
  assert.equal(await service.syncAnnualSchedulePaymentMethod('sub_1','evt_pix'),false);assert.equal(writes.length,2);
 }
});
