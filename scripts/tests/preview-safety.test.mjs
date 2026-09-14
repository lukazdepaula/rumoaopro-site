import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
const env={VERCEL_ENV:'preview',VERCEL:'1',LOADPRO_PREVIEW_INTEGRATION_ENABLED:'true',LOADPRO_TEST_SUPABASE_PROJECT_REF:'loadpro-sandbox',CHECKOUT_TEST_SUPABASE_PROJECT_REF:'site-sandbox',LOADPRO_SUPABASE_URL:'https://loadpro-sandbox.supabase.co',SUPABASE_URL:'https://site-sandbox.supabase.co',LOADPRO_SUPABASE_SERVICE_ROLE_KEY:'sb_secret_fixture',SUPABASE_SECRET_KEY:'sb_secret_fixture',LOADPRO_APP_URL:'https://loadpro-sandbox.vercel.app',NEXT_PUBLIC_SITE_URL:'https://site-sandbox.vercel.app',CHECKOUT_DB_DRIVER:'postgres',CHECKOUT_GATEWAY_MODE:'sandbox',STRIPE_SECRET_KEY:'sk_test_fixture'};
function load(file, settings, overrides={}) {
 const module={exports:{}};
 const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{module,exports:module.exports,process:{env:settings},URL,Headers,Response,console,fetch(){throw Error('Unexpected network request');},require(id){
  if(id==='@/lib/preview-safety') return load('lib/preview-safety.ts',settings);
  if(id==='next/server') return {NextResponse:{next:()=>({next:true}),json:(body,options)=>({body,...options})}};
  return {};
 },...overrides});return module.exports;
}
test('unconfigured preview blocks requests, configured isolated preview proceeds',()=>{
 const request={};
 assert.equal(load('middleware.ts',{VERCEL_ENV:'preview'}).middleware(request).status,503);
 assert.equal(load('middleware.ts',env).middleware(request).next,true);
});
test('production keeps current service configuration and middleware behavior',()=>{
 const settings={VERCEL_ENV:'production',STRIPE_SECRET_KEY:'sk_live_fixture',LOADPRO_SUPABASE_URL:'https://iqkzqdoyvxblnsgnsfbz.supabase.co'};
 const safety=load('lib/preview-safety.ts',settings);
 safety.assertPreviewIntegration();safety.assertPreviewProvider('STRIPE_SECRET_KEY',settings.STRIPE_SECRET_KEY);safety.assertPreviewDatabase(settings.LOADPRO_SUPABASE_URL,'loadpro');
 assert.equal(load('middleware.ts',settings).middleware({}).next,true);
});
test('inherited live keys, mismatched databases, production origins and live checkout fail closed',()=>{
 for(const patch of [{STRIPE_SECRET_KEY:'sk_live_fixture'},{MERCADO_PAGO_ACCESS_TOKEN:'APP_USR_fixture'}, {LOADPRO_SUPABASE_URL:'https://iqkzqdoyvxblnsgnsfbz.supabase.co'}, {LOADPRO_TEST_SUPABASE_PROJECT_REF:'iqkzqdoyvxblnsgnsfbz',LOADPRO_SUPABASE_URL:'https://iqkzqdoyvxblnsgnsfbz.supabase.co'},{SUPABASE_URL:'https://other.supabase.co'},{NEXT_PUBLIC_SITE_URL:'https://rumoaopro.com'}, {LOADPRO_APP_URL:'https://loadpro.rumoaopro.com.br'}, {CHECKOUT_GATEWAY_MODE:'live'},{LOADPRO_PREVIEW_INTEGRATION_ENABLED:'false'},{SUPABASE_SECRET_KEY:''}]) {
  assert.throws(()=>load('lib/preview-safety.ts',{...env,...patch}).assertPreviewIntegration());
  assert.equal(load('middleware.ts',{...env,...patch}).middleware({}).status,503);
 }
});
test('LoadPro auth/data boundary stops before any request to the production project',async()=>{
 const loadpro=load('lib/checkout/loadpro.ts',{...env,LOADPRO_SUPABASE_URL:'https://iqkzqdoyvxblnsgnsfbz.supabase.co'});
 await assert.rejects(loadpro.requestLoadPro('/rest/v1/billing_access'),/isolated database/);
 await assert.rejects(loadpro.resolveLoadProBillingAccess('fixture'),/isolated database/);
});
test('preview email and marketing stay disabled even with inherited sending credentials',async()=>{
 const settings={...env,EMAIL_PROVIDER:'resend',RESEND_API_KEY:'fake-key',META_ACCESS_TOKEN:'fake-token'};
 const email=load('lib/checkout/email.ts',settings);
 assert.equal(email.isEmailDeliveryConfigured(),false);
 assert.equal(await email.sendEmail({to:'fixture@example.invalid',subject:'Test',html:'Test'}),false);
 const meta=load('lib/marketing/meta.ts',settings);
 assert.equal((await meta.sendMetaEvent({dataset:'loadpro'})).reason,'preview_disabled');
});
test('non-LoadPro database access is blocked until that separate sandbox is pinned',()=>{
 const safety=load('lib/preview-safety.ts',env);
 assert.throws(()=>safety.assertPreviewDatabase('https://raptor-live.supabase.co','raptorpro'));
});
test('public links never send a preview customer to the production app',()=>{
 assert.equal(load('lib/preview-safety.ts',{VERCEL_ENV:'production'}).publicLoadProAppUrl(),'https://loadpro.rumoaopro.com.br/');
 for(const LOADPRO_APP_URL of [undefined,'https://loadpro.rumoaopro.com.br','https://user:secret@example.invalid','https://preview.vercel.app/?token=fixture']) assert.equal(load('lib/preview-safety.ts',{VERCEL_ENV:'preview',LOADPRO_APP_URL}).publicLoadProAppUrl(),'');
 assert.equal(load('lib/preview-safety.ts',env).publicLoadProAppUrl(),'https://loadpro-sandbox.vercel.app/');
});

test('sandbox provisioning needs a separate opt-in and all preview boundaries',()=>{
 const enabled={...env,LOADPRO_PREVIEW_PROVISIONING_ENABLED:'true'};
 assert.equal(load('lib/preview-safety.ts',env).canProvisionLoadProSandbox(),false);
 assert.equal(load('lib/preview-safety.ts',enabled).canProvisionLoadProSandbox(),true);
 for(const patch of [{STRIPE_SECRET_KEY:'sk_live_fixture'},{LOADPRO_SUPABASE_URL:'https://iqkzqdoyvxblnsgnsfbz.supabase.co'},{LOADPRO_PREVIEW_INTEGRATION_ENABLED:'false'}]) {
  assert.throws(()=>load('lib/preview-safety.ts',{...enabled,...patch}).canProvisionLoadProSandbox());
 }
 assert.equal(load('lib/preview-safety.ts',{...enabled,VERCEL_ENV:'production',LOADPRO_TEST_MODE:'true'}).canProvisionLoadProSandbox(),false);
});

async function subscriptionEvent(settings, sandbox=true) {
 const order={id:'sandbox-order',product_id:'loadpro_founders',metadata:{checkout_gateway_mode:sandbox?'sandbox':'live'}};
 const calls=[];
 const mocks={
  '@/lib/preview-safety':load('lib/preview-safety.ts',settings),
  '@/lib/checkout/db':{getOrderById:async()=>order,updateOrderGatewayIds:async(id,data)=>{calls.push({kind:'metadata',data});},appendOrderLog:async()=>{}},
  '@/lib/checkout/loadpro':{isLoadProOrder:()=>true,syncLoadProAccess:async(order,input)=>{calls.push({kind:'access',input});return {};}}
 };
 const events=load('lib/checkout/order-events.ts',settings,{require:id=>mocks[id]||{}});
 await events.syncOrderSubscription(order.id,'active',{provider_subscription_id:'sub_test',current_period_end:2000000000},{invite:true});
 return calls;
}

test('approved sandbox subscription updates isolated access without sending an invitation',async()=>{
 const calls=await subscriptionEvent({...env,LOADPRO_PREVIEW_PROVISIONING_ENABLED:'true'});
 const accesses=calls.filter(call=>call.kind==='access');
 assert.equal(accesses.length,1);
 assert.equal(accesses[0].input.invite,false);
 assert.equal(accesses[0].input.providerSubscriptionId,'sub_test');
 assert.equal(accesses[0].input.currentPeriodEnd,2000000000);
 assert.ok(calls.some(call=>call.data?.metadata?.loadpro_provisioning_status==='synced'));
});

test('sandbox orders still cannot provision on production or a non-enabled preview',async()=>{
 for(const settings of [env,{...env,VERCEL_ENV:'production',LOADPRO_TEST_MODE:'true',LOADPRO_PREVIEW_PROVISIONING_ENABLED:'true'}]) {
  const calls=await subscriptionEvent(settings);
  assert.equal(calls.some(call=>call.kind==='access'),false);
  assert.ok(calls.some(call=>call.data?.metadata?.loadpro_provisioning_status==='sandbox_skipped'));
 }
});

test('production live subscription keeps its existing invitation and access flow',async()=>{
 const calls=await subscriptionEvent({VERCEL_ENV:'production'},false);
 assert.equal(calls.filter(call=>call.kind==='access').length,1);
 assert.equal(calls.find(call=>call.kind==='access').input.invite,true);
});


test('preview checkout return tokens use a separate purpose-bound test key',()=>{
 const production={VERCEL_ENV:'production',NODE_ENV:'production',CHECKOUT_ACCESS_SECRET:'production-secret-fixture'};
 const preview={...env,NODE_ENV:'production',CHECKOUT_ACCESS_SECRET:production.CHECKOUT_ACCESS_SECRET};
 const access=settings=>load('lib/checkout/checkout-access.ts',settings,{Buffer,require:id=>id==='node:crypto'?{default:crypto}:load('lib/preview-safety.ts',settings)});
 const live=access(production), isolated=access(preview);
 const token=isolated.createCheckoutAccessToken('same-order');
 assert.equal(isolated.verifyCheckoutAccessToken('same-order',token),true);
 assert.equal(live.verifyCheckoutAccessToken('same-order',token),false);
 assert.equal(isolated.verifyCheckoutAccessToken('same-order',live.createCheckoutAccessToken('same-order')),false);
 assert.equal(access({...preview,CHECKOUT_ACCESS_SECRET:'different-inherited-secret'}).verifyCheckoutAccessToken('same-order',token),true);
 assert.equal(access({...preview,NEXT_PUBLIC_SITE_URL:'https://another-preview.vercel.app'}).verifyCheckoutAccessToken('same-order',token),false);
 assert.throws(()=>access({...preview,STRIPE_SECRET_KEY:'sk_live_fixture'}).createCheckoutAccessToken('same-order'));
});

test('isolated checkout reservation blocks a second subscription before creating any order or provider session',async()=>{
 let ready=0,reserved=0,created=0;
 const settings={...env,LOADPRO_PREVIEW_PROVISIONING_ENABLED:'true'};
 const mocks={
  'next/server':{NextResponse:{json:(body,options)=>({body,...options})}},
  '@/lib/preview-safety':load('lib/preview-safety.ts',settings),
  '@/lib/checkout/request-security':{isSameSiteRequest:()=>true,readJsonBody:async()=>({ok:true,data:{}})},
  '@/lib/checkout/checkout-access':{isCheckoutAccessConfigured:()=>true},
  '@/lib/checkout/validation':{validateCheckoutInput:()=>({productSlug:'loadpro-founders',country:'BR',email:'fixture@example.invalid',locale:'pt'}),isBrazil:()=>true},
  '@/lib/checkout/products':{getProductBySlug:()=>({id:'loadpro_founders',type:'subscription'}),isLoadProProductId:()=>true},
  '@/lib/checkout/loadpro':{assertLoadProProvisioningReady:async()=>{ready++;},reserveLoadProCheckout:async()=>{reserved++;return {allowed:false};}},
  '@/lib/checkout/db':{createOrder:async()=>{created++;throw Error('must not create another order');}}
 };
 const endpoint=load('app/api/checkout/start/route.ts',settings,{require:id=>mocks[id]||{}});
 const response=await endpoint.POST({url:settings.NEXT_PUBLIC_SITE_URL+'/api/checkout/start'});
 assert.equal(response.status,409);
 assert.equal(response.body.code,'LOADPRO_USE_EXISTING_ACCOUNT');
 assert.equal(response.body.loginUrl,settings.LOADPRO_APP_URL+'/?view=login');
 assert.equal(ready,1);assert.equal(reserved,1);assert.equal(created,0);
});


test('explicitly disabled Pix allows Stripe QA but cannot make a Pix provider request',()=>{
 const settings={...env,MERCADO_PAGO_ACCESS_TOKEN:'disabled'};
 const safety=load('lib/preview-safety.ts',settings);
 safety.assertPreviewIntegration();
 assert.throws(()=>safety.assertPreviewProvider('MERCADO_PAGO_ACCESS_TOKEN','disabled'),/Pix/);
 assert.throws(()=>load('lib/preview-safety.ts',{...settings,MERCADO_PAGO_ACCESS_TOKEN:'APP_USR_live_fixture'}).assertPreviewIntegration(),/Pix/);
});
