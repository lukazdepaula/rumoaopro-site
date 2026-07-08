import { NextResponse } from "next/server";
import { createCustomerLoginToken } from "@/lib/checkout/db";
import { sendMagicLoginEmail } from "@/lib/checkout/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      name?: string;
    };
    const email = body.email?.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
    }

    const login = await createCustomerLoginToken(email, body.name?.trim() || null);
    if (!login) {
      return NextResponse.json(
        { error: "Não foi possível criar o login." },
        { status: 500 }
      );
    }

    const magicLink = `${new URL(request.url).origin}/api/auth/verify?token=${login.token}`;
    await sendMagicLoginEmail({
      to: email,
      name: body.name,
      loginUrl: magicLink
    });

    return NextResponse.json({
      ok: true,
      magicLink:
        process.env.NODE_ENV !== "production" ||
        (process.env.EMAIL_PROVIDER || "mock") === "mock"
          ? magicLink
          : undefined
    });
  } catch (error) {
    console.error("[auth.request-login]", error);
    return NextResponse.json({ error: "Erro ao solicitar login." }, { status: 500 });
  }
}
