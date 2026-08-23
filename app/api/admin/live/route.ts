import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/checkout/admin-auth";
import { listActiveSitePresence } from "@/lib/checkout/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIVE_WINDOW_MS = 2 * 60 * 1000;

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const active = await listActiveSitePresence(
      new Date(Date.now() - ACTIVE_WINDOW_MS)
    );
    const pages = Array.from(
      active.reduce((map, visitor) => {
        map.set(visitor.path, (map.get(visitor.path) || 0) + 1);
        return map;
      }, new Map<string, number>())
    )
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count || a.path.localeCompare(b.path))
      .slice(0, 5);

    return NextResponse.json(
      {
        activeVisitors: active.length,
        pages,
        updatedAt: new Date().toISOString()
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[admin.live]", error);
    return NextResponse.json({ error: "Live data unavailable" }, { status: 500 });
  }
}
