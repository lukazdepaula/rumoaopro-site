import webpush from "web-push";
import {
  listActiveAdminPushSubscriptions,
  markAdminPushSubscriptionFailure,
  markAdminPushSubscriptionSuccess,
  type AdminPushSubscriptionRecord
} from "@/lib/checkout/db";
import { formatMoney } from "@/lib/checkout/products";
import type { Order } from "@/lib/checkout/types";

type AdminPushPayload = {
  title: string;
  body: string;
  url: string;
  tag: string;
  icon: string;
  badge: string;
};

export type AdminPushResult = {
  configured: boolean;
  attempted: number;
  sent: number;
  failed: number;
  reason?:
    | "not_configured"
    | "invalid_config"
    | "no_subscriptions"
    | "database_error";
};

function pushConfig() {
  const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.WEB_PUSH_VAPID_PRIVATE_KEY?.trim();
  const subject =
    process.env.WEB_PUSH_SUBJECT?.trim() || "mailto:contato@rumoaopro.com.br";

  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey, subject };
}

export function isAdminPushConfigured() {
  return Boolean(pushConfig());
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function errorStatus(error: unknown) {
  if (!error || typeof error !== "object" || !("statusCode" in error)) return null;
  const status = Number((error as { statusCode?: unknown }).statusCode);
  return Number.isFinite(status) ? status : null;
}

async function sendToSubscription(
  subscription: AdminPushSubscriptionRecord,
  payload: AdminPushPayload
) {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { auth: subscription.auth, p256dh: subscription.p256dh }
      },
      JSON.stringify(payload),
      { TTL: 60 * 60, urgency: "high" }
    );
    await markAdminPushSubscriptionSuccess(subscription.id);
    return true;
  } catch (error) {
    const status = errorStatus(error);
    const isExpired = status === 404 || status === 410;
    try {
      await markAdminPushSubscriptionFailure(
        subscription.id,
        errorMessage(error),
        isExpired
      );
    } catch {
      // A falha de telemetria nunca deve interromper a confirmacao da venda.
    }
    return false;
  }
}

async function sendAdminPush(
  payload: AdminPushPayload,
  adminEmail?: string
): Promise<AdminPushResult> {
  const config = pushConfig();
  if (!config) {
    return { configured: false, attempted: 0, sent: 0, failed: 0, reason: "not_configured" };
  }

  try {
    webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
  } catch {
    return {
      configured: false,
      attempted: 0,
      sent: 0,
      failed: 0,
      reason: "invalid_config"
    };
  }

  let subscriptions: AdminPushSubscriptionRecord[];
  try {
    subscriptions = await listActiveAdminPushSubscriptions(adminEmail);
  } catch {
    return { configured: true, attempted: 0, sent: 0, failed: 0, reason: "database_error" };
  }

  if (subscriptions.length === 0) {
    return { configured: true, attempted: 0, sent: 0, failed: 0, reason: "no_subscriptions" };
  }

  const results = await Promise.all(
    subscriptions.map((subscription) => sendToSubscription(subscription, payload))
  );
  const sent = results.filter(Boolean).length;

  return {
    configured: true,
    attempted: subscriptions.length,
    sent,
    failed: subscriptions.length - sent
  };
}

export async function sendAdminSalePush(order: Order) {
  return sendAdminPush({
    title: "Nova venda aprovada",
    body: `${order.product_name} · ${formatMoney(order.amount, order.currency)}`,
    url: `/admin/orders/${encodeURIComponent(order.id)}`,
    tag: `sale-${order.id}`,
    icon: "/assets/app/admin-icon-192.png",
    badge: "/assets/app/admin-icon-192.png"
  });
}

export async function sendAdminTestPush(adminEmail: string) {
  return sendAdminPush(
    {
      title: "RumoAoPro Admin",
      body: "As notificacoes de venda estao funcionando neste aparelho.",
      url: "/admin/notifications",
      tag: `test-${Date.now()}`,
      icon: "/assets/app/admin-icon-192.png",
      badge: "/assets/app/admin-icon-192.png"
    },
    adminEmail
  );
}
