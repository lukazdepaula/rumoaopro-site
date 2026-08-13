import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/checkout/admin-auth";
import {
  appendOrderLog,
  getOrderById,
  updateOrderGatewayIds
} from "@/lib/checkout/db";
import {
  isEmailDeliveryConfigured,
  sendRaptorProProgramAccessEmail
} from "@/lib/checkout/email";
import {
  getRaptorProProgramConfig,
  RAPTORPRO_ELANGA_PRODUCT_ID,
  syncRaptorProProgramAccess
} from "@/lib/checkout/raptorpro";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const order = await getOrderById(id);
  const redirect = (status: string) =>
    NextResponse.redirect(
      new URL(`/admin/orders/${id}?raptorMigration=${status}`, request.url),
      303
    );

  if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  if (order.status !== "paid") return redirect("not_paid");

  const program = getRaptorProProgramConfig(RAPTORPRO_ELANGA_PRODUCT_ID);
  if (!program) return redirect("error");

  try {
    const result = await syncRaptorProProgramAccess(order, "granted");
    if (!result.handled || result.configured === false || !result.actionUrl) {
      return redirect("error");
    }

    if (!isEmailDeliveryConfigured()) return redirect("email_unavailable");

    const emailSent = await sendRaptorProProgramAccessEmail({
      orderId: order.id,
      to: order.customer_email,
      name: order.customer_name,
      actionUrl: result.actionUrl,
      accountCreated: result.accountCreated,
      programName: program.programTitle,
      locale: "en"
    });

    if (!emailSent) return redirect("email_error");

    await updateOrderGatewayIds(order.id, {
      metadata: {
        raptorpro_provisioning_status: "synced",
        raptorpro_access_status: "granted",
        raptorpro_welcome_email_sent: true,
        raptorpro_welcome_email_status: "sent",
        raptorpro_account_created: result.accountCreated,
        raptorpro_program_id: program.programId,
        raptorpro_legacy_migration: true,
        raptorpro_legacy_migrated_at: new Date().toISOString()
      }
    });
    await appendOrderLog(
      order.id,
      "raptorpro.legacy_migration.completed",
      "Compra anterior do Elanga migrada para o In-Season Pro no RaptorPro e convite enviado em inglês.",
      { programId: program.programId, accountCreated: result.accountCreated }
    );

    return redirect("sent");
  } catch (error) {
    await appendOrderLog(
      order.id,
      "raptorpro.legacy_migration.error",
      "Não foi possível concluir a migração manual para o RaptorPro.",
      { error: error instanceof Error ? error.message : String(error) }
    );
    return redirect("error");
  }
}
