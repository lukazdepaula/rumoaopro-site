import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
import {PGlite} from '@electric-sql/pglite';
const require=createRequire(import.meta.url);
const accessId='10000000-0000-4000-8000-000000000001',userId='20000000-0000-4000-8000-000000000001';
const mailId='30000000-0000-4000-8000-000000000001';

// No test has access to a real provider: all network requests are intercepted.
async function fixture(t) {
 const db=new PGlite();t.after(()=>db.close());
 await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);
 create table billing_access(id uuid primary key,user_id uuid,email text,status text,access_kind text,billing_provider text,currency text,
 provider_subscription_id text,provider_customer_id text,plan_code text,price_cents integer,metadata jsonb,updated_at timestamptz);
 create table loadpro_annual_changes(access_id uuid,confirmed_at timestamptz);`);
 await db.exec(readFileSync('supabase/loadpro-annual-reminders.sql','utf8'));
 const migration=readFileSync('supabase/loadpro-reminder-delivery.sql','utf8');await db.exec(migration);await db.exec(migration);
 const end=Math.floor(Date.now()/1000)+86400,version=new Date().toISOString();
 await db.query('insert into auth.users values($1)',[userId]);
 await db.query(`insert into billing_access values($1,$2,'qa@example.invalid','active','subscription','stripe','BRL','sub_fixture','cus_fixture',
 'loadpro_founders',4990,$3,$4)`,[accessId,userId,JSON.stringify({provider_subscription_status:'trialing',trial_start:end-7*86400,trial_end:end}),version]);
 await db.query("select set_loadpro_trial_offer_preference($1,true,'pt','loadpro-trial-offer-v1')",[userId]);
 const env={VERCEL_ENV:'production',NODE_ENV:'production',LOADPRO_ANNUAL_ENABLED:'true',LOADPRO_TRIAL_REMINDER_OWNER:'loadpro',LOADPRO_STRIPE_TRIAL_REMINDER_DISABLED:'true',
 LOADPRO_TRIAL_REMINDER_DELIVERY_ENABLED:'true',LOADPRO_REMINDER_RESEND_API_KEY:'fixture-not-a-real-key',LOADPRO_REMINDER_EMAIL_FROM:'LoadPro <qa@example.invalid>',STRIPE_SECRET_KEY:'sk_live_fixture'};
 const state={calls:[],sent:null,postCount:0,contact:{object:'contact',email:'qa@example.invalid',unsubscribed:false},contactStatus:200,
 suppression:{name:'not_found'},suppressionStatus:404,suppressionList:{object:'list',has_more:false,data:[]},suppressionListStatus:200,
 loseResponse:false,failRecord:false,failClaimResponse:false,hideSent:false,postStatus:200,beforeClaim:null,beforeReview:null};
 const subscription={id:'sub_fixture',customer:'cus_fixture',livemode:true,status:'trialing',trial_start:end-7*86400,trial_end:end,current_period_end:end,
 items:{data:[{quantity:1,price:{currency:'brl',unit_amount:4990,recurring:{interval:'month',interval_count:1}}}]}};
 const requestLoadPro=async(p,init)=>{
  const body=init?.body?JSON.parse(init.body):null;
  if(p.startsWith('/rest/v1/billing_access?')) {if(state.beforeReview) await state.beforeReview();return Response.json((await db.query('select * from billing_access where id=$1',[accessId])).rows);}
  if(p.startsWith('/rest/v1/loadpro_communication_preferences?'))return Response.json((await db.query('select * from loadpro_communication_preferences where user_id=$1',[userId])).rows);
  if(p.startsWith('/rest/v1/loadpro_trial_reminders?'))return Response.json((await db.query('select * from loadpro_trial_reminders where id=$1',[new URL('https://db.invalid'+p).searchParams.get('id').slice(3)])).rows);
  if(p==='/rest/v1/rpc/reserve_loadpro_trial_reminder')return Response.json((await db.query('select reserve_loadpro_trial_reminder($1,$2,$3,$4,$5) as result',[body.p_access_id,body.p_access_version,body.p_preference_version,body.p_trial_end,body.p_payload_hash])).rows[0].result);
  if(p==='/rest/v1/rpc/claim_loadpro_reminder_delivery') {
   if(state.beforeClaim)await state.beforeClaim();
   const result=(await db.query('select to_jsonb(claim_loadpro_reminder_delivery($1,$2,$3,$4,$5,$6)) as result',[body.p_id,body.p_access_version,body.p_preference_version,body.p_payload_hash,JSON.stringify(body.p_payload),body.p_checked_at])).rows[0].result;
   if(state.failClaimResponse)throw Error('Lost claim response');
   return Response.json(result);
  }
  if(p==='/rest/v1/rpc/record_loadpro_reminder_delivery') {
   if(state.failRecord){state.failRecord=false;throw Error('Record unavailable');}
   return Response.json((await db.query('select to_jsonb(record_loadpro_reminder_delivery($1,$2,$3)) as result',[body.p_id,body.p_email_id,body.p_event])).rows[0].result);
  }
  throw Error('Unmocked database operation '+p);
 };
 const fetch=async(url,init={})=>{
  state.calls.push({url,method:init.method||'GET',body:init.body,headers:init.headers});
  if(url.startsWith('https://api.stripe.com/v1/subscriptions/sub_fixture?'))return Response.json(subscription);
  if(url==='https://api.resend.com/contacts/qa%40example.invalid')return Response.json(state.contact,{status:state.contactStatus});
  if(url==='https://api.resend.com/suppressions/qa%40example.invalid')return Response.json(state.suppression,{status:state.suppressionStatus});
  if(url==='https://api.resend.com/suppressions')return Response.json(state.suppressionList,{status:state.suppressionListStatus});
  if(url==='https://api.resend.com/emails'&&init.method==='POST') {
   state.postCount++;
   if(state.postStatus!==200)return Response.json({name:'error'},{status:state.postStatus});
   state.sent={...JSON.parse(init.body),object:'email',id:mailId,created_at:new Date().toISOString(),last_event:'sent',cc:[],bcc:[],scheduled_at:null};
   if(state.loseResponse)throw Error('Lost mail response');
   return Response.json({id:mailId});
  }
  if(url==='https://api.resend.com/emails/'+mailId)return Response.json(state.sent);
  if(url.startsWith('https://api.resend.com/emails?'))return Response.json({object:'list',has_more:false,data:state.sent&&!state.hideSent?[state.sent]:[]});
  throw Error('Unmocked network request '+url);
 };
 const cache={};
 const load=file=>{
  if(cache[file])return cache[file];
  const module={exports:{}};cache[file]=module.exports;
  const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(code,{module,exports:module.exports,Date,URL,URLSearchParams,Headers,Response,Request,AbortSignal,process:{env},fetch,
   require:dep=>{
    if(dep.startsWith('node:'))return require(dep);
    if(dep==='./loadpro')return {requestLoadPro};
    if(dep.startsWith('@/'))return load('lib/'+dep.slice(6)+'.ts');
    if(dep.startsWith('./'))return load(path.posix.join(path.posix.dirname(file),dep)+'.ts');
    throw Error('Unmocked dependency '+dep);
   }});
  cache[file]=module.exports;return module.exports;
 };
 const service=load('lib/checkout/loadpro-trial-reminder-delivery.ts');
 const provider=load('lib/checkout/loadpro-reminder-resend.ts');
 const reservation=load('lib/checkout/loadpro-trial-reminder-reservation.ts');
 const row=async()=> (await db.query('select * from loadpro_trial_reminders order by created_at')).rows[0];
 const reserve=async()=>reservation.reserveAnnualTrialReminder(accessId,{status:'allowed',email:'qa@example.invalid',checkedAt:Date.now()});
 return {db,env,state,subscription,service,provider,reserve,row};
}

test('reminders never touch providers/storage in preview, test mode, default or competing channels',async t=>{
 const f=await fixture(t),original={...f.env};
 for(const patch of [{VERCEL_ENV:'preview'},{VERCEL_ENV:'development'},{VERCEL_ENV:undefined},{LOADPRO_TEST_MODE:'true'},
 {LOADPRO_ANNUAL_ENABLED:'false'},{LOADPRO_TRIAL_REMINDER_OWNER:'stripe'},{LOADPRO_STRIPE_TRIAL_REMINDER_DISABLED:'false'},{LOADPRO_TRIAL_REMINDER_DELIVERY_ENABLED:'false'}]) {
  Object.assign(f.env,original,patch);
  assert.equal((await f.service.deliverAnnualTrialReminder(accessId)).status,'disabled');
  assert.equal((await f.service.deliverReservedTrialReminder(accessId)).status,'disabled');
  assert.equal((await f.service.reconcileTrialReminder(accessId)).status,'disabled');
 }
 assert.equal(f.state.calls.length,0);assert.equal(await f.row(),undefined);
});

test('global unsubscribe, suppression, missing/unknown contact and provider errors never send or change contacts',async t=>{
 const f=await fixture(t);
 for(const patch of [
 {contact:{object:'contact',email:'qa@example.invalid',unsubscribed:true}},
 {contact:{object:'contact',email:'someoneelse@example.invalid',unsubscribed:false}},
 {contact:{object:'contact',email:'qa@example.invalid'}},
 {contactStatus:404,contact:{name:'not_found'}},
 {suppressionStatus:200,suppression:{object:'suppression',email:'qa@example.invalid',origin:'bounce'}},
 {suppressionStatus:503,suppression:{name:'error'}},
 {suppressionStatus:404,suppression:{name:'unknown'}}]) {
  Object.assign(f.state,{contact:{object:'contact',email:'qa@example.invalid',unsubscribed:false},contactStatus:200,suppression:{name:'not_found'},suppressionStatus:404},patch);
  assert.notEqual((await f.service.deliverAnnualTrialReminder(accessId)).status,'accepted');
 }
 assert.equal(f.state.postCount,0);assert.equal(await f.row(),undefined);
 assert.equal(f.state.calls.some(x=>x.method!=='GET'),false);
});

test('one atomic delivery claim under concurrent workers preserves one message and one idempotency key',async t=>{
 const f=await fixture(t),reserved=await f.reserve();
 const results=await Promise.all([f.service.deliverReservedTrialReminder(reserved.id),f.service.deliverReservedTrialReminder(reserved.id)]);
 assert.equal(results.filter(x=>x.status==='accepted').length,1);assert.equal(f.state.postCount,1);
 const row=await f.row();assert.equal(row.state,'sent');assert.equal(row.provider_email_id,mailId);assert.equal(row.provider_event,'accepted');
 assert.match(f.state.sent.text,/R\$ 49,90/);assert.match(f.state.sent.text,/R\$ 499\/ano/);assert.match(f.state.sent.text,/settings=security/);
 assert.equal(f.state.sent.to[0],'qa@example.invalid');
 assert.equal(f.state.calls.find(x=>x.method==='POST').headers['Idempotency-Key'],'loadpro-trial-'+reserved.id);
 assert.equal((await f.service.deliverAnnualTrialReminder(accessId)).status,'not_reserved');
 await f.service.deliverReservedTrialReminder(reserved.id);assert.equal(f.state.postCount,1);
});

test('generic suppression 404 never authorizes delivery without a complete successful list',async t=>{
 const f=await fixture(t);
 for(const patch of [
  {suppressionListStatus:404,suppressionList:{name:'not_found'}},
  {suppressionListStatus:403,suppressionList:{name:'restricted_api_key'}},
  {suppressionList:{object:'list',has_more:true,data:[]}},
  {suppressionList:{object:'list',has_more:false,data:[{}]}},
  {suppressionList:{object:'list',has_more:false,data:[{email:'qa@example.invalid'}]}}
 ]) {
  Object.assign(f.state,{suppressionListStatus:200},patch);
  assert.notEqual((await f.service.deliverAnnualTrialReminder(accessId)).status,'accepted');
 }
 assert.equal(f.state.postCount,0);assert.equal(await f.row(),undefined);
});

for(const failure of ['loseResponse','failRecord'])test(`read-only reconciliation repairs ${failure} without sending again`,async t=>{
 const f=await fixture(t);f.state[failure]=true;
 assert.equal((await f.service.deliverAnnualTrialReminder(accessId)).status,'uncertain');
 const row=await f.row();assert.equal(row.state,'uncertain');assert.ok(row.send_started_at);assert.ok(row.delivery_payload);
 f.state.loseResponse=false;assert.equal((await f.service.reconcileTrialReminder(row.id)).status,'recorded');
 assert.equal((await f.row()).state,'sent');assert.equal(f.state.postCount,1);
});

test('lost claim response before POST never results in a second claim or speculative email',async t=>{
 const f=await fixture(t);f.state.failClaimResponse=true;
 await assert.rejects(f.service.deliverAnnualTrialReminder(accessId),/Lost claim/);
 const row=await f.row();assert.equal(row.state,'uncertain');assert.equal(f.state.postCount,0);
 f.state.failClaimResponse=false;assert.equal((await f.service.deliverReservedTrialReminder(row.id)).status,'uncertain');
 assert.equal(f.state.postCount,0);
});

test('unknown or refused provider result stays closed across retries even without an email ID',async t=>{
 const f=await fixture(t);f.state.postStatus=429;
 assert.equal((await f.service.deliverAnnualTrialReminder(accessId)).status,'uncertain');
 const row=await f.row();for(let i=0;i<2;i++)assert.equal((await f.service.deliverReservedTrialReminder(row.id)).status,'uncertain');
 assert.equal(f.state.postCount,1);assert.equal((await f.row()).state,'uncertain');
});

for(const change of ['optout','annual','access-version','preference-version','expired-trial'])test(`atomic pre-send check blocks ${change} after application review`,async t=>{
 const f=await fixture(t),reserved=await f.reserve();
 f.state.beforeClaim=async()=>{
  if(change==='optout')await f.db.query("select set_loadpro_trial_offer_preference($1,false,'pt','loadpro-trial-offer-v1')",[userId]);
  if(change==='annual')await f.db.query('insert into loadpro_annual_changes values($1,now())',[accessId]);
  if(change==='access-version')await f.db.exec("update billing_access set updated_at=updated_at+interval '1 second'");
  if(change==='preference-version')await f.db.query("select set_loadpro_trial_offer_preference($1,true,'pt','loadpro-trial-offer-v1')",[userId]);
  if(change==='expired-trial')await f.db.exec("update billing_access set metadata=metadata||jsonb_build_object('trial_end',extract(epoch from now()-interval '1 hour'))");
 };
 assert.equal((await f.service.deliverReservedTrialReminder(reserved.id)).status,'not_claimed');assert.equal(f.state.postCount,0);
});

test('revalidation rejects changed Stripe subscription and unsubscribe since reservation',async t=>{
  const f=await fixture(t),reserved=await f.reserve();f.subscription.schedule='sched_annual';
  assert.equal((await f.service.deliverReservedTrialReminder(reserved.id)).status,'ineligible');
  delete f.subscription.schedule;f.subscription.livemode=false;
  assert.equal((await f.service.deliverReservedTrialReminder(reserved.id)).status,'ineligible');
  f.subscription.livemode=true;f.state.contact.unsubscribed=true;
 assert.equal((await f.service.deliverReservedTrialReminder(reserved.id)).status,'suppressed');assert.equal(f.state.postCount,0);
});

test('email reconciliation rejects same-looking mail with wrong tags, recipient, content or timing',async t=>{
 const f=await fixture(t);f.state.loseResponse=true;await f.service.deliverAnnualTrialReminder(accessId);
 const row=await f.row(),original=structuredClone(f.state.sent);
 for(const patch of [{tags:[]},{to:['someoneelse@example.invalid']},{text:'different'}, {created_at:'2000-01-01T00:00:00Z'},{cc:['other@example.invalid']}]) {
  f.state.sent={...original,...patch};assert.equal((await f.service.reconcileTrialReminder(row.id)).status,'uncertain');
  assert.equal((await f.row()).state,'uncertain');
 }
 assert.equal(f.state.postCount,1);
});

test('negative delivery events remain terminal and service-only RPCs cannot be called by clients',async t=>{
 const f=await fixture(t);await f.service.deliverAnnualTrialReminder(accessId);const row=await f.row();
 f.state.sent.last_event='complained';assert.equal((await f.service.reconcileTrialReminder(row.id)).event,'complained');
 assert.equal((await f.row()).state,'suppressed');
 f.state.sent.last_event='delivered';await f.service.reconcileTrialReminder(row.id);assert.equal((await f.row()).provider_event,'complained');
 await f.db.exec('set role authenticated');
 await assert.rejects(f.db.query('select record_loadpro_reminder_delivery($1,$2,$3)',[row.id,mailId,'sent']),/permission/);
 await assert.rejects(f.db.query("select claim_loadpro_reminder_delivery($1,now(),$2,$3,'{}',now())",[row.id,userId,'a'.repeat(64)]),/permission/);
 await assert.rejects(f.db.query('select * from loadpro_trial_reminders'),/permission/);
 await f.db.exec('reset role');assert.equal(f.state.postCount,1);
});

test('an uncertain operation is never re-posted after the provider idempotency window',async t=>{
 const f=await fixture(t);f.state.loseResponse=true;await f.service.deliverAnnualTrialReminder(accessId);const row=await f.row();
 await f.db.exec("update loadpro_trial_reminders set send_started_at=now()-interval '2 days'");
 f.state.hideSent=true;assert.equal((await f.service.deliverReservedTrialReminder(row.id)).status,'uncertain');
 assert.equal(f.state.postCount,1);assert.equal((await f.row()).state,'uncertain');
});

test('existing server-side mail settings work without creating another credential',async t=>{
 const f=await fixture(t);f.env.RESEND_API_KEY=f.env.LOADPRO_REMINDER_RESEND_API_KEY;f.env.EMAIL_FROM=f.env.LOADPRO_REMINDER_EMAIL_FROM;
 delete f.env.LOADPRO_REMINDER_RESEND_API_KEY;delete f.env.LOADPRO_REMINDER_EMAIL_FROM;
 assert.equal((await f.service.deliverAnnualTrialReminder(accessId)).status,'accepted');assert.equal(f.state.postCount,1);
});
