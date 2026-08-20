import { NextResponse } from "next/server";
import { checkCustomerLoginRateLimit } from "@/lib/checkout/customer-login-rate-limit";
import { createCustomerLoginToken } from "@/lib/checkout/db";
import {
  isEmailDeliveryConfigured,
  sendMagicLoginEmail
} from "@/lib/checkout/email";
import { isSameSiteRequest } from "@/lib/checkout/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" }
  });
}

export async function POST(request: Request) {
  if (!isSameSiteRequest(request)) {
    return jsonResponse({ error: "Origem inválida." }, 403);
  }

  if (!isEmailDeliveryConfigured()) {
    console.error("[auth.request-login] Entrega de e-mail não configurada.");
    return jsonResponse(
      { error: "O acesso por e-mail está temporariamente indisponível." },
      503
    );
  }

  try {
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > 2_048) {
      return jsonResponse({ error: "Solicitação muito grande." }, 413);
    }

    let body: { email?: string; name?: string };
    try {
      body = JSON.parse(rawBody) as { email?: string; name?: string };
    } catch {
      return jsonResponse({ error: "Solicitação inválida." }, 400);
    }
    const email = body.email?.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return jsonResponse({ error: "Informe um e-mail válido." }, 400);
    }

    const rateLimit = checkCustomerLoginRateLimit(request, email);
    if (!rateLimit.allowed) {
      const response = jsonResponse(
        { error: "Muitas tentativas. Aguarde alguns minutos." },
        429
      );
      response.headers.set("Retry-After", String(rateLimit.retryAfterSeconds));
      return response;
    }

    const login = await createCustomerLoginToken(email, body.name?.trim() || null);
    if (!login) {
      return jsonResponse({ error: "Não foi possível criar o login." }, 500);
    }

    const magicLink = `${new URL(request.url).origin}/api/auth/verify?token=${login.token}`;
    const delivered = await sendMagicLoginEmail({
      to: email,
      name: body.name,
      loginUrl: magicLink
    });
    if (!delivered) {
      return jsonResponse(
        { error: "Não foi possível enviar o link de acesso." },
        503
      );
    }

    return jsonResponse({
      ok: true,
      magicLink: process.env.NODE_ENV !== "production" ? magicLink : undefined
    });
  } catch (error) {
    console.error("[auth.request-login]", error);
    return jsonResponse({ error: "Erro ao solicitar login." }, 500);
  }
}
