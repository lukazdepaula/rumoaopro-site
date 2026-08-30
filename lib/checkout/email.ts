import { appendOrderLog } from "@/lib/checkout/db";

type EmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  orderId?: string;
};

export function isEmailDeliveryConfigured() {
  if (process.env.NODE_ENV !== "production") return true;
  return (
    process.env.EMAIL_PROVIDER?.trim().toLowerCase() === "resend" &&
    Boolean(process.env.RESEND_API_KEY?.trim())
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

function loadProEmailShell(input: {
  preheader: string;
  eyebrow: string;
  title: string;
  content: string;
  locale?: "pt" | "en";
}) {
  const isEnglish = input.locale === "en";
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://rumoaopro.com").replace(/\/$/, "");
  const logoUrl = escapeHtml(`${siteUrl}/assets/loadpro/loadpro-logo-white-red-transparent.png`);
  return `<!doctype html>
    <html lang="${isEnglish ? "en" : "pt-BR"}">
      <body style="margin:0;padding:0;background:#eef0f3;color:#17191d;font-family:Arial,Helvetica,sans-serif">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(input.preheader)}</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#eef0f3">
          <tr><td align="center" style="padding:28px 12px">
            <table role="presentation" width="620" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:620px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 14px 36px rgba(15,23,42,.12)">
              <tr><td style="padding:25px 30px;background:#08090b;border-bottom:4px solid #ed1b2f">
                <img src="${logoUrl}" width="178" alt="LoadPro" style="display:block;width:178px;max-width:70%;height:auto;border:0" />
              </td></tr>
              <tr><td style="padding:34px 34px 28px">
                <p style="margin:0 0 9px;color:#d9162a;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase">${escapeHtml(input.eyebrow)}</p>
                <h1 style="margin:0 0 20px;color:#111318;font-size:28px;line-height:1.15">${escapeHtml(input.title)}</h1>
                ${input.content}
              </td></tr>
              <tr><td style="padding:20px 34px;background:#f6f7f9;border-top:1px solid #e4e7ec;color:#68707d;font-size:11px;line-height:1.55">
                ${isEnglish ? "LoadPro App · Football performance monitoring" : "LoadPro App · Monitoramento de performance no futebol"}<br />
                ${isEnglish ? "Transactional message sent by RumoAoPro. We will never ask for your password or full card details." : "Mensagem transacional enviada pela RumoAoPro. Nunca solicitaremos sua senha ou os dados completos do cartão."}
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
    </html>`;
}

function loadProEmailButton(url: string, label: string) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:25px 0"><tr><td style="border-radius:9px;background:#ed1b2f"><a href="${url}" style="display:inline-block;padding:14px 22px;color:#ffffff;font-size:14px;font-weight:800;text-decoration:none">${escapeHtml(label)}</a></td></tr></table>`;
}

function loadProEmailSummary(rows: Array<[string, string]>) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:23px 0;background:#f6f7f9;border:1px solid #e1e5eb;border-radius:11px">${rows
    .map(([label, value], index) => `<tr><td style="padding:12px 15px;color:#68707d;font-size:12px;${index < rows.length - 1 ? "border-bottom:1px solid #e1e5eb" : ""}">${escapeHtml(label)}</td><td align="right" style="padding:12px 15px;color:#17191d;font-size:13px;font-weight:800;${index < rows.length - 1 ? "border-bottom:1px solid #e1e5eb" : ""}">${escapeHtml(value)}</td></tr>`)
    .join("")}</table>`;
}

export async function sendEmail(input: EmailInput) {
  const provider = (process.env.EMAIL_PROVIDER || "mock").trim().toLowerCase();

  try {
    if (provider === "resend") {
      const apiKey = process.env.RESEND_API_KEY?.trim();
      if (!apiKey) {
        throw new Error("RESEND_API_KEY ausente.");
      }

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from:
            process.env.EMAIL_FROM || "RumoAoPro <no-reply@rumoaopro.com>",
          to: input.to,
          subject: input.subject,
          html: input.html,
          ...(input.text ? { text: input.text } : {})
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

    if (process.env.NODE_ENV === "production") {
      throw new Error("EMAIL_PROVIDER deve ser 'resend' em produção.");
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
    text: isEnglish
      ? `Hi, ${input.name}. Your 7-day LoadPro trial is active. Create your password: ${input.inviteUrl}. No charge today; after 7 days the subscription renews for ${renewalPrice} per month.`
      : `Fala, ${input.name}. Seu teste gratuito de 7 dias do LoadPro está ativo. Crie sua senha: ${input.inviteUrl}. Nenhuma cobrança foi feita hoje; depois de 7 dias a assinatura será renovada por ${renewalPrice}/mês.`,
    html: loadProEmailShell({
      locale: isEnglish ? "en" : "pt",
      preheader: isEnglish ? "Create your password to open LoadPro." : "Crie sua senha para acessar o LoadPro.",
      eyebrow: isEnglish ? "Access ready" : "Acesso preparado",
      title: isEnglish ? "Your 7-day free trial is active" : "Seu teste gratuito de 7 dias está ativo",
      content: `
        <p style="margin:0 0 12px;font-size:15px;line-height:1.65">${isEnglish ? `Hi, ${name}.` : `Fala, ${name}.`}</p>
        <p style="margin:0;color:#4f5663;font-size:15px;line-height:1.65">${isEnglish ? "Create your password now to access LoadPro and set up your first club." : "Crie sua senha agora para acessar o LoadPro e configurar seu primeiro clube."}</p>
        ${loadProEmailButton(inviteUrl, isEnglish ? "Create my password" : "Criar minha senha")}
        ${loadProEmailSummary([
          [isEnglish ? "Today" : "Hoje", isEnglish ? "No charge" : "Sem cobrança"],
          [isEnglish ? "After the trial" : "Após o teste", `${renewalPrice}${isEnglish ? " / month" : " / mês"}`]
        ])}
        <p style="margin:18px 0 0;color:#68707d;font-size:12px;line-height:1.55">${isEnglish ? "This personal activation link expires for security. Never share your password." : "Este link pessoal de ativação expira por segurança. Nunca compartilhe sua senha."}</p>`
    })
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
    text: isEnglish
      ? `Hi, ${input.name}. Your 7-day LoadPro trial is active. Sign in with your existing password: ${input.appUrl.replace(/\/$/, "")}/?view=login. After 7 days the subscription renews for ${renewalPrice} per month.`
      : `Fala, ${input.name}. Seu teste gratuito de 7 dias do LoadPro está ativo. Entre com sua senha atual: ${input.appUrl.replace(/\/$/, "")}/?view=login. Depois de 7 dias a assinatura será renovada por ${renewalPrice}/mês.`,
    html: loadProEmailShell({
      locale: isEnglish ? "en" : "pt",
      preheader: isEnglish ? "Your LoadPro trial is ready." : "Seu teste do LoadPro está pronto.",
      eyebrow: isEnglish ? "Access ready" : "Acesso preparado",
      title: isEnglish ? "Your 7-day free trial is active" : "Seu teste gratuito de 7 dias está ativo",
      content: `
        <p style="margin:0 0 12px;font-size:15px;line-height:1.65">${isEnglish ? `Hi, ${name}.` : `Fala, ${name}.`}</p>
        <p style="margin:0;color:#4f5663;font-size:15px;line-height:1.65">${isEnglish ? "This email already has a LoadPro account. Sign in with your existing password; if needed, use Forgot password on the login screen." : "Este e-mail já possui uma conta no LoadPro. Entre com sua senha atual; se precisar, use Esqueci minha senha na tela de login."}</p>
        ${loadProEmailButton(`${appUrl}/?view=login`, isEnglish ? "Open LoadPro" : "Abrir o LoadPro")}
        ${loadProEmailSummary([
          [isEnglish ? "Today" : "Hoje", isEnglish ? "No charge" : "Sem cobrança"],
          [isEnglish ? "After the trial" : "Após o teste", `${renewalPrice}${isEnglish ? " / month" : " / mês"}`]
        ])}`
    })
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
    text: isEnglish
      ? `We received a request to reset your LoadPro password. Create a new password: ${input.recoveryUrl}. If you did not request this, ignore this email.`
      : `Recebemos uma solicitação para redefinir sua senha do LoadPro. Crie uma nova senha: ${input.recoveryUrl}. Se você não fez essa solicitação, ignore este e-mail.`,
    html: loadProEmailShell({
      locale: isEnglish ? "en" : "pt",
      preheader: isEnglish ? "Securely reset your LoadPro password." : "Redefina sua senha do LoadPro com segurança.",
      eyebrow: isEnglish ? "Account security" : "Segurança da conta",
      title: isEnglish ? "Reset your password" : "Redefina sua senha",
      content: `
        <p style="margin:0;color:#4f5663;font-size:15px;line-height:1.65">${isEnglish ? "We received a request to reset the password for your LoadPro account." : "Recebemos uma solicitação para redefinir a senha da sua conta LoadPro."}</p>
        ${loadProEmailButton(recoveryUrl, isEnglish ? "Create a new password" : "Criar nova senha")}
        <p style="margin:0;color:#68707d;font-size:12px;line-height:1.55">${isEnglish ? "This secure link expires. If you did not request a new password, you can ignore this email." : "Este link seguro expira. Se você não solicitou uma nova senha, pode ignorar este e-mail."}</p>`
    })
  });
}

export async function sendPdfDeliveryEmail(input: {
  orderId: string;
  to: string;
  name: string;
  productName: string;
  downloadUrl: string;
}) {
  return sendEmail({
    to: input.to,
    subject: `Seu acesso - ${input.productName}`,
    orderId: input.orderId,
    html: `
      <p>Fala, ${escapeHtml(input.name)}.</p>
      <p>Pagamento confirmado. Seu acesso ao produto <strong>${escapeHtml(input.productName)}</strong> está liberado.</p>
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
  const isCoachingSubscription = input.productName.includes("Assessoria Online RumoAoPro");

  return sendEmail({
    to: input.to,
    subject: isCoachingSubscription
      ? "Assessoria RumoAoPro confirmada · próximos passos"
      : `Próximos passos - ${input.productName}`,
    orderId: input.orderId,
    html: isCoachingSubscription
      ? `
        <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#17191d">
          <div style="background:#08090b;color:#fff;padding:24px;border-bottom:4px solid #ed1b2f">
            <p style="margin:0 0 8px;color:#ff5362;font-size:12px;font-weight:700;text-transform:uppercase">RumoAoPro Assessoria</p>
            <h1 style="margin:0;font-size:26px">Assinatura confirmada</h1>
          </div>
          <div style="border:1px solid #d8dde6;border-top:0;padding:24px">
            <p>Fala, ${escapeHtml(input.name)}.</p>
            <p>Sua assinatura da <strong>Assessoria Online RumoAoPro</strong> foi confirmada.</p>
            <p>Nossa equipe usará o WhatsApp informado no checkout para fazer o contato inicial e organizar seu onboarding.</p>
            <p style="color:#68707d;font-size:13px">Prazo de suporte: até 3 dias úteis.</p>
          </div>
        </div>
      `
      : `
        <p>Fala, ${escapeHtml(input.name)}.</p>
        <p>Pagamento confirmado para <strong>${escapeHtml(input.productName)}</strong>.</p>
        <p>Em breve você recebe os próximos passos para onboarding e alinhamento inicial.</p>
      `
  });
}

export async function sendLoadProAccessEmail(input: {
  orderId: string;
  to: string;
  name: string;
  appUrl: string;
  productName: string;
  teamLimit: number;
  playersPerTeamLimit: number;
  amount: number;
  currency: string;
}) {
  const appUrl = escapeHtml(input.appUrl.replace(/\/$/, ""));
  const planName = escapeHtml(input.productName);
  const price = formatEmailMoney(input.amount, input.currency, "pt");
  return sendEmail({
    to: input.to,
    subject: "Seu acesso ao LoadPro está liberado",
    orderId: input.orderId,
    text: `Fala, ${input.name}. Seu ${input.productName} foi confirmado. O plano inclui até ${input.teamLimit} equipes, com até ${input.playersPerTeamLimit} atletas por equipe, por ${price}/mês. Acesse: ${input.appUrl.replace(/\/$/, "")}.`,
    html: loadProEmailShell({
      preheader: "Sua assinatura do LoadPro foi confirmada.",
      eyebrow: "Pagamento confirmado",
      title: "Seu acesso está liberado",
      content: `
        <p style="margin:0 0 12px;font-size:15px;line-height:1.65">Fala, ${escapeHtml(input.name)}.</p>
        <p style="margin:0;color:#4f5663;font-size:15px;line-height:1.65">Seu <strong>${planName}</strong> foi confirmado e o workspace está disponível.</p>
        ${loadProEmailSummary([
          ["Equipes", `Até ${input.teamLimit}`],
          ["Atletas por equipe", `Até ${input.playersPerTeamLimit}`],
          ["Valor", `${price} / mês`]
        ])}
        ${loadProEmailButton(appUrl, "Abrir o LoadPro")}
        <p style="margin:0;color:#68707d;font-size:12px;line-height:1.55">Se este for seu primeiro acesso, você também receberá um convite separado para definir sua senha com segurança.</p>`
    })
  });
}

export async function sendLoadProPaymentFailedEmail(input: {
  orderId: string;
  to: string;
  productName: string;
  amount: number;
  currency: string;
  appUrl: string;
  locale?: "pt" | "en";
}) {
  const isEnglish = input.locale === "en";
  const recoveryUrl = escapeHtml(`${input.appUrl.replace(/\/$/, "")}/?view=billing`);
  const amount = formatEmailMoney(input.amount, input.currency, isEnglish ? "en" : "pt");

  return sendEmail({
    to: input.to,
    subject: isEnglish
      ? "Please update your LoadPro payment"
      : "Precisamos atualizar seu pagamento do LoadPro",
    orderId: input.orderId,
    text: isEnglish
      ? `We could not confirm your latest LoadPro payment. Your data remains protected. Update your payment to restore workspace access: ${input.appUrl.replace(/\/$/, "")}/?view=billing.`
      : `Não conseguimos confirmar sua última cobrança do LoadPro. Seus dados continuam preservados. Regularize o pagamento para recuperar o acesso ao workspace: ${input.appUrl.replace(/\/$/, "")}/?view=billing.`,
    html: loadProEmailShell({
      locale: isEnglish ? "en" : "pt",
      preheader: isEnglish ? "Update your payment to restore workspace access." : "Regularize o pagamento para recuperar o acesso ao workspace.",
      eyebrow: isEnglish ? "Account notice" : "Aviso sobre sua assinatura",
      title: isEnglish ? "We could not confirm your payment" : "Não conseguimos confirmar seu pagamento",
      content: `
        <p style="margin:0 0 12px;font-size:15px;line-height:1.65">${isEnglish ? "Hi!" : "Fala!"}</p>
        <p style="margin:0;color:#4f5663;font-size:15px;line-height:1.65">${isEnglish ? "The latest charge for your LoadPro subscription was not approved. Your clubs, teams, athletes and reports remain protected." : "A última cobrança da sua assinatura do LoadPro não foi aprovada. Seus clubes, equipes, atletas e relatórios continuam preservados."}</p>
        ${loadProEmailSummary([
          [isEnglish ? "Plan" : "Plano", input.productName || "LoadPro"],
          [isEnglish ? "Monthly amount" : "Valor mensal", amount],
          [isEnglish ? "Status" : "Status", isEnglish ? "Payment pending" : "Pagamento pendente"]
        ])}
        ${loadProEmailButton(recoveryUrl, isEnglish ? "Update payment" : "Regularizar pagamento")}
        <p style="margin:0;color:#68707d;font-size:12px;line-height:1.55">${isEnglish ? "After Stripe confirms the payment, workspace access is restored automatically. Need help? Reply to this email and our team will assist you." : "Assim que a Stripe confirmar o pagamento, o acesso ao workspace será restabelecido automaticamente. Se precisar de ajuda, responda este e-mail e a nossa equipe cuida com você."}</p>`
    })
  });
}

export async function sendRaptorProProgramAccessEmail(input: {
  orderId: string;
  to: string;
  name: string;
  actionUrl: string;
  accountCreated: boolean;
  programName: string;
  locale: "pt" | "en";
}) {
  const actionUrl = escapeHtml(input.actionUrl);
  const programName = escapeHtml(input.programName);
  const isEnglish = input.locale === "en";
  return sendEmail({
    to: input.to,
    subject: isEnglish
      ? `${input.programName} is ready in RaptorPro`
      : `Seu ${input.programName} está liberado no RaptorPro`,
    orderId: input.orderId,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#17191d">
        <div style="background:#08090b;color:#fff;padding:24px;border-bottom:4px solid #ed1b2f">
          <p style="margin:0 0 8px;color:#ff5362;font-size:12px;font-weight:700;text-transform:uppercase">RaptorPro Coach</p>
          <h1 style="margin:0;font-size:26px">${isEnglish ? "Program unlocked" : "Programa liberado"}</h1>
        </div>
        <div style="border:1px solid #d8dde6;border-top:0;padding:24px">
          <p>${isEnglish ? "Hi" : "Fala"}, ${escapeHtml(input.name)}.</p>
          <p>${isEnglish ? "Payment confirmed. Your access to" : "Pagamento confirmado. Seu acesso ao"} <strong>${programName}</strong> ${isEnglish ? "is now available in RaptorPro." : "já está liberado no RaptorPro."}</p>
          <p>${input.accountCreated
            ? isEnglish ? "Use the button below to create your password and open your first session." : "Use o botão abaixo para criar sua senha e abrir o primeiro treino."
            : isEnglish ? "Use the button below to sign in securely and open your program." : "Use o botão abaixo para entrar com segurança e abrir seu programa."}</p>
          <p style="margin:24px 0"><a href="${actionUrl}" style="display:inline-block;background:#ed1b2f;color:#fff;padding:14px 20px;text-decoration:none;font-weight:700">${input.accountCreated ? (isEnglish ? "Create password and access" : "Criar senha e acessar") : (isEnglish ? "Open my program" : "Abrir meu programa")}</a></p>
          <p style="color:#68707d;font-size:13px">${isEnglish ? "This personal link expires for security. After your first access, sign in at app.rumoaopro.com.br with the email used for the purchase." : "O link é pessoal e expira por segurança. Depois do primeiro acesso, entre em app.rumoaopro.com.br com o e-mail usado na compra."}</p>
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
  return sendEmail({
    to: input.to,
    subject: `Acesso liberado - ${input.productName}`,
    orderId: input.orderId,
    html: `
      <p>Fala, ${escapeHtml(input.name)}.</p>
      <p>Pagamento confirmado. Seu acesso ao programa <strong>${escapeHtml(input.productName)}</strong> foi liberado.</p>
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
  return sendEmail({
    to: input.to,
    subject: "Seu link de acesso RumoAoPro",
    orderId: input.orderId,
    html: `
      <p>Fala${input.name ? `, ${escapeHtml(input.name)}` : ""}.</p>
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
  return sendEmail({
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
