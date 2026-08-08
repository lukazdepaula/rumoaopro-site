import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  PlayCircle,
  Smartphone,
} from "lucide-react";
import { ProgramPurchaseSummary } from "@/components/program-purchase-summary";
import { ReviewBadge } from "@/components/reviews";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { assets, nav, shopifyProducts } from "@/lib/content";
import { getReviewGroupForProgramHref } from "@/lib/reviews";

type Offseason30SalesPageProps = {
  locale: "pt" | "en";
};

const copy = {
  pt: {
    nav: nav.pt,
    ctaLabel: "Comprar",
    languageHref: "/en/programs/offseason-30-days",
    languageLabel: "🇧🇷 PT → EN",
    eyebrow: "Offseason 30 Days",
    h1: "30 dias para voltar mais rápido, forte e preparado.",
    lead:
      "Um plano completo de campo e academia, organizado no app para você abrir, treinar e registrar sua evolução.",
    primaryCta: "Começar agora",
    secondaryCta: "Ver como funciona",
    storeNote: "Pagamento seguro · acesso digital após a confirmação",
    chips: ["30 dias", "4 semanas", "Campo + academia", "R$ 199,90"],
    stats: [
      ["30", "dias organizados"],
      ["4", "semanas progressivas"],
      ["100%", "dentro do app"]
    ],
    journeyTitle: "Seu programa no bolso",
    journeyH2: "Abra o app. Veja o treino. Execute.",
    journeyLead:
      "Nada de procurar páginas em PDF. O caminho inteiro acontece no app, do calendário ao resultado final.",
    journeySteps: [
      {
        step: "01",
        title: "Veja sua semana",
        body: "Abra o calendário e saiba exatamente o que fazer em cada dia.",
        label: "Calendário completo"
      },
      {
        step: "02",
        title: "Siga cada sessão",
        body: "Acesse blocos, séries, repetições, notas e vídeos durante o treino.",
        label: "Treino guiado"
      },
      {
        step: "03",
        title: "Registre o resultado",
        body: "Marque exercícios, informe esforço e duração e acompanhe sua carga.",
        label: "Evolução registrada"
      }
    ],
    structureTitle: "Progressão de 4 semanas",
    structureH2: "Cada semana prepara a próxima.",
    weeks: [
      ["Semana 1", "Build the Base", "Ritmo, técnica e base aeróbia."],
      ["Semana 2", "Build Capacity", "Mais volume e densidade útil."],
      ["Semana 3", "Explode & Power Up", "Potência e repeat sprint."],
      ["Semana 4", "Club Ready", "Intensidade alta, fadiga controlada."]
    ],
    insideTitle: "O que você recebe",
    insideH2: "Tudo necessário para executar sem improvisar.",
    inside: [
      "Calendário completo por 30 dias",
      "Treinos de velocidade e condicionamento",
      "Sessões de força e potência",
      "Séries, repetições e descansos claros",
      "Vídeos demonstrativos dentro do treino",
      "Readiness, RPE, duração e carga"
    ],
    fitTitle: "Para quem é",
    fitH2: "Para jogadores que têm pouco tempo e um objetivo claro.",
    fit: [
      "Você tem até 4 semanas para se preparar",
      "Consegue treinar no campo e na academia",
      "Já treina e quer uma estrutura profissional",
      "Quer chegar melhor para clube, peneira ou pré-temporada"
    ],
    disclaimer:
      "Não indicado para retorno de lesão sem liberação ou para quem precisa de adaptações individuais semanais.",
    faqTitle: "Antes de comprar",
    faqs: [
      {
        question: "Preciso de academia?",
        answer: "Sim. O programa combina sessões de campo e academia."
      },
      {
        question: "Como recebo o acesso?",
        answer:
          "Após a confirmação do pagamento, você recebe por e-mail o link pessoal para criar sua senha e abrir o programa no app."
      },
      {
        question: "Posso fazer no celular?",
        answer:
          "Sim. A experiência foi pensada principalmente para o celular e também funciona no computador."
      }
    ],
    finalTitle: "Pare de improvisar sua offseason.",
    finalBody: "Comece os próximos 30 dias com um plano claro e pronto para executar.",
    finalCta: "Comprar por R$ 199,90",
    coachingCta: "Quero algo individual"
  },
  en: {
    nav: nav.en,
    ctaLabel: "Buy",
    languageHref: "/programas/offseason-30-days",
    languageLabel: "🇺🇸 EN → PT",
    eyebrow: "Offseason 30 Days",
    h1: "30 days to return faster, stronger and better prepared.",
    lead:
      "A complete field and gym plan, organized inside the app so you can open, train and track your progress.",
    primaryCta: "Start now",
    secondaryCta: "See how it works",
    storeNote: "Secure payment · digital access after confirmation",
    chips: ["30 days", "4 weeks", "Field + gym", "R$ 199.90"],
    stats: [
      ["30", "organized days"],
      ["4", "progressive weeks"],
      ["100%", "inside the app"]
    ],
    journeyTitle: "Your program in your pocket",
    journeyH2: "Open the app. See the session. Execute.",
    journeyLead:
      "No PDF pages to search through. The entire journey happens inside the app, from calendar to final result.",
    journeySteps: [
      {
        step: "01",
        title: "See your week",
        body: "Open the calendar and know exactly what to do each day.",
        label: "Complete calendar"
      },
      {
        step: "02",
        title: "Follow each session",
        body: "Access blocks, sets, reps, notes and videos while you train.",
        label: "Guided workout"
      },
      {
        step: "03",
        title: "Log your result",
        body: "Check exercises, enter effort and duration and monitor training load.",
        label: "Progress recorded"
      }
    ],
    structureTitle: "4-week progression",
    structureH2: "Every week prepares the next one.",
    weeks: [
      ["Week 1", "Build the Base", "Rhythm, technique and aerobic base."],
      ["Week 2", "Build Capacity", "More useful volume and density."],
      ["Week 3", "Explode & Power Up", "Power and repeat sprint work."],
      ["Week 4", "Club Ready", "High intensity, controlled fatigue."]
    ],
    insideTitle: "What you get",
    insideH2: "Everything you need to execute without improvising.",
    inside: [
      "Complete 30-day calendar",
      "Speed and conditioning sessions",
      "Strength and power sessions",
      "Clear sets, reps and rest periods",
      "Video demonstrations inside the workout",
      "Readiness, RPE, duration and training load"
    ],
    fitTitle: "Who it is for",
    fitH2: "For players with limited time and a clear goal.",
    fit: [
      "You have up to 4 weeks to prepare",
      "You can train on the field and in the gym",
      "You already train and want a professional structure",
      "You want to arrive better for a club, trial or pre-season"
    ],
    disclaimer:
      "Not suitable for an injury return without clearance or for players who need individual weekly adjustments.",
    faqTitle: "Before you buy",
    faqs: [
      {
        question: "Do I need gym access?",
        answer: "Yes. The program combines field and gym sessions."
      },
      {
        question: "How do I get access?",
        answer:
          "After payment confirmation, you receive a personal email link to create your password and open the program in the app."
      },
      {
        question: "Can I use it on mobile?",
        answer:
          "Yes. The experience was designed primarily for mobile and also works on desktop."
      }
    ],
    finalTitle: "Stop improvising your offseason.",
    finalBody: "Start the next 30 days with a clear plan that is ready to execute.",
    finalCta: "Buy for R$ 199.90",
    coachingCta: "I need individual coaching"
  }
};

const appScreens = {
  calendar: "/assets/programs/offseason-30/raptor-athlete-calendar-mobile.png",
  readiness: "/assets/programs/offseason-30/raptor-athlete-readiness-mobile.png",
  workout: "/assets/programs/offseason-30/raptor-athlete-workout-mobile.png",
  video: "/assets/programs/offseason-30/raptor-athlete-video-mobile.png"
};

function PhoneMockup({
  src,
  alt,
  className = "",
  priority = false
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[2.35rem] border-[7px] border-[#111216] bg-white shadow-[0_34px_90px_rgba(0,0,0,0.58)] ring-1 ring-white/15 ${className}`}
    >
      <span className="absolute left-1/2 top-2 z-20 h-4 w-[31%] -translate-x-1/2 rounded-full bg-[#08090b] shadow-sm" />
      <div className="relative aspect-[390/844] w-full overflow-hidden bg-white">
        <Image
          alt={alt}
          className="h-full w-full object-cover object-top"
          fill
          priority={priority}
          sizes="(min-width: 1024px) 260px, 44vw"
          src={src}
        />
      </div>
    </div>
  );
}

export function Offseason30SalesPage({ locale }: Offseason30SalesPageProps) {
  const page = copy[locale];
  const checkoutHref =
    locale === "en" ? "/en/checkout/offseason-30-days" : shopifyProducts.offseason30;
  const coachingHref =
    locale === "pt" ? "/assessoria#aplicacao" : "/en/coaching#application";
  const programHref =
    locale === "pt"
      ? "/programas/offseason-30-days"
      : "/en/programs/offseason-30-days";
  const reviewGroupKey = getReviewGroupForProgramHref(programHref);

  return (
    <main className="min-h-screen bg-[#050608]">
      <SiteHeader navItems={page.nav} ctaHref={checkoutHref} ctaLabel={page.ctaLabel} />

      <section className="relative isolate overflow-hidden bg-[#050608] text-white">
        <Image
          alt="Football player sprinting"
          className="absolute inset-0 -z-30 h-full w-full object-cover object-[62%_34%] opacity-25"
          fill
          priority
          sizes="100vw"
          src={assets.sprintFront}
        />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,#050608_0%,rgba(5,6,8,0.97)_48%,rgba(5,6,8,0.68)_100%)]" />
        <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:linear-gradient(rgba(18,110,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(18,110,255,0.2)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="mx-auto grid min-h-[calc(82svh-var(--header-height))] max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8">
          <div className="relative z-10">
            <div className="flex flex-wrap gap-3">
              <p className="inline-flex rounded-md border border-[#126eff]/70 bg-[#126eff]/20 px-3 py-2 text-sm font-bold uppercase text-white">
                {page.eyebrow}
              </p>
              <Link
                className="focus-ring inline-flex rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold uppercase text-white transition hover:bg-white hover:text-ink"
                href={page.languageHref}
              >
                {page.languageLabel}
              </Link>
            </div>
            <h1 className="mt-7 max-w-4xl font-display text-4xl uppercase leading-[0.98] text-white sm:text-5xl lg:text-6xl">
              {page.h1}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/74 sm:text-lg">
              {page.lead}
            </p>
            {reviewGroupKey ? (
              <ReviewBadge className="mt-6" groupKey={reviewGroupKey} locale={locale} tone="dark" />
            ) : null}
            <ProgramPurchaseSummary locale={locale} />
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#126eff] px-5 py-3 text-sm font-bold text-white shadow-[0_16px_48px_rgba(18,110,255,0.34)] transition hover:bg-[#0c55cc]"
                href={checkoutHref}
              >
                {page.primaryCta}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>
              <Link
                className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                href="#como-funciona"
              >
                {page.secondaryCta}
              </Link>
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-white/45">
              {page.storeNote}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {page.chips.map((chip) => (
                <span
                  className="rounded-md border border-white/10 bg-black/36 px-3 py-2 text-xs font-bold uppercase text-white/70 backdrop-blur"
                  key={chip}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[610px] lg:-translate-y-12">
            <div className="absolute left-1/2 top-[42%] -z-10 h-[72%] w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(18,110,255,0.24),rgba(220,38,38,0.12)_44%,transparent_72%)] blur-3xl" />
            <div className="relative mx-auto aspect-[4/5] w-[82%] max-w-[430px] overflow-hidden rounded-xl border border-white/16 bg-black shadow-[0_34px_110px_rgba(0,0,0,0.72)]">
              <Image
                alt="Offseason 30 Days"
                className="h-full w-full object-cover object-top"
                fill
                priority
                sizes="(min-width: 1024px) 430px, 82vw"
                src={assets.offseason30Cover}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {page.stats.map(([value, label]) => (
                <div className="rounded-lg border border-white/10 bg-black/48 p-4 text-center" key={label}>
                  <p className="font-display text-2xl uppercase text-[#2f7dff]">{value}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase leading-4 text-white/50">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#07080c] py-20 text-white" id="como-funciona">
        <div className="pointer-events-none absolute -left-24 top-8 h-96 w-96 rounded-full bg-[#ef233c]/16 blur-[110px]" />
        <div className="pointer-events-none absolute -right-20 top-16 h-[30rem] w-[30rem] rounded-full bg-[#126eff]/22 blur-[130px]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:54px_54px]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-[#ff5265]">
              <Smartphone aria-hidden="true" className="mr-2 inline h-4 w-4" />
              {page.journeyTitle}
            </p>
            <h2 className="mt-3 max-w-xl font-display text-4xl uppercase leading-[0.95] text-white sm:text-5xl">
              {page.journeyH2}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/64">{page.journeyLead}</p>

            <div className="mt-8 grid gap-3">
              {page.journeySteps.map((item) => (
                <article
                  className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur transition hover:border-[#ef233c]/45 hover:bg-white/[0.08]"
                  key={item.step}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[linear-gradient(135deg,#ef233c,#a80d28)] font-display text-lg text-white shadow-[0_12px_30px_rgba(239,35,60,0.28)]">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="text-base font-black text-white">{item.title}</h3>
                    <p className="mt-1 text-sm leading-5 text-white/55">{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="relative mx-auto h-[510px] w-full max-w-[720px] sm:h-[630px] lg:h-[690px]">
            <div className="absolute left-1/2 top-1/2 h-[58%] w-[68%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(18,110,255,0.34),rgba(239,35,60,0.16)_42%,transparent_70%)] blur-2xl" />

            <PhoneMockup
              alt="Calendário do atleta no RaptorPro"
              className="absolute left-[1%] top-[12%] z-10 w-[42%] -rotate-6 opacity-90 sm:left-[3%] sm:w-[39%]"
              priority
              src={appScreens.calendar}
            />
            <PhoneMockup
              alt="Readiness antes do treino no RaptorPro"
              className="absolute left-[29%] top-[4%] z-30 w-[42%] rotate-[1.5deg] sm:left-[31%] sm:w-[39%]"
              priority
              src={appScreens.readiness}
            />
            <PhoneMockup
              alt="Vídeo demonstrativo dentro do RaptorPro"
              className="absolute right-[-1%] top-[17%] z-40 w-[36%] rotate-6 shadow-[0_34px_100px_rgba(239,35,60,0.28)] ring-2 ring-[#ef233c]/45 sm:right-[2%] sm:w-[36%]"
              src={appScreens.video}
            />

            <div className="absolute bottom-[3%] left-[3%] z-40 rounded-xl border border-white/12 bg-[#111319]/90 px-4 py-3 shadow-2xl backdrop-blur sm:left-[7%]">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#ff5265]">Readiness</p>
              <p className="mt-1 text-sm font-bold text-white">Saiba como você chega</p>
            </div>
            <div className="absolute bottom-[8%] right-[1%] z-40 flex items-center gap-2 rounded-xl border border-white/12 bg-[#111319]/90 px-4 py-3 shadow-2xl backdrop-blur sm:right-[5%]">
              <PlayCircle aria-hidden="true" className="h-5 w-5 text-[#ff5265]" />
              <p className="text-sm font-bold text-white">Vídeos no treino</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 text-white" id="estrutura">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-[#6ea8ff]">
              <Gauge aria-hidden="true" className="mr-2 inline h-4 w-4" />
              {page.structureTitle}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase sm:text-4xl">{page.structureH2}</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {page.weeks.map(([week, title, body], index) => (
              <article className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] p-5" key={week}>
                <span className="absolute right-4 top-2 font-display text-6xl text-white/[0.05]">{index + 1}</span>
                <p className="text-xs font-bold uppercase text-[#6ea8ff]">{week}</p>
                <h3 className="mt-3 font-display text-2xl uppercase leading-none text-white">{title}</h3>
                <p className="mt-4 text-sm leading-6 text-white/66">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#07080b] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8">
          <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_22%_22%,rgba(239,35,60,0.24),transparent_34%),radial-gradient(circle_at_82%_64%,rgba(18,110,255,0.28),transparent_38%),#0e1015] p-6 shadow-[0_34px_100px_rgba(0,0,0,0.48)] sm:min-h-[600px]">
            <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:40px_40px]" />
            <PhoneMockup
              alt="Bloco de exercícios no portal do atleta RaptorPro"
              className="absolute left-1/2 top-1/2 w-[58%] max-w-[290px] -translate-x-1/2 -translate-y-1/2 -rotate-3"
              src={appScreens.workout}
            />
            <div className="absolute left-5 top-7 rounded-xl border border-white/12 bg-black/55 px-4 py-3 backdrop-blur-md sm:left-8 sm:top-10">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ff5265]">Treino guiado</p>
              <p className="mt-1 text-sm font-bold text-white">Blocos, vídeos e registro</p>
            </div>
            <div className="absolute bottom-7 right-4 rounded-xl border border-white/12 bg-black/62 px-4 py-3 backdrop-blur-md sm:bottom-10 sm:right-8">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6ea8ff]">Pós-treino</p>
              <p className="mt-1 text-sm font-bold text-white">RPE + duração + carga</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold uppercase text-[#6ea8ff]">
              <ClipboardCheck aria-hidden="true" className="mr-2 inline h-4 w-4" />
              {page.insideTitle}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">{page.insideH2}</h2>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {page.inside.map((item) => (
                <div className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.055] p-4" key={item}>
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#2f7dff]" />
                  <p className="text-sm font-semibold leading-6 text-white/75">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0b0b0d] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-[#6ea8ff]">FAQ</p>
            <h2 className="mt-3 font-display text-3xl uppercase text-white sm:text-4xl">{page.faqTitle}</h2>
          </div>
          <div className="grid gap-3">
            {page.faqs.map((faq) => (
              <article className="rounded-lg border border-white/10 bg-white/[0.055] p-5" key={faq.question}>
                <h3 className="text-lg font-bold text-white">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-white/66">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#050608] py-14 text-white">
        <Image
          alt="Football athlete running"
          className="absolute inset-0 h-full w-full object-cover object-[50%_32%] opacity-24"
          fill
          sizes="100vw"
          src={assets.sprintFront}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#050608_0%,rgba(5,6,8,0.94)_58%,rgba(18,110,255,0.42)_100%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-white/70">Offseason 30 Days</p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">{page.finalTitle}</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">{page.finalBody}</p>
          </div>
          <div className="flex flex-col gap-3">
            <a className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#126eff] px-5 py-3 text-sm font-bold text-white shadow-[0_16px_48px_rgba(18,110,255,0.34)] transition hover:bg-[#0c55cc]" href={checkoutHref}>
              {page.finalCta}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
            <Link className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-white/40 bg-black/25 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15" href={coachingHref}>
              {page.coachingCta}
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
