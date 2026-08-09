import { appendOrderLog } from "@/lib/checkout/db";
import type { Order } from "@/lib/checkout/types";

export const RAPTORPRO_OFFSEASON_PRODUCT_ID = "offseason_30_days";
export const RAPTORPRO_OFFSEASON_PROGRAM_ID = "commercial-program-offseason-30";
export const RAPTORPRO_OFFSEASON_PROGRAM_SLUG = "offseason-30-days";

type PaidAccessStatus = "granted" | "revoked";

type GeneratedLink = {
  action_link?: string;
  user?: { id?: string; email?: string };
};

export function isRaptorProProgramOrder(order: Order) {
  return order.product_id === RAPTORPRO_OFFSEASON_PRODUCT_ID;
}

function config() {
  const url = process.env.RAPTORPRO_SUPABASE_URL;
  const serviceRoleKey = process.env.RAPTORPRO_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return {
    url: url.replace(/\/$/, ""),
    serviceRoleKey,
    appUrl: (process.env.RAPTORPRO_APP_URL || "https://app.rumoaopro.com.br").replace(/\/$/, "")
  };
}

async function requestRaptorPro(path: string, init: RequestInit = {}) {
  const environment = config();
  if (!environment) throw new Error("RaptorPro provisioning environment is not configured.");
  const headers = new Headers(init.headers);
  headers.set("apikey", environment.serviceRoleKey);
  headers.set("Content-Type", "application/json");
  // GoTrue's admin endpoints still require an Authorization header. The new
  // sb_secret_* keys are valid here when the same key is also sent as apikey.
  // PostgREST only needs apikey for the new key format, so avoid adding a
  // bearer credential to database requests where it could be parsed as a JWT.
  if (
    !environment.serviceRoleKey.startsWith("sb_secret_") ||
    path.startsWith("/auth/v1/admin/")
  ) {
    headers.set("Authorization", `Bearer ${environment.serviceRoleKey}`);
  } else {
    headers.delete("Authorization");
  }
  return fetch(`${environment.url}${path}`, { ...init, headers, cache: "no-store" });
}

async function setPaidAccess(order: Order, status: PaidAccessStatus) {
  return requestRaptorPro("/rest/v1/rpc/set_commercial_program_paid_access", {
    method: "POST",
    body: JSON.stringify({
      p_program_id: RAPTORPRO_OFFSEASON_PROGRAM_ID,
      p_email: order.customer_email.trim().toLowerCase(),
      p_status: status,
      p_order_id: order.id
    })
  });
}

function isMissingAuthUser(message: string) {
  return message.toLowerCase().includes("auth user not found");
}

async function generateActionLink(order: Order, type: "invite" | "magiclink") {
  const environment = config();
  if (!environment) throw new Error("RaptorPro provisioning environment is not configured.");
  const redirectTo = `${environment.appUrl}/programs/${RAPTORPRO_OFFSEASON_PROGRAM_SLUG}/access`;
  const response = await requestRaptorPro("/auth/v1/admin/generate_link", {
    method: "POST",
    body: JSON.stringify({
      type,
      email: order.customer_email.trim().toLowerCase(),
      redirect_to: redirectTo,
      data: {
        full_name: order.customer_name,
        invite_kind: "commercial_program",
        invite_language: order.metadata.locale === "en" ? "en" : "pt",
        program_id: RAPTORPRO_OFFSEASON_PROGRAM_ID,
        product_id: order.product_id,
        order_id: order.id,
        source: "rumoaopro_checkout"
      }
    })
  });
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`RaptorPro ${type} link failed: ${response.status} ${message}`);
  }
  const result = (await response.json()) as GeneratedLink;
  if (!result.action_link) throw new Error(`RaptorPro ${type} link was not generated.`);
  return { actionUrl: result.action_link, userId: result.user?.id || null, type };
}

export function getRaptorProProgramUrl() {
  const environment = config();
  const appUrl = environment?.appUrl || "https://app.rumoaopro.com.br";
  return `${appUrl}/programs/${RAPTORPRO_OFFSEASON_PROGRAM_SLUG}/access`;
}

export async function syncRaptorProProgramAccess(order: Order, status: PaidAccessStatus) {
  if (!isRaptorProProgramOrder(order)) return { handled: false as const };
  if (!config()) {
    await appendOrderLog(
      order.id,
      "raptorpro.provisioning.pending_configuration",
      "Configure as variáveis de provisionamento do RaptorPro na Vercel."
    );
    return { handled: true as const, configured: false as const };
  }

  let response = await setPaidAccess(order, status);
  let actionUrl: string | null = null;
  let accountCreated = false;

  if (!response.ok && status === "granted") {
    const message = await response.text().catch(() => "");
    if (!isMissingAuthUser(message)) {
      throw new Error(`RaptorPro access sync failed: ${response.status} ${message}`);
    }
    const invite = await generateActionLink(order, "invite");
    actionUrl = invite.actionUrl;
    accountCreated = true;
    response = await setPaidAccess(order, status);
  }

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`RaptorPro access sync failed: ${response.status} ${message}`);
  }

  if (status === "granted" && !actionUrl && order.metadata.raptorpro_welcome_email_sent !== true) {
    const magicLink = await generateActionLink(order, "magiclink");
    actionUrl = magicLink.actionUrl;
  }

  await appendOrderLog(
    order.id,
    "raptorpro.access.synced",
    `Acesso ao programa RaptorPro atualizado para ${status}.`,
    { accountCreated, programId: RAPTORPRO_OFFSEASON_PROGRAM_ID }
  );

  return {
    handled: true as const,
    configured: true as const,
    status,
    accountCreated,
    actionUrl,
    programUrl: getRaptorProProgramUrl()
  };
}
