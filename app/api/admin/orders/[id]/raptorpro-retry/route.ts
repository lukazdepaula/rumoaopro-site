import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/checkout/admin-auth";
import {
  appendOrderLog,
  getOrderById,
  updateOrderGatewayIds
} from "@/lib/checkout/db";
import { deliverOrder } from "@/lib/checkout/delivery";
import {
  isEmailDeliveryConfigured,
  sendRaptorProProgramAccessEmail
} from "@/lib/checkout/email";
import {
  createRaptorProCheckoutAccessLink,
  getRaptorProProgramConfig,
  isRaptorProProgramOrder,
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
      new URL(`/admin/orders/${id}?raptorRetry=${status}`, request.url),
      303
    );

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }
  if (order.status !== "paid") return redirect("not_paid");
  if (!isRaptorProProgramOrder(order)) return redirect("not_supported");

  const program = getRaptorProProgramConfig(order);
  if (!program) return redirect("not_supported");

  try {
    const result = await syncRaptorProProgramAccess(order, "granted");
    if (!result.handled || result.configured === false) return redirect("error");

    const actionUrl =
      result.actionUrl || (await createRaptorProCheckoutAccessLink(order));

    if (!isEmailDeliveryConfigured()) return redirect("email_unavailable");

    const locale = order.metadata.locale === "en" ? "en" : "pt";
    const emailSent = await sendRaptorProProgramAccessEmail({
      orderId: order.id,
      to: order.customer_email,
      name: order.customer_name,
      actionUrl,
      accountCreated: result.accountCreated,
      programName: program.programTitle,
      locale
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
        raptorpro_program_slug: program.programSlug,
        raptorpro_reprocessed_at: new Date().toISOString()
      }
    });

    await deliverOrder(order.id);
    await appendOrderLog(
      order.id,
      "raptorpro.access.reprocessed",
      "Acesso ao RaptorPro reprocessado e novo convite enviado pelo admin.",
      { programId: program.programId, accountCreated: result.accountCreated }
    );

    return redirect("sent");
  } catch (error) {
    await appendOrderLog(
      order.id,
      "raptorpro.access.reprocess_error",
      "Não foi possível reprocessar o acesso ao RaptorPro.",
      { error: error instanceof Error ? error.message : String(error) }
    );
    return redirect("error");
  }
}
