import {
  appendOrderLog,
  getOrderById,
  revokeProductAccessByOrder,
  updateOrderGatewayIds,
  updateOrderStatus
} from "@/lib/checkout/db";
import { grantProductAccess } from "@/lib/checkout/access";
import { deliverOrder } from "@/lib/checkout/delivery";
import { sendAdminSalePush } from "@/lib/checkout/admin-push";
import {
  isEmailDeliveryConfigured,
  sendInternalSaleNotice,
  sendRaptorProProgramAccessEmail
} from "@/lib/checkout/email";
import { isLoadProOrder, syncLoadProAccess } from "@/lib/checkout/loadpro";
import { getRaptorProProgramConfig, isRaptorProProgramOrder, syncRaptorProProgramAccess } from "@/lib/checkout/raptorpro";
import type { Order } from "@/lib/checkout/types";

async function assertOrder(orderId: string): Promise<Order> {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  return order;
}

async function syncLoadProSafely(
  order: Order,
  status: "active" | "past_due" | "canceled" | "unpaid" | "paused",
  gatewayData: Record<string, unknown>,
  invite = false
) {
  if (!isLoadProOrder(order)) return;
  if (order.metadata.checkout_gateway_mode === "sandbox") {
    await updateOrderGatewayIds(order.id, {
      metadata: { loadpro_provisioning_status: "sandbox_skipped" }
    });
    await appendOrderLog(
      order.id,
      "loadpro.provisioning.sandbox_skipped",
      "Evento Stripe sandbox processado sem alterar o acesso real do LoadPro."
    );
    return;
  }
  try {
    const result = await syncLoadProAccess(order, {
      status,
      currentPeriodEnd:
        (gatewayData.current_period_end as string | number | null | undefined) ||
        (gatewayData.next_payment_date as string | null | undefined),
      currentPeriodStart:
        gatewayData.current_period_start as string | number | null | undefined,
      trialStart:
        gatewayData.trial_start as string | number | null | undefined,
      trialEnd:
        gatewayData.trial_end as string | number | null | undefined,
      providerSubscriptionStatus:
        typeof gatewayData.provider_subscription_status === "string"
          ? gatewayData.provider_subscription_status
          : null,
      cancelAtPeriodEnd:
        typeof gatewayData.cancel_at_period_end === "boolean"
          ? gatewayData.cancel_at_period_end
          : null,
      canceledAt:
        gatewayData.canceled_at as string | number | null | undefined,
      providerCustomerId:
        typeof gatewayData.provider_customer_id === "string"
          ? gatewayData.provider_customer_id
          : null,
      providerSubscriptionId:
        typeof gatewayData.provider_subscription_id === "string"
          ? gatewayData.provider_subscription_id
          : null,
      eventId:
        typeof gatewayData.event_id === "string"
          ? gatewayData.event_id
          : null,
      planCode:
        typeof gatewayData.plan_code === "string"
          ? gatewayData.plan_code
          : null,
      priceCents:
        typeof gatewayData.price_cents === "number"
          ? gatewayData.price_cents
          : null,
      invite
    });
    await updateOrderGatewayIds(order.id, {
      metadata: {
        loadpro_provisioning_status:
          result.configured === false ? "pending_configuration" : "synced"
      }
    });
  } catch (error) {
    await updateOrderGatewayIds(order.id, {
      metadata: { loadpro_provisioning_status: "error" }
    });
    await appendOrderLog(
      order.id,
      "loadpro.provisioning.error",
      "O pagamento foi preservado, mas o acesso automático ao LoadPro precisa ser reprocessado.",
      { error: error instanceof Error ? error.message : String(error), status }
    );
  }
}

async function syncRaptorProSafely(
  order: Order,
  status: "granted" | "revoked"
) {
  if (!isRaptorProProgramOrder(order)) return;
  const program = getRaptorProProgramConfig(order);
  if (!program) return;
  if (order.metadata.checkout_gateway_mode === "sandbox") {
    await updateOrderGatewayIds(order.id, {
      metadata: { raptorpro_provisioning_status: "sandbox_skipped" }
    });
    await appendOrderLog(
      order.id,
      "raptorpro.provisioning.sandbox_skipped",
      "Pedido sandbox processado sem alterar o acesso real do RaptorPro."
    );
    return;
  }
  try {
    const result = await syncRaptorProProgramAccess(order, status);
    if (!result.handled) return;
    let welcomeEmailSent = order.metadata.raptorpro_welcome_email_sent === true;
    let welcomeEmailStatus =
      typeof order.metadata.raptorpro_welcome_email_status === "string"
        ? order.metadata.raptorpro_welcome_email_status
        : welcomeEmailSent
          ? "sent"
          : "pending";

    if (status === "granted" && result.configured !== false && result.actionUrl && !welcomeEmailSent) {
      if (isEmailDeliveryConfigured()) {
        welcomeEmailSent = await sendRaptorProProgramAccessEmail({
          orderId: order.id,
          to: order.customer_email,
          name: order.customer_name,
          actionUrl: result.actionUrl,
          accountCreated: result.accountCreated,
          programName: program.programTitle,
          locale: order.metadata.locale === "en" ? "en" : "pt"
        });
        welcomeEmailStatus = welcomeEmailSent ? "sent" : "failed";
      } else {
        welcomeEmailSent = false;
        welcomeEmailStatus = "pending_configuration";
        await appendOrderLog(
          order.id,
          "raptorpro.email.pending_configuration",
          "O acesso foi criado, mas o provedor de e-mail ainda não está configurado para envio real."
        );
      }
    }

    await updateOrderGatewayIds(order.id, {
      metadata: {
        raptorpro_provisioning_status:
          result.configured === false ? "pending_configuration" : "synced",
        raptorpro_access_status: status,
        raptorpro_welcome_email_sent: welcomeEmailSent,
        raptorpro_welcome_email_status: welcomeEmailStatus,
        raptorpro_account_created: result.accountCreated,
        raptorpro_program_id: program.programId
      }
    });
  } catch (error) {
    await updateOrderGatewayIds(order.id, {
      metadata: { raptorpro_provisioning_status: "error" }
    });
    await appendOrderLog(
      order.id,
      "raptorpro.provisioning.error",
      "O pagamento foi preservado, mas o acesso automático ao RaptorPro precisa ser reprocessado.",
      { error: error instanceof Error ? error.message : String(error), status }
    );
  }
}

export async function syncOrderSubscription(
  orderId: string,
  status: "active" | "past_due" | "canceled" | "unpaid" | "paused",
  gatewayData: Record<string, unknown> = {},
  options: { invite?: boolean } = {}
) {
  const order = await assertOrder(orderId);
  const providerStatus =
    typeof gatewayData.provider_subscription_status === "string"
      ? gatewayData.provider_subscription_status
      : status;
  await updateOrderGatewayIds(order.id, {
    metadata: {
      subscription_status: providerStatus,
      subscription_updated_at: new Date().toISOString(),
      subscription_gateway_data: gatewayData
    }
  });
  const updated = (await getOrderById(order.id)) || order;
  await syncLoadProSafely(updated, status, gatewayData, options.invite === true);
  return getOrderById(order.id);
}

export async function triggerDelivery(orderId: string) {
  const order = await assertOrder(orderId);

  if (order.status !== "paid") {
    await appendOrderLog(
      orderId,
      "delivery.blocked",
      "Entrega bloqueada porque o pedido ainda não está paid.",
      { status: order.status }
    );
    return getOrderById(orderId);
  }

  await deliverOrder(orderId);
  return getOrderById(orderId);
}

export async function markOrderAsPaid(
  orderId: string,
  gatewayData: Record<string, unknown> = {}
) {
  const order = await assertOrder(orderId);
  const firstConfirmation = order.status !== "paid";

  if (firstConfirmation) {
    await updateOrderStatus(orderId, "paid", {
      gateway_data: gatewayData
    });
  } else {
    await appendOrderLog(orderId, "order.paid.idempotent", "Pedido já estava paid.", {
      gateway_data: gatewayData
    });
  }

  const paidOrder = await getOrderById(orderId);
  const sandboxOrder = paidOrder?.metadata.checkout_gateway_mode === "sandbox";
  if (paidOrder) {
    await syncLoadProSafely(paidOrder, "active", gatewayData, firstConfirmation);
    await syncRaptorProSafely(paidOrder, "granted");
    if (
      !isLoadProOrder(paidOrder) &&
      paidOrder.product_id !== "online_coaching_monthly"
    ) {
      await grantProductAccess(paidOrder);
    }

    if (firstConfirmation && !sandboxOrder) {
      await sendInternalSaleNotice({
        orderId: paidOrder.id,
        customerName: paidOrder.customer_name,
        customerEmail: paidOrder.customer_email,
        customerCountry: paidOrder.customer_country,
        customerPostalCode: paidOrder.customer_postal_code,
        customerAddress: paidOrder.customer_address,
        customerWhatsapp: paidOrder.customer_whatsapp,
        productName: paidOrder.product_name,
        amount: paidOrder.amount,
        currency: paidOrder.currency,
        gateway: paidOrder.gateway,
        discountCode:
          typeof paidOrder.metadata.discount_code === "string"
            ? paidOrder.metadata.discount_code
            : null
      });
    }
    if (sandboxOrder) {
      await appendOrderLog(
        paidOrder.id,
        "order.sandbox.delivery_skipped",
        "Pedido sandbox confirmado sem e-mail, convite ou entrega real."
      );
    }
  }

  if (!sandboxOrder) {
    await triggerDelivery(orderId);

    if (firstConfirmation && paidOrder) {
      try {
        const push = await sendAdminSalePush(paidOrder);
        await appendOrderLog(
          paidOrder.id,
          push.sent > 0 ? "admin_push.sent" : "admin_push.skipped",
          push.sent > 0
            ? `Notificacao de venda enviada para ${push.sent} aparelho(s).`
            : "Nenhum aparelho recebeu a notificacao administrativa.",
          push
        ).catch(() => undefined);
      } catch (error) {
        await appendOrderLog(
          paidOrder.id,
          "admin_push.error",
          "A venda foi confirmada, mas a notificacao administrativa falhou.",
          { error: error instanceof Error ? error.message : String(error) }
        ).catch(() => undefined);
      }
    }
  }
  return getOrderById(orderId);
}

export async function markOrderAsFailed(
  orderId: string,
  gatewayData: Record<string, unknown> = {}
) {
  await assertOrder(orderId);
  await updateOrderStatus(orderId, "failed", {
    gateway_data: gatewayData
  });
  return getOrderById(orderId);
}

export async function markOrderAsRefunded(
  orderId: string,
  gatewayData: Record<string, unknown> = {}
) {
  await assertOrder(orderId);
  await updateOrderStatus(orderId, "refunded", {
    gateway_data: gatewayData
  });
  await revokeProductAccessByOrder(orderId);
  const order = await getOrderById(orderId);
  if (order) {
    await syncLoadProSafely(order, "canceled", gatewayData);
    await syncRaptorProSafely(order, "revoked");
  }
  return getOrderById(orderId);
}

export async function markOrderAsCancelled(
  orderId: string,
  gatewayData: Record<string, unknown> = {}
) {
  await assertOrder(orderId);
  await updateOrderStatus(orderId, "cancelled", {
    gateway_data: gatewayData
  });
  const order = await getOrderById(orderId);
  if (order) {
    await syncLoadProSafely(order, "canceled", gatewayData);
    await syncRaptorProSafely(order, "revoked");
  }
  return getOrderById(orderId);
}
