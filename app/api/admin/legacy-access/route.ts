import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/checkout/admin-auth";
import { grantProductAccess } from "@/lib/checkout/access";
import {
  appendOrderLog,
  createOrder,
  getOrderByGatewayPaymentId,
  getOrderById,
  updateDeliveryStatus,
  updateOrderGatewayIds,
  updateOrderStatus
} from "@/lib/checkout/db";
import {
  isEmailDeliveryConfigured,
  sendRaptorProProgramAccessEmail
} from "@/lib/checkout/email";
import { getProductById } from "@/lib/checkout/products";
import {
  createRaptorProCheckoutAccessLink,
  getRaptorProProgramConfig,
  syncRaptorProProgramAccess
} from "@/lib/checkout/raptorpro";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedProducts = new Set([
  "offseason_30_days",
  "project_36",
  "elanga_in_season",
  "de_volta_aos_gramados_pt"
]);

function normalizeOrderNumber(value: string) {
  const digits = value.trim().replace(/\D/g, "");
  return digits ? `#${digits}` : "";
}

function redirect(request: Request, status: string, orderId?: string | null) {
  const url = new URL("/admin/legacy-access", request.url);
  url.searchParams.set("status", status);
  if (orderId) url.searchParams.set("orderId", orderId);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const customerName = String(form.get("customerName") || "").trim();
  const customerEmail = String(form.get("customerEmail") || "").trim().toLowerCase();
  const productId = String(form.get("productId") || "").trim();
  const locale = form.get("locale") === "en" ? "en" : "pt";
  const shopifyOrderNumber = normalizeOrderNumber(String(form.get("shopifyOrderNumber") || ""));
  const shopifyPurchaseDate = String(form.get("shopifyPurchaseDate") || "").trim();
  const shopifyProductName = String(form.get("shopifyProductName") || "").trim();
  const shopifyAmount = Number(form.get("shopifyAmount"));
  const product = getProductById(productId);
  const program = getRaptorProProgramConfig(productId);

  if (
    !customerName ||
    !/^\S+@\S+\.\S+$/.test(customerEmail) ||
    !allowedProducts.has(productId) ||
    !product ||
    !program ||
    !shopifyOrderNumber ||
    !/^\d{4}-\d{2}-\d{2}$/.test(shopifyPurchaseDate) ||
    !shopifyProductName ||
    !Number.isFinite(shopifyAmount) ||
    shopifyAmount < 0
  ) {
    return redirect(request, "invalid");
  }

  const legacyPaymentId = `shopify:${shopifyOrderNumber}`;
  let order = await getOrderByGatewayPaymentId("shopify_legacy", legacyPaymentId);

  if (order?.metadata.legacy_shopify_migration_status === "completed") {
    return redirect(request, "already_migrated", order.id);
  }

  try {
    if (!order) {
      order = await createOrder({
        product_id: product.id,
        product_name: product.name,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_country: "BR",
        customer_document_type: null,
        customer_document: null,
        gateway: "shopify_legacy",
        amount: 0,
        currency: "BRL",
        fiscal_status: "not_required",
        metadata: {
          locale,
          source: "shopify_legacy_migration",
          legacy_shopify_migration: true,
          legacy_shopify_migration_status: "started",
          shopify_order_number: shopifyOrderNumber,
          shopify_purchase_date: shopifyPurchaseDate,
          shopify_product_name: shopifyProductName,
          shopify_amount_paid: shopifyAmount,
          shopify_currency: "BRL"
        }
      });

      if (!order) throw new Error("Legacy order could not be created.");
      await updateOrderGatewayIds(order.id, { gateway_payment_id: legacyPaymentId });
    }

    if (order.status !== "paid") {
      await updateOrderStatus(order.id, "paid", {
        legacy_shopify_payment_verified: true,
        legacy_shopify_payment_verified_at: new Date().toISOString()
      });
    }

    order = await getOrderById(order.id);
    if (!order) throw new Error("Legacy order could not be reloaded.");

    await grantProductAccess(order);
    const access = await syncRaptorProProgramAccess(order, "granted");
    if (!access.handled || access.configured === false) {
      throw new Error("RaptorPro provisioning is not configured.");
    }

    const actionUrl = access.actionUrl || (await createRaptorProCheckoutAccessLink(order));
    if (!isEmailDeliveryConfigured()) {
      return redirect(request, "email_unavailable", order.id);
    }

    const emailSent = await sendRaptorProProgramAccessEmail({
      orderId: order.id,
      to: order.customer_email,
      name: order.customer_name,
      actionUrl,
      accountCreated: access.accountCreated,
      programName: program.programTitle,
      locale
    });

    if (!emailSent) return redirect(request, "email_error", order.id);

    await updateOrderGatewayIds(order.id, {
      metadata: {
        legacy_shopify_migration_status: "completed",
        legacy_shopify_migrated_at: new Date().toISOString(),
        raptorpro_provisioning_status: "synced",
        raptorpro_access_status: "granted",
        raptorpro_welcome_email_sent: true,
        raptorpro_welcome_email_status: "sent",
        raptorpro_account_created: access.accountCreated,
        raptorpro_program_id: program.programId
      }
    });
    await updateDeliveryStatus(order.id, "delivered", {
      source: "shopify_legacy_migration"
    });
    await appendOrderLog(
      order.id,
      "shopify_legacy.access.completed",
      `Pedido ${shopifyOrderNumber} do Shopify migrado para ${program.programTitle}; acesso e convite concluídos.`,
      { programId: program.programId, shopifyOrderNumber }
    );

    return redirect(request, "sent", order.id);
  } catch (error) {
    if (order) {
      await appendOrderLog(
        order.id,
        "shopify_legacy.access.error",
        "Não foi possível concluir a migração do pedido antigo do Shopify.",
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
    return redirect(request, "error", order?.id);
  }
}
