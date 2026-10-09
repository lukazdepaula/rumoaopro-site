import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const orderId = '10000000-0000-4000-8000-000000000001';
const app = 'http://127.0.0.1:3022';
const db = 'https://nawortzzryivahnutdqe.supabase.co';
const redirect = `${app}/programs/project-36-speed-acceleration/access`;
const action = `${db}/auth/v1/verify?token=fixture-only&type=magiclink&redirect_to=${encodeURIComponent(redirect)}`;
const env = {
  NODE_ENV: 'production', VERCEL_ENV: 'preview', VERCEL: '1',
  VERCEL_GIT_COMMIT_REF: 'codex/site-security-dependencies-2026-09-29',
  LOADPRO_PREVIEW_INTEGRATION_ENABLED: 'true', RAPTORPRO_PREVIEW_PROVISIONING_ENABLED: 'true',
  CHECKOUT_GATEWAY_MODE: 'sandbox', CHECKOUT_DB_DRIVER: 'postgres', STRIPE_SECRET_KEY: 'sk_test_fixture',
  NEXT_PUBLIC_SITE_URL: 'https://rumoaopro-site-git-codex-site-61f7c9-fagotti-10-7408s-projects.vercel.app',
  CHECKOUT_TEST_SUPABASE_PROJECT_REF: 'xxibnkscktibljtrqmxy',
  SUPABASE_URL: 'https://xxibnkscktibljtrqmxy.supabase.co',
  RAPTORPRO_TEST_SUPABASE_PROJECT_REF: 'nawortzzryivahnutdqe', RAPTORPRO_SUPABASE_URL: db,
  RAPTORPRO_APP_URL: app, RAPTORPRO_SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_qa_fixture',
  RAPTORPRO_PREVIEW_ALLOWED_EMAIL: 'owner@example.invalid', RAPTORPRO_PREVIEW_ORDER_ID: orderId,
  RAPTORPRO_PREVIEW_EMAIL_ENABLED: 'true', RAPTORPRO_PREVIEW_RESEND_API_KEY: 're_qa_fixture',
  RAPTORPRO_PREVIEW_EMAIL_FROM: 'QA <qa@example.invalid>',
  EMAIL_PROVIDER: 'resend', RESEND_API_KEY: 're_production_fixture_do_not_use'
};
const order = (patch = {}) => ({ id: orderId, product_id: 'project_36', gateway: 'stripe',
  status: 'paid', customer_email: 'owner@example.invalid', customer_name: 'QA',
  metadata: { checkout_gateway_mode: 'sandbox' }, ...patch });

function load(file, settings, mocks = {}, extras = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, process: { env: settings },
    URL, Headers, Response, Buffer, AbortSignal, console: { info() {}, error() {} },
    require(id) { if (id in mocks) return mocks[id]; throw Error(`Unmocked dependency ${id}`); },
    fetch() { throw Error('Unmocked network is forbidden'); }, ...extras });
  return module.exports;
}

function fixture(settings = env, link = action, options = {}) {
  const requests = [], logs = [];
  const safety = load('lib/preview-safety.ts', settings);
  const mocks = { '@/lib/preview-safety': safety,
    '@/lib/checkout/db': { appendOrderLog: async (...args) => logs.push(args) } };
  const extras = { fetch: async (url, init) => {
    requests.push({ url, method: init.method, body: init.body ? JSON.parse(init.body) : null, headers: new Headers(init.headers), redirect: init.redirect });
    if (url === `${db}/rest/v1/`) {
      return options.schemaError ? new Response('private-detail', { status: 401 })
        : Response.json({ paths: options.noFunction ? {} : { '/rpc/set_commercial_program_paid_access': {} } });
    }
    if (url === `${db}/rest/v1/rpc/set_commercial_program_paid_access`) {
      if (options.rpcError) return new Response(options.rpcError, { status: 400 });
      if (options.missingUser && requests.length === 1) return new Response('Auth user not found', { status: 400 });
      return Response.json({ ok: true });
    }
    if (url === `${db}/auth/v1/admin/generate_link`) {
      if (options.authError) return new Response(options.authError, { status: 400 });
      return Response.json({ action_link: link, user: { id: 'synthetic-user' } });
    }
    if (url === 'https://api.resend.com/emails') return Response.json({ id: 'fixture-message' }, { status: options.mailStatus || 200 });
    throw Error('Unapproved provider destination');
  } };
  return { safety, requests, logs,
    raptor: load('lib/checkout/raptorpro.ts', settings, mocks, extras),
    email: load('lib/checkout/email.ts', settings, mocks, extras) };
}
const mail = (patch = {}) => ({ orderId, to: 'owner@example.invalid', name: 'QA', actionUrl: action,
  accountCreated: false, programName: 'Speed Pro', locale: 'pt', ...patch });

test('Raptor QA scope is off by default and pinned to branch, database, provider and origin', async () => {
  const patches = [
    { VERCEL_ENV: 'production' }, { VERCEL_ENV: 'development' }, { VERCEL_ENV: '' },
    { VERCEL_GIT_COMMIT_REF: 'main' }, { RAPTORPRO_PREVIEW_PROVISIONING_ENABLED: '' },
    { LOADPRO_PREVIEW_INTEGRATION_ENABLED: 'false' }, { CHECKOUT_GATEWAY_MODE: 'live' },
    { STRIPE_SECRET_KEY: 'sk_live_fixture' }, { CHECKOUT_DB_DRIVER: 'sqlite' },
    { NEXT_PUBLIC_SITE_URL: 'https://rumoaopro.com' }, { CHECKOUT_TEST_SUPABASE_PROJECT_REF: 'other' },
    { SUPABASE_URL: 'https://production.supabase.co' }, { NEXT_PUBLIC_SUPABASE_URL: 'https://other.supabase.co' },
    { RAPTORPRO_TEST_SUPABASE_PROJECT_REF: 'nprxprvfzxnghnyjhttr', RAPTORPRO_SUPABASE_URL: 'https://nprxprvfzxnghnyjhttr.supabase.co' },
    { RAPTORPRO_SUPABASE_URL: 'https://other.supabase.co' }, { RAPTORPRO_APP_URL: 'https://app.rumoaopro.com.br' },
    { RAPTORPRO_APP_URL: 'http://127.0.0.1:9999' }, { RAPTORPRO_PREVIEW_ORDER_ID: '' },
    { RAPTORPRO_PREVIEW_ALLOWED_EMAIL: '' }, { RAPTORPRO_PREVIEW_ALLOWED_EMAIL: 'a@example.invalid,b@example.invalid' }
  ];
  for (const patch of patches) {
    const f = fixture({ ...env, ...patch });
    assert.equal(f.safety.canProvisionRaptorProSandbox(order()), false, JSON.stringify(patch));
    if (!Object.hasOwn(patch, 'RAPTORPRO_PREVIEW_PROVISIONING_ENABLED')) {
      assert.equal(f.safety.canInspectRaptorProSandbox(order()), false, JSON.stringify(patch));
    }
    await assert.rejects(f.raptor.syncRaptorProProgramAccess(order(), 'granted'));
    assert.equal(f.requests.length, 0);
  }
});

test('only the selected Stripe sandbox order, product and recipient may provision', async () => {
  for (const patch of [{ id: 'other' }, { customer_email: 'customer@example.invalid' },
    { product_id: 'power_pro' }, { product_id: 'projeto_36_2022_pt' }, { gateway: 'mock' },
    { metadata: {} }, { metadata: { checkout_gateway_mode: 'live' } }, { status: 'pending' }]) {
    const f = fixture();
    await assert.rejects(f.raptor.syncRaptorProProgramAccess(order(patch), 'granted'));
    assert.equal(f.requests.length, 0);
  }
});

test('approved QA uses only the existing synthetic program and exact staging Auth redirect', async () => {
  const f = fixture();
  assert.equal(await f.raptor.createRaptorProCheckoutAccessLink(order()), action);
  assert.equal(f.requests.length, 2);
  assert.equal(f.requests[0].body.p_program_id, 'speed-pro-qa-20260913');
  assert.equal(f.requests[0].body.p_email, 'owner@example.invalid');
  assert.equal(f.requests[0].body.p_order_id, orderId);
  assert.equal(f.requests[1].body.redirect_to, redirect);
  assert.equal(f.requests[1].body.data.program_id, 'speed-pro-qa-20260913');
  assert.ok(f.requests.every(request => request.redirect === 'error'));
  assert.equal(f.raptor.getRaptorProProgramUrl('project_36'), redirect);
  await f.raptor.syncRaptorProProgramAccess(order(), 'revoked');
  assert.equal(f.requests.at(-1).body.p_status, 'revoked');
  assert.equal(f.requests.at(-1).body.p_program_id, 'speed-pro-qa-20260913');
});

test('provider fallback or production magic links cannot leave the QA boundary', async () => {
  for (const link of ['https://app.rumoaopro.com.br', action.replace('nawortzzryivahnutdqe','nprxprvfzxnghnyjhttr'),
    action.replace(encodeURIComponent(redirect), encodeURIComponent('https://app.rumoaopro.com.br')),
    `${db}/auth/v1/verify?token=fixture&type=magiclink`, action.replace('type=magiclink','type=recovery')]) {
    const f = fixture(env, link);
    await assert.rejects(f.raptor.createRaptorProCheckoutAccessLink(order()), /unapproved sign-in/);
    assert.equal(await f.email.sendRaptorProProgramAccessEmail(mail({ actionUrl: link })), false);
    assert.equal(f.requests.some(r => r.url.includes('resend.com')), false);
  }
});

test('generic preview email stays blocked; only the allowed access template uses the dedicated QA key', async () => {
  const f = fixture();
  assert.equal(f.email.isEmailDeliveryConfigured(), false);
  assert.equal(f.email.isEmailDeliveryConfigured({ raptorPreviewTo: mail().to, orderId }), true);
  assert.equal(await f.email.sendEmail({ to: mail().to, orderId, subject: 'Generic', html: 'test' }), false);
  assert.equal(await f.email.sendRaptorProProgramAccessEmail(mail()), true);
  assert.equal(f.requests.length, 1);
  assert.equal(f.requests[0].headers.get('authorization'), 'Bearer re_qa_fixture');
  assert.equal(f.requests[0].body.to, mail().to);
  assert.equal(f.requests[0].body.from, env.RAPTORPRO_PREVIEW_EMAIL_FROM);
  assert.equal(f.requests[0].redirect, 'error');
  assert.match(f.requests[0].body.subject, /TESTE SEM COBRANÇA/);
  assert.match(f.requests[0].body.html, /AMBIENTE DE TESTES/);
  assert.doesNotMatch(f.requests[0].body.html, /app\.rumoaopro\.com\.br/);
  assert.doesNotMatch(JSON.stringify(f.logs), /fixture-only|token=/);
});

test('missing dedicated mail configuration never falls back to production credentials', async () => {
  for (const patch of [{ RAPTORPRO_PREVIEW_RESEND_API_KEY: '' }, { RAPTORPRO_PREVIEW_EMAIL_ENABLED: 'false' },
    { RAPTORPRO_PREVIEW_EMAIL_FROM: '' }, { VERCEL_GIT_COMMIT_REF: 'other-preview' }]) {
    const f = fixture({ ...env, ...patch });
    assert.equal(await f.email.sendRaptorProProgramAccessEmail(mail()), false);
    assert.equal(f.requests.length, 0);
  }
  for (const patch of [{ to: 'customer@example.invalid' }, { to: ['owner@example.invalid'] }, { orderId: 'other' }]) {
    const f = fixture();
    assert.equal(await f.email.sendRaptorProProgramAccessEmail(mail(patch)), false);
    assert.equal(f.requests.length, 0);
  }
});

test('sandbox webhook bridge sends one permitted QA message and no production notifications or delivery', async () => {
  for (const allowed of [true, false]) {
    const current = order();
    const f = fixture(allowed ? env : { ...env, RAPTORPRO_PREVIEW_PROVISIONING_ENABLED: 'false' });
    let grants = 0;
    const events = load('lib/checkout/order-events.ts', env, {
      '@/lib/preview-safety': f.safety,
      '@/lib/checkout/db': { getOrderById: async () => current, appendOrderLog: async () => {},
        updateOrderGatewayIds: async (id, data) => Object.assign(current.metadata, data.metadata) },
      '@/lib/checkout/access': { grantProductAccess: async () => { grants++; } },
      '@/lib/checkout/delivery': { deliverOrder: async () => { throw Error('No real delivery'); } },
      '@/lib/checkout/admin-push': { sendAdminSalePush: async () => { throw Error('No real notification'); } },
      '@/lib/checkout/email': f.email, '@/lib/checkout/raptorpro': f.raptor,
      '@/lib/checkout/loadpro': { isLoadProOrder: () => false }
    });
    await events.markOrderAsPaid(orderId);
    assert.equal(grants, 1); // Existing local checkout entitlement only.
    assert.equal(f.requests.length, allowed ? 3 : 0);
    assert.equal(current.metadata.raptorpro_provisioning_status, allowed ? 'synced' : 'sandbox_skipped');
    if (allowed) {
      assert.equal(current.metadata.raptorpro_program_id, 'speed-pro-qa-20260913');
      assert.equal(current.metadata.raptorpro_welcome_email_sent, true);
      await events.markOrderAsPaid(orderId);
      assert.equal(f.requests.filter(r => r.url.includes('resend.com')).length, 1);
    }
  }
});

test('a new QA account is invited only in staging and granted only the synthetic program', async () => {
  const f = fixture(env, action.replace('type=magiclink', 'type=invite'), { missingUser: true });
  const result = await f.raptor.syncRaptorProProgramAccess(order(), 'granted');
  assert.equal(result.accountCreated, true);
  assert.equal(f.requests.length, 3);
  assert.equal(f.requests[1].body.type, 'invite');
  assert.equal(f.requests[1].body.email, mail().to);
  assert.equal(f.requests[1].body.redirect_to, redirect);
  assert.equal(f.requests[2].body.p_program_id, 'speed-pro-qa-20260913');
  assert.equal(await f.email.sendRaptorProProgramAccessEmail(mail({ actionUrl: result.actionUrl, accountCreated: true })), true);
  assert.match(f.requests.at(-1).body.html, /Criar senha e acessar/);
});

test('QA provider failures do not expose raw response bodies or report failed mail as delivered', async () => {
  for (const options of [{ rpcError: 'private-provider-detail' }, { authError: 'private-provider-detail' }]) {
    const f = fixture(env, action, options);
    await assert.rejects(f.raptor.syncRaptorProProgramAccess(order(), 'granted'), error => {
      assert.match(error.message, /failed: 400/);
      assert.doesNotMatch(error.message, /private-provider-detail/);
      return true;
    });
  }
  const f = fixture(env, action, { mailStatus: 429 });
  assert.equal(await f.email.sendRaptorProProgramAccessEmail(mail()), false);
  assert.equal(f.logs.some(log => log[1] === 'email.sent'), false);
  assert.equal(f.logs.some(log => log[1] === 'email.error'), true);
  assert.doesNotMatch(JSON.stringify(f.logs), /fixture-only|token=/);
});

test('read-only preview diagnostic works with writes disabled and never executes an RPC or sends mail', async () => {
  const settings = { ...env, RAPTORPRO_PREVIEW_PROVISIONING_ENABLED: 'false', RAPTORPRO_PREVIEW_EMAIL_ENABLED: 'false' };
  const f = fixture(settings);
  assert.equal(f.safety.canProvisionRaptorProSandbox(order()), false);
  assert.equal(f.safety.canInspectRaptorProSandbox(order()), true);
  const result = await f.raptor.inspectRaptorProPreviewConnection(order());
  assert.equal(result.credentialType, 'secret');
  assert.equal(result.apiStatus, 200);
  assert.equal(result.provisioningFunctionVisible, true);
  assert.equal(f.requests.length, 1);
  assert.equal(f.requests[0].method, 'GET');
  assert.equal(f.requests[0].url, `${db}/rest/v1/`);
  assert.equal(f.requests[0].headers.get('apikey'), env.RAPTORPRO_SUPABASE_SERVICE_ROLE_KEY);
  assert.equal(f.requests[0].headers.get('authorization'), null);
  assert.equal(f.requests[0].redirect, 'error');
  assert.equal(f.logs.length, 0);
  assert.doesNotMatch(JSON.stringify(result), /sb_secret|owner@|token|paths/);
});

test('diagnostic rejects other environments and orders without network requests', async () => {
  for (const settings of [{ ...env, VERCEL_ENV: 'production' }, { ...env, VERCEL_GIT_COMMIT_REF: 'main' },
    { ...env, RAPTORPRO_SUPABASE_URL: 'https://nprxprvfzxnghnyjhttr.supabase.co' }]) {
    const f = fixture(settings);
    await assert.rejects(f.raptor.inspectRaptorProPreviewConnection(order()));
    assert.equal(f.requests.length, 0);
  }
  for (const patch of [{ id: 'other' }, { status: 'pending' }, { status: 'refunded' },
    { customer_email: 'customer@example.invalid' }, { product_id: 'power_pro' }, { metadata: {} }, { gateway: 'mock' }]) {
    const f = fixture();
    await assert.rejects(f.raptor.inspectRaptorProPreviewConnection(order(patch)));
    assert.equal(f.requests.length, 0);
  }
});

test('diagnostic reports only credential type and safe failure indicators', async () => {
  const jwt = role => ['eyJmaXh0dXJlIjp0cnVlfQ', Buffer.from(JSON.stringify({ role })).toString('base64url'), 'fixture'].join('.');
  for (const [key, type] of [['', 'missing'], ['sb_publishable_fixture', 'publishable'],
    [jwt('anon'), 'legacy_anon'], ['not-a-key', 'unrecognized'], [jwt('authenticated'), 'unrecognized']]) {
    const f = fixture({ ...env, RAPTORPRO_SUPABASE_SERVICE_ROLE_KEY: key });
    const result = await f.raptor.inspectRaptorProPreviewConnection(order());
    assert.equal(result.credentialType, type);
    assert.equal(result.apiStatus, null);
    assert.equal(f.requests.length, 0);
  }
  const f = fixture({ ...env, RAPTORPRO_SUPABASE_SERVICE_ROLE_KEY: `  ${jwt('service_role')}\n` });
  assert.equal((await f.raptor.inspectRaptorProPreviewConnection(order())).credentialType, 'legacy_service_role');
  assert.equal(f.requests[0].headers.get('authorization'), `Bearer ${jwt('service_role')}`);
  const failed = fixture(env, action, { schemaError: true });
  const result = await failed.raptor.inspectRaptorProPreviewConnection(order());
  assert.equal(result.apiStatus, 401);
  assert.equal(result.provisioningFunctionVisible, false);
  assert.doesNotMatch(JSON.stringify(result), /private-detail/);
});

function adminFixture({ settings = env, current = order(), authorized = true, options = {} } = {}) {
  const f = fixture(settings, action, options);
  const effects = { reads: 0, delivered: 0, updates: 0 };
  const route = load('app/api/admin/orders/[id]/raptorpro-retry/route.ts', settings, {
    'next/server': { NextResponse: {
      json: (body, init = {}) => ({ body, status: init.status || 200, headers: init.headers }),
      redirect: (url, status) => ({ url: String(url), status })
    } },
    '@/lib/checkout/admin-auth': { isAdminRequest: async () => authorized },
    '@/lib/preview-safety': f.safety,
    '@/lib/checkout/db': {
      getOrderById: async () => { effects.reads++; return current; },
      appendOrderLog: async (...args) => f.logs.push(args),
      updateOrderGatewayIds: async (id, data) => { effects.updates++; Object.assign(current.metadata, data.metadata); }
    },
    '@/lib/checkout/delivery': { deliverOrder: async () => { effects.delivered++; } },
    '@/lib/checkout/email': f.email, '@/lib/checkout/raptorpro': f.raptor
  });
  return { ...f, effects, current, run: method => route[method]({ url: `${env.NEXT_PUBLIC_SITE_URL}/api/admin/orders/${orderId}/raptorpro-retry` },
    { params: Promise.resolve({ id: orderId }) }) };
}

test('admin diagnostic and retry require authentication before reading orders', async () => {
  const f = adminFixture({ authorized: false });
  assert.equal((await f.run('GET')).status, 401);
  assert.equal((await f.run('POST')).status, 401);
  assert.equal(f.effects.reads, 0);
  assert.equal(f.requests.length, 0);
});

test('admin diagnostic is no-store, read-only and unavailable for other orders or production', async () => {
  const f = adminFixture({ settings: { ...env, RAPTORPRO_PREVIEW_PROVISIONING_ENABLED: 'false' } });
  const result = await f.run('GET');
  assert.equal(result.status, 200);
  assert.equal(result.headers['Cache-Control'], 'no-store');
  assert.equal(f.effects.updates, 0);
  assert.equal(f.effects.delivered, 0);
  for (const settings of [{ current: null }, { current: order({ id: 'other' }) },
    { current: order({ status: 'pending' }) }, { settings: { ...env, VERCEL_ENV: 'production' } }]) {
    const denied = adminFixture(settings);
    assert.equal((await denied.run('GET')).status, 404);
    assert.equal(denied.requests.length, 0);
  }
});

test('isolated admin retry rejects other orders and disabled mail before any provider mutation', async () => {
  for (const settings of [{ current: order({ id: 'other' }) }, { current: order({ customer_email: 'customer@example.invalid' }) },
    { current: order({ status: 'pending' }) }, { current: order({ status: 'refunded' }) },
    { settings: { ...env, RAPTORPRO_PREVIEW_PROVISIONING_ENABLED: 'false' } },
    { settings: { ...env, RAPTORPRO_PREVIEW_EMAIL_ENABLED: 'false' } },
    { settings: { ...env, RAPTORPRO_PREVIEW_RESEND_API_KEY: '' } }]) {
    const f = adminFixture(settings);
    const result = await f.run('POST');
    assert.equal(result.status, 303);
    assert.notEqual(new URL(result.url).searchParams.get('raptorRetry'), 'sent');
    assert.equal(f.requests.length, 0);
    assert.equal(f.effects.updates, 0);
    assert.equal(f.effects.delivered, 0);
  }
});

test('isolated admin retry grants only the fixture and sends the approved message without generic delivery', async () => {
  const f = adminFixture();
  assert.equal(new URL((await f.run('POST')).url).searchParams.get('raptorRetry'), 'sent');
  assert.equal(f.requests.length, 3);
  assert.equal(f.requests[0].body.p_program_id, 'speed-pro-qa-20260913');
  assert.equal(f.requests[2].body.to, 'owner@example.invalid');
  assert.match(f.requests[2].body.subject, /TESTE SEM COBRANÇA/);
  assert.equal(f.current.metadata.raptorpro_program_id, 'speed-pro-qa-20260913');
  assert.equal(f.current.metadata.raptorpro_welcome_email_sent, true);
  assert.equal(f.effects.delivered, 0);
  await f.run('POST');
  assert.equal(f.requests.length, 3); // A completed test is not sent twice by a later retry.
  assert.doesNotMatch(JSON.stringify(f.logs), /fixture-only|token=/);
});

test('isolated retry does not mark mail sent on failure or reveal provider details in its error log', async () => {
  for (const options of [{ mailStatus: 429 }, { rpcError: 'private-provider-detail' }]) {
    const f = adminFixture({ options });
    assert.notEqual(new URL((await f.run('POST')).url).searchParams.get('raptorRetry'), 'sent');
    assert.notEqual(f.current.metadata.raptorpro_welcome_email_sent, true);
    assert.equal(f.effects.delivered, 0);
    assert.doesNotMatch(JSON.stringify(f.logs), /private-provider-detail|fixture-only|token=/);
  }
});

test('ordinary production admin retry retains real program metadata and normal delivery', async () => {
  const f = adminFixture({ settings: { ...env, VERCEL_ENV: 'production' }, current: order({ metadata: {} }) });
  assert.equal(new URL((await f.run('POST')).url).searchParams.get('raptorRetry'), 'sent');
  assert.equal(f.requests[0].body.p_program_id, 'commercial-program-project-36');
  assert.equal(f.current.metadata.raptorpro_program_id, 'commercial-program-project-36');
  assert.equal(f.effects.delivered, 1);
  assert.equal(f.requests.at(-1).headers.get('authorization'), 'Bearer re_production_fixture_do_not_use');
});
