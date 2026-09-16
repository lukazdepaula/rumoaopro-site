import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  MessageCircle,
  ShieldPlus,
  Users
} from "lucide-react";

type LoadProPromoProps = {
  embedded?: boolean;
  locale: "pt" | "en";
};

const loadProUrl = process.env.NEXT_PUBLIC_LOADPRO_APP_URL || "#loadpro";
const whatsappNumber = "5519992811078";

const copy = {
  pt: {
    eyebrow: "LoadPro App · Software para treinadores",
    title: "Planeje o microciclo. Monitore a carga. Decida com dados.",
    body:
      "Uma plataforma para organizar o trabalho da comissão técnica, acompanhar a resposta dos atletas e transformar coletas diárias em decisões práticas.",
    trial: "7 dias grátis",
    price: "R$ 49,90",
    month: "/mês",
    monthly: "Mensal",
    monthlyTerms: "7 dias grátis. Depois, cobrança mensal automática no cartão nas condições confirmadas no checkout.",
    plan: "Fundadores 30 · Escolha como pagar",
    limits: "Até 2 equipes · 30 atletas por equipe",
    sameFeatures: "Os mesmos recursos e limites no mensal e no anual.",
    annual: "Anual",
    annualPrice: "R$ 499",
    year: "/ano",
    annualOffer: "12 meses pelo preço de 10",
    annualSavings: "Economize R$ 99,80 por ano",
    annualPayment: "Pagamento anual à vista, sem parcelamento.",
    annualTerms: "Cartão: cobrança ao fim do teste ou período mensal já pago, com renovação anual automática. Pix: pagamento agora e renovação manual; os 12 meses são liberados após confirmação do pagamento, preservando os dias restantes. A mensalidade continua até o Pix pago ser confirmado; gerar o código não altera a assinatura.",
    annualCta: "Escolher anual na minha assinatura",
    annualEntry: "Ainda não tem conta? Comece pelos 7 dias grátis do mensal e, depois de entrar, escolha e confirme o anual antes da cobrança. Sem essa confirmação, continuam as condições mensais contratadas.",
    primaryCta: "Testar grátis por 7 dias",
    secondaryCta: "Conhecer o LoadPro",
    whatsappCta: "Dúvidas no WhatsApp",
    whatsappMessage:
      "Olá! Tenho uma dúvida sobre o LoadPro e o Plano Treinadores Fundadores.",
    visualAlt: "Calendário de microciclo e monitoramento de carga do LoadPro",
    features: [
      "Calendário de microciclo",
      "Coletas pré e pós-treino",
      "Prontidão, dor e PSE",
      "Carga em AU",
      "Departamento médico",
      "Relatórios para a comissão"
    ]
  },
  en: {
    eyebrow: "LoadPro App · Software for football coaches",
    title: "Plan the microcycle. Monitor load. Make better decisions.",
    body:
      "A platform to organize the staff workflow, track athlete responses and turn daily monitoring into practical decisions.",
    trial: "7 days free",
    price: "R$49.90",
    month: "/month",
    monthly: "Monthly",
    monthlyTerms: "7 days free. Then automatic monthly card payments under the terms confirmed at checkout.",
    plan: "Founders 30 · Choose how to pay",
    limits: "Up to 2 teams · 30 athletes per team",
    sameFeatures: "The same features and limits with monthly and annual billing.",
    annual: "Annual",
    annualPrice: "R$499",
    year: "/year",
    annualOffer: "12 months for the price of 10",
    annualSavings: "Save R$99.80 per year",
    annualPayment: "Annual payment in full, with no installments. Prices in BRL.",
    annualTerms: "Card: charged at the end of your trial or paid monthly period, with automatic annual renewal. Pix: pay now and renew manually; 12 months are granted after payment confirmation, preserving your remaining days. Monthly billing continues until Pix payment is confirmed; generating a code does not change your subscription.",
    annualCta: "Choose annual in my subscription",
    annualEntry: "New to LoadPro? Start with the monthly plan's 7-day free trial, then sign in to choose and confirm annual billing before your charge. Without that confirmation, your contracted monthly terms continue. Annual offers apply to the corresponding BRL plans. Existing subscriptions in other currencies keep their terms.",
    primaryCta: "Start your 7-day free trial",
    secondaryCta: "Explore LoadPro",
    whatsappCta: "Questions on WhatsApp",
    whatsappMessage:
      "Hi! I have a question about LoadPro and the Founding Coaches Plan.",
    visualAlt: "LoadPro microcycle calendar and training-load monitoring",
    features: [
      "Microcycle calendar",
      "Pre and post-training forms",
      "Readiness, pain and RPE",
      "Training load in AU",
      "Medical department",
      "Staff-ready reports"
    ]
  }
} as const;

const featureIcons = [
  CalendarDays,
  Activity,
  CheckCircle2,
  BarChart3,
  ShieldPlus,
  Users
] as const;

export function LoadProPromo({
  embedded = false,
  locale
}: LoadProPromoProps) {
  const page = copy[locale];
  // Match the server's opt-in: deploying the backend must not advertise an
  // annual checkout before its production configuration is ready.
  const annualAvailable = process.env.LOADPRO_ANNUAL_ENABLED === "true";
  const plans = [
    {code:"loadpro_founders",players:30,monthly:49.9,annual:499,saving:99.8,slug:"loadpro-founders"},
    {code:"loadpro_founders_50",players:50,monthly:69.9,annual:699,saving:139.8,slug:"loadpro-founders-50"}
  ];
  const money = (amount:number) => `${locale === "pt" ? "R$ " : "R$"}${new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-GB",{minimumFractionDigits:Number.isInteger(amount)?0:2,maximumFractionDigits:2}).format(amount)}`;
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    page.whatsappMessage
  )}`;
  const subscriptionHref = loadProUrl.startsWith("#") ? loadProUrl : `${loadProUrl}?view=setup&settings=security&lang=${locale}&subscription=annual`;

  return (
    <section
      className={
        embedded
          ? "scroll-mt-8"
          : "scroll-mt-20 bg-ink py-16 text-white sm:py-20"
      }
      id="loadpro"
    >
      <div
        className={
          embedded
            ? ""
            : "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        }
      >
        <div className="relative isolate overflow-hidden rounded-[28px] border border-red-500/25 bg-[radial-gradient(circle_at_88%_8%,rgba(220,38,38,.28),transparent_34%),linear-gradient(145deg,#17090b,#08090b_64%)] shadow-[0_28px_80px_rgba(0,0,0,.32)]">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,.75)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.75)_1px,transparent_1px)] [background-size:36px_36px]"
          />

          <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:p-10">
            <div>
              <Image
                alt="LoadPro App"
                className="h-auto w-[210px] object-contain"
                height={72}
                src="/assets/loadpro/loadpro-logo-white-red-transparent.png"
                width={340}
              />

              <p className="mt-6 text-[10px] font-black uppercase tracking-[0.18em] text-red-300">
                {page.eyebrow}
              </p>
              <h2 className="mt-3 font-display text-3xl uppercase leading-[1.02] text-white sm:text-4xl lg:text-5xl">
                {page.title}
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
                {page.body}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-2">
                {page.features.map((feature, index) => {
                  const Icon = featureIcons[index];

                  return (
                    <div
                      className="flex min-h-14 items-center gap-2 rounded-xl border border-white/9 bg-white/[0.045] px-3 py-2 text-[11px] font-bold leading-4 text-white/72 sm:text-xs"
                      key={feature}
                    >
                      <Icon
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-red-400"
                      />
                      <span>{feature}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6">
                <a
                  className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/14 bg-white/[0.06] px-5 py-3 text-center text-sm font-black text-white transition hover:bg-white hover:text-black"
                  href={loadProUrl}
                >
                  {page.secondaryCta}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </a>
              </div>

              <a
                className="focus-ring mt-3 inline-flex min-h-11 items-center gap-2 text-xs font-bold text-white/58 transition hover:text-emerald-300"
                href={whatsappHref}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircle
                  aria-hidden="true"
                  className="h-4 w-4 text-emerald-400"
                />
                {page.whatsappCta}
              </a>
            </div>

            <div className="relative mx-auto w-full max-w-[720px]">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                <Image
                  alt=""
                  className="object-contain"
                  fill
                  sizes="(max-width: 1023px) 100vw, 54vw"
                  src="/assets/loadpro/hero-loadpro-laptop.png"
                />
                <div className="absolute left-[22.85%] top-[9.7%] h-[62.4%] w-[59.2%] overflow-hidden bg-[#17181d]">
                  <Image
                    alt={page.visualAlt}
                    className="object-cover object-left-top"
                    fill
                    sizes="(max-width: 1023px) 59vw, 32vw"
                    src="/assets/loadpro/product-calendar-microcycle-v2.png"
                  />
                </div>
              </div>

              <div className="relative -mt-8 ml-auto w-[72%] overflow-hidden rounded-xl border border-white/12 bg-[#15171b] p-1 shadow-[0_22px_50px_rgba(0,0,0,.48)] sm:-mt-14">
                <Image
                  alt={page.visualAlt}
                  className="h-auto w-full rounded-lg object-cover object-top"
                  height={500}
                  src="/assets/loadpro/product-dashboard-monitoring-v2.png"
                  width={900}
                />
              </div>
            </div>
            {plans.map(plan => <div key={plan.code} className="border-t border-white/10 pt-8 lg:col-span-2" data-loadpro-pricing={plan.code}>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h3 className="text-sm font-black uppercase tracking-[0.12em] text-red-300">{locale === "pt" ? `Fundadores ${plan.players}${annualAvailable ? ' · Escolha como pagar' : ''}` : `Founders ${plan.players}${annualAvailable ? ' · Choose how to pay' : ''}`}</h3>
                <p className="text-sm font-bold text-white/80">{locale === "pt" ? `Até 2 equipes · ${plan.players} atletas por equipe` : `Up to 2 teams · ${plan.players} athletes per team`}</p>
              </div>
              {annualAvailable && <p className="mt-2 text-sm text-white/65">{page.sameFeatures}</p>}
              <div className={`mt-5 grid gap-4${annualAvailable ? ' md:grid-cols-2' : ''}`}>
                <div className="flex flex-col rounded-2xl border border-white/15 bg-white/[0.04] p-5 sm:p-6" data-loadpro-monthly>
                  <h4 className="text-lg font-black text-white">{page.monthly}</h4>
                  <p className="mt-4 text-4xl font-black text-white">{money(plan.monthly)}<span className="ml-1 text-base font-bold text-white/65">{page.month}</span></p>
                  <p className="mt-3 font-bold text-white">{page.trial}</p>
                  <p className="mt-3 text-sm leading-6 text-white/70">{page.monthlyTerms}</p>
                  <Link className="focus-ring mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-center text-sm font-black text-white transition hover:bg-white hover:text-black" href={`${locale === "en" ? "/en" : ""}/checkout/${plan.slug}`}>
                    {page.primaryCta}<ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                  </Link>
                </div>
                {annualAvailable && <div className="flex flex-col rounded-2xl border border-red-400/40 bg-red-500/10 p-5 sm:p-6" data-loadpro-annual>
                  <p className="text-sm font-black text-red-300">{page.annualOffer}</p>
                  <h4 className="mt-3 text-lg font-black text-white">{page.annual}</h4>
                  <p className="mt-3 text-4xl font-black text-white">{money(plan.annual)}<span className="ml-1 text-base font-bold text-white/65">{page.year}</span></p>
                  <p className="mt-3 font-bold text-white">{locale === "pt" ? `Economize ${money(plan.saving)} por ano` : `Save ${money(plan.saving)} per year`}</p>
                  <p className="mt-2 text-sm font-bold text-white/80">{page.annualPayment}</p>
                  <p className="mt-3 text-sm leading-6 text-white/70">{page.annualTerms}</p>
                  <a className="focus-ring mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-center text-sm font-black text-white transition hover:bg-red-500" href={subscriptionHref}>
                    {page.annualCta}<ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                  </a>
                </div>}
              </div>
              {annualAvailable && <p className="mt-4 max-w-4xl text-sm leading-6 text-white/65">{page.annualEntry}</p>}
            </div>)}
          </div>
        </div>
      </div>
    </section>
  );
}
