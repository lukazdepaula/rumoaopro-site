import { appendOrderLog } from "@/lib/checkout/db";

type EmailInput = {
  to: string;
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
}) {
  await sendEmail({
    to: input.to,
    subject: "Seu link de acesso RumoAoPro",
    html: `
      <p>Fala${input.name ? `, ${input.name}` : ""}.</p>
      <p>Use o link abaixo para entrar na sua conta RumoAoPro:</p>
      <p><a href="${input.loginUrl}">Entrar na minha conta</a></p>
      <p>Esse link expira em alguns minutos por segurança.</p>
    `
  });
}

export async function sendInternalSaleNotice(input: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  amount: number;
  currency: string;
}) {
  const to = process.env.INTERNAL_SALES_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  if (!to) return;

  await sendEmail({
    to,
    subject: `Nova venda paga - ${input.productName}`,
    orderId: input.orderId,
    html: `
      <p>Nova venda confirmada.</p>
      <ul>
        <li>Pedido: ${input.orderId}</li>
        <li>Cliente: ${input.customerName} (${input.customerEmail})</li>
        <li>Produto: ${input.productName}</li>
        <li>Valor: ${input.currency} ${input.amount}</li>
      </ul>
    `
  });
}
