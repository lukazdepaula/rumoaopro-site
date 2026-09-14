import assert from 'node:assert/strict';
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
