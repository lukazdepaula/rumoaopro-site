import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function load(file, mocks = {}, extras = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX }
  }).outputText;
  vm.runInNewContext(code, {
    module, exports: module.exports, URL, URLSearchParams, Headers, Request, Response,
    crypto: { randomUUID }, console, process: { env: {} },
    fetch() { throw Error('Unexpected network request'); },
    require(id) {
      if (id in mocks) return mocks[id];
      if (id.startsWith('node:')) return require(id);
      throw Error(`Unmocked import: ${id}`);
    }, ...extras
  });
  return module.exports;
}
const plain = value => JSON.parse(JSON.stringify(value));
const attribution = load('lib/marketing/attribution.ts');
const product = { id: 'loadpro_founders', slug: 'loadpro-founders', name: 'LoadPro', price_brl: 49.9, price_usd: 9.9 };
const products = {
  isLoadProProductId: id => ['loadpro_founders', 'loadpro_founders_50'].includes(id),
  getProductById: () => product, getProductBySlug: () => product
};
const fixtureOrder = () => ({
  id: 'fixture-order', product_id: product.id, product_name: product.name,
  customer_name: 'Example Coach', customer_email: 'example@example.invalid',
  gateway: 'stripe', amount: 49.9, currency: 'BRL', status: 'pending',
  metadata: { checkout_gateway_mode: 'live', marketing_consent: 'denied' }
});

test('denied, missing and malformed consent discard all marketing identifiers', () => {
  for (const consent of ['denied', undefined, true, 'true']) {
    const result = attribution.normalizeMarketingAttribution({ consent, utmSource: 'meta', utmCampaign: 'fixture', sessionId: 'session', landingAttributionId: 'landing', fbp: 'fb.fixture' });
    assert.deepEqual(plain(result), { consent: 'denied' });
    assert.equal(attribution.attributionStatus(result), 'consent_denied');
  }
});

test('consented campaign and handoff survive normalization; sensitive URL parameters do not', () => {
  const result = attribution.normalizeMarketingAttribution({
    consent: 'granted', utmSource: 'meta', utmCampaign: 'loadpro_fixture',
    sessionId: 'session-123', landingAttributionId: 'landing-123',
    landingUrl: 'https://example.invalid/checkout?utm_campaign=fixture&access_token=private&email=private%40example.invalid#secret'
  });
  assert.equal(result.sessionId, 'session-123');
  assert.equal(result.landingAttributionId, 'landing-123');
  assert.equal(result.landingUrl, 'https://example.invalid/checkout?utm_campaign=fixture');
  assert.equal(attribution.attributionStatus(result), 'campaign_identified');
  assert.equal(attribution.attributionStatus({ consent: 'granted', fbclid: 'fixture' }), 'source_only');
  assert.equal(attribution.attributionStatus({ consent: 'granted' }), 'unidentified');
  assert.equal(attribution.attributionId('https://not-an-id.invalid'), undefined);
  assert.equal(attribution.marketingLandingUrl('https://user:password@example.invalid/'), undefined);
});

function browserFixture({ consent = 'granted', blockedStorage = false } = {}) {
  const saved = new Map();
  const storage = {
    getItem(key) { if (blockedStorage) throw Error('Storage blocked'); return saved.get(key) || null; },
    setItem(key, value) { if (blockedStorage) throw Error('Storage blocked'); saved.set(key, value); },
    removeItem(key) { if (blockedStorage) throw Error('Storage blocked'); saved.delete(key); }
  };
  const calls = [];
  const window = { localStorage: storage, sessionStorage: storage, location: {
    href: 'https://rumoaopro.com/checkout/loadpro-founders?utm_source=meta&utm_campaign=fixture&lp_attribution_id=landing-123',
    search: '?utm_source=meta&utm_campaign=fixture&lp_attribution_id=landing-123',
    pathname: '/checkout/loadpro-founders', protocol: 'https:'
  }, fbq: (...args) => calls.push(args) };
  const document = { cookie: '', documentElement: { dataset: {} } };
  const api = load('components/conversion-tracker.tsx', {
    react: { useEffect() {} }, 'next/navigation': { usePathname() {} },
    '@/components/privacy-consent': { readMarketingConsent: () => consent, MARKETING_CONSENT_EVENT: 'consent' },
    '@/lib/marketing/attribution': attribution
  }, { window, document, process: { env: { NEXT_PUBLIC_LOADPRO_META_PIXEL_ID: 'fixture-loadpro', NEXT_PUBLIC_RUMOAOPRO_META_PIXEL_ID: 'fixture-site' } } });
  return { api, window, saved, calls };
}

test('browser preserves the consented landing ID and its own checkout session', () => {
  const { api, window } = browserFixture();
  const first = api.getMarketingCheckoutContext();
  assert.equal(first.landingAttributionId, 'landing-123');
  assert.equal(first.utmCampaign, 'fixture');
  assert.ok(first.sessionId);
  window.location.search = '';
  assert.equal(api.getMarketingCheckoutContext().sessionId, first.sessionId);
  assert.equal(api.getMarketingCheckoutContext().landingAttributionId, first.landingAttributionId);
  window.location.search = '?lp_attribution_id=new-landing';
  const next = api.getMarketingCheckoutContext();
  assert.equal(next.landingAttributionId, 'new-landing');
  assert.equal(next.utmCampaign, undefined, 'new untagged touch must not inherit an old campaign');
});

test('browser does not infer permission from the URL; denied consent clears old attribution', () => {
  const { api, saved } = browserFixture({ consent: 'denied' });
  saved.set('rap_marketing_attribution_v1', JSON.stringify({ utmCampaign: 'old' }));
  assert.deepEqual(plain(api.getMarketingCheckoutContext()), { consent: 'denied' });
  assert.equal(saved.has('rap_marketing_attribution_v1'), false);
});

test('disabled browser storage does not interrupt checkout context', () => {
  const { api } = browserFixture({ blockedStorage: true });
  const first = api.getMarketingCheckoutContext();
  assert.equal(first.utmCampaign, 'fixture');
  assert.equal(api.getMarketingCheckoutContext().sessionId, first.sessionId);
});

test('invalid old attribution storage does not interrupt checkout', () => {
  for (const corrupted of ['null', '[]', '"invalid"', '{broken']) {
    const { api, saved } = browserFixture();
    saved.set('rap_marketing_attribution_v1', corrupted);
    assert.equal(api.getMarketingCheckoutContext().utmCampaign, 'fixture');
  }
});

test('LoadPro Purchase is server-only and StartTrial has zero value; programs stay unchanged', () => {
  const { api, calls } = browserFixture();
  api.trackMetaOutcome('Purchase', 'payment', product.slug, 'LoadPro', 49.9, 'BRL');
  assert.equal(calls.length, 0);
  api.trackMetaOutcome('StartTrial', 'trial', product.slug, 'LoadPro', 49.9, 'BRL');
  assert.equal(calls.at(-1)[3].value, 0);
  api.trackMetaOutcome('Purchase', 'program-payment', 'project-36', 'Program', 99, 'BRL');
  assert.equal(calls.at(-1)[3].value, 99);
});

function outcomeFixture({ preview = false, failStorage = false } = {}) {
  const records = new Map();
  const sent = [];
  const db = { appendOrderLog: async () => {}, recordWebhookEvent: async (provider, id, payload) => {
    if (failStorage) throw Error('Storage unavailable');
    if (records.has(id)) return false;
    records.set(id, { provider, ...plain(payload) }); return true;
  } };
  const outcomes = load('lib/marketing/loadpro-outcomes.ts', {
    '@/lib/checkout/db': db, '@/lib/checkout/products': products,
    '@/lib/preview-safety': { isPreviewEnvironment: () => preview },
    '@/lib/marketing/attribution': attribution
  }, { console: { error() {} } });
  const api = load('lib/marketing/order-events.ts', {
    '@/lib/checkout/db': db, '@/lib/checkout/products': products,
    '@/lib/marketing/loadpro-outcomes': outcomes,
    '@/lib/marketing/meta': { marketingConsentGranted: value => value === 'granted', sendMetaEvent: async value => { sent.push(value); return { sent: true }; } }
  });
  return { api, outcomes, records, sent };
}

test('confirmed trial is recorded once without marketing consent or personal fields', async () => {
  const { api, records, sent } = outcomeFixture();
  const order = fixtureOrder();
  order.metadata.marketing_utm_campaign = 'must-not-be-stored';
  order.metadata.marketing_session_id = 'must-not-be-linked';
  await api.trackMetaStartTrial(order, { subscriptionId: 'sub_fixture', occurredAt: 1790035200 });
  await api.trackMetaStartTrial(order, { subscriptionId: 'sub_fixture', occurredAt: 1790035200 });
  assert.equal(records.size, 1);
  const event = [...records.values()][0];
  assert.equal(event.type, 'trial_started');
  assert.equal(event.amount, 0);
  assert.equal(event.occurred_at, new Date(1790035200 * 1000).toISOString());
  assert.equal(event.session_id, null);
  assert.equal(event.attribution.utm_campaign, null);
  assert.equal(sent.length, 0);
  assert.ok(!JSON.stringify(event).includes(order.customer_email));
  assert.equal(order.status, 'pending', 'measurement must not mark a trial as paid');
});

test('payments use independent provider references; renewals do not become extra trials', async () => {
  const { api, records } = outcomeFixture();
  const order = fixtureOrder();
  for (const eventId of ['purchase:stripe:in_first', 'purchase:stripe:in_first', 'purchase:stripe:in_renewal']) {
    await api.trackMetaPurchase(order, { eventId, amount: 49.9, currency: 'BRL' });
  }
  assert.equal(records.size, 2);
  assert.ok([...records.values()].every(event => event.type === 'payment_received' && event.amount === 49.9));
  for (const amount of [0, -1, NaN, Infinity]) await api.trackMetaPurchase(order, { amount });
  assert.equal(records.size, 2);
});

test('consented outcomes carry the original campaign and checkout session; trial Meta value is zero', async () => {
  const { api, records, sent } = outcomeFixture();
  const order = fixtureOrder();
  Object.assign(order.metadata, { marketing_consent: 'granted', marketing_utm_source: 'meta', marketing_utm_campaign: 'fixture', marketing_session_id: 'session-123', marketing_landing_attribution_id: 'landing-123' });
  await api.trackMetaStartTrial(order, { subscriptionId: 'sub_fixture' });
  const event = [...records.values()][0];
  assert.equal(event.session_id, 'session-123');
  assert.equal(event.attribution.landing_attribution_id, 'landing-123');
  assert.equal(event.attribution.status, 'campaign_identified');
  assert.equal(sent[0].customData.value, 0);
  assert.equal(sent[0].eventId, 'start_trial:fixture-order');
});

test('sandbox, mock, preview and unverified trial do not create production outcomes', async () => {
  const { api, records, sent } = outcomeFixture();
  for (const mode of ['sandbox', 'mock']) {
    const order = fixtureOrder(); order.metadata.checkout_gateway_mode = mode; order.metadata.marketing_consent = 'granted';
    await api.trackMetaStartTrial(order, { subscriptionId: 'sub_fixture' });
    await api.trackMetaPurchase(order, { amount: 49.9 });
  }
  await api.trackMetaStartTrial(fixtureOrder());
  assert.equal(records.size, 0); assert.equal(sent.length, 0);
  const preview = outcomeFixture({ preview: true });
  await preview.api.trackMetaStartTrial(fixtureOrder(), { subscriptionId: 'sub_fixture' });
  assert.equal(preview.records.size, 0);
});

test('analytics storage failure cannot interrupt the billing handler', async () => {
  const { api } = outcomeFixture({ failStorage: true });
  await assert.doesNotReject(api.trackMetaStartTrial(fixtureOrder(), { subscriptionId: 'sub_fixture' }));
  await assert.doesNotReject(api.trackMetaPurchase(fixtureOrder(), { amount: 49.9 }));
});

test('public analytics endpoint rejects financial outcomes and strips denied attribution', async () => {
  const records = []; const sent = [];
  const route = load('app/api/analytics/event/route.ts', {
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } },
    '@/lib/checkout/db': { recordWebhookEvent: async (...args) => { records.push(args); return true; } },
    '@/lib/checkout/products': products, '@/lib/marketing/attribution': attribution,
    '@/lib/marketing/meta': { marketingConsentGranted: value => value === 'granted', sendMetaEvent: async value => sent.push(value) }
  });
  const request = type => new Request('https://example.invalid/api/analytics/event', { method: 'POST', headers: { 'sec-fetch-site': 'same-origin' }, body: JSON.stringify({ type, sessionId: 'fixture-session', productSlug: product.slug, path: '/checkout/loadpro-founders', marketing: { consent: 'denied', utmCampaign: 'must-not-store', fbp: 'must-not-store' } }) });
  for (const type of ['trial_started', 'payment_received']) assert.equal((await route.POST(request(type))).status, 400);
  assert.equal(records.length, 0);
  assert.equal((await route.POST(request('checkout_view'))).status, 200);
  assert.equal(records[0][2].attribution.utm_campaign, null);
  assert.equal(records[0][2].attribution.fbp, null);
  assert.equal(sent.length, 0);
});

function stripeFixture(status = 'trialing', signatureValid = true) {
  const measurement = outcomeFixture();
  const order = fixtureOrder();
  const paid = []; const seen = new Set();
  const route = load('app/api/webhooks/stripe/route.ts', {
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } },
    '@/lib/checkout/loadpro-annual-policy': { isAnnualAmount: () => false, matchesAnnualPayment: () => false },
    '@/lib/checkout/loadpro-annual': { reconcileAnnualCard: async () => {}, syncAnnualSchedulePaymentMethod: async () => {} },
    '@/lib/checkout/db': {
      getOrderById: async () => order, getOrderByGatewayPaymentId: async () => order,
      getOrderByGatewayCheckoutId: async () => order, updateOrderGatewayIds: async () => {},
      recordWebhookEvent: async (provider, id) => { if (seen.has(id)) return false; seen.add(id); return true; }
    },
    '@/lib/checkout/order-events': {
      syncOrderSubscription: async () => {}, markOrderAsFailed: async () => {},
      markOrderAsPaid: async () => { paid.push(order.id); order.status = 'paid'; }
    },
    '@/lib/checkout/payments': {
      verifyStripeWebhookSignature: () => signatureValid,
      fetchStripeSubscription: async () => ({ id: 'sub_fixture', status, trial_start: 1790035200, items: { data: [] } })
    },
    '@/lib/marketing/order-events': measurement.api,
    '@/lib/marketing/loadpro-outcomes': measurement.outcomes,
    '@/lib/checkout/loadpro': { isLoadProOrder: () => true, isCurrentLoadProSubscription: async () => true },
    '@/lib/checkout/loadpro-billing-policy': { stripeSubscriptionPeriod: () => ({ start: 1790035200, end: 1790640000 }) },
    '@/lib/checkout/email': { sendLoadProPaymentFailedEmail: async () => false }
  }, { process: { env: { STRIPE_SECRET_KEY: 'sk_live_fixture_not_a_credential' } } });
  const send = (id, type, object, livemode = true) => route.POST(new Request('https://example.invalid/api/webhooks/stripe', {
    method: 'POST', headers: { 'stripe-signature': 'fixture' }, body: JSON.stringify({ id, type, livemode, data: { object } })
  }));
  return { ...measurement, order, paid, send };
}

test('Stripe zero-value trial checkout and invoice produce one trial, never a sale', async () => {
  const fixture = stripeFixture();
  const checkout = { id: 'cs_fixture', metadata: { order_id: 'fixture-order' }, subscription: 'sub_fixture', status: 'complete', payment_status: 'paid', amount_total: 0 };
  const invoice = { id: 'in_zero', subscription: 'sub_fixture', paid: true, amount_paid: 0, currency: 'brl' };
  assert.equal((await fixture.send('evt_checkout', 'checkout.session.completed', checkout)).status, 200);
  assert.equal((await fixture.send('evt_invoice', 'invoice.paid', invoice)).status, 200);
  assert.equal(fixture.records.size, 1);
  assert.equal([...fixture.records.values()][0].type, 'trial_started');
  assert.equal(fixture.paid.length, 0);
  assert.equal(fixture.order.status, 'pending');
});

test('Stripe duplicate invoice notifications are one payment; a renewal is a second payment', async () => {
  const fixture = stripeFixture('active');
  const invoice = { id: 'in_first', subscription: 'sub_fixture', paid: true, amount_paid: 4990, currency: 'brl', status_transitions: { paid_at: 1790640000 } };
  await fixture.send('evt_first', 'invoice.paid', invoice);
  await fixture.send('evt_duplicate', 'invoice.paid', invoice);
  assert.equal(fixture.records.size, 1);
  assert.equal([...fixture.records.values()][0].amount, 49.9);
  await fixture.send('evt_renewal', 'invoice.paid', { ...invoice, id: 'in_renewal' });
  assert.equal(fixture.records.size, 2);
  assert.ok([...fixture.records.values()].every(event => event.type === 'payment_received'));
});

test('unverified or wrong-environment Stripe events cannot create billing measurements', async () => {
  const invalid = stripeFixture('active', false);
  assert.equal((await invalid.send('evt_invalid', 'invoice.paid', {})).status, 401);
  assert.equal(invalid.records.size, 0);
  const fixture = stripeFixture();
  assert.equal((await fixture.send('evt_test', 'invoice.paid', {}, false)).status, 409);
  assert.equal(fixture.records.size, 0);
});

test('late paid invoice is measured without reactivating canceled access', async () => {
  const fixture = stripeFixture('canceled');
  const result = await fixture.send('evt_late', 'invoice.paid', { id: 'in_late', subscription: 'sub_fixture', paid: true, amount_paid: 4990, currency: 'brl' });
  assert.equal(result.status, 200);
  assert.equal(fixture.records.size, 1);
  assert.equal([...fixture.records.values()][0].type, 'payment_received');
  assert.equal(fixture.paid.length, 0);
});
