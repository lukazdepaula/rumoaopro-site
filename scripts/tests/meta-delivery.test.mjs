import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function load(file, mocks = {}, extras = {}) {
  const module = { exports: {} };
  const source = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022
  }}).outputText;
  vm.runInNewContext(source, { module, exports: module.exports, URL, URLSearchParams, Request, Response,
    AbortSignal, console: { error() {} }, process: { env: {} },
    setTimeout: fn => { fn(); },
    require: id => id in mocks ? mocks[id] : id.startsWith('node:') ? require(id) : (() => { throw Error(`Unmocked ${id}`); })(),
    ...extras });
  return module.exports;
}
const eventPath = load('lib/marketing/event-path.ts');
const event = () => ({ dataset: 'rumoaopro', eventName: 'Purchase', eventId: 'purchase:fixture',
  eventTime: Math.floor(Date.now() / 1000) - 120, eventSourceUrl: 'https://rumoaopro.com/checkout/success',
  userData: { email: 'EXAMPLE@example.invalid' }, customData: { value: 100, currency: 'BRL' } });
function deliveryFixture(responses = [200], { preview = false, storageFailure = false } = {}) {
  const requests = [], receipts = new Map();
  const api = load('lib/marketing/meta.ts', {
    '@/lib/preview-safety': { isPreviewEnvironment: () => preview },
    '@/lib/checkout/db': {
      readMeasurementEvent: async (_, id) => { if (storageFailure) throw Error('offline'); return receipts.get(id); },
      recordWebhookEvent: async (_, id, payload) => { receipts.set(id, payload); return true; }
    }
  }, { process: { env: { NEXT_PUBLIC_RUMOAOPRO_META_PIXEL_ID: 'site-fixture',
    RUMOAOPRO_META_CONVERSIONS_API_TOKEN: 'fixture-not-a-secret', NEXT_PUBLIC_LOADPRO_META_PIXEL_ID: 'loadpro-fixture',
    LOADPRO_META_CONVERSIONS_API_TOKEN: 'fixture-not-a-secret' } },
    fetch: async (url, options) => {
      requests.push({ url, ...options });
      assert.ok(options.signal instanceof AbortSignal);
      const outcome = responses[Math.min(requests.length - 1, responses.length - 1)];
      if (outcome === 'offline') throw Error('network failure');
      if (outcome === 'empty') return Response.json({ events_received: 0 });
      return Response.json(outcome === 200 ? { events_received: 1 } : { error: 'provider error' }, { status: outcome });
    }
  });
  return { ...api, requests, receipts };
}
test('transient CAPI errors retry exactly the same event and persist a non-personal receipt', async () => {
  const api = deliveryFixture([503, 'offline', 200]);
  const input = event();
  assert.equal((await api.sendMetaEvent(input)).sent, true);
  assert.equal(api.requests.length, 3);
  assert.equal(new Set(api.requests.map(r => r.body)).size, 1);
  const sent = JSON.parse(api.requests[0].body).data[0];
  assert.equal(sent.event_time, input.eventTime);
  assert.equal(sent.event_id, input.eventId);
  assert.match(sent.user_data.em[0], /^[a-f0-9]{64}$/);
  assert.ok(!JSON.stringify([...api.receipts.values()]).includes('example'));
  assert.equal((await api.sendMetaEvent(input)).duplicate, true);
  assert.equal(api.requests.length, 3);
});
test('permanent provider refusals are not retried or recorded as delivered', async () => {
  const api = deliveryFixture([400]);
  const result = await api.sendMetaEvent(event());
  assert.equal(result.sent, false); assert.equal(result.retryable, false);
  assert.equal(api.requests.length, 1); assert.equal(api.receipts.size, 0);
});
test('temporary outages and incomplete success responses stop after three attempts', async () => {
  for (const response of [429, 503, 'offline', 'empty']) {
    const api = deliveryFixture([response]);
    const result = await api.sendMetaEvent(event());
    assert.equal(result.sent, false); assert.equal(result.retryable, true);
    assert.equal(api.requests.length, 3); assert.equal(api.receipts.size, 0);
  }
});
test('dataset and event name have separate delivery receipts', async () => {
  const api = deliveryFixture();
  await api.sendMetaEvent(event());
  await api.sendMetaEvent({ ...event(), dataset: 'loadpro' });
  await api.sendMetaEvent({ ...event(), eventName: 'StartTrial' });
  assert.equal(api.requests.length, 3); assert.equal(api.receipts.size, 3);
});
test('preview and storage outages never send untracked CAPI events', async () => {
  for (const options of [{ preview: true }, { storageFailure: true }]) {
    const api = deliveryFixture([200], options);
    assert.equal((await api.sendMetaEvent(event())).sent, false);
    assert.equal(api.requests.length, 0);
  }
});
test('old, future and malformed timestamps are not changed to the current time', async () => {
  const api = deliveryFixture();
  for (const eventTime of [NaN, 0, Date.now(), Math.floor(Date.now() / 1000) - 86401]) {
    assert.equal((await api.sendMetaEvent({ ...event(), eventTime })).reason, 'invalid_event_time');
  }
  assert.equal(api.requests.length, 0);
});
test('event paths reject external, encoded, query-bearing and private addresses', () => {
  for (const path of ['//facebook.com', '/\\facebook.com', '/%2f%2ffacebook.com', '/a/../admin', '/admin',
    '/en/admin/orders', '/login', '/my-programs/project-36', '/checkout/success', '/?email=secret', '/apps#token', '/a\nb']) {
    assert.equal(eventPath.publicEventPath(path), null, path);
  }
  for (const path of ['/', '/programas/de-volta-aos-gramados', '/en/programs/project-36kmh', '/checkout/power-pro']) {
    assert.equal(eventPath.publicEventPath(path), path);
  }
});
function routeFixture() {
  const records = new Map(), sent = [];
  let retryable = true;
  const api = load('app/api/analytics/event/route.ts', {
    'next/server': { NextResponse: Response },
    '@/lib/marketing/event-path': eventPath,
    '@/lib/marketing/attribution': load('lib/marketing/attribution.ts'),
    '@/lib/checkout/products': { getProductBySlug: () => null, isLoadProProductId: () => false },
    '@/lib/marketing/meta': { marketingConsentGranted: v => v === 'granted',
      sendMetaEvent: async input => { sent.push(input); return retryable ? { sent: false, retryable: true } : { sent: true }; } },
    '@/lib/checkout/db': {
      recordWebhookEvent: async (_, id, payload) => {
        if (records.has(id)) return false;
        records.set(id, { payload, createdAt: new Date(Date.now() - 120000).toISOString() }); return true;
      },
      readMeasurementEvent: async (_, id) => records.get(id)
    }
  });
  const send = (extra = {}, headers = {}) => api.POST(new Request('https://rumoaopro.com/api/analytics/event', {
    method: 'POST', headers: { 'sec-fetch-site': 'same-origin', ...headers },
    body: JSON.stringify({ type: 'page_view', sessionId: 'session', eventId: 'event',
      productSlug: 'site', path: '/apps', marketing: { consent: 'granted' }, ...extra })
  }));
  return { send, records, sent, succeed: () => { retryable = false; } };
}
test('internal analytics dedup does not swallow a failed CAPI delivery on replay', async () => {
  const api = routeFixture();
  assert.equal((await (await api.send()).json()).retryable, true);
  api.succeed();
  const result = await (await api.send()).json();
  assert.equal(result.recorded, false); assert.equal(result.accepted, true); assert.equal(result.retryable, false);
  assert.equal(api.records.size, 1); assert.equal(api.sent.length, 2);
  assert.equal(api.sent[1].eventId, api.sent[0].eventId);
  assert.equal(api.sent[1].eventTime, api.sent[0].eventTime);
  assert.equal(api.sent[1].eventTime, Math.floor(Date.parse(api.records.get('event').createdAt) / 1000));
});
test('same event ID cannot replay a different visit, product, or consent decision', async () => {
  const api = routeFixture(); await api.send();
  for (const extra of [{ path: '/programas' }, { sessionId: 'other' }, { type: 'whatsapp_click' }]) {
    assert.equal((await api.send(extra)).status, 409);
  }
  assert.equal(api.sent.length, 1);
  const denied = routeFixture(); await denied.send({ marketing: { consent: 'denied' } });
  assert.equal((await denied.send()).status, 409); assert.equal(denied.sent.length, 0);
});
test('unsafe event paths are rejected before internal storage or Meta', async () => {
  const api = routeFixture();
  for (const path of ['//facebook.com', '/admin/orders/123', '/apps?token=secret']) {
    assert.equal((await api.send({ path })).status, 400);
  }
  assert.equal(api.records.size, 0); assert.equal(api.sent.length, 0);
});

test('cross-origin and sibling-site event submissions are rejected', async () => {
  const api = routeFixture();
  for (const headers of [{ 'sec-fetch-site': 'same-site' }, { origin: 'https://unrelated.invalid' },
    { origin: 'http://rumoaopro.com' }, { 'sec-fetch-site': 'cross-site' }]) {
    assert.equal((await api.send({}, headers)).status, 403);
  }
  assert.equal(api.records.size, 0);
});

function mercadoFixture({ lookupFails = false, date = '2026-10-31T09:10:00-03:00' } = {}) {
  const sent = [], fulfilled = [], lookups = [];
  const order = { id: 'order-fixture', status: 'pending', amount: 49.9, currency: 'BRL',
    created_at: '2026-09-01T00:00:00Z', paid_at: '2026-09-01T00:00:00Z', metadata: {} };
  const api = load('app/api/webhooks/mercado-pago/route.ts', {
    'next/server': { NextResponse: Response },
    '@/lib/checkout/db': { recordWebhookEvent: async () => true, getOrderById: async () => order,
      getOrderByGatewayCheckoutId: async () => order, updateOrderGatewayIds: async () => {} },
    '@/lib/checkout/order-events': { markOrderAsPaid: async id => fulfilled.push(id) },
    '@/lib/marketing/order-events': { trackMetaPurchase: async (_, options) => sent.push(options) },
    '@/lib/checkout/payments': {
      verifyMercadoPagoWebhookSignature: () => true, mapMercadoPagoStatus: () => 'paid',
      fetchMercadoPagoAuthorizedPayment: async () => ({ external_reference: order.id, preapproval_id: 'sub',
        payment: { id: 'payment', status: 'approved', transaction_amount: 49.9, currency_id: 'BRL' } }),
      fetchMercadoPagoPayment: async id => {
        lookups.push(id); if (lookupFails) throw Error('provider offline');
        return { id, status: 'approved', date_approved: date, external_reference: order.id,
          transaction_amount: 49.9, currency_id: 'BRL' };
      }
    }
  });
  const send = type => api.POST(new Request('https://rumoaopro.com/api/webhooks/mercado-pago', {
    method: 'POST', body: JSON.stringify({ id: 'notification', type, data: { id: 'payment' } })
  }));
  return { send, sent, fulfilled, lookups };
}
test('Mercado Pago measures payment approval, not an old order or the retry date', async () => {
  for (const topic of ['payment', 'subscription_authorized_payment']) {
    const api = mercadoFixture();
    assert.equal((await api.send(topic)).status, 200);
    assert.equal(api.fulfilled.length, 1);
    assert.equal(api.sent[0].occurredAt, Date.parse('2026-10-31T09:10:00-03:00') / 1000);
    assert.equal(api.lookups.length, 1);
  }
});
test('an unavailable payment timestamp does not fail fulfillment or fabricate a Meta date', async () => {
  const api = mercadoFixture({ lookupFails: true });
  assert.equal((await api.send('subscription_authorized_payment')).status, 200);
  assert.equal(api.fulfilled.length, 1);
  assert.ok(Number.isNaN(api.sent[0].occurredAt));
});
