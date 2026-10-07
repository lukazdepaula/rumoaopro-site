import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

function load(file, mocks, env = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
  }).outputText;
  vm.runInNewContext(code, {
    module, exports: module.exports, Buffer, URL, Uint8Array,
    process: { env, cwd: () => '/fixture-only' },
    require(id) {
      if (id in mocks) return mocks[id];
      throw Error(`Unmocked dependency: ${id}`);
    },
    fetch() { throw Error('Unexpected network request'); }
  });
  return module.exports;
}

const bytes = Buffer.from('PUBLIC TEST FIXTURE - NOT A CUSTOMER MATERIAL');
const fileSystem = { existsSync: () => true, readFileSync: () => bytes };
const next = { NextResponse: class extends Response {
  static json(body, options = {}) { return Response.json(body, options); }
  static redirect(url) { return new Response(null, { status: 307, headers: { Location: String(url) } }); }
} };
const paid = { id: 'fixture-order', status: 'paid', delivery_status: 'not_delivered',
  product_id: 'fixture-product', customer_email: 'fixture@example.invalid', metadata: {} };
const product = { id: 'fixture-product', slug: 'fixture', name: 'Fixture', file_id: 'fixture.pdf', delivery_type: 'pdf_download' };

function deliveryFixture({ current = paid, item = product, emailResult = true, secret = 'fixture-not-a-secret' } = {}) {
  const state = { email: [], updates: [], tokens: 0 };
  const send = async (input) => { state.email.push(input); return emailResult; };
  const service = load('lib/checkout/delivery.ts', {
    'node:crypto': crypto, 'node:fs': fileSystem, 'node:path': path,
    '@/lib/checkout/db': {
      getOrderById: async () => current, appendOrderLog: async () => {},
      updateDeliveryStatus: async (...args) => state.updates.push(args),
      createCustomerLoginToken: async () => { state.tokens++; return { token: 'fixture-only-token' }; }
    },
    '@/lib/checkout/email': { sendLoadProAccessEmail: send, sendOnboardingEmail: send,
      sendPdfDeliveryEmail: send, sendProgramAccessEmail: send },
    '@/lib/checkout/payments': { getSiteUrl: () => 'https://fixture.example.invalid' },
    '@/lib/checkout/products': { getProductById: () => item, isLoadProProductId: () => false },
    '@/lib/checkout/raptorpro': { getRaptorProProgramConfig: () => ({ programId: 'fixture' }),
      isRaptorProProgramOrder: () => item?.id === 'project_36' }
  }, { NODE_ENV: 'production', SIGNED_DOWNLOAD_SECRET: secret });
  return { service, state };
}

test('download signature is bound to the order, file, expiry and signing secret', () => {
  const { service } = deliveryFixture();
  const url = new URL(service.createSignedDownloadUrl(paid, product));
  const valid = { orderId: paid.id, fileId: product.file_id,
    expires: url.searchParams.get('expires'), signature: url.searchParams.get('sig') };
  assert.equal(service.verifySignedDownload(valid), true);
  for (const patch of [{ orderId: 'other-order' }, { fileId: 'other.pdf' },
    { expires: String(Math.floor(Date.now() / 1000) - 1) }, { expires: 'NaN' },
    { signature: null }, { signature: '00'.repeat(32) }]) {
    assert.equal(service.verifySignedDownload({ ...valid, ...patch }), false);
  }
  assert.equal(deliveryFixture({ secret: 'separate-environment-fixture' }).service.verifySignedDownload(valid), false);
  assert.equal(deliveryFixture({ secret: '' }).service.createSignedDownloadUrl(paid, product), null);
});

function downloadFixture({ signed = true, current = paid, item = product } = {}) {
  const state = { reads: 0, files: 0 };
  const route = load('app/api/download/[orderId]/route.ts', {
    'node:fs': { ...fileSystem, readFileSync: () => { state.files++; return bytes; } },
    'next/server': next,
    '@/lib/checkout/db': { getOrderById: async () => { state.reads++; return current; } },
    '@/lib/checkout/delivery': { privateFilePath: () => '/fixture-only/fixture.pdf', verifySignedDownload: () => signed },
    '@/lib/checkout/products': { getProductById: () => item }
  });
  return { state, run: () => route.GET(new Request('https://fixture.example.invalid/api/download/fixture-order?file=fixture.pdf'),
    { params: Promise.resolve({ orderId: 'fixture-order' }) }) };
}

test('invalid signed download is rejected before loading an order or a file', async () => {
  const f = downloadFixture({ signed: false });
  assert.equal((await f.run()).status, 401);
  assert.equal(f.state.reads, 0);
  assert.equal(f.state.files, 0);
});

test('even a signed URL cannot download unpaid, refunded, missing or different-product material', async () => {
  for (const settings of [{ current: null }, { current: { ...paid, status: 'pending' } },
    { current: { ...paid, status: 'refunded' } }, { item: { ...product, file_id: 'other.pdf' } }]) {
    const f = downloadFixture(settings);
    assert.equal((await f.run()).status, 404);
    assert.equal(f.state.files, 0);
  }
});

test('valid paid download delivers only the fixture bytes with private no-store headers', async () => {
  const f = downloadFixture();
  const response = await f.run();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.equal(await response.text(), bytes.toString());
  assert.equal(f.state.files, 1);
});

function materialFixture({ loggedIn = true, allowed = true, storage = false } = {}) {
  const state = { materialReads: 0, checks: [], downloads: 0 };
  const route = load('app/api/account/materials/[id]/route.ts', {
    'node:fs': { ...fileSystem, readFileSync: () => { state.downloads++; return bytes; } },
    'node:path': path, 'next/server': next,
    '@/lib/checkout/customer-auth': { getCustomerSession: async () => loggedIn ? { user: { id: 'requesting-customer' } } : null },
    '@/lib/checkout/db': {
      getMaterialById: async () => { state.materialReads++; return { product_id: product.id, file_path_private: 'fixture-path' }; },
      userHasAccessToProduct: async (...args) => { state.checks.push(args); return allowed; }
    },
    '@/lib/checkout/materials': { resolvePrivateMaterialPath: () => '/fixture-only/fixture.pdf' },
    '@/lib/checkout/storage': { isSupabaseMaterialPath: () => storage,
      fetchSupabaseMaterial: async () => { state.downloads++; return { body: bytes, contentType: 'application/pdf', filename: 'fixture.pdf' }; } }
  });
  return { state, run: () => route.GET(new Request('https://fixture.example.invalid/api/account/materials/fixture'),
    { params: Promise.resolve({ id: 'fixture' }) }) };
}

test('private materials require login and the requesting customer entitlement before file access', async () => {
  const anonymous = materialFixture({ loggedIn: false });
  assert.equal((await anonymous.run()).status, 401);
  assert.equal(anonymous.state.materialReads, 0);
  for (const storage of [false, true]) {
    const denied = materialFixture({ allowed: false, storage });
    assert.equal((await denied.run()).status, 403);
    assert.deepEqual(denied.state.checks, [['requesting-customer', product.id]]);
    assert.equal(denied.state.downloads, 0);
    const granted = materialFixture({ storage });
    assert.equal(await (await granted.run()).text(), bytes.toString());
    assert.equal(granted.state.downloads, 1);
  }
});

test('delivery does not send for unpaid/already-delivered orders or unconfirmed Raptor provisioning', async () => {
  for (const settings of [{ current: { ...paid, status: 'pending' } },
    { current: { ...paid, delivery_status: 'delivered' } },
    { item: { ...product, id: 'project_36' } },
    { item: { ...product, id: 'project_36' }, current: { ...paid, metadata: { raptorpro_provisioning_status: 'synced' } } }]) {
    const f = deliveryFixture(settings);
    await f.service.deliverOrder(paid.id);
    assert.equal(f.state.email.length, 0);
    assert.equal(f.state.updates.some(([, status]) => status === 'delivered'), false);
  }
});

test('member delivery uses a personal login link and never reports failed email as delivered', async () => {
  for (const emailResult of [true, false]) {
    const f = deliveryFixture({ item: { ...product, delivery_type: 'member_area' }, emailResult });
    await f.service.deliverOrder(paid.id);
    assert.equal(f.state.tokens, 1);
    assert.equal(f.state.email.length, 1);
    assert.equal(f.state.email[0].to, paid.customer_email);
    assert.equal(new URL(f.state.email[0].accountUrl).pathname, '/api/auth/verify');
    assert.equal(new URL(f.state.email[0].accountUrl).searchParams.get('next'), '/my-programs/fixture');
    assert.equal(f.state.updates[0][1], emailResult ? 'delivered' : 'manual_required');
  }
});
