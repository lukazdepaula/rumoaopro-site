/** Preview requests must never inherit the production data or payment environment. */
export function isPreviewEnvironment() {
  return process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'development' || process.env.LOADPRO_TEST_MODE === 'true';
}
function requirePreviewEnabled() {
  if (process.env.LOADPRO_PREVIEW_INTEGRATION_ENABLED !== 'true') throw new Error('Preview integration is not configured');
}
export function assertPreviewDatabase(url: string | undefined, kind: 'loadpro' | 'checkout' | 'raptorpro') {
  if (!isPreviewEnvironment()) return;
  requirePreviewEnabled();
  const ref = process.env[kind === 'loadpro' ? 'LOADPRO_TEST_SUPABASE_PROJECT_REF' : kind === 'raptorpro' ? 'RAPTORPRO_TEST_SUPABASE_PROJECT_REF' : 'CHECKOUT_TEST_SUPABASE_PROJECT_REF'];
  if (!ref || ref === 'iqkzqdoyvxblnsgnsfbz' || !/^[a-z0-9-]+$/.test(ref) || url?.replace(/\/$/, '') !== `https://${ref}.supabase.co`) {
    throw new Error('Preview requires the explicitly pinned isolated database');
  }
}
export function assertPreviewProvider(key: string, value: string) {
  if (!isPreviewEnvironment()) return;
  requirePreviewEnabled();
  if (key === 'STRIPE_SECRET_KEY' && !value.startsWith('sk_test_')) throw new Error('Preview requires Stripe test credentials');
  // This integration uses Payments API. Orders API test credentials are a
  // different integration and must not be enabled by weakening this boundary.
  if (key === 'MERCADO_PAGO_ACCESS_TOKEN' && (!value.startsWith('TEST-') || process.env.LOADPRO_ANNUAL_PIX_SANDBOX !== 'true')) {
    throw new Error('Preview Pix Payments API test configuration is unavailable');
  }
}
function assertPreviewOrigin(value: string | undefined) {
  if (!value) throw new Error('Preview origin is missing');
  const url = new URL(value);
  const local = !process.env.VERCEL && url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname);
  if ((!local && url.protocol !== 'https:') || /(^|\.)rumoaopro\.com(\.br)?$/.test(url.hostname) || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('Preview must use a separate application origin');
  }
}
export function assertPreviewIntegration() {
  if (!isPreviewEnvironment()) return;
  requirePreviewEnabled();
  assertPreviewDatabase(process.env.LOADPRO_SUPABASE_URL, 'loadpro');
  assertPreviewDatabase(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL, 'checkout');
  assertPreviewOrigin(process.env.LOADPRO_APP_URL);
  assertPreviewOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  if (!process.env.LOADPRO_SUPABASE_SERVICE_ROLE_KEY || !(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
    || !['postgres', 'supabase'].includes(process.env.CHECKOUT_DB_DRIVER || '') || process.env.CHECKOUT_GATEWAY_MODE !== 'sandbox') {
    throw new Error('Preview data and checkout configuration is incomplete');
  }
  assertPreviewProvider('STRIPE_SECRET_KEY', process.env.STRIPE_SECRET_KEY || '');
  // Explicit non-credential override lets Stripe-only QA disable inherited Pix keys.
  if (process.env.MERCADO_PAGO_ACCESS_TOKEN && process.env.MERCADO_PAGO_ACCESS_TOKEN !== 'disabled') {
    assertPreviewProvider('MERCADO_PAGO_ACCESS_TOKEN', process.env.MERCADO_PAGO_ACCESS_TOKEN);
  }
}

/** Opt in only on the pinned preview; production sandbox events still skip access changes. */
export function canProvisionLoadProSandbox() {
  if (process.env.VERCEL_ENV === 'production' || !isPreviewEnvironment() || process.env.LOADPRO_PREVIEW_PROVISIONING_ENABLED !== 'true') return false;
  assertPreviewIntegration();
  return true;
}

export function publicLoadProAppUrl() {
  if (!isPreviewEnvironment()) return 'https://loadpro.rumoaopro.com.br/';
  try { assertPreviewOrigin(process.env.LOADPRO_APP_URL); }
  catch { return ''; }
  return process.env.LOADPRO_APP_URL!.replace(/\/$/, '') + '/';
}

/** Reading a public app URL must not require database/provisioning credentials. */
export function publicRaptorProAppUrl() {
  if (!isPreviewEnvironment()) return (process.env.RAPTORPRO_APP_URL || 'https://app.rumoaopro.com.br').replace(/\/$/, '');
  // The reviewed QA app is loopback-only, never a publicly deployed Raptor copy.
  if (process.env.VERCEL_ENV === 'preview'
    && process.env.VERCEL_GIT_COMMIT_REF === RAPTOR_QA_BRANCH
    && process.env.RAPTORPRO_PREVIEW_PROVISIONING_ENABLED === 'true'
    && process.env.RAPTORPRO_APP_URL === RAPTOR_QA_APP) return RAPTOR_QA_APP;
  try { assertPreviewOrigin(process.env.RAPTORPRO_APP_URL); }
  catch { return ''; }
  return process.env.RAPTORPRO_APP_URL!.replace(/\/$/, '');
}

const RAPTOR_QA_BRANCH = 'codex/site-security-dependencies-2026-09-29';
const RAPTOR_QA_DATABASE = 'https://nawortzzryivahnutdqe.supabase.co';
const CHECKOUT_QA_DATABASE = 'https://xxibnkscktibljtrqmxy.supabase.co';
const RAPTOR_QA_APP = 'http://127.0.0.1:3022';
const RAPTOR_QA_ACCESS_PATH = '/programs/project-36-speed-acceleration/access';

/** Temporary opt-in for one reviewed checkout, recipient and existing synthetic program. */
function raptorPreviewScope() {
  if (process.env.VERCEL_ENV !== 'preview'
    || process.env.VERCEL_GIT_COMMIT_REF !== RAPTOR_QA_BRANCH
    || process.env.LOADPRO_PREVIEW_INTEGRATION_ENABLED !== 'true'
    || process.env.RAPTORPRO_PREVIEW_PROVISIONING_ENABLED !== 'true'
    || process.env.CHECKOUT_GATEWAY_MODE !== 'sandbox'
    || !process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')
    || !['postgres', 'supabase'].includes(process.env.CHECKOUT_DB_DRIVER || '')
    || process.env.NEXT_PUBLIC_SITE_URL !== 'https://rumoaopro-site-git-codex-site-61f7c9-fagotti-10-7408s-projects.vercel.app'
    || process.env.CHECKOUT_TEST_SUPABASE_PROJECT_REF !== 'xxibnkscktibljtrqmxy'
    || (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) !== CHECKOUT_QA_DATABASE
    || (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== CHECKOUT_QA_DATABASE)
    || process.env.RAPTORPRO_TEST_SUPABASE_PROJECT_REF !== 'nawortzzryivahnutdqe'
    || process.env.RAPTORPRO_SUPABASE_URL !== RAPTOR_QA_DATABASE
    || process.env.RAPTORPRO_APP_URL !== RAPTOR_QA_APP) return null;
  const email = process.env.RAPTORPRO_PREVIEW_ALLOWED_EMAIL?.trim().toLowerCase() || '';
  const orderId = process.env.RAPTORPRO_PREVIEW_ORDER_ID || '';
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(email)
    || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) return null;
  return { email, orderId, programId: 'speed-pro-qa-20260913', appUrl: RAPTOR_QA_APP };
}

export function canProvisionRaptorProSandbox(order: {
  id: string; product_id: string; gateway: string; customer_email: string;
  metadata: Record<string, unknown>;
}) {
  const scope = raptorPreviewScope();
  return Boolean(scope && order.id === scope.orderId && order.product_id === 'project_36'
    && order.gateway === 'stripe' && order.metadata.checkout_gateway_mode === 'sandbox'
    && order.customer_email.trim().toLowerCase() === scope.email);
}

export function raptorProPreviewProgramId() {
  return raptorPreviewScope()?.programId || null;
}

/** Never email a production sign-in link, or a provider fallback to an unreviewed redirect. */
export function isRaptorProPreviewActionUrl(value: string) {
  if (!raptorPreviewScope()) return false;
  try {
    const url = new URL(value);
    return url.origin === RAPTOR_QA_DATABASE && url.pathname === '/auth/v1/verify'
      && !url.username && !url.password && !url.hash
      && ['invite', 'magiclink'].includes(url.searchParams.get('type') || '')
      && Boolean(url.searchParams.get('token') || url.searchParams.get('token_hash'))
      && url.searchParams.get('redirect_to') === `${RAPTOR_QA_APP}${RAPTOR_QA_ACCESS_PATH}`;
  } catch { return false; }
}

export function canSendRaptorProPreviewEmail(to: string, orderId: string) {
  const scope = raptorPreviewScope();
  return Boolean(scope && scope.email === to.trim().toLowerCase() && scope.orderId === orderId
    && process.env.RAPTORPRO_PREVIEW_EMAIL_ENABLED === 'true'
    && process.env.RAPTORPRO_PREVIEW_RESEND_API_KEY?.trim()
    && process.env.RAPTORPRO_PREVIEW_EMAIL_FROM?.trim());
}
