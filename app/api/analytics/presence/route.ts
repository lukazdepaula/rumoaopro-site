import { NextResponse } from "next/server";
import { upsertSitePresence } from "@/lib/checkout/db";
import { isSameSiteRequest } from "@/lib/checkout/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const sessionPattern = /^[a-z0-9-]{20,80}$/i;

export async function POST(request: Request) {
  if (!isSameSiteRequest(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 2048) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
    const path = typeof body.path === "string" ? body.path.trim().slice(0, 240) : "";
    const locale = body.locale === "en" ? "en" : "pt";

    if (!sessionPattern.test(sessionId) || !path.startsWith("/") || path.startsWith("/admin")) {
      return NextResponse.json({ error: "Invalid presence" }, { status: 400 });
    }

    try {
      await upsertSitePresence({ sessionId, path, locale });
    } catch (error) {
      console.error("[analytics.presence.storage]", error);
      return new NextResponse(null, {
        status: 202,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": "30"
        }
      });
    }

    return new NextResponse(null, {
      status: 204,
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    console.error("[analytics.presence.payload]", error);
    return NextResponse.json({ error: "Invalid presence" }, { status: 400 });
  }
}
