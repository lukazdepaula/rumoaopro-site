import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/checkout/admin-auth";
import { canProvisionRaptorProSandbox, canInspectRaptorProSandbox, isPreviewEnvironment } from "@/lib/preview-safety";
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
  inspectRaptorProPreviewConnection,
  syncRaptorProProgramAccess
} from "@/lib/checkout/raptorpro";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const headers = { "Cache-Control": "no-store" };
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }
  const { id } = await context.params;
  const order = await getOrderById(id);
  if (!order || order.status !== "paid" || !canInspectRaptorProSandbox(order)) {
    return NextResponse.json({ error: "Diagnóstico de testes indisponível." }, { status: 404, headers });
  }
  try {
    return NextResponse.json(await inspectRaptorProPreviewConnection(order), { headers });
  } catch {
    return NextResponse.json({ error: "Não foi possível verificar a conexão de testes." }, { status: 502, headers });
  }
}

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
    const isolatedPreview = canProvisionRaptorProSandbox(order);
    if (isPreviewEnvironment() && !isolatedPreview) return redirect("error");
    // A retry must not create an account/link if its approved mail channel is off.
    if (isolatedPreview) {
      if (order.metadata.raptorpro_welcome_email_sent === true) return redirect("sent");
      if (!isEmailDeliveryConfigured({ raptorPreviewTo: order.customer_email, orderId: order.id })) {
        return redirect("email_unavailable");
      }
    }
    const result = await syncRaptorProProgramAccess(order, "granted");
    if (!result.handled || result.configured === false) return redirect("error");

    const actionUrl =
      result.actionUrl || (await createRaptorProCheckoutAccessLink(order));

    if (!isolatedPreview && !isEmailDeliveryConfigured()) return redirect("email_unavailable");

    const locale = order.metadata.locale === "en" ? "en" : "pt";
    const emailSent = await sendRaptorProProgramAccessEmail({
      orderId: order.id,
      to: order.customer_email,
      name: order.customer_name,
      actionUrl,
      accountCreated: result.accountCreated,
      programName: isolatedPreview ? result.programTitle : program.programTitle,
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
        raptorpro_program_id: result.programId,
        raptorpro_program_slug: result.programSlug,
        raptorpro_reprocessed_at: new Date().toISOString()
      }
    });

    // The isolated order must never trigger generic delivery or client notifications.
    if (!isolatedPreview) await deliverOrder(order.id);
    await appendOrderLog(
      order.id,
      "raptorpro.access.reprocessed",
      "Acesso ao RaptorPro reprocessado e novo convite enviado pelo admin.",
      { programId: result.programId, accountCreated: result.accountCreated }
    );

    return redirect("sent");
  } catch (error) {
    await appendOrderLog(
      order.id,
      "raptorpro.access.reprocess_error",
      "Não foi possível reprocessar o acesso ao RaptorPro.",
      { error: isPreviewEnvironment() ? "Isolated preview retry failed." : error instanceof Error ? error.message : String(error) }
    );
    return redirect("error");
  }
}
