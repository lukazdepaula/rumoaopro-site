import { NextResponse } from "next/server";
import { getAdminRequestSession } from "@/lib/checkout/admin-auth";
import {
  deactivateAdminPushSubscription,
  saveAdminPushSubscription
} from "@/lib/checkout/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

function validEndpoint(value: unknown): value is string {
  if (typeof value !== "string" || value.length < 20 || value.length > 3000) {
    return false;
  }

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function validKey(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 16 &&
    value.length <= 500 &&
    /^[A-Za-z0-9_-]+$/.test(value)
  );
}

export async function POST(request: Request) {
  const session = await getAdminRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origem invalida." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as
    | { endpoint?: unknown; p256dh?: unknown; auth?: unknown; platform?: unknown }
    | null;
  if (
    !body ||
    !validEndpoint(body.endpoint) ||
    !validKey(body.p256dh) ||
    !validKey(body.auth)
  ) {
    return NextResponse.json(
      { error: "Assinatura de notificacao invalida." },
      { status: 400 }
    );
  }

  await saveAdminPushSubscription({
    adminEmail: session.email,
    endpoint: body.endpoint,
    p256dh: body.p256dh,
    auth: body.auth,
    platform: typeof body.platform === "string" ? body.platform : "unknown",
    userAgent: request.headers.get("user-agent")
  });

  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function DELETE(request: Request) {
  const session = await getAdminRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origem invalida." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as
    | { endpoint?: unknown }
    | null;
  if (!body || !validEndpoint(body.endpoint)) {
    return NextResponse.json({ error: "Endpoint invalido." }, { status: 400 });
  }

  await deactivateAdminPushSubscription(body.endpoint, session.email);
  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } }
  );
}
