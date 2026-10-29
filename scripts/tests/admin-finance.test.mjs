import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const product = { id: 'loadpro_founders', name: 'LoadPro', type: 'subscription' };
function load(file, fetch, env = {}, mocks = {}, globals = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX }
  }).outputText;
  vm.runInNewContext(code, {
    module, exports: module.exports, URL, URLSearchParams, AbortSignal, fetch,
    console: { error() {} }, process: { env }, ...globals,
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

test('Temporary reconciliation rejects unauthenticated callers before any provider query', async () => {
  let queries = 0;
  const route = load('app/api/admin/finance/reconciliation/route.ts', undefined, {}, {
    'next/server': { NextResponse: { json: (data, init) => new Response(JSON.stringify(data), init) } },
    '@/lib/checkout/admin-auth': { isAdminRequest: async () => false },
    '@/lib/checkout/financial-reporting': {
      getFinancialReconciliationSample: async () => { queries++; },
      resolveFinancialPeriod: () => { throw Error('Must authenticate first'); }
    }
  });
  const response = await route.GET(new Request('https://site.test/api/admin/finance/reconciliation?source=stripe&from=2026-09-01&to=2026-09-20'));
  assert.equal(response.status, 401);
  assert.match(response.headers.get('cache-control'), /private, no-store/);
  assert.equal(queries, 0);
});

test('Temporary reconciliation validates range and source and does not serialize provider errors', async () => {
  // Exercise the active diagnostic before its fixed expiry, independently of today.
  const clock = { Date: class extends Date {
    constructor(...args) { super(...(args.length ? args : ['2026-10-02T12:00:00Z'])); }
    static now() { return Date.parse('2026-10-02T12:00:00Z'); }
  } };
  const metrics = load('lib/checkout/financial-reporting.ts', () => { throw Error('No query expected'); }, {}, {}, clock);
  let queries = 0;
  const route = load('app/api/admin/finance/reconciliation/route.ts', undefined, {}, {
    'next/server': { NextResponse: { json: (data, init) => new Response(JSON.stringify(data), init) } },
    '@/lib/checkout/admin-auth': { isAdminRequest: async () => true },
    '@/lib/checkout/financial-reporting': {
      resolveFinancialPeriod: metrics.resolveFinancialPeriod,
      getFinancialReconciliationSample: async () => { queries++; throw Error('fixture_private_provider_body'); }
    }
  }, clock);
  for (const query of [
    'source=unknown&from=2026-09-01&to=2026-09-20',
    'source=stripe&from=2026-01-01&to=2026-09-20',
    'source=stripe&from=2026-02-31&to=2026-03-02',
    'source=stripe&from=2030-09-01&to=2030-09-20',
    'source=stripe&from=2026-09-20&to=2026-09-01'
  ]) assert.equal((await route.GET(new Request('https://site.test/?'+query))).status, 400);
  assert.equal(queries, 0);
  const response = await route.GET(new Request('https://site.test/?source=stripe&from=2026-09-01&to=2026-09-20'));
  assert.equal(response.status, 502);
  assert.doesNotMatch(await response.text(), /fixture_private|provider_body/);
});

test('Kiwify diagnostic projects money only and never returns customer, partner or credential fields', async () => {
  const api = load('lib/checkout/financial-reporting.ts', async url => {
    if (String(url).endsWith('/oauth/token')) return json({ access_token: 'fixture_access_secret' });
    assert.equal(url.pathname, '/v1/sales');
    return json({ data: [{
      id: 'sale_fixture', status: 'paid', currency: 'BRL', net_amount: 31595,
      customer: { name: 'fixture_customer', email: 'fixture_private_contact' },
      client_secret: 'fixture_secret', payment: {
        charge_amount: 39386, charge_currency: 'BRL', net_amount: 31595,
        settlement_amount: 39386, settlement_currency: 'BRL', product_base_price: 34990,
        product_base_currency: 'BRL', fee: 3395, fee_currency: 'BRL', private_field: 'fixture_private'
      }, revenue_partners: [
        { account_id: 'fixture_account', net_amount_split: 31595, percentage: 100, legal_name: 'fixture_legal_name' },
        { account_id: 'another', net_amount_split: 999, legal_name: 'fixture_other_name' }
      ]
    }] });
  }, { KIWIFY_CLIENT_ID: 'fixture_client', KIWIFY_CLIENT_SECRET: 'fixture_secret',
    KIWIFY_ACCOUNT_ID: 'fixture_account', KIWIFY_PREPARADOR_PRO_PRODUCT_ID: 'fixture_product' });
  const result = await api.getFinancialReconciliationSample('kiwify', period);
  assert.equal(result.rows[0].netAmount, 31595);
  assert.equal(result.rows[0].settlementAmount, 39386);
  assert.equal(result.rows[0].ownShares.length, 1);
  assert.doesNotMatch(JSON.stringify(result), /fixture_(customer|private|secret|account|legal|other|access|client)/);
});

test('Mercado Pago diagnostic projects refund/fee amounts and rejects incomplete samples', async () => {
  let incomplete = false;
  const api = load('lib/checkout/financial-reporting.ts', async () => json({
    paging: { total: incomplete ? 101 : 1 }, results: [{
      id: 12345, status: 'refunded', currency_id: 'BRL', transaction_amount: 199,
      transaction_amount_refunded: 199, payer: { email: 'fixture_private_contact' },
      transaction_details: { net_received_amount: 197.03, private_field: 'fixture_private' },
      fee_details: [{ type: 'mercadopago_fee', amount: 1.97 }],
      charges_details: [{ name: 'mercadopago_fee', type: 'fee', amounts: { original: 1.97, refunded: 1.97, private_field: 'fixture_private' } }]
    }]
  }), { MERCADO_PAGO_ACCESS_TOKEN: 'fixture_secret' });
  const result = await api.getFinancialReconciliationSample('mercado_pago', period);
  assert.equal(result.rows[0].netReceived, 197.03);
  assert.equal(result.rows[0].charges[0].refunded, 1.97);
  assert.doesNotMatch(JSON.stringify(result), /private|payer|secret/);
  incomplete = true;
  await assert.rejects(api.getFinancialReconciliationSample('mercado_pago', period), /incomplete/);
});

test('Stripe diagnostic returns price groups only, constrains statuses and rejects incomplete samples', async () => {
  let incomplete = false;
  const subscription = status => ({
    id: 'fixture_private_subscription', status,
    customer: { name: 'fixture_private_name', email: 'fixture_private_contact' },
    metadata: { product_id: 'loadpro_founders', secret: 'fixture_private_metadata' },
    items: { data: [{ price: {
      id: 'price_fixture', unit_amount: 4990, currency: 'brl',
      product: { id: 'prod_fixture', name: 'fixture_private_product_name' }
    } }] }
  });
  const api = finance(async url => {
    assert.equal(url.pathname, '/v1/subscriptions');
    assert.equal(url.searchParams.get('expand[]'), 'data.items.data.price');
    return json({ data: [subscription('active'), subscription('active'), subscription('__proto__')], has_more: incomplete });
  });
  const result = await api.getFinancialReconciliationSample('stripe', period);
  assert.equal(result.rows.length, 1);
  assert.equal(result.rows[0].priceId, 'price_fixture');
  assert.equal(result.rows[0].productId, 'prod_fixture');
  assert.equal(result.rows[0].siteProductId, 'loadpro_founders');
  assert.equal(result.rows[0].statuses.active, 2);
  assert.equal(result.rows[0].statuses.unknown, 1);
  assert.doesNotMatch(JSON.stringify(result), /fixture_private|__proto__/);
  assert.match(result.scope, /not revenue/);
  incomplete = true;
  await assert.rejects(api.getFinancialReconciliationSample('stripe', period), /incomplete/);
});

test('Temporary diagnostic expires automatically without querying providers', async () => {
  let queries = 0;
  const route = load('app/api/admin/finance/reconciliation/route.ts', undefined, {}, {
    'next/server': { NextResponse: { json: (data, init) => new Response(JSON.stringify(data), init) } },
    '@/lib/checkout/admin-auth': { isAdminRequest: async () => true },
    '@/lib/checkout/financial-reporting': {
      getFinancialReconciliationSample: async () => { queries++; },
      resolveFinancialPeriod: () => { throw Error('Must expire before resolving dates'); }
    }
  }, { Date: class extends Date { static now() { return Date.parse('2026-10-03T03:00:00Z'); } } });
  const response = await route.GET(new Request('https://site.test/?source=stripe&from=2026-09-01&to=2026-09-20'));
  assert.equal(response.status, 410);
  assert.equal(queries, 0);
  assert.match(response.headers.get('cache-control'), /no-store/);
});
