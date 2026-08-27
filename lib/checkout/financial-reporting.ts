import "server-only";

import { checkoutProducts } from "@/lib/checkout/products";
import type { Gateway, Order } from "@/lib/checkout/types";

export type FinancialRangePreset =
  | "current_month"
  | "today"
  | "last_7_days"
  | "last_30_days"
  | "previous_month"
  | "current_year"
  | "custom";

export type FinancialPeriod = {
  preset: FinancialRangePreset;
  start: Date;
  end: Date;
  startKey: string;
  endKey: string;
  label: string;
  days: number;
  isCurrentMonth: boolean;
};

export type FinancialSourceState = "ready" | "fallback" | "missing" | "error";

export type FinancialSource = {
  id: "stripe" | "mercado_pago" | "shopify_legacy";
  name: string;
  state: FinancialSourceState;
  grossRevenueBrl: number;
  netRevenueBrl: number;
  refundsBrl: number;
  feesBrl: number;
  paymentCount: number;
  excludedTransactionCount: number;
  detail: string;
  updatedAt: string;
  hasUnconvertedCurrencies: boolean;
};

export type FinancialDailyPoint = {
  key: string;
  label: string;
  grossRevenueBrl: number;
  netRevenueBrl: number;
  paymentCount: number;
};

export type FinancialPeriodMetrics = {
  period: FinancialPeriod;
  state: "ready" | "partial";
  grossRevenueBrl: number;
  netRevenueBrl: number;
  refundsBrl: number;
  feesBrl: number;
  paymentCount: number;
  averageTicketBrl: number;
  officialSourceCount: number;
  sources: FinancialSource[];
  daily: FinancialDailyPoint[];
  updatedAt: string;
  hasUnconvertedCurrencies: boolean;
};

type SourceDailyValue = {
  grossRevenueBrl: number;
  netRevenueBrl: number;
  paymentCount: number;
};

type SourceResult = FinancialSource & { daily: Map<string, SourceDailyValue> };

type StripeBalanceTransaction = {
  id: string;
  amount?: number;
  created?: number;
  currency?: string;
  fee?: number;
  net?: number;
  reporting_category?: string;
  type?: string;
  source?: string | StripeResource | null;
};

type StripeResource = {
  id?: string;
  object?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

type StripeBalanceResponse = {
  data?: StripeBalanceTransaction[];
  has_more?: boolean;
};

type MercadoPagoPayment = {
  id?: number | string;
  status?: string;
  date_approved?: string | null;
  currency_id?: string;
  transaction_amount?: number;
  transaction_amount_refunded?: number;
  transaction_details?: { net_received_amount?: number | null };
  fee_details?: Array<{ amount?: number }>;
  external_reference?: string | number | null;
  metadata?: Record<string, unknown>;
};

type MercadoPagoSearchResponse = {
  results?: MercadoPagoPayment[];
  paging?: { total?: number; limit?: number; offset?: number };
};

const REPORTING_TIME_ZONE = "America/Sao_Paulo";
const CACHE_TTL_MS = 60 * 1000;
const MAX_RANGE_DAYS = 366;
const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG",
  "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"
]);

const cache = new Map<string, { expiresAt: number; value: FinancialPeriodMetrics }>();
const requests = new Map<string, Promise<FinancialPeriodMetrics>>();

type SiteSalesIndex = {
  orderIds: Set<string>;
  productIds: Set<string>;
  stripeIdentifiers: Set<string>;
  mercadoPagoIdentifiers: Set<string>;
};

const PROVIDER_METADATA_KEYS = [
  "gateway_payment_id",
  "gateway_checkout_id",
  "stripe_subscription_id",
  "provider_subscription_id",
  "mercado_pago_subscription_id",
  "mercado_pago_preference_id",
  "mercado_pago_payment_id",
  "subscription_id",
  "payment_id",
  "checkout_id",
  "invoice_id",
  "session_id"
] as const;

function textValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function recordValue(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function addIdentifier(target: Set<string>, value: unknown) {
  const text = textValue(value);
  if (text) target.add(text);
}

function siteSalesIndex(orders: Order[]): SiteSalesIndex {
  const index: SiteSalesIndex = {
    orderIds: new Set(orders.map((order) => order.id)),
    productIds: new Set(checkoutProducts.map((product) => product.id)),
    stripeIdentifiers: new Set<string>(),
    mercadoPagoIdentifiers: new Set<string>()
  };

  for (const order of orders) {
    const identifiers =
      order.gateway === "stripe"
        ? index.stripeIdentifiers
        : order.gateway === "mercado_pago"
          ? index.mercadoPagoIdentifiers
          : null;
    if (!identifiers) continue;
    addIdentifier(identifiers, order.id);
    addIdentifier(identifiers, order.gateway_payment_id);
    addIdentifier(identifiers, order.gateway_checkout_id);
    for (const key of PROVIDER_METADATA_KEYS) {
      addIdentifier(identifiers, order.metadata[key]);
    }
  }

  return index;
}

function metadataMatchesSite(
  metadata: Record<string, unknown> | null,
  identifiers: Set<string>,
  index: SiteSalesIndex
) {
  if (!metadata) return false;
  const orderId = textValue(metadata.order_id) || textValue(metadata.orderId);
  if (orderId && (index.orderIds.has(orderId) || identifiers.has(orderId))) return true;
  const productId =
    textValue(metadata.product_id) ||
    textValue(metadata.productId) ||
    textValue(metadata.plan_code);
  return Boolean(productId && index.productIds.has(productId));
}

function resourceMatchesSite(
  value: unknown,
  identifiers: Set<string>,
  index: SiteSalesIndex,
  depth = 0
): boolean {
  if (depth > 7) return false;
  if (typeof value === "string") return identifiers.has(value) || index.orderIds.has(value);
  if (Array.isArray(value)) {
    return value.some((item) => resourceMatchesSite(item, identifiers, index, depth + 1));
  }
  const resource = recordValue(value);
  if (!resource) return false;
  if (resourceMatchesSite(resource.id, identifiers, index, depth + 1)) return true;
  if (metadataMatchesSite(recordValue(resource.metadata), identifiers, index)) return true;

  for (const key of [
    "payment_intent",
    "invoice",
    "subscription",
    "charge",
    "parent",
    "lines",
    "data"
  ]) {
    if (resourceMatchesSite(resource[key], identifiers, index, depth + 1)) return true;
  }
  return false;
}

function stripeReferencePath(id: string) {
  if (id.startsWith("ch_")) return `charges/${encodeURIComponent(id)}`;
  if (id.startsWith("in_")) return `invoices/${encodeURIComponent(id)}`;
  if (id.startsWith("pi_")) return `payment_intents/${encodeURIComponent(id)}`;
  if (id.startsWith("re_")) return `refunds/${encodeURIComponent(id)}`;
  if (id.startsWith("dp_")) return `disputes/${encodeURIComponent(id)}`;
  if (id.startsWith("sub_")) return `subscriptions/${encodeURIComponent(id)}`;
  return null;
}

function collectStripeReferences(value: unknown, output = new Set<string>(), depth = 0) {
  if (depth > 7) return output;
  if (typeof value === "string") {
    if (stripeReferencePath(value)) output.add(value);
    return output;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStripeReferences(item, output, depth + 1);
    return output;
  }
  const resource = recordValue(value);
  if (!resource) return output;
  for (const item of Object.values(resource)) {
    collectStripeReferences(item, output, depth + 1);
  }
  return output;
}

function numberFromEnv(name: string) {
  const value = Number(process.env[name]?.trim().replace(",", "."));
  return Number.isFinite(value) && value > 0 ? value : null;
}

function usdBrlRate() {
  return numberFromEnv("USD_TO_BRL_RATE") || 5.5;
}

function currentDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: REPORTING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const value = (type: "year" | "month" | "day") =>
    parts.find((part) => part.type === type)?.value || "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function validDateKey(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? null
    : value;
}

function addDays(key: string, days: number) {
  const date = new Date(`${key}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function startOfReportingDay(key: string) {
  return new Date(`${key}T03:00:00.000Z`);
}

function daysBetween(startKey: string, endExclusiveKey: string) {
  return Math.max(
    1,
    Math.round(
      (new Date(`${endExclusiveKey}T12:00:00.000Z`).getTime() -
        new Date(`${startKey}T12:00:00.000Z`).getTime()) /
        86_400_000
    )
  );
}

function monthStartKey(key: string) {
  return `${key.slice(0, 7)}-01`;
}

function previousMonthStartKey(key: string) {
  const date = new Date(`${monthStartKey(key)}T12:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() - 1);
  return date.toISOString().slice(0, 10);
}

function nextMonthStartKey(key: string) {
  const date = new Date(`${monthStartKey(key)}T12:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() + 1);
  return date.toISOString().slice(0, 10);
}

function formatPeriodLabel(startKey: string, endKey: string) {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  const start = formatter.format(new Date(`${startKey}T12:00:00.000Z`));
  const end = formatter.format(new Date(`${endKey}T12:00:00.000Z`));
  return startKey === endKey ? start : `${start} – ${end}`;
}

function buildPeriod(
  preset: FinancialRangePreset,
  startKey: string,
  endKey: string,
  currentKey: string
): FinancialPeriod {
  const endExclusiveKey = addDays(endKey, 1);
  const currentMonthEndKey = currentKey;
  return {
    preset,
    start: startOfReportingDay(startKey),
    end: startOfReportingDay(endExclusiveKey),
    startKey,
    endKey,
    label: formatPeriodLabel(startKey, endKey),
    days: daysBetween(startKey, endExclusiveKey),
    isCurrentMonth:
      startKey === monthStartKey(currentKey) && endKey === currentMonthEndKey
  };
}

export function resolveFinancialPeriod(
  params: { range?: string; from?: string; to?: string; period?: string },
  now = new Date()
): FinancialPeriod {
  const currentKey = currentDateKey(now);
  const requested = params.range as FinancialRangePreset | undefined;
  const presets: FinancialRangePreset[] = [
    "current_month",
    "today",
    "last_7_days",
    "last_30_days",
    "previous_month",
    "current_year",
    "custom"
  ];
  const preset = requested && presets.includes(requested) ? requested : "current_month";

  if (!params.range && /^\d{4}-(0[1-9]|1[0-2])$/.test(params.period || "")) {
    const requestedStartKey = `${params.period}-01`;
    const startKey = requestedStartKey > currentKey
      ? monthStartKey(currentKey)
      : requestedStartKey;
    const endKey = addDays(nextMonthStartKey(startKey), -1);
    return buildPeriod("custom", startKey, endKey > currentKey ? currentKey : endKey, currentKey);
  }

  if (preset === "today") return buildPeriod(preset, currentKey, currentKey, currentKey);
  if (preset === "last_7_days") {
    return buildPeriod(preset, addDays(currentKey, -6), currentKey, currentKey);
  }
  if (preset === "last_30_days") {
    return buildPeriod(preset, addDays(currentKey, -29), currentKey, currentKey);
  }
  if (preset === "previous_month") {
    const startKey = previousMonthStartKey(currentKey);
    return buildPeriod(preset, startKey, addDays(nextMonthStartKey(startKey), -1), currentKey);
  }
  if (preset === "current_year") {
    return buildPeriod(preset, `${currentKey.slice(0, 4)}-01-01`, currentKey, currentKey);
  }
  if (preset === "custom") {
    let startKey = validDateKey(params.from) || monthStartKey(currentKey);
    let endKey = validDateKey(params.to) || currentKey;
    if (startKey > currentKey) startKey = currentKey;
    if (endKey > currentKey) endKey = currentKey;
    if (startKey > endKey) [startKey, endKey] = [endKey, startKey];
    if (daysBetween(startKey, addDays(endKey, 1)) > MAX_RANGE_DAYS) {
      startKey = addDays(endKey, -(MAX_RANGE_DAYS - 1));
    }
    return buildPeriod(preset, startKey, endKey, currentKey);
  }

  return buildPeriod("current_month", monthStartKey(currentKey), currentKey, currentKey);
}

export function previousFinancialPeriod(period: FinancialPeriod): FinancialPeriod {
  const endKey = addDays(period.startKey, -1);
  const startKey = addDays(endKey, -(period.days - 1));
  return buildPeriod("custom", startKey, endKey, currentDateKey());
}

function dateKeyInReportingZone(value: Date) {
  return currentDateKey(value);
}

function addDaily(
  map: Map<string, SourceDailyValue>,
  key: string,
  grossRevenueBrl: number,
  netRevenueBrl: number,
  paymentCount: number
) {
  const current = map.get(key) || {
    grossRevenueBrl: 0,
    netRevenueBrl: 0,
    paymentCount: 0
  };
  current.grossRevenueBrl += grossRevenueBrl;
  current.netRevenueBrl += netRevenueBrl;
  current.paymentCount += paymentCount;
  map.set(key, current);
}

function convertToBrl(amount: number, currency: string) {
  const normalized = currency.toUpperCase();
  if (normalized === "BRL") return amount;
  if (normalized === "USD") return amount * usdBrlRate();
  return null;
}

function stripeMajorAmount(amount: number, currency: string) {
  return amount / (ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase()) ? 1 : 100);
}

async function requestJson<T>(url: URL, headers: HeadersInit) {
  const response = await fetch(url, {
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(15000)
  });
  const payload = (await response.json().catch(() => ({}))) as T;
  if (!response.ok) {
    throw new Error(`Financial provider returned HTTP ${response.status}`);
  }
  return payload;
}

async function stripeTransactionMatchesSite(
  transaction: StripeBalanceTransaction,
  secretKey: string,
  index: SiteSalesIndex,
  resourceRequests: Map<string, Promise<StripeResource | null>>
) {
  if (resourceMatchesSite(transaction.source, index.stripeIdentifiers, index)) return true;

  const pending = Array.from(collectStripeReferences(transaction.source));
  const checked = new Set<string>();
  while (pending.length > 0 && checked.size < 12) {
    const id = pending.shift();
    if (!id || checked.has(id)) continue;
    checked.add(id);
    const path = stripeReferencePath(id);
    if (!path) continue;

    let request = resourceRequests.get(id);
    if (!request) {
      request = requestJson<StripeResource>(new URL(`https://api.stripe.com/v1/${path}`), {
        Authorization: `Bearer ${secretKey}`
      }).catch(() => null);
      resourceRequests.set(id, request);
    }
    const resource = await request;
    if (!resource) continue;
    if (resourceMatchesSite(resource, index.stripeIdentifiers, index)) return true;
    for (const reference of collectStripeReferences(resource)) {
      if (!checked.has(reference)) pending.push(reference);
    }
  }

  return false;
}

async function loadStripeSource(
  period: FinancialPeriod,
  orders: Order[]
): Promise<SourceResult> {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) throw new Error("Stripe secret is not configured");
  const index = siteSalesIndex(orders);

  const transactions: StripeBalanceTransaction[] = [];
  let startingAfter: string | null = null;
  for (let page = 0; page < 50; page += 1) {
    const url = new URL("https://api.stripe.com/v1/balance_transactions");
    url.searchParams.set("created[gte]", String(Math.floor(period.start.getTime() / 1000)));
    url.searchParams.set("created[lt]", String(Math.floor(period.end.getTime() / 1000)));
    url.searchParams.set("limit", "100");
    url.searchParams.append("expand[]", "data.source");
    if (startingAfter) url.searchParams.set("starting_after", startingAfter);
    const payload = await requestJson<StripeBalanceResponse>(url, {
      Authorization: `Bearer ${secretKey}`
    });
    const pageData = Array.isArray(payload.data) ? payload.data : [];
    transactions.push(...pageData);
    if (!payload.has_more || pageData.length === 0) break;
    startingAfter = pageData.at(-1)?.id || null;
    if (page === 49) throw new Error("Stripe report exceeded the pagination safety limit");
  }

  const daily = new Map<string, SourceDailyValue>();
  let grossRevenueBrl = 0;
  let netRevenueBrl = 0;
  let refundsBrl = 0;
  let feesBrl = 0;
  let paymentCount = 0;
  let excludedTransactionCount = 0;
  let hasUnconvertedCurrencies = false;

  const uniqueTransactions = Array.from(
    new Map(transactions.map((transaction) => [transaction.id, transaction])).values()
  );
  const resourceRequests = new Map<string, Promise<StripeResource | null>>();
  for (const transaction of uniqueTransactions) {
    const source = recordValue(transaction.source) as StripeResource | null;
    if (source?.id) resourceRequests.set(source.id, Promise.resolve(source));
  }
  const siteMatches = new Map(
    await Promise.all(
      uniqueTransactions.map(async (transaction) => [
        transaction.id,
        await stripeTransactionMatchesSite(transaction, secretKey, index, resourceRequests)
      ] as const)
    )
  );

  for (const transaction of uniqueTransactions) {
    const category = transaction.reporting_category || transaction.type || "";
    const isPayment = category === "charge" || category === "payment";
    const isRefund = category === "refund" || category === "payment_refund";
    const isDispute = category === "dispute" || category === "payment_dispute";
    const isDisputeReversal = category === "dispute_reversal";
    if (!isPayment && !isRefund && !isDispute && !isDisputeReversal) continue;
    if (!siteMatches.get(transaction.id)) {
      excludedTransactionCount += 1;
      continue;
    }

    const currency = (transaction.currency || "BRL").toUpperCase();
    const amount = convertToBrl(stripeMajorAmount(transaction.amount || 0, currency), currency);
    const fee = convertToBrl(stripeMajorAmount(transaction.fee || 0, currency), currency);
    const net = convertToBrl(stripeMajorAmount(transaction.net || 0, currency), currency);
    if (amount === null || fee === null || net === null) {
      hasUnconvertedCurrencies = true;
      continue;
    }

    const created = new Date((transaction.created || 0) * 1000);
    const key = dateKeyInReportingZone(created);
    const gross = isPayment && amount > 0 ? amount : 0;
    const refund = isRefund || isDispute ? Math.abs(Math.min(0, amount)) : 0;
    const count = gross > 0 ? 1 : 0;
    grossRevenueBrl += gross;
    refundsBrl += refund;
    feesBrl += fee;
    netRevenueBrl += net;
    paymentCount += count;
    addDaily(daily, key, gross, net, count);
  }

  return {
    id: "stripe",
    name: "Stripe",
    state: "ready",
    grossRevenueBrl,
    netRevenueBrl,
    refundsBrl,
    feesBrl,
    paymentCount,
    excludedTransactionCount,
    detail:
      excludedTransactionCount > 0
        ? `Somente vendas vinculadas ao site; ${excludedTransactionCount} movimentação(ões) externa(s) ignorada(s)`
        : "Somente vendas vinculadas ao site, incluindo renovações",
    updatedAt: new Date().toISOString(),
    hasUnconvertedCurrencies,
    daily
  };
}

function mercadoPagoPaymentMatchesSite(payment: MercadoPagoPayment, index: SiteSalesIndex) {
  const paymentId = payment.id === null || payment.id === undefined ? null : String(payment.id);
  if (paymentId && index.mercadoPagoIdentifiers.has(paymentId)) return true;
  const externalReference =
    payment.external_reference === null || payment.external_reference === undefined
      ? null
      : String(payment.external_reference);
  if (
    externalReference &&
    (index.orderIds.has(externalReference) || index.mercadoPagoIdentifiers.has(externalReference))
  ) {
    return true;
  }
  return metadataMatchesSite(
    recordValue(payment.metadata),
    index.mercadoPagoIdentifiers,
    index
  );
}

async function loadMercadoPagoSource(
  period: FinancialPeriod,
  orders: Order[]
): Promise<SourceResult> {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim();
  if (!accessToken) throw new Error("Mercado Pago token is not configured");
  const index = siteSalesIndex(orders);

  const payments: MercadoPagoPayment[] = [];
  for (let offset = 0; offset < 5000; offset += 100) {
    const url = new URL("https://api.mercadopago.com/v1/payments/search");
    url.searchParams.set("sort", "date_approved");
    url.searchParams.set("criteria", "asc");
    url.searchParams.set("range", "date_approved");
    url.searchParams.set("begin_date", period.start.toISOString());
    url.searchParams.set("end_date", new Date(period.end.getTime() - 1).toISOString());
    url.searchParams.set("limit", "100");
    url.searchParams.set("offset", String(offset));
    const payload = await requestJson<MercadoPagoSearchResponse>(url, {
      Authorization: `Bearer ${accessToken}`
    });
    const pageData = Array.isArray(payload.results) ? payload.results : [];
    payments.push(...pageData);
    const total = Number(payload.paging?.total || 0);
    if (pageData.length < 100 || offset + pageData.length >= total) break;
    if (offset === 4900) throw new Error("Mercado Pago report exceeded the pagination safety limit");
  }

  const daily = new Map<string, SourceDailyValue>();
  let grossRevenueBrl = 0;
  let netRevenueBrl = 0;
  let refundsBrl = 0;
  let feesBrl = 0;
  let paymentCount = 0;
  let excludedTransactionCount = 0;
  let hasUnconvertedCurrencies = false;

  const uniquePayments = Array.from(
    new Map(
      payments.map((payment, position) => [
        payment.id === null || payment.id === undefined
          ? `${payment.date_approved || "unknown"}:${payment.transaction_amount || 0}:${position}`
          : String(payment.id),
        payment
      ])
    ).values()
  );

  for (const payment of uniquePayments) {
    if (!payment.date_approved || !["approved", "refunded", "charged_back"].includes(payment.status || "")) {
      continue;
    }
    if (!mercadoPagoPaymentMatchesSite(payment, index)) {
      excludedTransactionCount += 1;
      continue;
    }
    const currency = (payment.currency_id || "BRL").toUpperCase();
    const gross = convertToBrl(Number(payment.transaction_amount || 0), currency);
    const refund = convertToBrl(Number(payment.transaction_amount_refunded || 0), currency);
    const fee = convertToBrl(
      (payment.fee_details || []).reduce((total, item) => total + Number(item.amount || 0), 0),
      currency
    );
    const providerNet = payment.transaction_details?.net_received_amount;
    const net =
      providerNet === null || providerNet === undefined
        ? gross !== null && refund !== null && fee !== null
          ? gross - refund - fee
          : null
        : convertToBrl(Number(providerNet), currency);
    if (gross === null || refund === null || fee === null || net === null) {
      hasUnconvertedCurrencies = true;
      continue;
    }
    const key = dateKeyInReportingZone(new Date(payment.date_approved));
    grossRevenueBrl += gross;
    refundsBrl += refund;
    feesBrl += fee;
    netRevenueBrl += net;
    paymentCount += 1;
    addDaily(daily, key, gross, net, 1);
  }

  return {
    id: "mercado_pago",
    name: "Mercado Pago",
    state: "ready",
    grossRevenueBrl,
    netRevenueBrl,
    refundsBrl,
    feesBrl,
    paymentCount,
    excludedTransactionCount,
    detail:
      excludedTransactionCount > 0
        ? `Somente vendas vinculadas ao site; ${excludedTransactionCount} pagamento(s) externo(s) ignorado(s)`
        : "Somente vendas vinculadas ao site, incluindo renovações",
    updatedAt: new Date().toISOString(),
    hasUnconvertedCurrencies,
    daily
  };
}

export function financialOrderDate(order: Order) {
  const shopifyPurchaseDate =
    order.gateway === "shopify_legacy"
      ? textValue(order.metadata.shopify_purchase_date)
      : null;
  if (shopifyPurchaseDate && validDateKey(shopifyPurchaseDate)) {
    return new Date(`${shopifyPurchaseDate}T12:00:00.000Z`);
  }
  return new Date(order.paid_at || order.created_at);
}

export function financialOrderValueBrl(order: Order) {
  const rawShopifyAmount = order.metadata.shopify_amount_paid;
  const shopifyAmount =
    order.gateway === "shopify_legacy" &&
    rawShopifyAmount !== null &&
    rawShopifyAmount !== undefined &&
    rawShopifyAmount !== ""
      ? Number(rawShopifyAmount)
      : Number.NaN;
  const amount = Number.isFinite(shopifyAmount) && shopifyAmount >= 0
    ? shopifyAmount
    : order.amount;
  const shopifyCurrency =
    order.gateway === "shopify_legacy"
      ? textValue(order.metadata.shopify_currency)
      : null;
  const currency = (shopifyCurrency || order.currency).toUpperCase();
  if (currency === "BRL") return amount;
  if (currency === "USD") {
    return amount * (order.exchange_rate_used || usdBrlRate());
  }
  return null;
}

function localSource(
  period: FinancialPeriod,
  orders: Order[],
  gateway: Gateway,
  state: FinancialSourceState,
  detail: string
): SourceResult {
  const sourceOrders = orders.filter((order) => {
    if (order.status !== "paid" || order.gateway !== gateway) return false;
    const paidAt = financialOrderDate(order);
    return paidAt >= period.start && paidAt < period.end;
  });
  const daily = new Map<string, SourceDailyValue>();
  let grossRevenueBrl = 0;
  let paymentCount = 0;
  let hasUnconvertedCurrencies = false;
  for (const order of sourceOrders) {
    const value = financialOrderValueBrl(order);
    if (value === null) {
      hasUnconvertedCurrencies = true;
      continue;
    }
    grossRevenueBrl += value;
    paymentCount += 1;
    addDaily(
      daily,
      dateKeyInReportingZone(financialOrderDate(order)),
      value,
      value,
      1
    );
  }
  return {
    id:
      gateway === "stripe"
        ? "stripe"
        : gateway === "mercado_pago"
          ? "mercado_pago"
          : "shopify_legacy",
    name:
      gateway === "stripe"
        ? "Stripe"
        : gateway === "mercado_pago"
          ? "Mercado Pago"
          : "Shopify legado",
    state,
    grossRevenueBrl,
    netRevenueBrl: grossRevenueBrl,
    refundsBrl: 0,
    feesBrl: 0,
    paymentCount,
    excludedTransactionCount: 0,
    detail,
    updatedAt: new Date().toISOString(),
    hasUnconvertedCurrencies,
    daily
  };
}

async function sourceWithFallback(
  id: "stripe" | "mercado_pago",
  period: FinancialPeriod,
  orders: Order[]
) {
  const gateway = id as Gateway;
  const hasCredential =
    id === "stripe"
      ? Boolean(process.env.STRIPE_SECRET_KEY?.trim())
      : Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim());
  if (!hasCredential) {
    return localSource(
      period,
      orders,
      gateway,
      "missing",
      "Credencial ausente; exibindo somente pedidos locais disponíveis"
    );
  }

  try {
    return id === "stripe"
      ? await loadStripeSource(period, orders)
      : await loadMercadoPagoSource(period, orders);
  } catch (error) {
    console.error(`[financial-reporting.${id}]`, error);
    return localSource(
      period,
      orders,
      gateway,
      "fallback",
      "Fallback pelos pedidos locais; renovações podem ficar de fora"
    );
  }
}

function buildDailySeries(period: FinancialPeriod, sources: SourceResult[]) {
  const result: FinancialDailyPoint[] = [];
  for (let key = period.startKey; key <= period.endKey; key = addDays(key, 1)) {
    let grossRevenueBrl = 0;
    let netRevenueBrl = 0;
    let paymentCount = 0;
    for (const source of sources) {
      const value = source.daily.get(key);
      grossRevenueBrl += value?.grossRevenueBrl || 0;
      netRevenueBrl += value?.netRevenueBrl || 0;
      paymentCount += value?.paymentCount || 0;
    }
    result.push({
      key,
      label: `${key.slice(8, 10)}/${key.slice(5, 7)}`,
      grossRevenueBrl,
      netRevenueBrl,
      paymentCount
    });
  }
  return result;
}

async function loadFinancialPeriodMetrics(
  period: FinancialPeriod,
  orders: Order[]
): Promise<FinancialPeriodMetrics> {
  const [stripe, mercadoPago] = await Promise.all([
    sourceWithFallback("stripe", period, orders),
    sourceWithFallback("mercado_pago", period, orders)
  ]);
  const shopify = localSource(
    period,
    orders,
    "shopify_legacy",
    "ready",
    "Vendas do Shopify pela data e pelo valor original informados na migração"
  );
  const sources = [stripe, mercadoPago, shopify];
  const grossRevenueBrl = sources.reduce((total, source) => total + source.grossRevenueBrl, 0);
  const netRevenueBrl = sources.reduce((total, source) => total + source.netRevenueBrl, 0);
  const refundsBrl = sources.reduce((total, source) => total + source.refundsBrl, 0);
  const feesBrl = sources.reduce((total, source) => total + source.feesBrl, 0);
  const paymentCount = sources.reduce((total, source) => total + source.paymentCount, 0);
  const officialSourceCount = [stripe, mercadoPago].filter((source) => source.state === "ready").length;

  return {
    period,
    state: officialSourceCount === 2 ? "ready" : "partial",
    grossRevenueBrl,
    netRevenueBrl,
    refundsBrl,
    feesBrl,
    paymentCount,
    averageTicketBrl: paymentCount > 0 ? grossRevenueBrl / paymentCount : 0,
    officialSourceCount,
    sources,
    daily: buildDailySeries(period, sources),
    updatedAt: new Date().toISOString(),
    hasUnconvertedCurrencies: sources.some((source) => source.hasUnconvertedCurrencies)
  };
}

export async function getFinancialPeriodMetrics(
  period: FinancialPeriod,
  orders: Order[],
  options?: { bypassCache?: boolean }
): Promise<FinancialPeriodMetrics> {
  const cacheKey = `${period.startKey}:${period.endKey}`;
  if (!options?.bypassCache) {
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.value;
    const pending = requests.get(cacheKey);
    if (pending) return pending;
  }

  const request = loadFinancialPeriodMetrics(period, orders)
    .then((value) => {
      cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, value });
      return value;
    })
    .finally(() => {
      if (requests.get(cacheKey) === request) requests.delete(cacheKey);
    });
  requests.set(cacheKey, request);
  return request;
}
