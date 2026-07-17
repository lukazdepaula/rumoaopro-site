import { appendOrderLog } from "@/lib/checkout/db";

type EmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  orderId?: string;
};

export async function sendEmail(input: EmailInput) {
  const provider = process.env.EMAIL_PROVIDER || "mock";

  try {
    if (provider === "resend" && process.env.RESEND_API_KEY) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from:
            process.env.EMAIL_FROM || "RumoAoPro <no-reply@rumoaopro.com>",
          to: input.to,
          subject: input.subject,
          html: input.html
        })
      });

      if (!response.ok) {
        throw new Error(`Resend retornou ${response.status}.`);
      }

      if (input.orderId) {
        await appendOrderLog(input.orderId, "email.sent", "E-mail enviado.", {
          provider,
          subject: input.subject
        });
      }
      return;
    }

    console.info("[email:mock]", {
      to: input.to,
      subject: input.subject,
      orderId: input.orderId
    });

    if (input.orderId) {
      await appendOrderLog(input.orderId, "email.mock", "E-mail mockado.", {
        subject: input.subject
      });
    }
  } catch (error) {
    if (input.orderId) {
      await appendOrderLog(input.orderId, "email.error", "Falha ao enviar e-mail.", {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

export async function sendPdfDeliveryEmail(input: {
  orderId: string;
  to: string;
  name: string;
  productName: string;
  downloadUrl: string;
}) {
  await sendEmail({
    to: input.to,
    subject: `Seu acesso - ${input.productName}`,
    orderId: input.orderId,
    html: `
      <p>Fala, ${input.name}.</p>
      <p>Pagamento confirmado. Seu acesso ao produto <strong>${input.productName}</strong> está liberado.</p>
      <p><a href="${input.downloadUrl}">Clique aqui para baixar o material</a>.</p>
      <p>Esse link é temporário por segurança. Se expirar, responda este e-mail ou peça reenvio pelo suporte.</p>
    `
  });
}

export async function sendOnboardingEmail(input: {
  orderId: string;
  to: string;
  name: string;
  productName: string;
}) {
  await sendEmail({
    to: input.to,
    subject: `Próximos passos - ${input.productName}`,
    orderId: input.orderId,
    html: `
      <p>Fala, ${input.name}.</p>
      <p>Pagamento confirmado para <strong>${input.productName}</strong>.</p>
      <p>Em breve você recebe os próximos passos para onboarding e alinhamento inicial.</p>
    `
  });
}

export async function sendProgramAccessEmail(input: {
  orderId: string;
  to: string;
  name: string;
  productName: string;
  accountUrl: string;
}) {
  await sendEmail({
    to: input.to,
    subject: `Acesso liberado - ${input.productName}`,
    orderId: input.orderId,
    html: `
      <p>Fala, ${input.name}.</p>
      <p>Pagamento confirmado. Seu acesso ao programa <strong>${input.productName}</strong> foi liberado.</p>
      <p><a href="${input.accountUrl}">Clique aqui para acessar sua biblioteca</a>.</p>
    `
  });
}

export async function sendMagicLoginEmail(input: {
  to: string;
  name?: string | null;
  loginUrl: string;
  orderId?: string;
}) {
  await sendEmail({
    to: input.to,
    subject: "Seu link de acesso RumoAoPro",
    orderId: input.orderId,
    html: `
      <p>Fala${input.name ? `, ${input.name}` : ""}.</p>
      <p>Use o link abaixo para entrar na sua conta RumoAoPro:</p>
      <p><a href="${input.loginUrl}">Entrar na minha conta</a></p>
      <p>Esse link expira em alguns minutos por segurança.</p>
    `
  });
}

export async function sendAdminPasswordResetEmail(input: {
  to: string;
  resetUrl: string;
}) {
  await sendEmail({
    to: input.to,
    subject: "Crie ou redefina sua senha de admin RumoAoPro",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#17191d">
        <div style="background:#08090b;color:#fff;padding:24px">
          <p style="margin:0 0 8px;color:#c8a24c;font-size:12px;font-weight:700;text-transform:uppercase">RumoAoPro Admin</p>
          <h1 style="margin:0;font-size:24px">Defina sua senha</h1>
        </div>
        <div style="border:1px solid #d8dde6;border-top:0;padding:24px">
          <p>Recebemos uma solicitação para criar ou redefinir sua senha de administrador.</p>
          <p style="margin:24px 0"><a href="${input.resetUrl}" style="display:inline-block;background:#d5162a;color:#fff;padding:12px 18px;text-decoration:none;font-weight:700">Definir minha senha</a></p>
          <p style="color:#68707d;font-size:13px">O link expira em 30 minutos e só pode ser usado uma vez. Se você não fez esta solicitação, ignore este e-mail.</p>
        </div>
      </div>
    `
  });
}

export async function sendInternalSaleNotice(input: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerCountry: string;
  customerPostalCode?: string | null;
  productName: string;
  amount: number;
  currency: string;
  gateway: string;
  discountCode?: string | null;
}) {
  const configuredRecipients =
    process.env.INTERNAL_SALES_EMAIL ||
    process.env.ADMIN_EMAILS ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  if (!configuredRecipients) return;

  const to = configuredRecipients
    .split(/[;,]/)
    .map((email) => email.trim())
    .filter(Boolean);
  if (to.length === 0) return;

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const orderUrl = siteUrl ? `${siteUrl}/admin/orders/${input.orderId}` : null;
  const amount = new Intl.NumberFormat(
    input.currency === "BRL" ? "pt-BR" : "en-US",
    { style: "currency", currency: input.currency }
  ).format(input.amount);

  await sendEmail({
    to,
    subject: `Venda confirmada: ${input.productName} · ${amount}`,
    orderId: input.orderId,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#17191d">
        <div style="background:#08090b;color:#fff;padding:24px">
          <p style="margin:0 0 8px;color:#c8a24c;font-size:12px;font-weight:700;text-transform:uppercase">RumoAoPro Admin</p>
          <h1 style="margin:0;font-size:26px">Nova venda confirmada</h1>
        </div>
        <div style="border:1px solid #d8dde6;border-top:0;padding:24px">
          <p style="margin:0 0 18px;font-size:22px;font-weight:700">${input.productName}</p>
          <table style="border-collapse:collapse;width:100%;font-size:14px">
            <tr><td style="padding:8px 0;color:#68707d">Valor</td><td style="padding:8px 0;text-align:right;font-weight:700">${amount}</td></tr>
            <tr><td style="padding:8px 0;color:#68707d">Gateway</td><td style="padding:8px 0;text-align:right;font-weight:700">${input.gateway}</td></tr>
            <tr><td style="padding:8px 0;color:#68707d">Cliente</td><td style="padding:8px 0;text-align:right;font-weight:700">${input.customerName}</td></tr>
            <tr><td style="padding:8px 0;color:#68707d">E-mail</td><td style="padding:8px 0;text-align:right">${input.customerEmail}</td></tr>
            <tr><td style="padding:8px 0;color:#68707d">País / CEP</td><td style="padding:8px 0;text-align:right">${input.customerCountry}${input.customerPostalCode ? ` · ${input.customerPostalCode}` : ""}</td></tr>
            ${input.discountCode ? `<tr><td style="padding:8px 0;color:#68707d">Cupom</td><td style="padding:8px 0;text-align:right">${input.discountCode}</td></tr>` : ""}
            <tr><td style="padding:8px 0;color:#68707d">Pedido</td><td style="padding:8px 0;text-align:right;font-family:monospace">${input.orderId}</td></tr>
          </table>
          ${orderUrl ? `<p style="margin:24px 0 0"><a href="${orderUrl}" style="display:inline-block;background:#d5162a;color:#fff;padding:12px 18px;text-decoration:none;font-weight:700">Abrir pedido no admin</a></p>` : ""}
        </div>
      </div>
    `
  });
}
