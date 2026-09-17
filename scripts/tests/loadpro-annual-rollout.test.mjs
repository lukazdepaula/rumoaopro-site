import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const require=createRequire(import.meta.url);
const source=ts.transpileModule(readFileSync('components/loadpro-promo.tsx','utf8'),{
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}
}).outputText;
function render(locale,enabled) {
 const module={exports:{}};
 vm.runInNewContext(source,{module,exports:module.exports,Intl,encodeURIComponent,process:{env:{
  LOADPRO_ANNUAL_ENABLED:enabled,NEXT_PUBLIC_LOADPRO_APP_URL:'https://loadpro.rumoaopro.com.br/'
 }},require:id=>{
  if(id==='next/image')return ({src,alt})=>React.createElement('img',{src,alt});
  if(id==='next/link')return ({children,...props})=>React.createElement('a',props,children);
  if(['react/jsx-runtime','lucide-react'].includes(id))return require(id);
  throw Error('Unexpected dependency '+id);
 }});
 return renderToStaticMarkup(React.createElement(module.exports.LoadProPromo,{locale}));
}
for(const locale of ['pt','en']) {
 test(`sales rollout ${locale}: monthly checkouts remain available while disabled or unconfigured`,()=>{
  for(const flag of [undefined,'false','TRUE','1']) {
   const html=render(locale,flag);
   assert.equal((html.match(/data-loadpro-monthly/g)||[]).length,2);
   assert.match(html,/checkout\/loadpro-founders"/);assert.match(html,/checkout\/loadpro-founders-50"/);
   assert.match(html,locale==='pt'?/49,90/:/49\.90/);assert.match(html,locale==='pt'?/69,90/:/69\.90/);
   assert.doesNotMatch(html,/data-loadpro-annual|subscription=annual|499|699|Escolha como pagar|Choose how to pay|sem parcelamento|no installments/);
  }
 });
 test(`sales rollout ${locale}: explicit enable exposes both annual prices and authenticated choices`,()=>{
  const html=render(locale,'true');
  assert.equal((html.match(/data-loadpro-monthly/g)||[]).length,2);
  assert.equal((html.match(/data-loadpro-annual/g)||[]).length,2);
  assert.match(html,/499/);assert.match(html,/699/);assert.match(html,/settings=security/);assert.match(html,/subscription=annual/);
  assert.match(html,locale==='pt'?/sem parcelamento/:/no installments/);
 });
}