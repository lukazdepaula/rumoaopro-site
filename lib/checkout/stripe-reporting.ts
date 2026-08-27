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

type StripeCoupon = {
  id?: string;
  amount_off?: number | null;
  currency?: string | null;
  duration?: "forever" | "once" | "repeating" | null;
  percent_off?: number | null;
  valid?: boolean;
};

type StripeCouponReference = string | StripeCoupon;

type StripePromotionCode = {
  coupon?: StripeCouponReference | null;
  promotion?: { coupon?: StripeCouponReference | null } | null;
};

type StripePromotionCodeReference = string | StripePromotionCode;

type StripeDiscount = {
  coupon?: StripeCouponReference | null;
  end?: number | null;
  source?: {
    coupon?: StripeCouponReference | null;
    promotion_code?: StripePromotionCodeReference | null;
  } | null;
};

type StripeDiscountReference = string | StripeDiscount;

type StripeSubscription = {
  id: string;
  customer?: string | { id?: string };
  livemode?: boolean;
  metadata?: Record<string, string>;
  discount?: StripeDiscount | null;
  discounts?: StripeDiscountReference[];
  items?: {
    data?: Array<{
      quantity?: number | null;
      price?: StripePrice;
      discounts?: StripeDiscountReference[];
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
  grossMrrBrlEstimate: number;
  discountBrlEstimate: number;
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
  grossMrrBrlEstimate: number;
  discountBrlEstimate: number;
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
    grossMrrBrlEstimate: 0,
    discountBrlEstimate: 0,
    usdBrlRate: usdBrlRate(),
    amounts: [],
    products: localRecurringProducts.map((product) => ({
      id: product.id,
      name: localProductLabels[product.id] || product.name,
      subscriptions: 0,
      subscribers: 0,
      mrrBrlEstimate: 0,
      grossMrrBrlEstimate: 0,
      discountBrlEstimate: 0,
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

  return majorAmount(price) * Math.max(0, quantity) * monthlyMultiplier(price);
}

function monthlyMultiplier(price: StripePrice) {
  const intervalCount = Math.max(1, price.recurring?.interval_count || 1);
  switch (price.recurring?.interval) {
    case "day":
      return 365 / (12 * intervalCount);
    case "week":
      return 52 / (12 * intervalCount);
    case "year":
      return 1 / (12 * intervalCount);
    default:
      return 1 / intervalCount;
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
    url.searchParams.append("expand[]", "data.discounts");
    url.searchParams.append("expand[]", "data.items.data.discounts");
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

function discountObjects(discounts?: StripeDiscountReference[]) {
  return (discounts || []).filter(
    (discount): discount is StripeDiscount => typeof discount === "object" && discount !== null
  );
}

async function stripeObject<T>(secretKey: string, path: string) {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error(`Stripe discount lookup failed with ${response.status}`);
  return (await response.json()) as T;
}

async function resolveDiscounts(
  secretKey: string,
  discounts: StripeDiscountReference[] | undefined,
  couponRequests: Map<string, Promise<StripeCoupon | null>>,
  promotionRequests: Map<string, Promise<StripePromotionCode | null>>
) {
  const couponById = (id: string) => {
    let request = couponRequests.get(id);
    if (!request) {
      request = stripeObject<StripeCoupon>(secretKey, `coupons/${encodeURIComponent(id)}`)
        .catch(() => null);
      couponRequests.set(id, request);
    }
    return request;
  };
  const promotionById = (id: string) => {
    let request = promotionRequests.get(id);
    if (!request) {
      request = stripeObject<StripePromotionCode>(
        secretKey,
        `promotion_codes/${encodeURIComponent(id)}`
      ).catch(() => null);
      promotionRequests.set(id, request);
    }
    return request;
  };

  return Promise.all(
    (discounts || []).map(async (discount) => {
      if (typeof discount === "string") return discount;
      const directReference = discount.coupon || discount.source?.coupon;
      let coupon =
        directReference && typeof directReference === "object"
          ? directReference
          : directReference
            ? await couponById(directReference)
            : null;

      const promotionReference = discount.source?.promotion_code;
      if (!coupon && promotionReference) {
        const promotion =
          typeof promotionReference === "object"
            ? promotionReference
            : await promotionById(promotionReference);
        const promotionCoupon = promotion?.coupon || promotion?.promotion?.coupon;
        coupon =
          promotionCoupon && typeof promotionCoupon === "object"
            ? promotionCoupon
            : promotionCoupon
              ? await couponById(promotionCoupon)
              : null;
      }

      return coupon ? { ...discount, coupon } : discount;
    })
  );
}

async function hydrateSubscriptionDiscounts(
  secretKey: string,
  subscriptions: StripeSubscription[]
) {
  const couponRequests = new Map<string, Promise<StripeCoupon | null>>();
  const promotionRequests = new Map<string, Promise<StripePromotionCode | null>>();
  await Promise.all(
    subscriptions.map(async (subscription) => {
      subscription.discounts = await resolveDiscounts(
        secretKey,
        subscription.discounts,
        couponRequests,
        promotionRequests
      );
      if (subscription.discount) {
        const [resolved] = await resolveDiscounts(
          secretKey,
          [subscription.discount],
          couponRequests,
          promotionRequests
        );
        subscription.discount = typeof resolved === "object" ? resolved : subscription.discount;
      }
      await Promise.all(
        (subscription.items?.data || []).map(async (item) => {
          item.discounts = await resolveDiscounts(
            secretKey,
            item.discounts,
            couponRequests,
            promotionRequests
          );
        })
      );
    })
  );
}

function applyDiscounts(
  amount: number,
  currency: string,
  discounts: StripeDiscountReference[] | undefined,
  nowInSeconds: number,
  amountOffMultiplier = 1
) {
  if (process.env.STRIPE_MRR_SUBTRACT_DISCOUNTS?.trim().toLowerCase() === "false") {
    return amount;
  }

  let result = amount;
  for (const discount of discountObjects(discounts)) {
    if (discount.end && discount.end <= nowInSeconds) continue;
    const couponReference = discount.coupon || discount.source?.coupon;
    const coupon =
      couponReference && typeof couponReference === "object" ? couponReference : null;
    if (!coupon || coupon.duration === "once") continue;
    if (coupon.percent_off !== null && coupon.percent_off !== undefined) {
      result *= Math.max(0, 1 - coupon.percent_off / 100);
    }
    if (
      coupon.amount_off !== null &&
      coupon.amount_off !== undefined &&
      coupon.currency?.toUpperCase() === currency.toUpperCase()
    ) {
      result -=
        (coupon.amount_off /
          (ZERO_DECIMAL_CURRENCIES.has(currency.toLowerCase()) ? 1 : 100)) *
        amountOffMultiplier;
    }
    result = Math.max(0, result);
  }
  return result;
}

async function loadStripeRecurringMetrics(secretKey: string) {
  const [active, pastDue, trialing] = await Promise.all([
    listStripeSubscriptions(secretKey, "active"),
    listStripeSubscriptions(secretKey, "past_due"),
    listStripeSubscriptions(secretKey, "trialing")
  ]);
  const includedSubscriptions = [...active, ...pastDue];
  await hydrateSubscriptionDiscounts(secretKey, includedSubscriptions);
  const totalAmounts = new Map<string, number>();
  const grossTotalAmounts = new Map<string, number>();
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
      grossAmounts: Map<string, number>;
    }
  >();

  for (const product of localRecurringProducts) {
    productMap.set(product.id, {
      id: product.id,
      name: localProductLabels[product.id] || product.name,
      subscriptions: new Set(),
      subscribers: new Set(),
      amounts: new Map(),
      grossAmounts: new Map()
    });
  }

  for (const subscription of includedSubscriptions) {
    let subscriptionHasMrr = false;
    const entries: Array<{
      identity: { id: string; name: string };
      currency: string;
      gross: number;
      monthlyMultiplier: number;
      afterItemDiscount: number;
    }> = [];
    const nowInSeconds = Math.floor(Date.now() / 1000);

    for (const item of subscription.items?.data || []) {
      if (!item.price) continue;
      const gross = monthlyAmount(item.price, item.quantity || 1);
      if (gross <= 0) continue;

      subscriptionHasMrr = true;
      const currency = item.price.currency.toUpperCase();
      const identity = productIdentity(subscription, item.price);
      entries.push({
        identity,
        currency,
        gross,
        monthlyMultiplier: monthlyMultiplier(item.price),
        afterItemDiscount: applyDiscounts(
          gross,
          currency,
          item.discounts,
          nowInSeconds,
          monthlyMultiplier(item.price)
        )
      });
    }

    const subscriptionDiscounts = subscription.discounts?.length
      ? subscription.discounts
      : subscription.discount
        ? [subscription.discount]
        : undefined;
    const currencies = new Set(entries.map((entry) => entry.currency));
    for (const currency of currencies) {
      const currencyEntries = entries.filter((entry) => entry.currency === currency);
      const discountedSubtotal = currencyEntries.reduce(
        (total, entry) => total + entry.afterItemDiscount,
        0
      );
      const subscriptionNet = applyDiscounts(
        discountedSubtotal,
        currency,
        subscriptionDiscounts,
        nowInSeconds,
        currencyEntries[0]?.monthlyMultiplier || 1
      );
      const factor = discountedSubtotal > 0 ? subscriptionNet / discountedSubtotal : 0;

      for (const entry of currencyEntries) {
        const net = entry.afterItemDiscount * factor;
        const product = productMap.get(entry.identity.id) || {
          ...entry.identity,
          subscriptions: new Set<string>(),
          subscribers: new Set<string>(),
          amounts: new Map<string, number>(),
          grossAmounts: new Map<string, number>()
        };
        addAmount(totalAmounts, currency, net);
        addAmount(grossTotalAmounts, currency, entry.gross);
        addAmount(product.amounts, currency, net);
        addAmount(product.grossAmounts, currency, entry.gross);
        product.subscriptions.add(subscription.id);
        product.subscribers.add(customerId(subscription));
        productMap.set(entry.identity.id, product);
      }
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
      grossMrrBrlEstimate: brlEstimate(product.grossAmounts, rate),
      discountBrlEstimate: Math.max(
        0,
        brlEstimate(product.grossAmounts, rate) - brlEstimate(product.amounts, rate)
      ),
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
    grossMrrBrlEstimate: brlEstimate(grossTotalAmounts, rate),
    discountBrlEstimate: Math.max(
      0,
      brlEstimate(grossTotalAmounts, rate) - brlEstimate(totalAmounts, rate)
    ),
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

export async function getStripeRecurringMetrics(options?: {
  bypassCache?: boolean;
}): Promise<StripeRecurringMetrics> {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) return emptyMetrics("missing");

  if (!options?.bypassCache && metricsCache && metricsCache.expiresAt > Date.now()) {
    return metricsCache.value;
  }

  if (!metricsRequest || options?.bypassCache) {
    const request = loadStripeRecurringMetrics(secretKey)
      .catch((error) => {
        console.error("[stripe.reporting]", error);
        return emptyMetrics("error", !secretKey.startsWith("sk_test_"));
      })
      .then((value) => {
        metricsCache = { expiresAt: Date.now() + 60 * 1000, value };
        return value;
      })
      .finally(() => {
        if (metricsRequest === request) metricsRequest = undefined;
      });
    metricsRequest = request;
  }

  return metricsRequest;
}
