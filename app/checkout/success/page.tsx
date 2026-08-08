import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, CircleAlert, MailCheck } from "lucide-react";
import { MockPaymentActions } from "@/components/mock-payment-actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getOrderById } from "@/lib/checkout/db";
import { formatMoney, getProductById } from "@/lib/checkout/products";
import {
  getRaptorProProgramUrl,
  isRaptorProProgramOrder
} from "@/lib/checkout/raptorpro";
import { nav } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pagamento em processamento",
  description:
    "Recebemos o retorno do checkout. A entrega acontece somente após confirmação do webhook."
};

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    order_id?: string;
    mock?: string;
    locale?: string;
  }>;
};

function maskEmail(email?: string | null) {
  if (!email) return "seu e-mail";
  const [localPart, domain] = email.split("@");
  if (!domain) return email;
  const visible = localPart.slice(0, Math.min(3, localPart.length));
  return `${visible}${"*".repeat(Math.max(3, localPart.length - visible.length))}@${domain}`;
}

export default async function CheckoutSuccessPage({
  searchParams
}: CheckoutSuccessPageProps) {
  const params = await searchParams;
  const order = params.order_id ? await getOrderById(params.order_id) : null;
  const isEnglish = params.locale === "en" || order?.metadata.checkout_locale === "en";
  const product = order ? getProductById(order.product_id) : null;
  const showMockActions = order?.gateway === "mock" && order.status === "pending";
  const trialDays = Number(order?.metadata.trial_days || 0);
  const isLoadProTrial =
    order?.gateway === "stripe" &&
    order?.product_id === "loadpro_founders" &&
    trialDays > 0;
  const isRaptorProProgram = order ? isRaptorProProgramOrder(order) : false;
  const raptorProvisioningStatus =
    typeof order?.metadata.raptorpro_provisioning_status === "string"
      ? order.metadata.raptorpro_provisioning_status
      : null;
  const raptorEmailStatus =
    typeof order?.metadata.raptorpro_welcome_email_status === "string"
      ? order.metadata.raptorpro_welcome_email_status
      : order?.gateway !== "mock" && order?.metadata.raptorpro_welcome_email_sent === true
        ? "sent"
        : "pending";
  const raptorAccessReady =
    isRaptorProProgram &&
    order?.status === "paid" &&
    raptorProvisioningStatus === "synced";
  const raptorEmailSent = raptorEmailStatus === "sent";
  const raptorAccountCreated = order?.metadata.raptorpro_account_created === true;
  const customerEmail = maskEmail(order?.customer_email);
  const subscriptionStatus =
    typeof order?.metadata.subscription_status === "string"
      ? order.metadata.subscription_status
      : null;
  const trialIsReady =
    isLoadProTrial &&
    (subscriptionStatus === "trialing" || order?.status === "paid");
  const statusLabel = isLoadProTrial
    ? trialIsReady
      ? isEnglish ? "Trial active" : "Teste ativo"
      : isEnglish ? "Activating trial" : "Ativando teste"
    : order?.status === "paid"
      ? isEnglish ? "Paid" : "Pago"
      : order?.status === "failed"
        ? isEnglish ? "Failed" : "Falhou"
        : isEnglish ? "Processing" : "Em processamento";
  const accessHref = isLoadProTrial
    ? process.env.LOADPRO_APP_URL || "https://loadpro.rumoaopro.com.br"
    : isRaptorProProgram
      ? getRaptorProProgramUrl()
    : order?.status === "paid" && product
      ? `/my-programs/${product.slug}`
      : "/my-programs";
  const title = isLoadProTrial
    ? trialIsReady
      ? isEnglish ? "Free trial activated" : "Teste gratuito ativado"
      : isEnglish ? "Activating your free trial" : "Ativando seu teste gratuito"
    : order?.status === "paid" && isRaptorProProgram
    ? raptorAccessReady && raptorEmailSent
      ? isEnglish
        ? "Payment approved. Check your email."
        : "Pagamento aprovado. Confira seu e-mail."
      : isEnglish
        ? "Payment approved. We are finishing your access."
        : "Pagamento aprovado. Estamos finalizando seu acesso."
    : order?.status === "paid"
    ? isEnglish ? "Payment confirmed" : "Pagamento confirmado"
    : isEnglish ? "Payment processing" : "Pagamento em confirmação";
  const description = isLoadProTrial
    ? trialIsReady
      ? isEnglish
        ? `We sent ${order?.customer_email || "your email"} a RumoAoPro message. Open it and click Create my password to access LoadPro.`
        : `Enviamos uma mensagem da RumoAoPro para ${order?.customer_email || "seu e-mail"}. Abra o e-mail e clique em Criar minha senha para acessar o LoadPro.`
      : isEnglish
        ? "Your card was registered and no charge was made today. We are finishing the activation and will email your secure password-creation link."
        : "Seu cartão foi cadastrado e nenhuma cobrança foi feita hoje. Estamos concluindo a ativação e enviaremos por e-mail o link seguro para criar sua senha."
    : order?.status === "paid" && isRaptorProProgram
      ? raptorAccessReady && raptorEmailSent
        ? isEnglish
          ? `We sent the secure RaptorPro access link to ${customerEmail}. Use that link before opening the app directly.`
          : `Enviamos o link seguro do RaptorPro para ${customerEmail}. Use esse link antes de abrir o app diretamente.`
        : isEnglish
          ? "Your payment is confirmed. Keep this page saved while we finish creating and emailing your access."
          : "Seu pagamento está confirmado. Mantenha esta página salva enquanto terminamos de criar e enviar seu acesso."
    : order?.status === "paid"
    ? isEnglish
      ? "Payment approved. Your program access is ready and a confirmation email will be sent automatically."
      : "Pagamento aprovado. Seu acesso foi liberado e o e-mail de confirmação será enviado automaticamente."
    : showMockActions
      ? isEnglish
        ? "We received the checkout response. In mock mode, use the buttons below to simulate confirmation."
        : "Recebemos o retorno do checkout. No modo mock, use os botões abaixo para simular a confirmação."
      : isEnglish
        ? "We received the checkout response. Access is released only after the payment provider confirms it."
        : "Recebemos o retorno do checkout. Por segurança, o produto só é liberado quando o pagamento for confirmado pelo gateway.";

  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader navItems={isEnglish ? nav.en : nav.pt} ctaHref={isEnglish ? "/en/programs" : "/programas"} ctaLabel={isEnglish ? "Programs" : "Programas"} />
      <section className="bg-ink py-20 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <CheckCircle2
            aria-hidden="true"
            className="mx-auto h-14 w-14 text-turf"
          />
          <h1 className="mt-6 font-display text-4xl uppercase leading-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-base leading-8 text-white/70">
            {description}
          </p>
          {order ? (
            <div className="mt-8 rounded-lg border border-white/15 bg-white/10 p-4 text-left">
              <p className="text-xs font-bold uppercase text-white/55">{isEnglish ? "Order" : "Pedido"}</p>
              <p className="mt-1 break-all text-sm font-semibold text-white">
                {order.id}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-bold uppercase text-white/45">{isEnglish ? "Product" : "Produto"}</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {order.product_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-white/45">Status</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {statusLabel}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-white/45">{isEnglish ? "Amount" : "Valor"}</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {isLoadProTrial
                      ? formatMoney(0, order.currency)
                      : formatMoney(order.amount, order.currency)}
                  </p>
                </div>
              </div>
              {isLoadProTrial ? (
                <p className="mt-4 border-t border-white/10 pt-4 text-sm leading-6 text-white/70">
                  {isEnglish
                    ? `No charge today. After ${trialDays} days: ${formatMoney(order.amount, order.currency)} per month.`
                    : `Nenhuma cobrança hoje. Depois de ${trialDays} dias: ${formatMoney(order.amount, order.currency)} por mês.`}
                </p>
              ) : null}
            </div>
          ) : null}
          {isLoadProTrial ? (
            <div className="mt-6 rounded-lg border border-white/15 bg-white/[0.06] p-5 text-left">
              <p className="text-xs font-bold uppercase tracking-wide text-signal">
                {isEnglish ? "Next step" : "Próximo passo"}
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">
                {isEnglish ? "Create your LoadPro password" : "Crie sua senha do LoadPro"}
              </h2>
              <ol className="mt-3 space-y-2 text-sm leading-6 text-white/70">
                <li>1. {isEnglish ? "Open the RumoAoPro email we sent you." : "Abra o e-mail enviado pela RumoAoPro."}</li>
                <li>2. {isEnglish ? "Click Create my password and choose a secure password." : "Clique em Criar minha senha e defina uma senha segura."}</li>
                <li>3. {isEnglish ? "Sign in and set up your first club." : "Entre no app e configure seu primeiro clube."}</li>
              </ol>
            </div>
          ) : null}
          {order?.status === "paid" && isRaptorProProgram ? (
            <div className="mt-6 rounded-lg border border-white/15 bg-white/[0.06] p-5 text-left">
              <div className="flex items-start gap-3">
                {raptorAccessReady && raptorEmailSent ? (
                  <MailCheck aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-turf" />
                ) : (
                  <CircleAlert aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-signal" />
                )}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-signal">
                    {isEnglish ? "Your next step" : "Seu próximo passo"}
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-white">
                    {raptorEmailSent
                      ? isEnglish
                        ? "Open the RaptorPro email"
                        : "Abra o e-mail do RaptorPro"
                      : isEnglish
                        ? "Your access email is still being prepared"
                        : "Seu e-mail de acesso ainda está sendo preparado"}
                  </h2>
                </div>
              </div>
              <ol className="mt-4 space-y-2 text-sm leading-6 text-white/70">
                <li>1. {isEnglish ? `Check the inbox and spam folder for ${customerEmail}.` : `Confira a caixa de entrada e o spam de ${customerEmail}.`}</li>
                <li>2. {raptorAccountCreated
                  ? isEnglish ? "Click Create password and access." : "Clique em Criar senha e acessar."
                  : isEnglish ? "Open the secure sign-in link." : "Abra o link seguro de entrada."}</li>
                <li>3. {isEnglish ? "After signing in, Offseason 30 Days opens automatically." : "Depois de entrar, o Offseason 30 Days abrirá automaticamente."}</li>
              </ol>
              {!raptorEmailSent ? (
                <p className="mt-4 rounded-md border border-signal/30 bg-signal/10 p-3 text-sm leading-6 text-white/75">
                  {isEnglish
                    ? "Do not create another order. Your payment is saved. If the email does not arrive, contact support with the order number shown above."
                    : "Não faça outra compra. Seu pagamento está salvo. Se o e-mail não chegar, fale com o suporte informando o número do pedido acima."}
                </p>
              ) : null}
            </div>
          ) : null}
          {showMockActions ? <MockPaymentActions orderId={order.id} /> : null}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md bg-white px-5 text-sm font-bold uppercase text-ink"
              href={accessHref}
            >
              {isLoadProTrial
                ? isEnglish ? "I created my password — open LoadPro" : "Já criei minha senha — abrir LoadPro"
                : isRaptorProProgram
                  ? isEnglish ? "I already signed in — open RaptorPro" : "Já fiz meu acesso — abrir RaptorPro"
                : order?.status === "paid"
                  ? isEnglish ? "Access program" : "Acessar programa"
                : isEnglish ? "Go to my account" : "Ir para minha conta"}
            </Link>
            {order?.status === "paid" && isRaptorProProgram && !raptorEmailSent ? (
              <Link
                className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-signal/50 px-5 text-sm font-bold uppercase text-white"
                href={`https://wa.me/5519992811078?text=${encodeURIComponent(`Olá! Preciso de ajuda com o acesso ao Offseason 30 Days. Pedido: ${order.id}`)}`}
              >
                {isEnglish ? "Contact support" : "Falar com o suporte"}
              </Link>
            ) : null}
            <Link
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-white/15 px-5 text-sm font-bold uppercase text-white"
              href={isEnglish ? "/en/programs" : "/programas"}
            >
              {isEnglish ? "Back to programs" : "Voltar aos programas"}
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
