import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/checkout/admin-auth";
import { listPaidOrders } from "@/lib/checkout/db";
import { ordersToFiscalCsv } from "@/lib/checkout/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const csv = ordersToFiscalCsv(await listPaidOrders());
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"rumoaopro-vendas-pagas.csv\""
    }
  });
}
