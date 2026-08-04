import { NextResponse } from "next/server";
import { getAdminRequestSession } from "@/lib/checkout/admin-auth";
import { sendAdminTestPush } from "@/lib/checkout/admin-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getAdminRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Origem invalida." }, { status: 403 });
  }

  const result = await sendAdminTestPush(session.email);
  if (!result.configured) {
    return NextResponse.json(
      { error: "As chaves de notificacao ainda nao foram configuradas." },
      { status: 503 }
    );
  }
  if (result.reason === "no_subscriptions") {
    return NextResponse.json(
      { error: "Ative as notificacoes neste aparelho antes de testar." },
      { status: 404 }
    );
  }
  if (result.sent === 0) {
    return NextResponse.json(
      { error: "Nao foi possivel entregar a notificacao de teste." },
      { status: 502 }
    );
  }

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" }
  });
}
