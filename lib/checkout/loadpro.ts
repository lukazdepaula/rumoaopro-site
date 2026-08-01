import crypto from "node:crypto";
import { appendOrderLog } from "@/lib/checkout/db";
import { getProductById } from "@/lib/checkout/products";
import type { Order } from "@/lib/checkout/types";

type LoadProSubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused";

type SyncInput = {
  status: LoadProSubscriptionStatus;
  currentPeriodEnd?: string | number | null;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
  invite?: boolean;
  eventId?: string | null;
};

export function isLoadProOrder(order: Order) {
  return order.product_id === "loadpro_founders";
}

function config() {
  const url = process.env.LOADPRO_SUPABASE_URL;
  const serviceRoleKey = process.env.LOADPRO_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return {
    url: url.replace(/\/$/, ""),
    serviceRoleKey,
    appUrl: (process.env.LOADPRO_APP_URL || "https://loadpro.rumoaopro.com.br").replace(/\/$/, "")
  };
}

function periodEnd(value: SyncInput["currentPeriodEnd"]) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value > 10_000_000_000 ? value : value * 1000).toISOString();
  }
  if (typeof value === "string" && Number.isFinite(Date.parse(value))) {
    return new Date(value).toISOString();
  }
  const nextMonth = new Date();
  nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
  return nextMonth.toISOString();
}

async function requestLoadPro(path: string, init: RequestInit = {}) {
  const environment = config();
  if (!environment) throw new Error("LoadPro provisioning environment is not configured.");
  const headers = new Headers(init.headers);
  headers.set("apikey", environment.serviceRoleKey);
  headers.set("Content-Type", "application/json");
  if (environment.serviceRoleKey.startsWith("sb_secret_")) {
    headers.delete("Authorization");
  } else {
    headers.set("Authorization", `Bearer ${environment.serviceRoleKey}`);
  }
  return fetch(`${environment.url}${path}`, {
    ...init,
    headers,
    cache: "no-store"
  });
}

export async function assertLoadProProvisioningReady() {
  const environment = config();
  if (!environment) {
    throw new Error("LoadPro provisioning environment is not configured.");
  }

  const response = await requestLoadPro(
    "/rest/v1/billing_access?select=id&limit=1"
  );
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(
      `LoadPro billing migration is not ready: ${response.status} ${message}`
    );
  }
}

async function existingAccess(email: string) {
  const response = await requestLoadPro(
    `/rest/v1/billing_access?select=access_kind,status&email=eq.${encodeURIComponent(email)}&limit=1`
  );
  if (!response.ok) return null;
  const rows = (await response.json()) as Array<Record<string, unknown>>;
  return rows[0] || null;
}

async function inviteCoach(order: Order) {
  const environment = config();
  if (!environment) return false;
  const redirectTo = `${environment.appUrl}/?view=login`;
  const response = await requestLoadPro(
    `/auth/v1/invite?redirect_to=${encodeURIComponent(redirectTo)}`,
    {
      method: "POST",
      body: JSON.stringify({
        email: order.customer_email.trim().toLowerCase(),
        data: {
          full_name: order.customer_name,
          source: "rumoaopro_checkout",
          order_id: order.id
        }
      })
    }
  );

  if (response.ok) {
    await appendOrderLog(
      order.id,
      "loadpro.invite.sent",
      "Convite de acesso ao LoadPro enviado pelo Supabase."
    );
    return true;
  }

  const message = await response.text().catch(() => "");
  if (response.status === 400 || response.status === 422) {
    await appendOrderLog(
      order.id,
      "loadpro.invite.existing_user",
      "O e-mail já existe no LoadPro; o acesso pago foi atualizado sem criar outra conta.",
      { status: response.status }
    );
    return false;
  }
  throw new Error(`LoadPro invite failed: ${response.status} ${message}`);
}

export async function syncLoadProAccess(order: Order, input: SyncInput) {
  if (!isLoadProOrder(order)) return { handled: false };
  const environment = config();
  if (!environment) {
    await appendOrderLog(
      order.id,
      "loadpro.provisioning.pending_configuration",
      "Configure as variáveis de provisionamento do LoadPro na Vercel."
    );
    return { handled: true, configured: false };
  }

  const email = order.customer_email.trim().toLowerCase();
  const current = await existingAccess(email);
  if (current?.access_kind === "lifetime") {
    await appendOrderLog(
      order.id,
      "loadpro.provisioning.legacy_preserved",
      "O coach já possui acesso legado vitalício; nenhuma limitação foi aplicada."
    );
    return { handled: true, configured: true, lifetime: true };
  }

  const product = getProductById(order.product_id);
  const currentPeriodEnd =
    input.status === "active" || input.status === "canceled"
      ? periodEnd(input.currentPeriodEnd)
      : input.currentPeriodEnd
        ? periodEnd(input.currentPeriodEnd)
        : null;
  const providerSubscriptionId =
    input.providerSubscriptionId ||
    (typeof order.metadata.mercado_pago_subscription_id === "string"
      ? order.metadata.mercado_pago_subscription_id
      : null) ||
    order.gateway_payment_id ||
    order.gateway_checkout_id;

  const response = await requestLoadPro(
    "/rest/v1/billing_access?on_conflict=email",
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        email,
        status: input.status,
        access_kind: "subscription",
        plan_code: order.product_id,
        current_period_end: currentPeriodEnd,
        billing_provider: order.gateway,
        provider_customer_id: input.providerCustomerId || null,
        provider_subscription_id: providerSubscriptionId,
        order_id: order.id,
        team_limit: product?.team_limit || 2,
        players_per_team_limit: product?.players_per_team_limit || 25,
        price_cents: Math.round(order.amount * 100),
        currency: order.currency,
        price_locked: product?.founding_price_lock === true,
        metadata: {
          source: "rumoaopro_checkout",
          gateway: order.gateway,
          event_id: input.eventId || null,
          sync_token: crypto.randomUUID()
        },
        updated_at: new Date().toISOString()
      })
    }
  );
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`LoadPro access sync failed: ${response.status} ${message}`);
  }

  await appendOrderLog(
    order.id,
    "loadpro.access.synced",
    `Acesso LoadPro atualizado para ${input.status}.`,
    { currentPeriodEnd, providerSubscriptionId }
  );

  if (input.invite && input.status === "active") {
    await inviteCoach(order);
  }

  return { handled: true, configured: true, currentPeriodEnd };
}
