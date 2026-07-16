import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/checkout/admin-auth";
import {
  appendOrderLog,
  createCustomerLoginToken,
  getOrderById
} from "@/lib/checkout/db";
import { sendMagicLoginEmail } from "@/lib/checkout/email";

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
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  if (order.status !== "paid") {
    return NextResponse.redirect(
      new URL(`/admin/orders/${id}?access=not_paid`, request.url),
      303
    );
  }

  const login = await createCustomerLoginToken(
    order.customer_email,
    order.customer_name
  );

  if (!login) {
    return NextResponse.redirect(
      new URL(`/admin/orders/${id}?access=error`, request.url),
      303
    );
  }

  const magicLink = new URL("/api/auth/verify", request.url);
  magicLink.searchParams.set("token", login.token);

  await sendMagicLoginEmail({
    to: order.customer_email,
    name: order.customer_name,
    loginUrl: magicLink.toString(),
    orderId: order.id
  });
  await appendOrderLog(
    order.id,
    "access.link_sent",
    "Link de acesso reenviado pelo admin.",
    { userId: login.user.id }
  );

  return NextResponse.redirect(
    new URL(`/admin/orders/${id}?access=sent`, request.url),
    303
  );
}
