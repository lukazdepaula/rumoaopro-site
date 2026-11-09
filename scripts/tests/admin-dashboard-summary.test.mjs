import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { renderDashboard, sources } from './fixtures/admin-dashboard.mjs';

const mod = { exports: {} };
vm.runInNewContext(ts.transpileModule(readFileSync('lib/checkout/admin-dashboard-summary.ts','utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText, { module: mod, exports: mod.exports });
const { summarizeAdminRevenue, monthlyRevenueProgress } = mod.exports;
const metrics = (changes = {}) => ({state:'ready',grossRevenueBrl:600,netRevenueBrl:540,feesBrl:60,
  refundsBrl:0,paymentCount:2,hasUnconvertedCurrencies:false,sources:structuredClone(sources),...changes});

test('identified coaching is counted once and transfers, unclassified and outgoing payments never count', () => {
  const data=metrics();
  data.sources[1].externalReceipts.unclassified.grossRevenueBrl=5000;
  const result=summarizeAdminRevenue(data,true);
  assert.equal(result.grossRevenueBrl,900);
  assert.equal(result.netRevenueBrl,825);
  assert.equal(result.paymentCount,3);
  assert.equal(result.averageTicketBrl,300);
  assert.equal(result.siteRevenueBrl+result.courseRevenueBrl+result.coachingRevenueBrl,result.grossRevenueBrl);
  assert.equal(result.netRevenueBrl+result.feesBrl+result.refundsBrl,result.grossRevenueBrl);
});

test('incomplete sources, missing orders and unsupported currencies never become a complete total', () => {
  const cases=[metrics({state:'partial'}),metrics({hasUnconvertedCurrencies:true})];
  for (const change of ['missing','fallback','error','currency','missing-external','missing-source']) {
    const data=metrics();
    if(change==='currency')data.sources[0].externalReceipts.hasUnconvertedCurrencies=true;
    else if(change==='missing-external')delete data.sources[0].externalReceipts;
    else if(change==='missing-source')data.sources=data.sources.filter(source=>source.id!=='stripe');
    else data.sources[0].state=change;
    cases.push(data);
  }
  for (const data of cases) {
    const result=summarizeAdminRevenue(data,true);
    assert.equal(result.ready,false);
    assert.equal(result.grossRevenueBrl,null);
    assert.equal(result.paymentCount,null);
    assert.equal(result.averageTicketBrl,null);
  }
  assert.equal(summarizeAdminRevenue(metrics(),false).grossRevenueBrl,null);
});

test('a confirmed zero is zero revenue but has no average ticket', () => {
  const data=metrics({grossRevenueBrl:0,netRevenueBrl:0,feesBrl:0,paymentCount:0});
  for(const source of data.sources) {
    source.grossRevenueBrl=0;
    if(source.externalReceipts)for(const key of Object.keys(source.externalReceipts.coaching))source.externalReceipts.coaching[key]=0;
  }
  const result=summarizeAdminRevenue(data,true);
  assert.equal(result.grossRevenueBrl,0);
  assert.equal(result.averageTicketBrl,null);
});

test('operational amounts retain cent precision when combining sources', () => {
  const data=metrics({grossRevenueBrl:3150.17});
  data.sources[0].externalReceipts.coaching.grossRevenueBrl=1249.66;
  assert.equal(summarizeAdminRevenue(data,true).grossRevenueBrl,4399.83);
});

test('monthly goal measures only the current month, caps the ring but reports an exceeded target', () => {
  const progress=monthlyRevenueProgress(6123.45,15000,true);
  assert.ok(Math.abs(progress.percent-40.823)<0.00001);
  assert.equal(progress.remaining,8876.55);
  assert.equal(monthlyRevenueProgress(18000,15000,true).ringPercent,100);
  assert.equal(monthlyRevenueProgress(18000,15000,true).percent,120);
  assert.equal(monthlyRevenueProgress(18000,15000,true).exceeded,3000);
  assert.equal(monthlyRevenueProgress(0,15000,true).percent,0);
  for(const [revenue,goal,current] of [[null,15000,true],[900,15000,false],[900,0,true],[Infinity,15000,true]]) {
    assert.equal(monthlyRevenueProgress(revenue,goal,current),null);
  }
});

test('goal shows the approved target and hides progress for incomplete sources and other periods', async () => {
  const ready=await renderDashboard();
  assert.match(ready,/15\.000,00/);
  assert.match(ready,/data-testid="monthly-goal-progress">6%/);
  const partial=await renderDashboard({financialOverrides:{state:'partial'}});
  assert.match(partial,/data-testid="monthly-goal-progress">—/);
  const custom=await renderDashboard({searchParams:{range:'previous_month'}});
  assert.match(custom,/Selecione Mês atual/);
});

test('changing dates changes the headline and preserves custom dates in links', async () => {
  const html=await renderDashboard({searchParams:{range:'custom',from:'2026-09-01',to:'2026-09-20',compare:'0'}});
  assert.match(html,/Faturamento do período/);
  assert.doesNotMatch(html,/Faturamento do mês até hoje/);
  assert.match(html,/from=2026-09-01&amp;to=2026-09-20/);
  assert.match(html,/value="2026-09-20"/);
});

test('partial revenue is visibly unavailable and a forecast change cannot change cash received', async () => {
  const partial=await renderDashboard({financialOverrides:{state:'partial'}});
  assert.match(partial,/Conferência parcial/);
  assert.match(partial,/data-testid="operation-revenue">—/);
  const changed=await renderDashboard({recurringOverrides:{mrrBrlEstimate:50000}});
  assert.match(changed,/data-testid="operation-revenue">R\$\s*900,00/);
  assert.match(changed,/50\.000,00/);
});
