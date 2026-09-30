import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/checkout/admin-auth";
import { getFinancialReconciliationSample, resolveFinancialPeriod } from "@/lib/checkout/financial-reporting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Temporary read-only diagnostic, restricted to the existing admin session.
export async function GET(request: Request) {
  const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }
  // Fail closed even if the planned removal is delayed.
  if (Date.now() >= Date.parse("2026-10-03T03:00:00Z")) {
    return NextResponse.json({ error: "Reconciliation diagnostic expired" }, { status: 410, headers });
  }
  const url = new URL(request.url);
  const source = url.searchParams.get("source");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  if (!source || !["kiwify", "mercado_pago", "stripe"].includes(source) ||
      !from || !to || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return NextResponse.json({ error: "Invalid source or dates" }, { status: 400, headers });
  }
  const period = resolveFinancialPeriod({ range: "custom", from, to });
  if (period.startKey !== from || period.endKey !== to || period.days > 31) {
    return NextResponse.json({ error: "Use a valid past/current range of at most 31 days" }, { status: 400, headers });
  }
  try {
    const result = await getFinancialReconciliationSample(source as "kiwify" | "mercado_pago" | "stripe", period);
    return NextResponse.json({ source, from, to, ...result }, { headers });
  } catch {
    return NextResponse.json({ error: "Reconciliation sample unavailable" }, { status: 502, headers });
  }
}
