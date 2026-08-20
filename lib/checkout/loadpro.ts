import crypto from "node:crypto";
import { appendOrderLog, updateOrderGatewayIds } from "@/lib/checkout/db";
import {
  sendLoadProExistingAccountEmail,
  sendLoadProPasswordRecoveryEmail,
  sendLoadProTrialInviteEmail
} from "@/lib/checkout/email";
import { getProductById, isLoadProProductId } from "@/lib/checkout/products";
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
  currentPeriodStart?: string | number | null;
  trialStart?: string | number | null;
  trialEnd?: string | number | null;
  providerSubscriptionStatus?: string | null;
  cancelAtPeriodEnd?: boolean | null;
  canceledAt?: string | number | null;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
  invite?: boolean;
  eventId?: string | null;
  planCode?: string | null;
  priceCents?: number | null;
};

export type LoadProBillingAccess = {
  id: string;
  email: string;
  user_id: string | null;
  status: string;
  access_kind: string;
  plan_code: string;
  current_period_end: string | null;
  billing_provider: string | null;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  team_limit: number | null;
  players_per_team_limit: number | null;
  price_cents: number | null;
  currency: string | null;
  price_locked: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export function isLoadProOrder(order: Order) {
  return isLoadProProductId(order.product_id);
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

export async function resolveLoadProBillingAccess(accessToken: string) {
  const environment = config();
  if (!environment || !accessToken) return null;

  const identityResponse = await fetch(`${environment.url}/auth/v1/user`, {
    headers: {
      apikey: environment.serviceRoleKey,
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });
  if (!identityResponse.ok) return null;

  const identity = (await identityResponse.json()) as Record<string, unknown>;
  const userId = typeof identity.id === "string" ? identity.id : "";
  const email =
    typeof identity.email === "string" ? identity.email.trim().toLowerCase() : "";
  if (!userId || !email) return null;

  const select = encodeURIComponent(
    "id,email,user_id,status,access_kind,plan_code,current_period_end,billing_provider,provider_customer_id,provider_subscription_id,team_limit,players_per_team_limit,price_cents,currency,price_locked,metadata,created_at,updated_at"
  );
  let response = await requestLoadPro(
    `/rest/v1/billing_access?select=${select}&user_id=eq.${encodeURIComponent(userId)}&limit=1`
  );
  let rows = response.ok
    ? ((await response.json()) as LoadProBillingAccess[])
    : [];

  if (!rows[0]) {
    response = await requestLoadPro(
      `/rest/v1/billing_access?select=${select}&email=eq.${encodeURIComponent(email)}&limit=1`
    );
    rows = response.ok
      ? ((await response.json()) as LoadProBillingAccess[])
      : [];
  }

  const access = rows[0] || null;
  if (!access || access.email !== email) return null;
  return { identity: { id: userId, email }, access, appUrl: environment.appUrl };
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
  if (typeof order.metadata.loadpro_invite_sent_at === "string") {
    return false;
  }
  const redirectTo = `${environment.appUrl}/?view=login`;
  const locale = order.metadata.checkout_locale === "en" ? "en" : "pt";
  const response = await requestLoadPro(
    "/auth/v1/admin/generate_link",
    {
      method: "POST",
      body: JSON.stringify({
        type: "invite",
        email: order.customer_email.trim().toLowerCase(),
        data: {
          full_name: order.customer_name,
          source: "rumoaopro_checkout",
          order_id: order.id
        },
        redirect_to: redirectTo
      })
    }
  );

  if (response.ok) {
    const payload = (await response.json()) as Record<string, unknown>;
    const properties =
      typeof payload.properties === "object" && payload.properties !== null
        ? (payload.properties as Record<string, unknown>)
        : {};
    const actionLink =
      typeof payload.action_link === "string"
        ? payload.action_link
        : typeof properties.action_link === "string"
          ? properties.action_link
          : null;
    if (!actionLink) {
      await appendOrderLog(
        order.id,
        "loadpro.invite.error",
        "O Supabase não retornou o link seguro de criação de senha."
      );
      return false;
    }
    const emailSent = await sendLoadProTrialInviteEmail({
      orderId: order.id,
      to: order.customer_email,
      name: order.customer_name,
      inviteUrl: actionLink,
      amount: order.amount,
      currency: order.currency,
      locale
    });
    if (!emailSent) {
      await updateOrderGatewayIds(order.id, {
        metadata: { loadpro_invite_status: "email_error" }
      });
      return false;
    }
    await updateOrderGatewayIds(order.id, {
      metadata: {
        loadpro_invite_sent_at: new Date().toISOString(),
        loadpro_invite_status: "sent_by_rumoaopro"
      }
    });
    await appendOrderLog(
      order.id,
      "loadpro.invite.sent",
      "Convite de criação de senha do LoadPro enviado pela RumoAoPro."
    );
    return true;
  }

  const message = await response.text().catch(() => "");
  if (response.status === 400 || response.status === 422) {
    const emailSent = await sendLoadProExistingAccountEmail({
      orderId: order.id,
      to: order.customer_email,
      name: order.customer_name,
      appUrl: environment.appUrl,
      amount: order.amount,
      currency: order.currency,
      locale
    });
    if (emailSent) {
      await updateOrderGatewayIds(order.id, {
        metadata: {
          loadpro_invite_sent_at: new Date().toISOString(),
          loadpro_invite_status: "existing_account_notified"
        }
      });
    }
    await appendOrderLog(
      order.id,
      "loadpro.invite.existing_user",
      "O e-mail já existe no LoadPro; o acesso foi atualizado e a orientação de login foi enviada pela RumoAoPro.",
      { status: response.status }
    );
    return emailSent;
  }
  throw new Error(`LoadPro invite failed: ${response.status} ${message}`);
}

export async function sendLoadProPasswordRecovery(input: {
  email: string;
  locale?: "pt" | "en";
}) {
  const environment = config();
  if (!environment) throw new Error("LoadPro recovery environment is not configured.");

  const redirectUrl = new URL(`${environment.appUrl}/`);
  redirectUrl.searchParams.set("view", "login");
  redirectUrl.searchParams.set("lang", input.locale === "en" ? "en" : "pt");

  const response = await requestLoadPro("/auth/v1/admin/generate_link", {
    method: "POST",
    body: JSON.stringify({
      type: "recovery",
      email: input.email.trim().toLowerCase(),
      redirect_to: redirectUrl.toString()
    })
  });

  if (!response.ok) return false;

  const payload = (await response.json()) as Record<string, unknown>;
  const properties =
    typeof payload.properties === "object" && payload.properties !== null
      ? (payload.properties as Record<string, unknown>)
      : {};
  const actionLink =
    typeof payload.action_link === "string"
      ? payload.action_link
      : typeof properties.action_link === "string"
        ? properties.action_link
        : null;
  if (!actionLink) return false;

  return sendLoadProPasswordRecoveryEmail({
    to: input.email,
    recoveryUrl: actionLink,
    locale: input.locale
  });
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

  const metadataPlanCode = typeof order.metadata.subscription_plan_code === "string"
    ? order.metadata.subscription_plan_code
    : null;
  const planCode = isLoadProProductId(input.planCode)
    ? input.planCode
    : isLoadProProductId(metadataPlanCode)
      ? metadataPlanCode
      : order.product_id;
  const product = getProductById(planCode);
  if (!product || !isLoadProProductId(product.id)) {
    throw new Error(`Unknown LoadPro plan: ${planCode}`);
  }
  const configuredPrice = order.currency === "BRL"
    ? product.price_brl
    : product.base_price_usd;
  const priceCents = typeof input.priceCents === "number" && Number.isFinite(input.priceCents)
    ? input.priceCents
    : Math.round(configuredPrice * 100);
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
        plan_code: planCode,
        current_period_end: currentPeriodEnd,
        billing_provider: order.gateway,
        provider_customer_id: input.providerCustomerId || null,
        provider_subscription_id: providerSubscriptionId,
        order_id: order.id,
        team_limit: product?.team_limit || 2,
        players_per_team_limit: product.players_per_team_limit || 30,
        price_cents: priceCents,
        currency: order.currency,
        price_locked: product?.founding_price_lock === true,
        metadata: {
          source: "rumoaopro_checkout",
          gateway: order.gateway,
          event_id: input.eventId || null,
          provider_subscription_status: input.providerSubscriptionStatus || null,
          plan_code: planCode,
          current_period_start: input.currentPeriodStart || null,
          trial_start: input.trialStart || null,
          trial_end: input.trialEnd || null,
          cancel_at_period_end: input.cancelAtPeriodEnd === true,
          canceled_at: input.canceledAt || null,
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
    { currentPeriodEnd, providerSubscriptionId, planCode, priceCents }
  );

  if (input.invite && input.status === "active") {
    await inviteCoach(order);
  }

  return { handled: true, configured: true, currentPeriodEnd };
}
