// Pure billing rules shared by checkout, upgrades and webhook reconciliation.
export function loadProUpgradePrice(currency: string, brl: number, usd: number) {
  const normalized = currency.toUpperCase();
  if (normalized !== "BRL" && normalized !== "USD") {
    throw new Error("Unsupported subscription currency. Contact support to change this plan.");
  }
  const priceCents = Math.round((normalized === "BRL" ? brl : usd) * 100);
  if (!Number.isSafeInteger(priceCents) || priceCents <= 0) throw new Error("Invalid upgrade price.");
  return { currency: normalized, priceCents };
}

export function stripeSubscriptionPeriod(subscription: Record<string, unknown>) {
  const items = subscription.items as { data?: Array<Record<string, unknown>> } | undefined;
  const item = items?.data?.[0];
  const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;
  return {
    start: number(subscription.current_period_start) ?? number(item?.current_period_start),
    end: subscription.status === "trialing"
      ? number(subscription.trial_end)
      : ["canceled", "incomplete_expired"].includes(String(subscription.status))
        ? number(subscription.ended_at)
        : number(subscription.current_period_end) ?? number(item?.current_period_end)
  };
}

export function canReplaceLoadProSubscription(input: {
  currentSubscription: string | null;
  incomingSubscription: string | null;
  currentStatus: string;
  incomingStatus: string;
  currentOrderCreatedAt?: string | null;
  incomingOrderCreatedAt: string;
}) {
  if (!input.currentSubscription) return true;
  if (input.currentSubscription === input.incomingSubscription) return true;
  // Different-subscription cancellations, failures and late events must never
  // overwrite the selected subscription. Reactivation requires a newer order.
  return ["canceled", "cancelled", "incomplete_expired"].includes(input.currentStatus)
    && input.incomingStatus === "active"
    && Boolean(input.currentOrderCreatedAt)
    && Date.parse(input.incomingOrderCreatedAt) > Date.parse(input.currentOrderCreatedAt!);
}
