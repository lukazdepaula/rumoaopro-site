import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
function load(file,mocks={},extras={}) {
  const module={exports:{}};
  const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(code,{module,exports:module.exports,require:id=>{if(id in mocks)return mocks[id];throw Error('Unmocked '+id);},
    Date,URL,URLSearchParams,Headers,Response,Request,process:{env:{}},...extras});
  return module.exports;
}
const policy=load('lib/checkout/loadpro-annual-policy.ts');
const billing=load('lib/checkout/loadpro-billing-policy.ts');
function fixture(code='loadpro_founders',status='trialing') {
  const plan=policy.annualPlan(code),end=Math.floor(Date.now()/1000)+7*86400;
  const access={id:'access',email:'fixture@example.invalid',user_id:'coach',billing_provider:'stripe',access_kind:'subscription',
    plan_code:code,price_cents:plan.monthlyCents,currency:'BRL',current_period_end:new Date(end*1000).toISOString(),
    provider_subscription_id:'sub_fixture',provider_customer_id:'cus_fixture',team_limit:2,players_per_team_limit:plan.players,
    metadata:{billing_interval:'month',annual_change:{id:'change_fixture',payment_method:'card',state:'scheduled'}}};
  const change={id:'change_fixture',access_id:'access',user_id:'coach',state:'scheduled',confirmed_at:new Date().toISOString(),method:'card',
    quote:{plan_code:code,price_cents:plan.annualCents,effective_at:access.current_period_end},
    provider:{subscription_id:'sub_fixture',customer_id:'cus_fixture',schedule_id:'sched_fixture'}};
  const subscription={id:'sub_fixture',customer:'cus_fixture',status,schedule:'sched_fixture',current_period_start:end-7*86400,
    current_period_end:end,trial_start:status==='trialing'?end-7*86400:null,trial_end:status==='trialing'?end:null,
    latest_invoice:{status:'paid'},items:{data:[{quantity:1,price:{id:'price_monthly',unit_amount:plan.monthlyCents,currency:'brl',recurring:{interval:'month',interval_count:1}}}]}};
  const phase={start_date:end-7*86400,end_date:end,items:[{price:'price_monthly',quantity:1}]};
  const schedule={id:'sched_fixture',subscription:'sub_fixture',customer:'cus_fixture',status:'active',end_behavior:'release',
    current_phase:{start_date:phase.start_date,end_date:end},metadata:{loadpro_annual_change:change.id},
    default_settings:{default_payment_method:'pm_existing'},phases:[phase,{start_date:end,end_date:end+365*86400,items:[{price:'price_annual',quantity:1}]}]};
  const state={http:[],db:[],sync:[],loseResponse:false};
  const provider=load('lib/checkout/loadpro-annual-provider.ts',{'./loadpro-annual-policy':policy,'./loadpro-billing-policy':billing},{
    process:{env:{VERCEL_ENV:'preview',STRIPE_SECRET_KEY:'sk_test_fixture',STRIPE_LOADPRO_ANNUAL_PRICE_ID:'price_annual',STRIPE_LOADPRO_FOUNDERS_50_ANNUAL_PRICE_ID:'price_annual'}},
    fetch:async(url,init)=>{
      state.http.push({url,init});
      if(url.includes('/prices/'))return Response.json({id:'price_annual',active:true,currency:'brl',unit_amount:plan.annualCents,recurring:{interval:'year',interval_count:1}});
      if(url.includes('/subscriptions/'))return Response.json(subscription);
      assert.match(url,/\/subscription_schedules\/sched_fixture$/);
      if(init.method==='POST') {
        assert.ok(change.provider.cancellation,'consent must be durable before provider mutation');
        assert.equal(init.body.get('end_behavior'),'cancel');
        assert.equal(init.body.get('proration_behavior'),'none');
        assert.equal(init.body.get('phases[0][end_date]'),String(end));
        assert.equal(init.body.get('phases[0][items][0][price]'),'price_monthly');
        assert.equal(init.body.get('phases[1][start_date]'),null);
        assert.equal(init.body.get('phases[0][trial_end]'),status==='trialing'?String(end):null);
        assert.equal(init.headers['Idempotency-Key'],'annual:change_fixture:cancel-before-annual');
        schedule.phases=[phase];schedule.end_behavior='cancel';schedule.metadata.loadpro_cancel_change=change.id;
        subscription.cancel_at=end;
        if(state.loseResponse)throw Error('Lost provider response');
      }
      return Response.json(schedule);
    }
  });
  const service=load('lib/checkout/loadpro-annual-cancellation.ts',{
    './loadpro-annual':{getAnnualChange:async(id,userId)=>{assert.equal(id,change.id);assert.equal(userId,'coach');return structuredClone(change);},
      annualDb:async(path,init)=>{state.db.push({path,init});if(init.method==='PATCH')change.provider=JSON.parse(init.body).provider;return null;}},
    './loadpro-annual-provider':provider,'./loadpro-billing-policy':billing,'./loadpro-annual-policy':policy,
    './db':{getOrderByGatewayPaymentId:async()=>({customer_email:access.email})},
    './loadpro':{syncLoadProAccess:async(order,input)=>{state.sync.push(input);access.metadata.cancel_at_period_end=input.cancelAtPeriodEnd;}}
  });
  return {service,access,change,subscription,schedule,state,end};
}

for(const code of ['loadpro_founders','loadpro_founders_50'])for(const status of ['trialing','active']) {
  test(`${code} ${status}: cancellation keeps paid/free days and removes the annual charge, including repeat`,async()=>{
    const f=fixture(code,status),original=structuredClone(f.access);
    const quote=await f.service.quoteAnnualCancellation(f.access,'coach');
    assert.equal(quote.amount_cents,0);assert.equal(quote.cancelled,false);
    assert.equal(f.state.http.filter(c=>c.init.method==='POST').length,0);assert.equal(f.state.db.length,0);
    for(let repeat=0;repeat<2;repeat++) {
      const result=await f.service.cancelScheduledAnnual(f.access,'coach',quote.id,quote.cancel_at);
      assert.equal(result.cancelled,true);assert.equal(result.access_until,original.current_period_end);
    }
    assert.equal(f.state.http.filter(c=>c.init.method==='POST').length,1);
    assert.equal(f.subscription.id,original.provider_subscription_id);assert.equal(f.schedule.phases.length,1);
    assert.equal(f.schedule.default_settings.default_payment_method,'pm_existing');
    for(const write of f.state.sync) {assert.equal(write.currentPeriodEnd,f.end);assert.equal(write.cancelAtPeriodEnd,true);assert.equal(write.priceCents,original.price_cents);assert.equal(write.billingInterval,'month');}
    assert.equal(f.access.players_per_team_limit,original.players_per_team_limit);
  });
}

test('lost cancellation response is recovered without repeating a provider mutation',async()=>{
  const f=fixture();const quote=await f.service.quoteAnnualCancellation(f.access,'coach');f.state.loseResponse=true;
  await assert.rejects(f.service.cancelScheduledAnnual(f.access,'coach',quote.id,quote.cancel_at),/Lost provider response/);
  assert.equal(f.state.sync.length,0);
  f.state.loseResponse=false;
  const result=await f.service.cancelScheduledAnnual(f.access,'coach',quote.id,quote.cancel_at);
  assert.equal(result.cancelled,true);assert.equal(f.state.sync.length,1);
  assert.equal(f.state.http.filter(c=>c.init.method==='POST').length,1);
});

test('other accounts, wrong dates, annual phases and externally modified schedules fail before mutation',async()=>{
  const changes=[f=>f.access.user_id='other',f=>f.subscription.customer='other',f=>f.schedule.metadata.loadpro_annual_change='other',
    f=>f.schedule.subscription='other',f=>f.schedule.phases[0].add_invoice_items=[{}],f=>f.access.metadata.billing_interval='year',
    f=>f.change.quote.price_cents=1,f=>f.subscription.cancel_at=f.end,f=>f.subscription.status='past_due',
    f=>f.subscription.items.data[0].price.unit_amount=1,f=>f.schedule.phases[1].items[0].price='other',
    f=>f.schedule.phases[0].default_payment_method='pm_override',f=>f.schedule.phases[0].automatic_tax={enabled:true}];
  for(const mutate of changes) {
    const f=fixture();mutate(f);
    await assert.rejects(f.service.cancelScheduledAnnual(f.access,'coach','change_fixture',f.access.current_period_end));
    assert.equal(f.state.http.filter(c=>c.init.method==='POST').length,0);assert.equal(f.state.db.length,0);assert.equal(f.state.sync.length,0);
  }
  const f=fixture();await assert.rejects(f.service.cancelScheduledAnnual(f.access,'coach','change_fixture','2030-01-01Z'),/Review cancellation date/);
  assert.equal(f.state.db.length,0);
});

test('cancellation API requires authenticated matching owner and explicit date confirmation',async()=>{
  let changes=0;
  const route=load('app/api/loadpro/billing/annual/cancel/route.ts',{
    'next/server':{NextResponse:Response},'@/lib/checkout/loadpro':{resolveLoadProBillingAccess:async()=>({identity:{id:'coach'},access:{user_id:'coach'}})},
    '@/lib/checkout/loadpro-annual-cancellation':{quoteAnnualCancellation:async()=>({id:'change',cancel_at:'2030-01-01Z'}),cancelScheduledAnnual:async()=>{changes++;return {cancelled:true};}}
  });
  const headers={origin:'https://loadpro.rumoaopro.com.br',authorization:'Bearer fixture'};
  assert.equal((await route.GET(new Request('https://api.invalid/cancel',{headers:{origin:headers.origin}}))).status,401);
  assert.equal((await route.GET(new Request('https://api.invalid/cancel',{headers:{...headers,origin:'https://other.invalid'}}))).status,403);
  for(const body of [{},{id:'change',cancel_at:'2030-01-01Z',confirmed:false},{id:'change',confirmed:true}])
    assert.equal((await route.POST(new Request('https://api.invalid/cancel',{method:'POST',headers,body:JSON.stringify(body)}))).status,400);
  assert.equal(changes,0);
  // Cancellation remains available even when new annual offers are disabled.
  assert.equal((await route.POST(new Request('https://api.invalid/cancel',{method:'POST',headers,body:JSON.stringify({id:'change',cancel_at:'2030-01-01Z',confirmed:true})}))).status,200);
  assert.equal(changes,1);
});
