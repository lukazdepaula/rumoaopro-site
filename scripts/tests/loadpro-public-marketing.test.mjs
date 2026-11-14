import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function load(file, mocks, extras = {}) {
  const module = { exports: {} };
  const source = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022
  } }).outputText;
  vm.runInNewContext(source, { module, exports: module.exports, URL, URLSearchParams, Request, Response, Buffer,
    AbortSignal, console: { error() {} }, process: { env: {} }, setTimeout: fn => fn(),
    require: id => id in mocks ? mocks[id] : id.startsWith('node:') ? require(id) : (() => { throw Error(`Unmocked ${id}`); })(), ...extras });
  return module.exports;
}
const origin = 'https://loadpro.rumoaopro.com.br';
const base = () => ({ type: 'product_view', eventId: 'loadpro:page-fixture:ViewContent:event-fixture',
  sessionId: 'page-fixture', locale: 'pt', marketing: { consent: 'granted', utmCampaign: 'fixture',
    fbp: 'fb.1.1794000000000.123456789', fbc: 'fb.1.1794000000000.fixture-click' } });
function fixture({ preview = false, failStorage = false, responses = [200] } = {}) {
  const records = new Map(), receipts = new Map(), requests = [];
  const db = {
    async recordWebhookEvent(provider, id, payload) {
      if (failStorage) throw Error('offline');
      const map = provider === 'meta' ? receipts : records;
      if (map.has(id)) return false;
      map.set(id, { payload, createdAt: new Date(Date.now() - 1000).toISOString() }); return true;
    },
    async readMeasurementEvent(provider, id) { return (provider === 'meta' ? receipts : records).get(id); }
  };
  const previewMock = { isPreviewEnvironment: () => preview };
  const meta = load('lib/marketing/meta.ts', { '@/lib/checkout/db': db, '@/lib/preview-safety': previewMock }, {
    process: { env: { NEXT_PUBLIC_LOADPRO_META_PIXEL_ID: 'pixel-fixture', LOADPRO_META_CONVERSIONS_API_TOKEN: 'fixture-not-a-secret' } },
    fetch: async (url, options) => {
      requests.push({ url, ...options });
      const status = responses[Math.min(requests.length - 1, responses.length - 1)];
      return Response.json(status === 200 ? { events_received: 1 } : { error: 'unavailable' }, { status });
    }
  });
  const api = load('app/api/loadpro/marketing/events/route.ts', {
    'next/server': { NextResponse: Response }, '@/lib/checkout/db': db, '@/lib/marketing/meta': meta,
    '@/lib/preview-safety': previewMock,
    '@/lib/marketing/attribution': load('lib/marketing/attribution.ts', {})
  });
  const request = (body = base(), headers = {}) => new Request('https://rumoaopro.com/api/loadpro/marketing/events', {
    method: 'POST', headers: { origin, 'content-type': 'application/json', 'user-agent': 'QA fixture', ...headers }, body: JSON.stringify(body)
  });
  return { api, request, records, receipts, requests, send: (body, headers) => api.POST(request(body, headers)) };
}

test('public view creates a matching server event, with the true source and no revenue or health data', async () => {
  const h = fixture(); const response = await h.send(); const result = await response.json();
  assert.equal(result.providerAccepted, true); assert.equal(h.requests.length, 1);
  assert.equal(response.headers.get('access-control-allow-origin'), origin);
  const event = JSON.parse(h.requests[0].body).data[0];
  assert.equal(event.event_name, 'ViewContent'); assert.equal(event.event_id, base().eventId);
  assert.equal(event.event_source_url, `${origin}/`);
  assert.equal(event.custom_data.value, undefined); assert.equal(event.custom_data.currency, undefined);
  assert.deepEqual(Object.keys(event.user_data).sort(), ['client_user_agent', 'fbc', 'fbp']);
  assert.equal(event.event_time, Math.floor(Date.parse([...h.records.values()][0].createdAt) / 1000));
  await h.send(); assert.equal(h.requests.length, 1); assert.equal(h.records.size, 1);
});

test('all supported public events retain the exact browser name and ID', async () => {
  const h = fixture();
  for (const [type, name] of [['page_view', 'PageView'], ['product_view', 'ViewContent'], ['whatsapp_click', 'Contact']]) {
    await h.send({ ...base(), type, eventId: `loadpro:page-fixture:${name}:event-fixture` });
    const event = JSON.parse(h.requests.at(-1).body).data[0]; assert.equal(event.event_name, name);
    assert.equal(event.event_id, `loadpro:page-fixture:${name}:event-fixture`);
  }
  assert.equal(h.requests.length, 3);
});

test('preview and refused consent produce neither database records nor advertising calls', async () => {
  for (const options of [{ preview: true }, {}]) {
    const h = fixture(options); await h.send(options.preview ? base() : { ...base(), marketing: { consent: 'denied', fbc: 'private' } });
    assert.equal(h.records.size, 0); assert.equal(h.requests.length, 0);
  }
});

test('unknown, missing and deceptive origins fail preflight and submission', async () => {
  const h = fixture();
  for (const value of ['', 'null', 'https://rumoaopro.com', 'https://loadpro.rumoaopro.com.br.unrelated.invalid', 'http://loadpro.rumoaopro.com.br']) {
    assert.equal((await h.send(base(), { origin: value })).status, 403);
    const response = await h.api.OPTIONS(new Request('https://rumoaopro.com/api/loadpro/marketing/events', { method: 'OPTIONS', headers: { origin: value } }));
    assert.equal(response.status, 403); assert.equal(response.headers.get('access-control-allow-origin'), null);
  }
  assert.equal(h.requests.length, 0); assert.equal(h.records.size, 0);
});

test('payment, athlete, private-URL and arbitrary customer data cannot enter the public bridge', async () => {
  const h = fixture();
  for (const body of [
    { ...base(), type: 'trial_started' }, { ...base(), type: 'payment_received' }, { ...base(), type: 'Purchase' },
    { ...base(), type: 'AthleteWellness' }, { ...base(), customData: { pain: 'private' } },
    { ...base(), eventSourceUrl: `${origin}/?token=private` }, { ...base(), email: 'private@example.invalid' },
    { ...base(), eventId: 'loadpro:another-session:ViewContent:event-fixture' },
    { ...base(), eventId: 'loadpro:page-fixture:Purchase:event-fixture' },
    { ...base(), eventId: 'loadpro:page-fixture:ViewContent:' }
  ]) assert.equal((await h.send(body)).status, 400);
  assert.equal(h.requests.length, 0); assert.equal(h.records.size, 0);
});

test('retries keep their original timestamp and do not replace receipts or create a second conversion', async () => {
  const h = fixture({ responses: [503, 503, 503, 200] });
  assert.equal((await (await h.send()).json()).retryable, true);
  assert.equal((await (await h.send()).json()).providerAccepted, true);
  assert.equal(h.requests.length, 4); assert.equal(h.records.size, 1);
  assert.equal(new Set(h.requests.map(request => request.body)).size, 1);
  await h.send(); assert.equal(h.requests.length, 4);
});

test('storage failures fail closed and reused IDs cannot change locale', async () => {
  const failed = fixture({ failStorage: true }); assert.equal((await failed.send()).status, 503);
  assert.equal(failed.requests.length, 0);
  const h = fixture(); await h.send(); assert.equal((await h.send({ ...base(), locale: 'en' })).status, 409);
  assert.equal(h.requests.length, 1);
});

test('large, malformed and excessive submissions are rejected', async () => {
  const h = fixture();
  assert.equal((await h.send(base(), { 'content-type': 'text/plain' })).status, 415);
  assert.equal((await h.send(base(), { 'content-length': '12289' })).status, 413);
  assert.equal((await h.send({ ...base(), ignored: 'x'.repeat(13000) })).status, 413);
  for (const body of [null, [], 'invalid']) assert.equal((await h.send(body)).status, 400);
  const limited = fixture(); for (let i = 0; i < 30; i++) await limited.send();
  assert.equal((await limited.send()).status, 429);
});
