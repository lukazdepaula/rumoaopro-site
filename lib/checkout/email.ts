import { appendOrderLog } from "@/lib/checkout/db";

type EmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  orderId?: string;
};

export function isEmailDeliveryConfigured() {
  return (
    process.env.EMAIL_PROVIDER === "resend" &&
    Boolean(process.env.RESEND_API_KEY)
  );
}

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
      })[character] || character
  );

const formatEmailMoney = (
  amount: number,
  currency: string,
  locale: "pt" | "en"
) =>
  new Intl.NumberFormat(locale === "en" ? "en-US" : "pt-BR", {
    style: "currency",
    currency
  }).format(amount);

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
      return true;
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
    return true;
  } catch (error) {
    if (input.orderId) {
      await appendOrderLog(input.orderId, "email.error", "Falha ao enviar e-mail.", {
        error: error instanceof Error ? error.message : String(error)
      });
    }
    return false;
  }
}

export async function sendLoadProTrialInviteEmail(input: {
  orderId: string;
  to: string;
  name: string;
  inviteUrl: string;
  amount: number;
  currency: string;
  locale?: "pt" | "en";
}) {
  const isEnglish = input.locale === "en";
  const inviteUrl = escapeHtml(input.inviteUrl);
  const name = escapeHtml(input.name);
  const renewalPrice = formatEmailMoney(
    input.amount,
    input.currency,
    isEnglish ? "en" : "pt"
  );

  return sendEmail({
    to: input.to,
    subject: isEnglish
      ? "Create your password and access LoadPro"
      : "Crie sua senha e acesse o LoadPro",
    orderId: input.orderId,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#17191d">
        <div style="background:#08090b;color:#fff;padding:24px;border-bottom:4px solid #ed1b2f">
          <p style="margin:0 0 8px;color:#ff5362;font-size:12px;font-weight:700;text-transform:uppercase">RumoAoPro · LoadPro App</p>
          <h1 style="margin:0;font-size:26px">${isEnglish ? "Your 7-day free trial is active" : "Seu teste gratuito de 7 dias está ativo"}</h1>
        </div>
        <div style="border:1px solid #d8dde6;border-top:0;padding:24px">
          <p>${isEnglish ? `Hi, ${name}.` : `Fala, ${name}.`}</p>
          <p>${isEnglish
            ? "Create your password now to access LoadPro and set up your first club."
            : "Crie sua senha agora para acessar o LoadPro e configurar seu primeiro clube."}</p>
          <p style="margin:24px 0"><a href="${inviteUrl}" style="display:inline-block;background:#ed1b2f;color:#fff;padding:13px 20px;text-decoration:none;font-weight:700">${isEnglish ? "Create my password" : "Criar minha senha"}</a></p>
          <div style="background:#f4f5f7;border-radius:8px;padding:16px;font-size:14px;line-height:1.6">
            <strong>${isEnglish ? "No charge today." : "Nenhuma cobrança foi feita hoje."}</strong><br>
            ${isEnglish
              ? `After 7 days, the subscription renews for ${renewalPrice} per month. You can cancel at any time.`
              : `Depois de 7 dias, a assinatura será renovada por ${renewalPrice}/mês. Você pode cancelar quando quiser.`}
          </div>
          <p style="color:#68707d;font-size:13px;margin-top:20px">${isEnglish
            ? "For security, this link expires and can only be used to activate your own account. Never share your password."
            : "Por segurança, este link expira e deve ser usado apenas para ativar sua própria conta. Nunca compartilhe sua senha."}</p>
        </div>
      </div>
    `
  });
}

export async function sendLoadProExistingAccountEmail(input: {
  orderId: string;
  to: string;
  name: string;
  appUrl: string;
  amount: number;
  currency: string;
  locale?: "pt" | "en";
}) {
  const isEnglish = input.locale === "en";
  const appUrl = escapeHtml(input.appUrl.replace(/\/$/, ""));
  const name = escapeHtml(input.name);
  const renewalPrice = formatEmailMoney(
    input.amount,
    input.currency,
    isEnglish ? "en" : "pt"
  );

  return sendEmail({
    to: input.to,
    subject: isEnglish
      ? "Your LoadPro trial is active"
      : "Seu teste do LoadPro está ativo",
    orderId: input.orderId,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#17191d">
        <div style="background:#08090b;color:#fff;padding:24px;border-bottom:4px solid #ed1b2f">
          <p style="margin:0 0 8px;color:#ff5362;font-size:12px;font-weight:700;text-transform:uppercase">RumoAoPro · LoadPro App</p>
          <h1 style="margin:0;font-size:26px">${isEnglish ? "Your 7-day free trial is active" : "Seu teste gratuito de 7 dias está ativo"}</h1>
        </div>
        <div style="border:1px solid #d8dde6;border-top:0;padding:24px">
          <p>${isEnglish ? `Hi, ${name}.` : `Fala, ${name}.`}</p>
          <p>${isEnglish
            ? "This email already has a LoadPro account. Sign in with your existing password; if needed, use Forgot password on the login screen."
            : "Este e-mail já possui uma conta no LoadPro. Entre com sua senha atual; se precisar, use Esqueci minha senha na tela de login."}</p>
          <p style="margin:24px 0"><a href="${appUrl}/?view=login" style="display:inline-block;background:#ed1b2f;color:#fff;padding:13px 20px;text-decoration:none;font-weight:700">${isEnglish ? "Open LoadPro" : "Abrir o LoadPro"}</a></p>
          <p style="color:#68707d;font-size:13px">${isEnglish
            ? `No charge was made today. After 7 days, the subscription renews for ${renewalPrice} per month.`
            : `Nenhuma cobrança foi feita hoje. Depois de 7 dias, a assinatura será renovada por ${renewalPrice}/mês.`}</p>
        </div>
      </div>
    `
  });
}

export async function sendLoadProPasswordRecoveryEmail(input: {
  to: string;
  recoveryUrl: string;
  locale?: "pt" | "en";
}) {
  const isEnglish = input.locale === "en";
  const recoveryUrl = escapeHtml(input.recoveryUrl);

  return sendEmail({
    to: input.to,
    subject: isEnglish
      ? "Reset your LoadPro password"
      : "Redefina sua senha do LoadPro",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#17191d">
        <div style="background:#08090b;color:#fff;padding:24px;border-bottom:4px solid #ed1b2f">
          <p style="margin:0 0 8px;color:#ff5362;font-size:12px;font-weight:700;text-transform:uppercase">RumoAoPro · LoadPro App</p>
          <h1 style="margin:0;font-size:26px">${isEnglish ? "Reset your password" : "Redefina sua senha"}</h1>
        </div>
        <div style="border:1px solid #d8dde6;border-top:0;padding:24px">
          <p>${isEnglish
            ? "We received a request to reset the password for your LoadPro account."
            : "Recebemos uma solicitação para redefinir a senha da sua conta LoadPro."}</p>
          <p style="margin:24px 0"><a href="${recoveryUrl}" style="display:inline-block;background:#ed1b2f;color:#fff;padding:13px 20px;text-decoration:none;font-weight:700">${isEnglish ? "Create a new password" : "Criar nova senha"}</a></p>
          <p style="color:#68707d;font-size:13px">${isEnglish
            ? "This secure link expires. If you did not request a new password, you can ignore this email."
            : "Este link seguro expira. Se você não solicitou uma nova senha, pode ignorar este e-mail."}</p>
          <p style="color:#68707d;font-size:13px">${isEnglish
            ? "RumoAoPro support will never ask for your password."
            : "O suporte RumoAoPro nunca solicitará sua senha."}</p>
        </div>
      </div>
    `
  });
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

export async function sendLoadProAccessEmail(input: {
  orderId: string;
  to: string;
  name: string;
  appUrl: string;
}) {
  const appUrl = escapeHtml(input.appUrl.replace(/\/$/, ""));
  await sendEmail({
    to: input.to,
    subject: "Seu acesso ao LoadPro está liberado",
    orderId: input.orderId,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#17191d">
        <div style="background:#08090b;color:#fff;padding:24px;border-bottom:4px solid #ed1b2f">
          <p style="margin:0 0 8px;color:#ff5362;font-size:12px;font-weight:700;text-transform:uppercase">LoadPro</p>
          <h1 style="margin:0;font-size:26px">Assinatura confirmada</h1>
        </div>
        <div style="border:1px solid #d8dde6;border-top:0;padding:24px">
          <p>Fala, ${escapeHtml(input.name)}.</p>
          <p>Seu Plano Treinadores Fundadores foi confirmado. Ele inclui até <strong>2 equipes</strong>, com até <strong>25 atletas por equipe</strong>, pelo preço fundador de <strong>R$ 49,90/mês</strong> enquanto a assinatura permanecer ativa.</p>
          <p>Se este for seu primeiro acesso, você também receberá um convite para definir sua senha com segurança.</p>
          <p style="margin:24px 0"><a href="${appUrl}" style="display:inline-block;background:#ed1b2f;color:#fff;padding:12px 18px;text-decoration:none;font-weight:700">Abrir o LoadPro</a></p>
          <p style="color:#68707d;font-size:13px">Nunca envie sua senha por e-mail, WhatsApp ou suporte.</p>
        </div>
      </div>
    `
  });
}

export async function sendRaptorProProgramAccessEmail(input: {
  orderId: string;
  to: string;
  name: string;
  actionUrl: string;
  accountCreated: boolean;
}) {
  const actionUrl = escapeHtml(input.actionUrl);
  return sendEmail({
    to: input.to,
    subject: "Seu Offseason 30 Days está liberado no RaptorPro",
    orderId: input.orderId,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#17191d">
        <div style="background:#08090b;color:#fff;padding:24px;border-bottom:4px solid #ed1b2f">
          <p style="margin:0 0 8px;color:#ff5362;font-size:12px;font-weight:700;text-transform:uppercase">RaptorPro Coach</p>
          <h1 style="margin:0;font-size:26px">Programa liberado</h1>
        </div>
        <div style="border:1px solid #d8dde6;border-top:0;padding:24px">
          <p>Fala, ${escapeHtml(input.name)}.</p>
          <p>Pagamento confirmado. Seu acesso ao <strong>Offseason 30 Days</strong> já está liberado no RaptorPro.</p>
          <p>${input.accountCreated ? "Use o botão abaixo para criar sua senha e abrir o primeiro treino." : "Use o botão abaixo para entrar com segurança e abrir seu programa."}</p>
          <p style="margin:24px 0"><a href="${actionUrl}" style="display:inline-block;background:#ed1b2f;color:#fff;padding:14px 20px;text-decoration:none;font-weight:700">${input.accountCreated ? "Criar senha e acessar" : "Abrir meu programa"}</a></p>
          <p style="color:#68707d;font-size:13px">O link é pessoal e expira por segurança. Depois do primeiro acesso, entre em app.rumoaopro.com.br com o e-mail usado na compra.</p>
        </div>
      </div>
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
  customerAddress?: string | null;
  customerWhatsapp?: string | null;
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
  const customerName = escapeHtml(input.customerName);
  const customerEmail = escapeHtml(input.customerEmail);
  const customerCountry = escapeHtml(input.customerCountry);
  const customerPostalCode = input.customerPostalCode
    ? escapeHtml(input.customerPostalCode)
    : null;
  const customerAddress = input.customerAddress
    ? escapeHtml(input.customerAddress)
    : null;
  const customerWhatsapp = input.customerWhatsapp
    ? escapeHtml(input.customerWhatsapp)
    : null;
  const discountCode = input.discountCode
    ? escapeHtml(input.discountCode)
    : null;

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
            <tr><td style="padding:8px 0;color:#68707d">Cliente</td><td style="padding:8px 0;text-align:right;font-weight:700">${customerName}</td></tr>
            <tr><td style="padding:8px 0;color:#68707d">E-mail</td><td style="padding:8px 0;text-align:right">${customerEmail}</td></tr>
            <tr><td style="padding:8px 0;color:#68707d">WhatsApp</td><td style="padding:8px 0;text-align:right">${customerWhatsapp || "-"}</td></tr>
            <tr><td style="padding:8px 0;color:#68707d">País / CEP</td><td style="padding:8px 0;text-align:right">${customerCountry}${customerPostalCode ? ` · ${customerPostalCode}` : ""}</td></tr>
            <tr><td style="padding:8px 0;color:#68707d">Endereço</td><td style="padding:8px 0;text-align:right">${customerAddress || "-"}</td></tr>
            ${discountCode ? `<tr><td style="padding:8px 0;color:#68707d">Cupom</td><td style="padding:8px 0;text-align:right">${discountCode}</td></tr>` : ""}
            <tr><td style="padding:8px 0;color:#68707d">Pedido</td><td style="padding:8px 0;text-align:right;font-family:monospace">${input.orderId}</td></tr>
          </table>
          ${orderUrl ? `<p style="margin:24px 0 0"><a href="${orderUrl}" style="display:inline-block;background:#d5162a;color:#fff;padding:12px 18px;text-decoration:none;font-weight:700">Abrir pedido no admin</a></p>` : ""}
        </div>
      </div>
    `
  });
}
