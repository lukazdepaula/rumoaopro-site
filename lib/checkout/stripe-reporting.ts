import "server-only";

import { checkoutProducts } from "@/lib/checkout/products";

type StripeProduct = {
  id?: string;
  name?: string;
  metadata?: Record<string, string>;
};

type StripePrice = {
  id: string;
  currency: string;
  nickname?: string | null;
  type?: string;
  unit_amount?: number | null;
  unit_amount_decimal?: string | null;
  metadata?: Record<string, string>;
  product?: string | StripeProduct;
  recurring?: {
    interval?: "day" | "week" | "month" | "year";
    interval_count?: number;
    usage_type?: "licensed" | "metered";
  } | null;
};

type StripeSubscription = {
  id: string;
  customer?: string | { id?: string };
  livemode?: boolean;
  metadata?: Record<string, string>;
  items?: {
    data?: Array<{
      quantity?: number | null;
      price?: StripePrice;
    }>;
  };
};

type StripeListResponse = {
  data?: StripeSubscription[];
  has_more?: boolean;
};

export type StripeRecurringProductMetric = {
  id: string;
  name: string;
  subscriptions: number;
  subscribers: number;
  mrrBrlEstimate: number;
  amounts: Array<{ currency: string; amount: number }>;
};

export type StripeRecurringMetrics = {
  state: "ready" | "missing" | "error";
  livemode: boolean;
  activeSubscriptions: number;
  activeSubscribers: number;
  pastDueSubscriptions: number;
  trialingSubscriptions: number;
  mrrBrlEstimate: number;
  usdBrlRate: number;
  amounts: Array<{ currency: string; amount: number }>;
  products: StripeRecurringProductMetric[];
  updatedAt: string;
  hasUnconvertedCurrencies: boolean;
};

const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg",
  "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf"
]);

const localRecurringProducts = checkoutProducts.filter(
  (product) => product.type === "subscription"
);

const localProductLabels: Record<string, string> = {
  loadpro_founders: "LoadPro · Fundadores 30",
  loadpro_founders_50: "LoadPro · Fundadores 50",
  online_coaching_monthly: "Assessoria Online"
};

function usdBrlRate() {
  const configured = Number(process.env.USD_TO_BRL_RATE || 5.5);
  return Number.isFinite(configured) && configured > 0 ? configured : 5.5;
}

function emptyMetrics(
  state: StripeRecurringMetrics["state"],
  livemode = false
): StripeRecurringMetrics {
  return {
    state,
    livemode,
    activeSubscriptions: 0,
    activeSubscribers: 0,
    pastDueSubscriptions: 0,
    trialingSubscriptions: 0,
    mrrBrlEstimate: 0,
    usdBrlRate: usdBrlRate(),
    amounts: [],
    products: localRecurringProducts.map((product) => ({
      id: product.id,
      name: localProductLabels[product.id] || product.name,
      subscriptions: 0,
      subscribers: 0,
      mrrBrlEstimate: 0,
      amounts: []
    })),
    updatedAt: new Date().toISOString(),
    hasUnconvertedCurrencies: false
  };
}

function majorAmount(price: StripePrice) {
  const raw =
    price.unit_amount_decimal !== null && price.unit_amount_decimal !== undefined
      ? Number(price.unit_amount_decimal)
      : price.unit_amount;
  if (raw === null || raw === undefined || !Number.isFinite(raw)) return 0;
  return raw / (ZERO_DECIMAL_CURRENCIES.has(price.currency.toLowerCase()) ? 1 : 100);
}

function monthlyAmount(price: StripePrice, quantity: number) {
  if (
    price.type === "one_time" ||
    price.recurring?.usage_type === "metered" ||
    !price.recurring?.interval
  ) {
    return 0;
  }

  const intervalCount = Math.max(1, price.recurring.interval_count || 1);
  const amount = majorAmount(price) * Math.max(0, quantity);

  switch (price.recurring.interval) {
    case "day":
      return (amount * 365) / (12 * intervalCount);
    case "week":
      return (amount * 52) / (12 * intervalCount);
    case "year":
      return amount / (12 * intervalCount);
    default:
      return amount / intervalCount;
  }
}

function configuredLoadProProduct(priceId: string) {
  if (priceId === process.env.STRIPE_LOADPRO_FOUNDERS_PRICE_ID) {
    return localRecurringProducts.find((product) => product.id === "loadpro_founders");
  }
  if (priceId === process.env.STRIPE_LOADPRO_FOUNDERS_50_PRICE_ID) {
    return localRecurringProducts.find((product) => product.id === "loadpro_founders_50");
  }
  return null;
}

function productIdentity(subscription: StripeSubscription, price: StripePrice) {
  const expandedProduct =
    price.product && typeof price.product === "object" ? price.product : null;
  const candidates = [
    subscription.metadata?.product_id,
    subscription.metadata?.plan_code,
    price.metadata?.product_id,
    expandedProduct?.metadata?.product_id
  ].filter((value): value is string => Boolean(value));

  const localProduct =
    localRecurringProducts.find(
      (product) =>
        candidates.includes(product.id) ||
        (product.stripe_price_id && product.stripe_price_id === price.id)
    ) || configuredLoadProProduct(price.id);

  if (localProduct) {
    return {
      id: localProduct.id,
      name: localProductLabels[localProduct.id] || localProduct.name
    };
  }

  return {
    id:
      candidates[0] ||
      (typeof price.product === "string" ? price.product : expandedProduct?.id) ||
      price.id,
    name: expandedProduct?.name || price.nickname || "Outras assinaturas"
  };
}

function customerId(subscription: StripeSubscription) {
  if (typeof subscription.customer === "string") return subscription.customer;
  return subscription.customer?.id || subscription.id;
}

async function listStripeSubscriptions(secretKey: string, status: string) {
  const subscriptions: StripeSubscription[] = [];
  let startingAfter: string | null = null;

  for (let page = 0; page < 20; page += 1) {
    const url = new URL("https://api.stripe.com/v1/subscriptions");
    url.searchParams.set("status", status);
    url.searchParams.set("limit", "100");
    url.searchParams.append("expand[]", "data.items.data.price.product");
    if (startingAfter) url.searchParams.set("starting_after", startingAfter);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${secretKey}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10000)
    });
    const payload = (await response.json().catch(() => ({}))) as StripeListResponse;

    if (!response.ok) {
      throw new Error(`Stripe subscriptions request failed with ${response.status}`);
    }

    const pageData = Array.isArray(payload.data) ? payload.data : [];
    subscriptions.push(...pageData);

    if (!payload.has_more || pageData.length === 0) return subscriptions;
    startingAfter = pageData.at(-1)?.id || null;
  }

  throw new Error("Stripe subscription report exceeded the pagination safety limit");
}

function addAmount(map: Map<string, number>, currency: string, amount: number) {
  const normalizedCurrency = currency.toUpperCase();
  map.set(normalizedCurrency, (map.get(normalizedCurrency) || 0) + amount);
}

function amountsArray(map: Map<string, number>) {
  return Array.from(map, ([currency, amount]) => ({ currency, amount })).sort((a, b) =>
    a.currency.localeCompare(b.currency)
  );
}

function brlEstimate(amounts: Map<string, number>, rate: number) {
  return (amounts.get("BRL") || 0) + (amounts.get("USD") || 0) * rate;
}

async function loadStripeRecurringMetrics(secretKey: string) {
  const [active, pastDue, trialing] = await Promise.all([
    listStripeSubscriptions(secretKey, "active"),
    listStripeSubscriptions(secretKey, "past_due"),
    listStripeSubscriptions(secretKey, "trialing")
  ]);
  const includedSubscriptions = [...active, ...pastDue];
  const totalAmounts = new Map<string, number>();
  const activeSubscribers = new Set<string>();
  const positiveSubscriptions = new Set<string>();
  const rate = usdBrlRate();

  const productMap = new Map<
    string,
    {
      id: string;
      name: string;
      subscriptions: Set<string>;
      subscribers: Set<string>;
      amounts: Map<string, number>;
    }
  >();

  for (const product of localRecurringProducts) {
    productMap.set(product.id, {
      id: product.id,
      name: localProductLabels[product.id] || product.name,
      subscriptions: new Set(),
      subscribers: new Set(),
      amounts: new Map()
    });
  }

  for (const subscription of includedSubscriptions) {
    let subscriptionHasMrr = false;

    for (const item of subscription.items?.data || []) {
      if (!item.price) continue;
      const amount = monthlyAmount(item.price, item.quantity || 1);
      if (amount <= 0) continue;

      subscriptionHasMrr = true;
      const currency = item.price.currency.toUpperCase();
      const identity = productIdentity(subscription, item.price);
      const product = productMap.get(identity.id) || {
        ...identity,
        subscriptions: new Set<string>(),
        subscribers: new Set<string>(),
        amounts: new Map<string, number>()
      };

      addAmount(totalAmounts, currency, amount);
      addAmount(product.amounts, currency, amount);
      product.subscriptions.add(subscription.id);
      product.subscribers.add(customerId(subscription));
      productMap.set(identity.id, product);
    }

    if (subscriptionHasMrr) {
      positiveSubscriptions.add(subscription.id);
      activeSubscribers.add(customerId(subscription));
    }
  }

  const products = Array.from(productMap.values())
    .map((product) => ({
      id: product.id,
      name: product.name,
      subscriptions: product.subscriptions.size,
      subscribers: product.subscribers.size,
      mrrBrlEstimate: brlEstimate(product.amounts, rate),
      amounts: amountsArray(product.amounts)
    }))
    .sort((a, b) => b.mrrBrlEstimate - a.mrrBrlEstimate || a.name.localeCompare(b.name));

  return {
    state: "ready" as const,
    livemode:
      includedSubscriptions[0]?.livemode ??
      trialing[0]?.livemode ??
      !secretKey.startsWith("sk_test_"),
    activeSubscriptions: positiveSubscriptions.size,
    activeSubscribers: activeSubscribers.size,
    pastDueSubscriptions: pastDue.length,
    trialingSubscriptions: trialing.length,
    mrrBrlEstimate: brlEstimate(totalAmounts, rate),
    usdBrlRate: rate,
    amounts: amountsArray(totalAmounts),
    products,
    updatedAt: new Date().toISOString(),
    hasUnconvertedCurrencies: Array.from(totalAmounts.keys()).some(
      (currency) => currency !== "BRL" && currency !== "USD"
    )
  } satisfies StripeRecurringMetrics;
}

let metricsCache: { expiresAt: number; value: StripeRecurringMetrics } | undefined;
let metricsRequest: Promise<StripeRecurringMetrics> | undefined;

export async function getStripeRecurringMetrics(): Promise<StripeRecurringMetrics> {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) return emptyMetrics("missing");

  if (metricsCache && metricsCache.expiresAt > Date.now()) {
    return metricsCache.value;
  }

  if (!metricsRequest) {
    metricsRequest = loadStripeRecurringMetrics(secretKey)
      .catch((error) => {
        console.error("[stripe.reporting]", error);
        return emptyMetrics("error", !secretKey.startsWith("sk_test_"));
      })
      .then((value) => {
        metricsCache = { expiresAt: Date.now() + 60 * 1000, value };
        return value;
      })
      .finally(() => {
        metricsRequest = undefined;
      });
  }

  return metricsRequest;
}
