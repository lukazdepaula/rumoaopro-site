import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/checkout/admin-auth";
import { appendOrderLog, getOrderById } from "@/lib/checkout/db";
import { triggerDelivery } from "@/lib/checkout/order-events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await appendOrderLog(id, "delivery.retry", "Reenvio de entrega solicitado no admin.");
  await triggerDelivery(id);
  return NextResponse.redirect(new URL(`/admin/orders/${id}`, request.url), 303);
}
