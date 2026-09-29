import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const product = { id: 'loadpro_founders', name: 'LoadPro', type: 'subscription' };
function load(file, fetch, env = {}, mocks = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX }
  }).outputText;
  vm.runInNewContext(code, {
    module, exports: module.exports, URL, URLSearchParams, AbortSignal, fetch,
    console: { error() {} }, process: { env },
    require(id) {
      if (id in mocks) return mocks[id];
      if (id === 'server-only') return {};
      if (id === '@/lib/checkout/products') return { checkoutProducts: [product] };
      throw Error(`Unmocked import: ${id}`);
    }
  });
  return module.exports;
}
const json = (body, status = 200) => new Response(JSON.stringify(body), { status });
const period = {
  preset: 'custom', startKey: '2026-09-01', endKey: '2026-09-30',
  start: new Date('2026-09-01T03:00:00Z'), end: new Date('2026-10-01T03:00:00Z'),
  days: 30, isCurrentMonth: false, label: 'Fixture'
};
const transaction = (id, source, extra = {}) => ({
  id, source, amount: 4990, fee: 200, net: 4790, currency: 'brl',
  reporting_category: 'charge', created: Date.parse('2026-09-28T12:00:00Z') / 1000, ...extra
});
const linked = id => ({ id, metadata: { product_id: product.id } });
const finance = fetch => load('lib/checkout/financial-reporting.ts', fetch, { STRIPE_SECRET_KEY: 'fixture' });
const stripeSource = async api => (await api.getFinancialPeriodMetrics(period, [])).sources.find(s => s.id === 'stripe');

test('Stripe reconciles linked payments, refunds and genuine external transactions without duplicates', async () => {
  const paid = transaction('txn_paid', linked('ch_paid'));
  const api = finance(async url => {
    if (url.pathname.endsWith('/balance_transactions')) return json({ data: [
      paid, paid,
      transaction('txn_refund', linked('re_refund'), { reporting_category: 'refund', amount: -1000, net: -1000, fee: 0 }),
      transaction('txn_external', 'ch_external'),
      transaction('txn_payout', 'ch_never_fetch', { reporting_category: 'payout' })
    ], has_more: false });
    assert.equal(url.pathname, '/v1/charges/ch_external');
    return json({ id: 'ch_external', metadata: {} });
  });
  const result = await stripeSource(api);
  assert.equal(result.state, 'ready');
  assert.equal(result.paymentCount, 1);
  assert.equal(result.grossRevenueBrl, 49.9);
  assert.equal(result.netRevenueBrl, 37.9);
  assert.equal(result.feesBrl, 2);
  assert.equal(result.refundsBrl, 10);
  assert.equal(result.excludedTransactionCount, 1);
});

test('Stripe resource errors produce explicit fallback, not false external exclusions', async () => {
  for (const mode of ['429', 'timeout', 'malformed', 'invalid-list', 'invalid-resource']) {
    const api = finance(async url => {
      if (url.pathname.endsWith('/balance_transactions')) {
        if (mode === 'invalid-list') return json({});
        return json({ data: [transaction('txn', 'ch_unresolved')], has_more: false });
      }
      if (mode === '429') return json({}, 429);
      if (mode === 'timeout') throw Error('Synthetic timeout');
      if (mode === 'invalid-resource') return json({});
      return new Response('invalid JSON');
    });
    const result = await stripeSource(api);
    assert.equal(result.state, 'fallback', mode);
    assert.equal(result.excludedTransactionCount, 0, mode);
    assert.match(result.detail, /Fallback/);
  }
});

test('Stripe limits concurrent resource lookups to four and reuses shared references', async () => {
  let inFlight = 0;
  let peak = 0;
  let calls = 0;
  const api = finance(async url => {
    if (url.pathname.endsWith('/balance_transactions')) return json({
      data: Array.from({ length: 12 }, (_, i) => transaction(`txn_${i}`, `ch_${Math.floor(i / 2)}`)),
      has_more: false
    });
    calls++;
    peak = Math.max(peak, ++inFlight);
    await new Promise(resolve => setTimeout(resolve, 5));
    inFlight--;
    return json(linked(url.pathname.split('/').at(-1)));
  });
  const result = await stripeSource(api);
  assert.equal(result.paymentCount, 12);
  assert.equal(calls, 6);
  assert.ok(peak <= 4 && peak > 1);
});

test('Stripe never treats a PaymentIntent client secret as a resource reference', async () => {
  const paths = [];
  const api = finance(async url => {
    paths.push(url.pathname);
    if (url.pathname.endsWith('/balance_transactions')) return json({ data: [
      transaction('txn_external', { id: 'ch_external', payment_intent: 'pi_external' })
    ], has_more: false });
    assert.equal(url.pathname, '/v1/payment_intents/pi_external');
    return json({ id: 'pi_external', client_secret: 'pi_external_secret_fixture', metadata: {}, latest_charge: 'ch_external' });
  });
  const result = await stripeSource(api);
  assert.equal(result.state, 'ready');
  assert.equal(result.excludedTransactionCount, 1);
  assert.equal(paths.length, 2);
  assert.ok(paths.every(path => !path.includes('_secret_')));
});

const subscription = (id, amount = 4990, discount) => ({
  id, customer: `cus_${id}`, livemode: true, metadata: { product_id: product.id },
  discount, items: { data: [{ quantity: 1, price: { id: 'price_fixture', currency: 'brl',
    unit_amount: amount, recurring: { interval: 'month', interval_count: 1 } } }] }
});
test('MRR excludes past due and trialing but retains their health counters and active discounts', async () => {
  const groups = {
    active: [subscription('active', 4990, { coupon: { percent_off: 10, duration: 'forever', valid: true } })],
    past_due: [subscription('late')], trialing: [subscription('trial', 6990)]
  };
  const api = load('lib/checkout/stripe-reporting.ts', async url => json({
    data: groups[url.searchParams.get('status')], has_more: false
  }), { STRIPE_SECRET_KEY: 'fixture' });
  const result = await api.getStripeRecurringMetrics();
  assert.equal(result.state, 'ready');
  assert.equal(result.activeSubscriptions, 1);
  assert.equal(result.activeSubscribers, 1);
  assert.equal(result.pastDueSubscriptions, 1);
  assert.equal(result.trialingSubscriptions, 1);
  assert.ok(Math.abs(result.mrrBrlEstimate - 44.91) < 1e-8);
  assert.equal(result.products[0].subscriptions, 1);
});

test('Malformed subscription response is unavailable, never a ready zero MRR', async () => {
  const api = load('lib/checkout/stripe-reporting.ts', async () => json({}), { STRIPE_SECRET_KEY: 'fixture' });
  assert.equal((await api.getStripeRecurringMetrics()).state, 'error');
});

test('Unreconciled Vercel and ManyChat costs remain explicitly unknown', async () => {
  const api = load('lib/checkout/expense-reporting.ts', () => { throw Error('No network expected'); });
  const result = await api.getMonthlyExpenseMetrics('2026-09');
  for (const id of ['vercel', 'manychat']) {
    const source = result.sources.find(s => s.id === id);
    assert.equal(source.state, 'missing');
    assert.equal(source.amount, null);
    assert.equal(source.brlEstimate, null);
  }
});

const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { AdminMonthlyExpenses } = load('components/admin-monthly-expenses.tsx', undefined, {}, {
  react: React, 'react/jsx-runtime': require('react/jsx-runtime'), 'lucide-react': require('lucide-react')
});
const expenseData = {
  period: '2026-09', isCurrentPeriod: true, elapsedDays: 29, daysInMonth: 30,
  totalBrlEstimate: 100, projectedBrlEstimate: 900, budgetBrl: null,
  budgetUsedPercent: null, hasSpendData: true, hasUnconvertedCurrencies: false,
  updatedAt: '2026-09-29T10:00:00Z',
  sources: [{ id: 'meta_ads', name: 'Meta Ads', category: 'Marketing', state: 'ready',
    amount: 100, currency: 'BRL', brlEstimate: 100, detail: 'Synthetic fixture', projectionMode: 'paced' }]
};
function balanceMarkup(data = expenseData, revenue = 1000) {
  const html = renderToStaticMarkup(React.createElement(AdminMonthlyExpenses, { initialData: data, confirmedNetRevenueBrl: revenue }));
  return html.split('Saldo após custos informados')[1].split('border-t border-ink/10 bg-')[0];
}
test('Admin balance uses confirmed net receipts minus recorded costs, not projections', () => {
  assert.match(balanceMarkup(), /900,00/);
  assert.match(balanceMarkup(), /Não é lucro líquido/);
  assert.doesNotMatch(balanceMarkup(), /100,00/);
});
test('Missing costs, unconverted currencies or unavailable receipts suppress the balance', () => {
  const missing = { ...expenseData, sources: [...expenseData.sources, { id: 'vercel', name: 'Vercel', state: 'missing', amount: null, currency: null, brlEstimate: null }] };
  for (const html of [balanceMarkup(missing), balanceMarkup({ ...expenseData, hasUnconvertedCurrencies: true }), balanceMarkup(expenseData, null)]) {
    assert.match(html, /—/);
    assert.doesNotMatch(html, /900,00/);
  }
});
