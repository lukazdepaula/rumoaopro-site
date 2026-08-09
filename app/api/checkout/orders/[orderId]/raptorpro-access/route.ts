import { NextResponse } from "next/server";
import { appendOrderLog, getOrderById, updateOrderGatewayIds } from "@/lib/checkout/db";
import { isEmailDeliveryConfigured, sendRaptorProProgramAccessEmail } from "@/lib/checkout/email";
import {
  createRaptorProCheckoutAccessLink,
  isRaptorProProgramOrder
} from "@/lib/checkout/raptorpro";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ orderId: string }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  const { orderId } = await params;
  const fallbackUrl = new URL("/checkout/success", request.url);
  fallbackUrl.searchParams.set("order_id", orderId);

  try {
    const order = await getOrderById(orderId);
    if (!order || order.status !== "paid" || !isRaptorProProgramOrder(order)) {
      fallbackUrl.searchParams.set("access_error", "not_available");
      return NextResponse.redirect(fallbackUrl, 303);
    }

    const actionUrl = await createRaptorProCheckoutAccessLink(order);
    if (order.metadata.raptorpro_direct_access_email_sent !== true && isEmailDeliveryConfigured()) {
      const emailSent = await sendRaptorProProgramAccessEmail({
        orderId: order.id,
        to: order.customer_email,
        name: order.customer_name,
        actionUrl,
        accountCreated: order.metadata.raptorpro_account_created === true
      });
      await updateOrderGatewayIds(order.id, {
        metadata: {
          raptorpro_direct_access_email_sent: emailSent,
          raptorpro_welcome_email_sent: emailSent || order.metadata.raptorpro_welcome_email_sent === true,
          raptorpro_welcome_email_status: emailSent ? "sent" : "failed"
        }
      });
    }
    await appendOrderLog(
      order.id,
      "raptorpro.access.opened_from_checkout",
      "Cliente abriu o acesso seguro diretamente pela confirmação da compra."
    );
    return NextResponse.redirect(actionUrl, 303);
  } catch (error) {
    console.error("[checkout.raptorpro-access]", error);
    await appendOrderLog(
      orderId,
      "raptorpro.access.direct_error",
      "Não foi possível abrir o acesso direto pela confirmação da compra.",
      { error: error instanceof Error ? error.message : String(error) }
    ).catch(() => undefined);
    fallbackUrl.searchParams.set("access_error", "generation_failed");
    return NextResponse.redirect(fallbackUrl, 303);
  }
}
