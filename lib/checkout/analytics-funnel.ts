import type { AnalyticsEvent, AnalyticsEventType, Order } from "@/lib/checkout/types";

// A session can visit multiple products. Consent changes and language changes
// must not create another visitor for the same product.
const sessionKey = (session: string, product: string) => JSON.stringify([session, product]);

export function summarizeFunnel(events: AnalyticsEvent[], orders: Order[]) {
  const stages = new Map<AnalyticsEventType, Set<string>>();
  const consentedViews = new Map<string, number>();
  for (const event of events) {
    if (!event.session_id || !event.product_id) continue;
    const key = sessionKey(event.session_id, event.product_id);
    const stage = stages.get(event.type) || new Set<string>();
    stage.add(key);
    stages.set(event.type, stage);
    if (event.type === "product_view" && event.marketing_consent === "granted") {
      const timestamp = Date.parse(event.created_at);
      if (Number.isFinite(timestamp)) {
        consentedViews.set(key, Math.min(consentedViews.get(key) ?? Infinity, timestamp));
      }
    }
  }
  const convertedSessions = new Set<string>();
  let linkedPaidOrders = 0;
  const paidOrders = orders.filter(order => order.status === "paid");
  for (const order of paidOrders) {
    const session = order.metadata.marketing_session_id;
    if (typeof session !== "string" || order.metadata.marketing_consent !== "granted") continue;
    const key = sessionKey(session, order.product_id);
    const viewedAt = consentedViews.get(key);
    if (viewedAt !== undefined && Date.parse(order.created_at) >= viewedAt) {
      convertedSessions.add(key);
      linkedPaidOrders += 1;
    }
  }
  const count = (type: AnalyticsEventType) => stages.get(type)?.size || 0;
  return {
    views: count("product_view"), clicks: count("checkout_click"),
    checkouts: count("checkout_view"), submits: count("checkout_submit"),
    errors: count("checkout_error"), starts: orders.length, sales: paidOrders.length,
    measurableViews: consentedViews.size, convertedSessions: convertedSessions.size,
    unlinkedSales: paidOrders.length - linkedPaidOrders,
    conversion: consentedViews.size > 0 ? convertedSessions.size / consentedViews.size * 100 : null
  };
}
