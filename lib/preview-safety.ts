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
  if (process.env.MERCADO_PAGO_ACCESS_TOKEN) assertPreviewProvider('MERCADO_PAGO_ACCESS_TOKEN', process.env.MERCADO_PAGO_ACCESS_TOKEN);
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
