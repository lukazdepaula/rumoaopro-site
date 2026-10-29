import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

function load(file, mocks, env = {}, extras = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  vm.runInNewContext(code, {
    module, exports: module.exports, process: { env }, URL, Headers, Response,
    console: { error() {} },
    require(id) {
      if (id in mocks) return mocks[id];
      throw Error(`Unmocked dependency: ${id}`);
    },
    fetch() { throw Error('Unexpected network request'); }, ...extras
  });
  return module.exports;
}

const order = (patch = {}) => ({
  id: 'fixture-order', product_id: 'project_36', gateway: 'stripe', status: 'paid',
  customer_email: 'fixture@example.invalid', customer_name: 'Fixture',
  metadata: {}, ...patch
});

function provisioningFixture() {
  const requests = [];
  const logs = [];
  const env = {
    VERCEL_ENV: 'production', RAPTORPRO_SUPABASE_URL: 'https://fixture.supabase.co',
    RAPTORPRO_SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_fixture_not_real',
    RAPTORPRO_APP_URL: 'https://app.example.invalid'
  };
  const safety = load('lib/preview-safety.ts', {}, env);
  const raptor = load('lib/checkout/raptorpro.ts', {
    '@/lib/preview-safety': safety,
    '@/lib/checkout/db': { appendOrderLog: async (...args) => logs.push(args) }
  }, env, {
    fetch: async (url, init) => {
      requests.push({ path: new URL(url).pathname, body: JSON.parse(init.body) });
      if (url.endsWith('/rest/v1/rpc/set_commercial_program_paid_access')) return Response.json({ ok: true });
      if (url.endsWith('/auth/v1/admin/generate_link')) {
        return Response.json({ action_link: 'https://auth.example.invalid/fixture-only', user: { id: 'fixture-user' } });
      }
      throw Error('Unexpected mocked provider endpoint');
    }
  });
  return { raptor, requests, logs };
}

for (const [label, patch] of [
  ['sandbox', { metadata: { checkout_gateway_mode: 'sandbox' } }],
  ['mock', { gateway: 'mock' }]
]) {
  test(`${label} order cannot grant, revoke, or generate a real Raptor sign-in link`, async () => {
    const f = provisioningFixture();
    for (const status of ['granted', 'revoked']) {
      await assert.rejects(f.raptor.syncRaptorProProgramAccess(order(patch), status), /test order/i);
    }
    await assert.rejects(f.raptor.createRaptorProCheckoutAccessLink(order(patch)), /test order/i);
    assert.equal(f.requests.length, 0);
    assert.equal(f.logs.length, 0);
  });
}

test('ordinary and historical paid purchases keep the existing access flow', async () => {
  for (const patch of [{}, { gateway: 'shopify_legacy' }, { metadata: { checkout_gateway_mode: 'live' } }]) {
    const f = provisioningFixture();
    const result = await f.raptor.createRaptorProCheckoutAccessLink(order(patch));
    assert.equal(result, 'https://auth.example.invalid/fixture-only');
    assert.equal(f.requests.length, 2);
    assert.equal(f.requests[0].body.p_status, 'granted');
    assert.equal(f.requests[0].body.p_email, 'fixture@example.invalid');
    assert.equal(f.requests[0].body.p_order_id, 'fixture-order');
    assert.equal(f.requests[1].body.redirect_to, 'https://app.example.invalid/programs/project-36-speed-acceleration/access');
  }
});

function directRouteFixture({ sameSite = true, authorized = true, current = order() } = {}) {
  const f = provisioningFixture();
  const state = { reads: 0, verifications: [], cleared: [] };
  const route = load('app/api/checkout/orders/[orderId]/raptorpro-access/route.ts', {
    'next/server': { NextResponse: { redirect: (url, status) => ({ url: String(url), status,
      cookies: { set: (...args) => state.cleared.push(args) } }) } },
    'next/headers': { cookies: async () => ({ get: () => ({ value: 'fixture-cookie' }) }) },
    '@/lib/checkout/checkout-access': {
      CHECKOUT_ACCESS_COOKIE_NAME: 'fixture', checkoutAccessCookieOptions: () => ({ httpOnly: true }),
      verifyCheckoutAccessToken: (id) => { state.verifications.push(id); return authorized; }
    },
    '@/lib/checkout/db': { getOrderById: async () => { state.reads++; return current; }, appendOrderLog: async () => {} },
    '@/lib/checkout/request-security': { isSameSiteRequest: () => sameSite },
    '@/lib/checkout/raptorpro': f.raptor
  });
  return { ...f, state, run: () => route.POST({ url: 'https://site.example.invalid/api/checkout/orders/fixture-order/raptorpro-access' },
    { params: Promise.resolve({ orderId: 'fixture-order' }) }) };
}

test('direct checkout access denies external origins and grants for a different order before reading data', async () => {
  for (const settings of [{ sameSite: false }, { authorized: false }]) {
    const f = directRouteFixture(settings);
    const response = await f.run();
    assert.equal(response.status, 303);
    assert.equal(f.state.reads, 0);
    assert.equal(f.requests.length, 0);
    assert.equal(f.state.cleared.length, 0);
    assert.equal(new URL(response.url).origin, 'https://site.example.invalid');
  }
});

test('unpaid, refunded, missing and unsupported orders cannot provision through the direct button', async () => {
  for (const current of [null, order({ status: 'pending' }), order({ status: 'refunded' }), order({ product_id: 'unknown' })]) {
    const f = directRouteFixture({ current });
    const response = await f.run();
    assert.equal(new URL(response.url).searchParams.get('access_error'), 'not_available');
    assert.equal(f.requests.length, 0);
  }
});

test('paid sandbox direct button stays on the checkout page without provisioning or consuming the grant', async () => {
  const f = directRouteFixture({ current: order({ metadata: { checkout_gateway_mode: 'sandbox' } }) });
  const response = await f.run();
  assert.equal(new URL(response.url).searchParams.get('access_error'), 'generation_failed');
  assert.equal(f.requests.length, 0);
  assert.equal(f.state.cleared.length, 0);
});

test('legitimate direct access redirects to the generated link and clears the checkout grant', async () => {
  const f = directRouteFixture();
  const response = await f.run();
  assert.equal(response.status, 303);
  assert.equal(response.url, 'https://auth.example.invalid/fixture-only');
  assert.deepEqual(f.state.verifications, ['fixture-order']);
  assert.equal(f.requests.length, 2);
  assert.equal(f.state.cleared.length, 1);
  assert.equal(f.state.cleared[0][1], '');
  assert.equal(f.state.cleared[0][2].maxAge, 0);
});
