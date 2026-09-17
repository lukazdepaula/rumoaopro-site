import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
import {PGlite} from '@electric-sql/pglite';
function load(file,mocks={},env={}) {
 const module={exports:{}};
 const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{module,exports:module.exports,require:id=>{if(id in mocks)return mocks[id];throw Error('Unmocked '+id);},Date,URL,Response,Headers,Request,process:{env}});
 return module.exports;
}
const user='20000000-0000-4000-8000-000000000001',other='20000000-0000-4000-8000-000000000002',id='10000000-0000-4000-8000-000000000001';
const terms='loadpro-trial-offer-v1';
const policy=load('lib/checkout/loadpro-annual-policy.ts');
const prepare=load('lib/checkout/loadpro-annual-reminder.ts',{'./loadpro-annual-policy':policy});
function accessFixture(){const end=Date.now()+86400000;return {id,user_id:user,email:'qa@example.invalid',access_kind:'subscription',status:'active',plan_code:'loadpro_founders',price_cents:4990,currency:'BRL',billing_provider:'stripe',provider_subscription_id:'sub_fixture',provider_customer_id:'cus_fixture',updated_at:new Date().toISOString(),metadata:{provider_subscription_status:'trialing',trial_start:new Date(end-7*86400000).toISOString(),trial_end:new Date(end).toISOString()}};}
const options=()=>({now:Date.now(),offerConsent:true,suppressed:false,existingTrialReminder:false,deliveredKeys:new Set(),appUrl:'https://loadpro.example.invalid'});
test('draft rejects unknown suppression, non-seven-day trials and misleading states; links go to authenticated settings',()=>{
 const a=accessFixture();const draft=prepare.prepareAnnualTrialReminder(a,options());assert.ok(draft);assert.match(draft.text,/settings=notifications/);
 for(const patch of [{suppressed:undefined},{offerConsent:undefined},{existingTrialReminder:undefined}])assert.equal(prepare.prepareAnnualTrialReminder(a,{...options(),...patch}),null);
 for(const patch of [{status:'canceled'},{access_kind:'lifetime'},{metadata:{...a.metadata,trial_start:a.metadata.trial_end}},{metadata:{...a.metadata,trial_start:'invalid'}},{metadata:{...a.metadata,trial_start:new Date(Date.now()+2*86400000).toISOString()}}])assert.equal(prepare.prepareAnnualTrialReminder({...a,...patch},options()),null);
 for(const appUrl of ['https://user:secret@example.invalid','ftp://localhost'])assert.throws(()=>prepare.prepareAnnualTrialReminder(a,{...options(),appUrl}),/Invalid/);
});

test('Postgres reservation is unique, rechecks ownership/state/consent, and withdrawal suppresses existing drafts',async()=>{
 const db=new PGlite();
 try {
 await db.exec('create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create table billing_access(id uuid primary key,user_id uuid,status text,access_kind text,billing_provider text,currency text,provider_subscription_id text,provider_customer_id text,plan_code text,price_cents integer,metadata jsonb,updated_at timestamptz);create table loadpro_annual_changes(access_id uuid,confirmed_at timestamptz);');
 const migration=readFileSync('supabase/loadpro-annual-reminders.sql','utf8');await db.exec(migration);await db.exec(migration);
 await db.query('insert into auth.users values($1),($2)',[user,other]);
 const a=accessFixture();
 await db.query('insert into billing_access values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',[id,user,a.status,a.access_kind,a.billing_provider,a.currency,a.provider_subscription_id,a.provider_customer_id,a.plan_code,a.price_cents,JSON.stringify(a.metadata),a.updated_at]);
 const save=async(uid,enabled)=> (await db.query('select * from set_loadpro_trial_offer_preference($1,$2,$3,$4)',[uid,enabled,'pt',terms])).rows[0];
 const pref=await save(user,true);
 const reserve=(version=pref.version, accessVersion=a.updated_at)=>(db.query('select reserve_loadpro_trial_reminder($1,$2,$3,$4,$5) as id',[id,accessVersion,version,a.metadata.trial_end,'a'.repeat(64)])).then(r=>r.rows[0].id);
 assert.equal(await reserve((await save(other,true)).version),null,'another user preference must not authorize this user');
 assert.equal(await reserve(pref.version,new Date(Date.now()+2000).toISOString()),null,'stale access is rejected');
 await db.query("update billing_access set metadata=metadata || '{\"annual_change\":{\"state\":\"paid\"}}'::jsonb");assert.equal(await reserve(),null);
 await db.query('update billing_access set metadata=$1',[JSON.stringify(a.metadata)]);
 await db.query('insert into loadpro_annual_changes values($1,now())',[id]);assert.equal(await reserve(),null,'durable confirmation excludes even before access metadata catches up');
 await db.exec('delete from loadpro_annual_changes');
 const two=await Promise.all([reserve(),reserve()]);assert.equal(two.filter(Boolean).length,1,'one reservation across concurrent/repeated invocations');
 await save(user,false);assert.equal((await db.query('select state from loadpro_trial_reminders')).rows[0].state,'suppressed');
 const enabledAgain=await save(user,true);assert.equal(await reserve(enabledAgain.version),null,'opting back in must not duplicate the same reminder');
 await db.exec('set role authenticated');await assert.rejects(db.query('select * from loadpro_communication_preferences'),/permission/);await assert.rejects(db.query('select set_loadpro_trial_offer_preference($1,true,$2,$3)',[other,'pt',terms]),/permission/);await db.exec('reset role');
 assert.equal((await db.query("select count(*)::int as n from pg_class where relname in ('loadpro_communication_preferences','loadpro_trial_reminders') and relrowsecurity")).rows[0].n,2);
 } finally {await db.close();}
});

function serviceFixture(env={LOADPRO_TRIAL_REMINDER_OWNER:'loadpro',LOADPRO_STRIPE_TRIAL_REMINDER_DISABLED:'true'}) {
 const access=accessFixture(),calls=[],subscription={id:'sub_fixture',customer:'cus_fixture',status:'trialing',trial_end:Date.parse(access.metadata.trial_end)/1000};
 let preference={user_id:user,annual_trial_offer:true,terms_version:terms,version:'version1',locale:'pt'},reserved=false;
 const storage={getReminderPreference:async()=>preference,TRIAL_OFFER_TERMS:terms,reminderDb:async(path,init)=>{calls.push({path,init});if(path.startsWith('billing_access?'))return [access];if(path==='rpc/reserve_loadpro_trial_reminder'){if(reserved)return null;reserved=true;return 'reservation1';}throw Error(path);}};
 const service=load('lib/checkout/loadpro-trial-reminder-reservation.ts',{'node:crypto':{createHash},'./loadpro-reminder-preferences':storage,'./loadpro-annual-reminder':prepare,'./loadpro-annual-provider':{annualStripe:async()=>subscription,validateMonthlySubscription:()=>{}},'@/lib/preview-safety':{publicLoadProAppUrl:()=> 'https://loadpro.example.invalid'}},env);
 return {service,access,calls,subscription,setPref:p=>{preference=p;}};
}
test('default/unknown/existing Stripe channel and suppressed or stale communication checks reserve nothing',async()=>{
 for(const env of [{},{LOADPRO_TRIAL_REMINDER_OWNER:'stripe'},{LOADPRO_TRIAL_REMINDER_OWNER:'loadpro'}]) {const f=serviceFixture(env);assert.equal(await f.service.reserveAnnualTrialReminder(id,{status:'allowed',checkedAt:Date.now()}),null);assert.equal(f.calls.length,0);}
 for(const communication of [{status:'unknown',checkedAt:Date.now()},{status:'suppressed',checkedAt:Date.now()},{status:'allowed',checkedAt:Date.now()-61000},{status:'allowed',checkedAt:Date.now()+61000}]){const f=serviceFixture();assert.equal(await f.service.reserveAnnualTrialReminder(id,communication),null);assert.equal(f.calls.length,0);}
});
test('fresh provider scheduling/cancellation prevents drafts; lost reservation response cannot generate another message',async()=>{
 for(const patch of [{schedule:'sched_other'},{cancel_at:123},{cancel_at_period_end:true},{status:'active'},{trial_end:1},{id:'sub_other'}]){const f=serviceFixture();Object.assign(f.subscription,patch);assert.equal(await f.service.reserveAnnualTrialReminder(id,{status:'allowed',checkedAt:Date.now()}),null);assert.equal(f.calls.some(x=>x.path.startsWith('rpc/')),false);}
 const f=serviceFixture();const first=await f.service.reserveAnnualTrialReminder(id,{status:'allowed',checkedAt:Date.now()});assert.equal(first.status,'reserved_for_review');assert.match(first.draft.text,/R\$ 499\/ano/);assert.equal(await f.service.reserveAnnualTrialReminder(id,{status:'allowed',checkedAt:Date.now()}),null);
 const rpc=f.calls.find(x=>x.init);assert.match(JSON.parse(rpc.init.body).p_payload_hash,/^[0-9a-f]{64}$/);
});
test('preferences API authenticates ownership, ignores injected account IDs, validates explicit choice and permits opt-out with annual off',async()=>{
 let resolved=null;const calls=[];
 const route=load('app/api/loadpro/billing/annual/preferences/route.ts',{'next/server':{NextResponse:{json:(body,options)=>({body,...options})}},'@/lib/checkout/loadpro':{resolveLoadProBillingAccess:async()=>resolved},'@/lib/checkout/loadpro-reminder-preferences':{TRIAL_OFFER_TERMS:terms,getReminderPreference:async uid=>{calls.push(uid);return null;},setReminderPreference:async(uid,enabled)=>{calls.push({uid,enabled});return {annual_trial_offer:enabled};}}});
 const request=(body,headers={})=>new Request('https://site.example.invalid/api/loadpro/billing/annual/preferences',{method:body?'POST':'GET',headers:{origin:'https://loadpro.rumoaopro.com.br',authorization:'Bearer fixture',...headers},...(body?{body:JSON.stringify(body)}:{})});
 assert.equal((await route.GET(request(null,{origin:'https://evil.invalid'}))).status,403);
 assert.equal((await route.GET(request(null,{authorization:''}))).status,401);
 assert.equal((await route.GET(request())).status,401);
 resolved={identity:{id:user},access:{user_id:other}};assert.equal((await route.GET(request())).status,401);
 resolved={identity:{id:user},access:{user_id:user}};assert.equal((await route.GET(request())).body.preference.enabled,false);
 assert.equal((await route.POST(request({enabled:'yes',locale:'pt',terms_version:terms}))).status,400);
 const result=await route.POST(request({enabled:false,locale:'pt',terms_version:terms,user_id:other}));assert.equal(result.body.preference.enabled,false);assert.deepEqual(calls.at(-1),{uid:user,enabled:false});
});
