import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

function evaluate(source, mocks = {}, extras = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  vm.runInNewContext(code, {
    module, exports: module.exports, Date, URL, URLSearchParams, Headers, Response,
    process: { env: {} },
    require(id) {
      if (id in mocks) return mocks[id];
      throw Error(`Unmocked dependency: ${id}`);
    },
    ...extras
  });
  return module.exports;
}

function load(file, mocks = {}, extras = {}) {
  return evaluate(readFileSync(file, 'utf8'), mocks, extras);
}

const programs = load('lib/checkout/raptorpro.ts', {
  '@/lib/preview-safety': {}, '@/lib/checkout/db': {}
});

function order(patch = {}) {
  return {
    id: 'attempt', product_id: 'power_pro', customer_email: 'athlete@example.invalid',
    customer_name: 'Test athlete', status: 'pending', gateway: 'mercado_pago',
    paid_at: null, metadata: {}, created_at: '2026-08-26T02:00:00Z', ...patch
  };
}

function eventsFixture(input, otherPaid = null, lookupError = null) {
  const current = structuredClone(input);
  const state = { logs: [], raptor: [], localRevocations: [], loadpro: [], lookups: [] };
  const events = load('lib/checkout/order-events.ts', {
    '@/lib/checkout/db': {
      getOrderById: async () => current,
      updateOrderStatus: async (id, status) => { current.status = status; },
      updateOrderGatewayIds: async (id, data) => Object.assign(current.metadata, data.metadata),
      revokeProductAccessByOrder: async (id) => state.localRevocations.push(id),
      appendOrderLog: async (id, type, message, metadata) => state.logs.push({ id, type, message, metadata }),
      findOtherPaidOrderForProducts: async (...args) => {
        state.lookups.push(args);
        if (lookupError) throw lookupError;
        return otherPaid;
      }
    },
    '@/lib/checkout/access': {}, '@/lib/checkout/delivery': {},
    '@/lib/checkout/admin-push': {}, '@/lib/checkout/email': {},
    '@/lib/checkout/loadpro': {
      isLoadProOrder: (value) => value.product_id === 'loadpro_founders',
      syncLoadProAccess: async (value, input) => { state.loadpro.push(input); return {}; }
    },
    '@/lib/checkout/raptorpro': {
      ...programs,
      syncRaptorProProgramAccess: async (value, status) => {
        state.raptor.push({ orderId: value.id, status });
        return { handled: true, configured: true, accountCreated: false, actionUrl: null };
      }
    },
    '@/lib/preview-safety': { canProvisionLoadProSandbox: () => false }
  });
  return { events, state, current };
}

test('an unpaid Pix cancellation never revokes the program, including repeated callbacks', async () => {
  const paid = order({ id: 'valid-purchase', status: 'paid', paid_at: '2026-08-26T02:30:00Z' });
  const f = eventsFixture(order(), paid);
  await f.events.markOrderAsCancelled('attempt');
  await f.events.markOrderAsCancelled('attempt');
  assert.equal(f.current.status, 'cancelled');
  assert.equal(paid.status, 'paid');
  assert.equal(f.state.raptor.length, 0);
  assert.equal(f.state.localRevocations.length, 0);
  assert.equal(f.state.lookups.length, 0);
  assert.equal(f.state.logs.filter((log) => log.metadata?.reason === 'order_never_granted').length, 2);
});

for (const method of ['markOrderAsRefunded', 'markOrderAsCancelled']) {
  test(`${method} preserves access backed by another paid purchase`, async () => {
    const original = order({ status: 'paid', paid_at: '2026-08-26T02:30:00Z' });
    const f = eventsFixture(original, order({ id: 'other-paid', status: 'paid' }));
    await f.events[method](original.id);
    assert.equal(f.state.raptor.length, 0);
    assert.equal(f.state.lookups[0][0], original.customer_email);
    assert.equal(f.state.logs.find((log) => log.metadata?.reason === 'another_paid_order').metadata.paidOrderId, 'other-paid');
  });

  test(`${method} still revokes a paid purchase with no other entitlement`, async () => {
    const original = order({ status: 'paid', paid_at: '2026-08-26T02:30:00Z' });
    const f = eventsFixture(original);
    await f.events[method](original.id);
    assert.equal(f.state.raptor.length, 1);
    assert.equal(f.state.raptor[0].status, 'revoked');
    assert.equal(f.current.metadata.raptorpro_access_status, 'revoked');
    if (method === 'markOrderAsRefunded') assert.deepEqual(f.state.localRevocations, [original.id]);
  });
}

test('legacy and current Speed Pro product IDs are checked as the same program', async () => {
  const f = eventsFixture(order({ product_id: 'projeto_36_2022_pt', paid_at: '2026-08-26T02:30:00Z' }));
  await f.events.markOrderAsRefunded('attempt');
  assert.deepEqual(Array.from(f.state.lookups[0][1]), ['project_36', 'projeto_36_2022_pt']);
});

test('a previously recorded grant is checked even if the legacy paid timestamp is missing', async () => {
  const f = eventsFixture(order({ metadata: { raptorpro_access_status: 'granted' } }), order({ id: 'other' }));
  await f.events.markOrderAsCancelled('attempt');
  assert.equal(f.state.lookups.length, 1);
  assert.equal(f.state.raptor.length, 0);
});

test('database lookup failure preserves access and records a provisioning error', async () => {
  const f = eventsFixture(order({ paid_at: '2026-08-26T02:30:00Z' }), null, Error('database unavailable'));
  await f.events.markOrderAsRefunded('attempt');
  assert.equal(f.state.raptor.length, 0);
  assert.equal(f.current.metadata.raptorpro_provisioning_status, 'error');
  assert.ok(f.state.logs.some((log) => log.type === 'raptorpro.provisioning.error'));
});

test('sandbox orders cannot change production program access', async () => {
  const f = eventsFixture(order({ paid_at: '2026-08-26T02:30:00Z', metadata: { checkout_gateway_mode: 'sandbox' } }));
  await f.events.markOrderAsCancelled('attempt');
  assert.equal(f.state.raptor.length, 0);
  assert.equal(f.state.lookups.length, 0);
  assert.equal(f.current.metadata.raptorpro_provisioning_status, 'sandbox_skipped');
});

test('LoadPro subscription cancellation retains its existing behavior', async () => {
  const f = eventsFixture(order({ product_id: 'loadpro_founders' }));
  await f.events.markOrderAsCancelled('attempt');
  assert.equal(f.state.loadpro.length, 1);
  assert.equal(f.state.loadpro[0].status, 'canceled');
  assert.equal(f.state.lookups.length, 0);
});

const dbSource = ts.createSourceFile('db.ts', readFileSync('lib/checkout/db.ts', 'utf8'), ts.ScriptTarget.Latest, true);
const lookupSource = dbSource.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === 'findOtherPaidOrderForProducts').getText(dbSource);
function lookupFixture(extras) {
  return evaluate(lookupSource, {}, {
    normalizeOrder: (value) => ({ ...value, metadata: typeof value.metadata === 'string' ? JSON.parse(value.metadata) : value.metadata }),
    isAdminDeletedOrder: (value) => [true, 'true'].includes(value.metadata.admin_deleted),
    eq: (column, value) => `${column}=eq.${encodeURIComponent(value)}`,
    selectQuery: (parts) => ['select=*', ...parts].join('&'),
    ...extras
  }).findOtherPaidOrderForProducts;
}

test('SQLite lookup is exact, case insensitive, alias aware and not limited to 500 global orders', async () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('CREATE TABLE orders (id TEXT, product_id TEXT, customer_email TEXT, status TEXT, gateway TEXT, metadata TEXT, created_at TEXT)');
    const insert = db.prepare('INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?, ?)');
    const add = (value) => insert.run(value.id, value.product_id, value.customer_email, value.status, value.gateway, JSON.stringify(value.metadata), value.created_at);
    for (let i = 0; i < 550; i++) add(order({ id: `unrelated-${i}`, status: 'paid', customer_email: 'another@example.invalid' }));
    for (const patch of [
      { id: 'self' }, { id: 'refunded', status: 'refunded' }, { id: 'pending', status: 'pending' },
      { id: 'sandbox', metadata: { checkout_gateway_mode: 'sandbox' } }, { id: 'mock', gateway: 'mock' },
      { id: 'deleted', metadata: { admin_deleted: true } }, { id: 'deleted-string', metadata: { admin_deleted: 'true' } },
      { id: 'other-program', product_id: 'power_pro' }, { id: 'partial-email', customer_email: 'prefix-athlete@example.invalid' }
    ]) add(order({ status: 'paid', product_id: 'project_36', ...patch }));
    const lookup = lookupFixture({ useSupabaseDriver: () => false, getDatabase: () => db });
    assert.equal(await lookup('athlete@example.invalid', ['project_36', 'projeto_36_2022_pt'], 'self'), null);
    add(order({ id: 'valid-legacy', status: 'paid', product_id: 'projeto_36_2022_pt', customer_email: ' Athlete@Example.Invalid ' }));
    assert.equal((await lookup(' ATHLETE@example.invalid ', ['project_36', 'projeto_36_2022_pt'], 'self')).id, 'valid-legacy');
  } finally { db.close(); }
});

test('Supabase lookup filters on the server, escapes email wildcards and checks subsequent pages', async () => {
  const requests = [];
  const lookup = lookupFixture({
    useSupabaseDriver: () => true,
    supabaseRequest: async (table, options) => {
      assert.equal(table, 'orders');
      const query = new URLSearchParams(options.query);
      requests.push(query);
      assert.equal(query.get('customer_email'), 'ilike.athlete\\_one@example.invalid');
      assert.equal(query.get('status'), 'eq.paid');
      assert.equal(query.get('product_id'), 'in.("power_pro")');
      assert.equal(query.get('id'), 'neq.self');
      if (query.get('offset') === '0') return Array.from({ length: 100 }, (_, i) => order({ id: `sandbox-${i}`, status: 'paid', customer_email: 'athlete_one@example.invalid', metadata: { checkout_gateway_mode: 'sandbox' } }));
      return [order({ id: 'valid', status: 'paid', customer_email: 'ATHLETE_ONE@example.invalid' })];
    }
  });
  assert.equal((await lookup('Athlete_one@example.invalid', ['power_pro'], 'self')).id, 'valid');
  assert.equal(requests.length, 2);
  assert.equal(requests[1].get('offset'), '100');
});

test('a matching email is not inferred from a LIKE wildcard or partial match', async () => {
  const lookup = lookupFixture({ useSupabaseDriver: () => true, supabaseRequest: async () => [order({ status: 'paid', customer_email: 'athleteXone@example.invalid' })] });
  assert.equal(await lookup('athlete_one@example.invalid', ['power_pro'], 'self'), null);
});
