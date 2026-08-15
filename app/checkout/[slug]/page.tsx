import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import { CheckoutForm } from "@/components/checkout-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { assets, nav } from "@/lib/content";
import { getProductBySlug } from "@/lib/checkout/products";
import { getLocalizedProductCopy } from "@/lib/checkout/localization";

export const dynamic = "force-dynamic";

type CheckoutPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ locale?: string }>;
};

export async function generateMetadata({
  params
}: CheckoutPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  return {
    title: product ? `Checkout - ${product.name}` : "Checkout",
    description: product?.description || "Checkout seguro RumoAoPro."
  };
}

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const { slug } = await params;
  const { locale: requestedLocale } = await searchParams;
  const locale = requestedLocale === "en" ? "en" : "pt";
  const isEnglish = locale === "en";

  if (slug === "projeto-36-2022") {
    permanentRedirect("/checkout/project-36");
  }

  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const productCopy = getLocalizedProductCopy(product, locale);
  const isLoadProSubscription = product.id === "loadpro_founders";
  const isCoachingSubscription = product.id === "online_coaching_monthly";
  const loadProWhatsapp = (process.env.NEXT_PUBLIC_LOADPRO_WHATSAPP || "5519992811078").replace(/\D/g, "");
  const subscriptionBenefits = isCoachingSubscription
    ? [
        "Assessoria individual por ciclos de 30 dias",
        "Planejamento conectado à rotina e ao calendário do atleta",
        "CPF/CNPJ, endereço e WhatsApp registrados para emissão fiscal",
        "Cobrança recorrente segura pela Stripe",
        "Assinatura e pagamentos acompanhados no admin RumoAoPro"
      ]
    : isEnglish
      ? [
          "Founding plan billed monthly",
          "Up to 2 teams and 30 athletes per team",
          "Founding price locked while your subscription remains active",
          "Secure invitation sent after confirmation",
          "Cancel whenever you need"
        ]
      : [
          "Plano fundador de R$ 49,90 por mês",
          "Até 2 equipes e 30 atletas por equipe",
          "Preço protegido enquanto a assinatura permanecer ativa",
          "Convite seguro enviado após a confirmação",
          "Pedido e assinatura acompanhados no admin RumoAoPro"
        ];

  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader
        navItems={isEnglish ? nav.en : nav.pt}
        ctaHref={isEnglish ? "/en/programs" : "/programas"}
        ctaLabel={isEnglish ? "Programs" : "Programas"}
      />

      <section className="relative isolate overflow-hidden bg-ink py-12 text-white">
        <Image
          alt="Lukaz de Paula treinando velocidade no campo"
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-45"
          fill
          priority
          sizes="100vw"
          src={assets.sprintFront}
        />
        <div className="absolute inset-0 -z-10 bg-ink/80" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            className="focus-ring inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold text-white"
            href={productCopy.salesPagePath}
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            {isEnglish ? `Back to ${productCopy.name}` : `Voltar para ${productCopy.name}`}
          </Link>
          <div className="mt-8 max-w-3xl">
            <p className="text-sm font-bold uppercase text-gold">
              {isEnglish ? "Secure payment" : "Pagamento seguro"}
            </p>
            <h1 className="mt-3 font-display text-4xl uppercase leading-tight sm:text-5xl">
              {isEnglish ? "Complete your order" : "Checkout RumoAoPro"}
            </h1>
            <p className="mt-4 text-base leading-8 text-white/72">
              {product.type === "subscription"
                ? isCoachingSubscription
                  ? "Preencha seus dados fiscais e confirme a assinatura da assessoria. A cobrança de R$ 399 é renovada automaticamente a cada 30 dias."
                  : isEnglish
                  ? "Enter your details and confirm the monthly subscription. Your LoadPro access is provisioned after payment approval."
                  : "Informe seus dados, escolha o processador do cartão e confirme sua assinatura mensal. Seu acesso ao LoadPro será provisionado após a aprovação."
                : isEnglish
                ? "Pay securely in USD. Your program access is activated automatically after payment confirmation."
                : "Escolha a forma de pagamento ideal para o seu país. Seu acesso é liberado automaticamente assim que o pagamento for confirmado."}
            </p>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_0.55fr] lg:px-8">
          <CheckoutForm locale={locale} product={product} />
          <aside className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-ink text-white">
              <LockKeyhole aria-hidden="true" className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-ink">
              {isCoachingSubscription
                ? "Assinatura e dados protegidos"
                : isEnglish
                  ? "Protected payment and access"
                  : "Compra e acesso protegidos"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-graphite/72">
              {isCoachingSubscription
                ? "O pagamento é processado pela Stripe. Após a confirmação, sua inscrição fica registrada no admin e a equipe recebe seus dados para iniciar o atendimento."
                : isEnglish
                ? `Payment is securely processed by Stripe. ${productCopy.name} appears in your account after confirmation.`
                : "Seus dados são enviados diretamente aos provedores de pagamento. O programa aparece na sua conta após a confirmação da compra."}
            </p>
            <div className="mt-6 grid gap-3">
              {(product.type === "subscription"
                ? subscriptionBenefits
                : isEnglish
                ? [
                    "Secure international card payment via Stripe",
                    "Price charged in US dollars",
                    "Automatic access after confirmation",
                    "Training materials protected in your account",
                    "Support directly from RumoAoPro"
                  ]
                : [
                    "CPF/CNPJ exigido apenas para Brasil",
                    "Cartão e parcelamento via Mercado Pago no Brasil",
                    "Pix com QR Code e aprovação rápida",
                    "Stripe para cartão no Brasil e no exterior",
                    "Pedido registrado no painel interno"
                  ]).map((item) => (
                <p className="flex gap-3 text-sm text-graphite/75" key={item}>
                  <ShieldCheck
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-turf"
                  />
                  <span>{item}</span>
                </p>
              ))}
            </div>
            {isLoadProSubscription ? (
              <a
                className="focus-ring mt-6 inline-flex min-h-11 items-center justify-center rounded-md border border-ink/15 px-4 text-sm font-bold text-ink"
                href={`https://wa.me/${loadProWhatsapp}?text=${encodeURIComponent(isEnglish ? "Hi! I have a question about the LoadPro Founding Coaches Plan." : "Olá! Tenho uma dúvida sobre o Plano Treinadores Fundadores do LoadPro.")}`}
                rel="noreferrer"
                target="_blank"
              >
                {isEnglish ? "Talk to LoadPro support" : "Falar com o suporte do LoadPro"}
              </a>
            ) : null}
          </aside>
        </div>
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}
