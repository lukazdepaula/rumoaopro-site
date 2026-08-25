import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/checkout/admin-auth";
import { getMonthlyExpenseMetrics } from "@/lib/checkout/expense-reporting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const period = url.searchParams.get("period") || undefined;
  if (period && !/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  try {
    const metrics = await getMonthlyExpenseMetrics(period, {
      bypassCache: url.searchParams.get("refresh") === "1"
    });
    return NextResponse.json(metrics, {
      headers: { "Cache-Control": "private, no-store" }
    });
  } catch (error) {
    console.error("[admin.expenses]", error);
    return NextResponse.json({ error: "Expense data unavailable" }, { status: 500 });
  }
}
