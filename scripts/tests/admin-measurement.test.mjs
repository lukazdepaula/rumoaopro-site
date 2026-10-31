import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
import { DatabaseSync } from 'node:sqlite';
import { renderDashboard } from './fixtures/admin-dashboard.mjs';

function load(source, globals = {}) {
  const module = { exports: {} };
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022
  }}).outputText, { module, exports: module.exports, Date, URLSearchParams, ...globals });
  return module.exports;
}
const funnel = load(readFileSync('lib/checkout/analytics-funnel.ts', 'utf8')).summarizeFunnel;
const {readReportingPages} = load(readFileSync('lib/checkout/reporting-pagination.ts', 'utf8'));
const event = (extra = {}) => ({id:'e', type:'product_view', session_id:'s', product_id:'p',
  locale:'pt', marketing_consent:'granted', created_at:'2026-10-15T10:00:00Z', ...extra});
const order = (extra = {}) => ({id:'o', status:'paid', product_id:'p', created_at:'2026-10-15T10:01:00Z',
  metadata:{marketing_consent:'granted',marketing_session_id:'s'}, ...extra});

test('funnel counts one session/product across consent, path and language replays', () => {
  const result = funnel([event({marketing_consent:'denied'}),event(),event({locale:'en',path:'/en/p'}),
    event({product_id:'other'}),event({type:'checkout_click'}),event({type:'checkout_click'}),
    event({session_id:''})], []);
  assert.equal(result.views,2);
  assert.equal(result.clicks,1);
  assert.equal(result.measurableViews,2);
});

test('conversion joins consenting sessions by product and time, not total paid orders', () => {
  const result=funnel([event(),event({session_id:'no-sale'})],[order(),order({id:'repeat'}),
    order({id:'external',metadata:{}}),order({id:'denied',metadata:{marketing_consent:'denied',marketing_session_id:'s'}}),
    order({id:'earlier',created_at:'2026-10-15T09:00:00Z'}),order({id:'wrong-product',product_id:'other'}),
    order({id:'refund',status:'refunded'})]);
  assert.equal(result.sales,6);
  assert.equal(result.convertedSessions,1);
  assert.equal(result.conversion,50);
  assert.equal(result.unlinkedSales,4);
});

test('missing consent/history produces unavailable conversion, not zero or over 100 percent', () => {
  assert.equal(funnel([event({marketing_consent:null})],[order()]).conversion,null);
  assert.equal(funnel([], [order(),order()]).conversion,null);
  assert.equal(funnel([event()],[order(),order(),order()]).conversion,100);
});

test('a short database page is not treated as the end of the report', async () => {
  const data=Array.from({length:2505},(_,i)=>i), offsets=[];
  const rows=await readReportingPages(async offset=>{offsets.push(offset);return data.slice(offset,offset+417);});
  assert.equal(rows.length,2505);
  assert.equal(offsets.at(-1),2505);
});

test('pagination fails closed on repeated pages or malformed data', async () => {
  await assert.rejects(readReportingPages(async()=>({})),/Invalid reporting/);
  await assert.rejects(readReportingPages(async()=>[1]),/safety limit/);
});

const dbSource=ts.createSourceFile('db.ts',readFileSync('lib/checkout/db.ts','utf8'),ts.ScriptTarget.Latest,true);
const definitions=dbSource.statements.filter(s=>ts.isFunctionDeclaration(s)&&
  ['normalizeAnalyticsEvent','listAnalyticsEvents','listOrders'].includes(s.name?.text)).map(s=>s.getText(dbSource)).join('\n');
function dbFixture(extra={}) {
  return load(definitions, {useSupabaseDriver:()=>true, ensureSupabaseSeeded:async()=>{}, readReportingPages,
    eq:(key,value)=>`${key}=eq.${value}`,selectQuery:parts=>parts.join('&'),
    parseMetadata:value=>typeof value==='string'?JSON.parse(value):value||{},
    normalizeOrder:o=>o,isAdminDeletedOrder:()=>false,nowIso:()=> '2026-10-30T12:00:00Z', ...extra});
}

test('analytics bounds are sent on every page, stable ties are ordered, consent survives normalization', async () => {
  const from=new Date('2026-10-01T03:00:00Z'),to=new Date('2026-10-02T03:00:00Z');
  const data=Array.from({length:1203},(_,i)=>({id:String(i),event_id:String(i),created_at:from.toISOString(),
    payload:{...event(),attribution:{consent:'granted'}}}));
  const api=dbFixture({supabaseRequest:async(table,{query})=>{
    assert.equal(table,'webhook_events');const q=new URLSearchParams(query);
    assert.deepEqual(q.getAll('created_at'),['lt.'+to.toISOString(),'gte.'+from.toISOString()]);
    assert.equal(q.get('order'),'created_at.asc,id.asc');
    const offset=Number(q.get('offset'));return data.slice(offset,offset+250);
  }});
  const rows=await api.listAnalyticsEvents(from,to);
  assert.equal(rows.length,1203);
  assert.equal(rows[0].marketing_consent,'granted');
});

test('financial order index loads beyond 500 and retains filters on every page', async () => {
  const data=Array.from({length:602},(_,i)=>({id:String(i),created_at:'2026-10-02T00:00:00Z'}));
  const api=dbFixture({supabaseRequest:async(table,{query})=>{
    assert.equal(table,'orders');const q=new URLSearchParams(query);
    assert.equal(q.get('status'),'eq.paid');assert.equal(q.get('gateway'),'eq.stripe');
    assert.equal(q.get('created_at'),'lt.2026-10-30T12:00:00Z');
    assert.equal(q.get('order'),'created_at.asc,id.asc');
    const offset=Number(q.get('offset'));return data.slice(offset,offset+200);
  }});
  assert.equal((await api.listOrders({status:'paid',gateway:'stripe'},{complete:true})).length,602);
});

test('SQLite honors the exclusive end date and preserves more than the old 10000-event cap', async () => {
  const db=new DatabaseSync(':memory:');
  try {
    db.exec('CREATE TABLE webhook_events(id TEXT, event_id TEXT, provider TEXT, payload TEXT, created_at TEXT)');
    const insert=db.prepare('INSERT INTO webhook_events VALUES(?,?,?,?,?)');
    for(let i=0;i<10002;i++) insert.run(String(i),String(i),'analytics',JSON.stringify(event()),'2026-10-01T12:00:00.000Z');
    insert.run('end','end','analytics',JSON.stringify(event()),'2026-10-02T03:00:00.000Z');
    const api=dbFixture({useSupabaseDriver:()=>false,getDatabase:()=>db});
    assert.equal((await api.listAnalyticsEvents(new Date('2026-10-01T03:00:00Z'),new Date('2026-10-02T03:00:00Z'))).length,10002);
  } finally {db.close();}
});

test('dashboard keeps course out of programs and the MRR-plus-programs indicator', async () => {
  const html=await renderDashboard();
  const combined=html.split('Indicador mensal combinado')[1].split('</article>')[0];
  assert.match(combined,/1\.200,00/);
  assert.doesNotMatch(combined,/1\.600,00/);
  assert.match(combined.split('Programas no período')[1].split('Curso ·')[0],/200,00/);
  assert.match(combined.split('Curso · Preparador PRO')[1],/400,00/);
  assert.match(html,/Recebimentos fora do checkout/);
  assert.match(html,/900,00/); // 600 linked + 300 external; 285 transfer excluded.
});

test('missing orders or analytics suppresses conversion and operation totals', async () => {
  const html=await renderDashboard({unavailable:true});
  assert.match(html,/Conversão indisponível/);
  assert.match(html,/Total da operação indisponível/);
  assert.doesNotMatch(html,/900,00/);
});
