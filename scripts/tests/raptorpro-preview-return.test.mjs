import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
import * as jsxRuntime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';

const preview = {
  VERCEL_ENV: 'preview', VERCEL: '1', LOADPRO_PREVIEW_INTEGRATION_ENABLED: 'true',
  RAPTORPRO_APP_URL: 'https://raptor-sandbox.vercel.app/'
};

function load(file, env, mocks = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true
    }
  }).outputText;
  vm.runInNewContext(code, {
    module, exports: module.exports, process: { env }, URL, Headers, Response,
    fetch() { throw Error('Unexpected network request'); },
    require(id) {
      if (id in mocks) return mocks[id];
      if (id === '@/lib/preview-safety') return load('lib/preview-safety.ts', env);
      if (id === '@/lib/checkout/db') return {};
      throw Error(`Unmocked dependency: ${id}`);
    }
  });
  return module.exports;
}

test('public program links work without reading privileged Raptor credentials', () => {
  const env = new Proxy(preview, {
    get(target, key) {
      if (/^RAPTORPRO_(SUPABASE|TEST_SUPABASE)/.test(String(key))) {
        throw Error('Public link must not read provisioning configuration');
      }
      return target[key];
    }
  });
  const raptor = load('lib/checkout/raptorpro.ts', env);
  const slugs = {
    project_36: 'project-36-speed-acceleration',
    projeto_36_2022_pt: 'project-36-speed-acceleration',
    offseason_30_days: 'offseason-30-days',
    elanga_in_season: 'project-elanga-in-season',
    de_volta_aos_gramados_pt: 'de-volta-aos-gramados',
    power_pro: 'power-pro-v2'
  };
  for (const [productId, slug] of Object.entries(slugs)) {
    assert.equal(raptor.getRaptorProProgramUrl(productId), `https://raptor-sandbox.vercel.app/programs/${slug}/access`);
    assert.equal(raptor.getRaptorProProgramUrl({ product_id: productId }), raptor.getRaptorProProgramUrl(productId));
  }
  assert.equal(raptor.getRaptorProProgramUrl(), raptor.getRaptorProProgramUrl('offseason_30_days'));
});

test('missing or unsafe preview origins stay in the local catalog, never the live app', () => {
  const origins = [undefined, '', 'https://app.rumoaopro.com.br', 'https://RUMOAOPRO.COM',
    'https://loadpro.rumoaopro.com.br/', 'http://example.invalid', '//example.invalid',
    'javascript:alert(1)', 'https://user:secret@example.invalid',
    'https://sandbox.vercel.app/?token=fixture', 'https://sandbox.vercel.app/#fragment',
    'https://sandbox.vercel.app/nested'];
  for (const mode of [{ VERCEL_ENV: 'preview' }, { VERCEL_ENV: 'development' }, { LOADPRO_TEST_MODE: 'true' }]) {
    for (const RAPTORPRO_APP_URL of origins) {
      assert.equal(load('lib/checkout/raptorpro.ts', { ...mode, VERCEL: '1', RAPTORPRO_APP_URL })
        .getRaptorProProgramUrl('project_36'), '/apps');
    }
  }
});

test('public URL fix does not relax the privileged database boundary', async () => {
  const order = { id: 'test-order', product_id: 'project_36', metadata: {}, customer_email: 'qa@example.invalid' };
  for (const patch of [{}, {
    RAPTORPRO_SUPABASE_URL: 'https://live-raptor.supabase.co',
    RAPTORPRO_SUPABASE_SERVICE_ROLE_KEY: 'fixture-not-a-real-key'
  }, {
    RAPTORPRO_TEST_SUPABASE_PROJECT_REF: 'sandbox-raptor',
    RAPTORPRO_SUPABASE_URL: 'https://different-project.supabase.co',
    RAPTORPRO_SUPABASE_SERVICE_ROLE_KEY: 'fixture-not-a-real-key'
  }]) {
    const raptor = load('lib/checkout/raptorpro.ts', { ...preview, ...patch });
    for (const status of ['granted', 'revoked']) {
      await assert.rejects(raptor.syncRaptorProProgramAccess(order, status), /explicitly pinned isolated database/);
    }
    await assert.rejects(raptor.createRaptorProCheckoutAccessLink(order), /explicitly pinned isolated database/);
  }
});

test('production keeps the default and configured public program destinations', () => {
  const base = { VERCEL_ENV: 'production' };
  assert.equal(load('lib/checkout/raptorpro.ts', base).getRaptorProProgramUrl('project_36'),
    'https://app.rumoaopro.com.br/programs/project-36-speed-acceleration/access');
  assert.equal(load('lib/checkout/raptorpro.ts', { ...base, RAPTORPRO_APP_URL: 'https://app.example.invalid/' })
    .getRaptorProProgramUrl('power_pro'), 'https://app.example.invalid/programs/power-pro-v2/access');
});

async function renderReturn(env, authorized = true) {
  const order = {
    id: 'test-order', product_id: 'project_36', product_name: 'Speed Pro', status: 'paid',
    gateway: 'stripe', amount: 49.90, currency: 'USD', customer_email: 'qa@example.invalid',
    metadata: { checkout_gateway_mode: 'sandbox', checkout_locale: 'en', raptorpro_provisioning_status: 'sandbox_skipped' }
  };
  let reads = 0;
  const Page = load('app/checkout/success/page.tsx', env, {
    'react/jsx-runtime': jsxRuntime,
    'next/link': ({ children, ...props }) => jsxRuntime.jsx('a', { ...props, children }),
    'next/headers': { cookies: async () => ({ get: () => ({ value: 'fixture' }) }) },
    'lucide-react': { CheckCircle2: () => null, CircleAlert: () => null, MailCheck: () => null },
    '@/components/mock-payment-actions': { MockPaymentActions: () => null },
    '@/components/checkout-success-tracker': { CheckoutSuccessTracker: () => null },
    '@/components/site-footer': { SiteFooter: () => null },
    '@/components/site-header': { SiteHeader: () => null },
    '@/lib/checkout/checkout-access': { CHECKOUT_ACCESS_COOKIE_NAME: 'fixture', verifyCheckoutAccessToken: () => authorized },
    '@/lib/checkout/db': { getOrderById: async () => { reads++; return order; } },
    '@/lib/checkout/products': { getProductById: () => ({ id: 'project_36', slug: 'project-36' }),
      isLoadProProductId: () => false, formatMoney: () => '$49.90' },
    '@/lib/checkout/raptorpro': load('lib/checkout/raptorpro.ts', env),
    '@/lib/content': { nav: { en: [], pt: [] } }
  }).default;
  return { html: renderToStaticMarkup(await Page({ searchParams: Promise.resolve({ order_id: order.id, locale: 'en' }) })), reads };
}

test('authorized paid return renders with Raptor provisioning disabled', async () => {
  for (const RAPTORPRO_APP_URL of [preview.RAPTORPRO_APP_URL, undefined, 'https://app.rumoaopro.com.br']) {
    const { html, reads } = await renderReturn({ ...preview, RAPTORPRO_APP_URL });
    assert.equal(reads, 1);
    assert.match(html, /Payment approved/);
    assert.match(html, /Speed Pro/);
    assert.doesNotMatch(html, /https:\/\/app\.rumoaopro\.com\.br/);
    assert.ok(html.includes(RAPTORPRO_APP_URL === preview.RAPTORPRO_APP_URL
      ? 'https://raptor-sandbox.vercel.app/programs/project-36-speed-acceleration/access' : 'href="/apps"'));
  }
});

test('return without a valid checkout grant cannot read the order or display its details', async () => {
  const { html, reads } = await renderReturn(preview, false);
  assert.equal(reads, 0);
  assert.doesNotMatch(html, /Speed Pro|qa@example|test-order/);
});
