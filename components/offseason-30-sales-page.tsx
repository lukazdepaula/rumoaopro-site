import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Dumbbell,
  Flame,
  Gauge,
  PlayCircle,
  ShieldCheck,
  Target,
  Trophy,
  Zap
} from "lucide-react";
import { ReviewBadge, ReviewsSection } from "@/components/reviews";
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
    eyebrow: "Offseason Program 30 Days",
    h1: "Organize 30 dias de offseason com treino de verdade.",
    lead:
      "Um programa direto para jogadores de futebol que precisam voltar mais prontos em pouco tempo, combinando velocidade, força, potência e condicionamento.",
    primaryCta: "Comprar programa",
    secondaryCta: "Ver estrutura",
    storeNote: "Compra finalizada pela loja RumoAoPro.",
    chips: ["30 dias", "4 semanas", "Campo + academia", "Vídeo demos"],
    stats: [
      ["4", "semanas progressivas"],
      ["30", "dias organizados"],
      ["39", "páginas no guia"]
    ],
    fitTitle: "Para quem é esse programa",
    fitH2: "Feito para atleta com pouco tempo e objetivo claro.",
    fitLead:
      "O Offseason 30 Days não tenta resolver uma temporada inteira. Ele organiza uma janela curta para você criar ritmo, retomar intensidade e chegar mais pronto para treinos, peneiras ou pré-temporada.",
    goodFitLabel: "Boa escolha",
    notFitLabel: "Melhor escolher assessoria",
    goodFit: [
      "Você tem 4 semanas ou menos para se preparar melhor",
      "Você consegue treinar campo e academia durante a semana",
      "Você quer voltar com mais velocidade, força e condicionamento",
      "Você prefere uma estrutura pronta, visual e fácil de seguir"
    ],
    notFit: [
      "Você está voltando de lesão sem liberação",
      "Você precisa de ajuste individual toda semana",
      "Você não tem acesso mínimo a campo ou academia",
      "Você quer um ciclo longo de hipertrofia e força máxima"
    ],
    structureTitle: "Progressão do programa",
    structureH2: "Quatro semanas para construir, carregar e chegar afiado.",
    structureLead:
      "A progressão começa recolocando qualidade no movimento, sobe volume e densidade, avança para potência e fecha com intensidade alta sem destruir o atleta.",
    weeks: [
      {
        week: "Semana 1",
        title: "Build the Base",
        body:
          "Reintroduz velocidade de qualidade, força geral e condicionamento controlado para criar ritmo rápido sem desperdiçar a janela curta.",
        points: ["Acceleration + plyometrics", "Full body strength", "Aerobic base"]
      },
      {
        week: "Semana 2",
        title: "Build Capacity",
        body:
          "Aumenta volume e densidade em campo e academia mantendo execução limpa, controle e intenção em cada repetição.",
        points: ["Mais carga útil", "Mais densidade", "Qualidade primeiro"]
      },
      {
        week: "Semana 3",
        title: "Explode & Power Up",
        body:
          "Entra com trabalho mais explosivo, contrast training e repeat sprint para converter força em ações mais rápidas.",
        points: ["Power focus", "Repeat sprint", "Contraste na academia"]
      },
      {
        week: "Semana 4",
        title: "Club Ready",
        body:
          "Mantém intensidade alta, reduz excesso de fadiga e prioriza sharpness para chegar pronto ao clube, peneira ou rotina de treino.",
        points: ["HIIT 200/150/100/50", "Speed endurance", "Chegar fresco"]
      }
    ],
    includedTitle: "O que vem dentro",
    includedH2: "Um guia visual para executar sem ficar adivinhando.",
    included: [
      {
        icon: CalendarDays,
        title: "Plano dia a dia",
        body:
          "A semana mostra o foco de cada dia: campo, academia, condicionamento, mudança de direção e recuperação."
      },
      {
        icon: Zap,
        title: "Sessões de velocidade",
        body:
          "Aceleração, sprints, plyos, mudança de direção e speed endurance com volumes e descansos claros."
      },
      {
        icon: Dumbbell,
        title: "Sessões de força",
        body:
          "Treinos full body, contraste, potência e movimentos principais com séries, repetições e orientações."
      },
      {
        icon: Activity,
        title: "Condicionamento",
        body:
          "Blocos aeróbicos, repeat sprint e protocolos intervalados para sustentar a intensidade do futebol."
      },
      {
        icon: ClipboardCheck,
        title: "Coach notes",
        body:
          "Notas objetivas dizendo o que priorizar, quando controlar intensidade e quando parar se a mecânica cair."
      },
      {
        icon: PlayCircle,
        title: "Vídeo demos",
        body:
          "O material foi desenhado com referências de demo para reduzir dúvida na execução."
      }
    ],
    rulesTitle: "Regras da semana",
    rulesH2: "O programa é curto, então a execução precisa ser inteligente.",
    rules: [
      ["Quality first", "Não transforme todo treino em sofrimento. A qualidade manda."],
      ["Sprint with intent", "Sprints precisam de intenção, descanso e mecânica limpa."],
      ["Conditioning controlled", "Condicionamento deve construir capacidade sem matar potência."],
      ["Track loads and times", "Anote cargas, tempos e resposta para enxergar progresso."],
      ["Recover hard", "Sono, hidratação e comida fazem parte do plano."]
    ],
    previewTitle: "Dentro do PDF",
    previewH2: "O produto já tem cara de material premium.",
    previewLead:
      "A capa e as páginas internas usam uma linguagem visual forte, com tabelas, blocos, coach notes e chamadas de vídeo demo.",
    previewImages: [
      {
        src: assets.offseason30Progression,
        alt: "Progressão semanal do Offseason Program 30 Days",
        label: "Program progression"
      },
      {
        src: assets.offseason30WeekOverview,
        alt: "Visão geral da semana 1 do Offseason 30 Days",
        label: "Week overview"
      },
      {
        src: assets.offseason30DayOne,
        alt: "Sessão de aceleração e pliometria do Offseason 30 Days",
        label: "Field session"
      }
    ],
    authorityTitle: "Criado para futebol real",
    authorityH2: "Curto, direto e com transferência para o campo.",
    authorityBody:
      "O programa segue a mesma lógica da RumoAoPro: academia e campo trabalhando juntos. A meta não é apenas cansar. É construir ritmo, velocidade, força e capacidade para o jogador voltar melhor.",
    authorityStats: [
      ["Campo", "aceleração, sprint, mudança de direção e condicionamento"],
      ["Academia", "força, potência, contraste e estabilidade"],
      ["Recuperação", "dias de descanso e regras para controlar fadiga"]
    ],
    faqTitle: "Perguntas rápidas",
    faqH2: "Antes de comprar",
    faqs: [
      {
        question: "Esse programa substitui assessoria individual?",
        answer:
          "Não. Ele é uma estrutura pronta de 30 dias. Se você precisa adaptar carga, calendário, lesão ou jogos da semana, a assessoria é melhor."
      },
      {
        question: "Preciso de academia?",
        answer:
          "Sim. O programa combina campo e academia, então o ideal é ter acesso aos dois."
      },
      {
        question: "Serve para pré-temporada?",
        answer:
          "Serve principalmente para uma janela curta antes de voltar ao clube, treinos, peneiras ou pré-temporada."
      },
      {
        question: "É para iniciante?",
        answer:
          "É melhor para atleta que já treina e entende o básico de academia e campo. Iniciante total pode precisar de acompanhamento."
      }
    ],
    finalTitle: "Tem 30 dias? Então pare de improvisar.",
    finalBody:
      "Entre na offseason curta com uma estrutura clara para campo, academia e condicionamento.",
    finalCta: "Comprar Offseason 30 Days",
    coachingCta: "Quero algo individual"
  },
  en: {
    nav: nav.en,
    ctaLabel: "Buy",
    languageHref: "/programas/offseason-30-days",
    languageLabel: "🇺🇸 EN → PT",
    eyebrow: "Offseason Program 30 Days",
    h1: "Turn a short offseason into 30 focused training days.",
    lead:
      "A direct football program for players who need to return sharper fast, combining speed, strength, power and conditioning.",
    primaryCta: "Buy program",
    secondaryCta: "See structure",
    storeNote: "Checkout runs through the RumoAoPro store.",
    chips: ["30 days", "4 weeks", "Field + gym", "Video demos"],
    stats: [
      ["4", "progressive weeks"],
      ["30", "organized days"],
      ["39", "guide pages"]
    ],
    fitTitle: "Who this program is for",
    fitH2: "Built for players with limited time and a clear goal.",
    fitLead:
      "Offseason 30 Days is not trying to solve an entire year. It organizes a short window so you can rebuild rhythm, raise intensity and return sharper for team training, trials or pre-season.",
    goodFitLabel: "Good fit",
    notFitLabel: "Better choose coaching",
    goodFit: [
      "You have 4 weeks or less to prepare better",
      "You can train both field and gym during the week",
      "You want to return with more speed, strength and conditioning",
      "You prefer a ready, visual and easy-to-follow structure"
    ],
    notFit: [
      "You are returning from injury without clearance",
      "You need individual weekly adjustments",
      "You do not have basic field or gym access",
      "You want a long hypertrophy and max-strength cycle"
    ],
    structureTitle: "Program progression",
    structureH2: "Four weeks to build, load and arrive sharp.",
    structureLead:
      "The progression starts by restoring movement quality, increases volume and density, moves into power and closes with high intensity without burying the player.",
    weeks: [
      {
        week: "Week 1",
        title: "Build the Base",
        body:
          "Reintroduces quality speed, general strength and controlled conditioning so the player builds rhythm fast.",
        points: ["Acceleration + plyometrics", "Full body strength", "Aerobic base"]
      },
      {
        week: "Week 2",
        title: "Build Capacity",
        body:
          "Raises volume and density across field and gym work while keeping execution clean, controlled and intentional.",
        points: ["Useful loading", "More density", "Quality first"]
      },
      {
        week: "Week 3",
        title: "Explode & Power Up",
        body:
          "Moves into faster, more explosive work, contrast training and repeat sprint ability.",
        points: ["Power focus", "Repeat sprint", "Contrast lifting"]
      },
      {
        week: "Week 4",
        title: "Club Ready",
        body:
          "Keeps intensity high, reduces unnecessary fatigue and prioritizes sharpness for the club, trial or training environment.",
        points: ["HIIT 200/150/100/50", "Speed endurance", "Arrive fresh"]
      }
    ],
    includedTitle: "What is inside",
    includedH2: "A visual guide so the player can execute without guessing.",
    included: [
      {
        icon: CalendarDays,
        title: "Day-by-day plan",
        body:
          "The week shows each day's focus: field, gym, conditioning, change of direction and recovery."
      },
      {
        icon: Zap,
        title: "Speed sessions",
        body:
          "Acceleration, sprints, plyos, change of direction and speed endurance with clear volumes and rest."
      },
      {
        icon: Dumbbell,
        title: "Strength sessions",
        body:
          "Full-body, contrast, power and main lifts with sets, reps and coaching instructions."
      },
      {
        icon: Activity,
        title: "Conditioning",
        body:
          "Aerobic blocks, repeat sprint work and interval protocols to support football intensity."
      },
      {
        icon: ClipboardCheck,
        title: "Coach notes",
        body:
          "Direct notes showing what to prioritize, when to control intensity and when to stop if mechanics drop."
      },
      {
        icon: PlayCircle,
        title: "Video demos",
        body:
          "The guide is built with demo references to reduce confusion during execution."
      }
    ],
    rulesTitle: "Weekly rules",
    rulesH2: "The window is short, so execution has to be intelligent.",
    rules: [
      ["Quality first", "Do not turn every session into survival. Quality leads."],
      ["Sprint with intent", "Sprints need intent, rest and clean mechanics."],
      ["Conditioning controlled", "Conditioning should build capacity without killing power."],
      ["Track loads and times", "Record loads, times and response so progress is visible."],
      ["Recover hard", "Sleep, hydration and food are part of the plan."]
    ],
    previewTitle: "Inside the PDF",
    previewH2: "The product already looks like a premium guide.",
    previewLead:
      "The cover and internal pages use a strong visual language with tables, blocks, coach notes and video demo calls.",
    previewImages: [
      {
        src: assets.offseason30Progression,
        alt: "Weekly progression for Offseason Program 30 Days",
        label: "Program progression"
      },
      {
        src: assets.offseason30WeekOverview,
        alt: "Week 1 overview for Offseason 30 Days",
        label: "Week overview"
      },
      {
        src: assets.offseason30DayOne,
        alt: "Acceleration and plyometrics session for Offseason 30 Days",
        label: "Field session"
      }
    ],
    authorityTitle: "Built for real football",
    authorityH2: "Short, direct and connected to the pitch.",
    authorityBody:
      "The program follows the RumoAoPro logic: gym and field work serving the same goal. The point is not just to get tired. It is to build rhythm, speed, strength and capacity so the player returns better.",
    authorityStats: [
      ["Field", "acceleration, sprint, change of direction and conditioning"],
      ["Gym", "strength, power, contrast and stability"],
      ["Recovery", "rest days and rules to control fatigue"]
    ],
    faqTitle: "Quick questions",
    faqH2: "Before you buy",
    faqs: [
      {
        question: "Does this replace individual coaching?",
        answer:
          "No. This is a ready 30-day structure. If you need load, calendar, injury or match-week adaptation, coaching is a better fit."
      },
      {
        question: "Do I need gym access?",
        answer:
          "Yes. The program combines field and gym work, so the best setup includes both."
      },
      {
        question: "Can I use it before pre-season?",
        answer:
          "Yes. It is especially useful for a short window before returning to club, trials, team training or pre-season."
      },
      {
        question: "Is it beginner-friendly?",
        answer:
          "It is better for players who already train and understand the basics of field and gym work. Complete beginners may need supervision."
      }
    ],
    finalTitle: "Have 30 days? Stop improvising.",
    finalBody:
      "Enter your short offseason with a clear structure for field work, gym sessions and conditioning.",
    finalCta: "Buy Offseason 30 Days",
    coachingCta: "I need coaching"
  }
};

export function Offseason30SalesPage({ locale }: Offseason30SalesPageProps) {
  const page = copy[locale];
  const coachingHref =
    locale === "pt" ? "/assessoria#aplicacao" : "/en/coaching#application";
  const programHref =
    locale === "pt"
      ? "/programas/offseason-30-days"
      : "/en/programs/offseason-30-days";
  const reviewGroupKey = getReviewGroupForProgramHref(programHref);

  return (
    <main className="min-h-screen bg-[#050608]">
      <SiteHeader
        navItems={page.nav}
        ctaHref={shopifyProducts.offseason30}
        ctaLabel={page.ctaLabel}
      />

      <section className="relative isolate overflow-hidden bg-[#050608] text-white">
        <Image
          alt="Offseason 30 Days football speed session"
          className="absolute inset-0 -z-30 h-full w-full object-cover object-[64%_center] opacity-28"
          fill
          priority
          sizes="100vw"
          src={assets.offseason30DayOne}
        />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,#050608_0%,rgba(5,6,8,0.96)_46%,rgba(5,6,8,0.70)_100%)]" />
        <div className="absolute inset-0 -z-10 opacity-[0.14] [background-image:linear-gradient(rgba(18,110,255,0.32)_1px,transparent_1px),linear-gradient(90deg,rgba(18,110,255,0.22)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="mx-auto grid min-h-[calc(84svh-var(--header-height))] max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8">
          <div className="relative z-10">
            <div className="flex flex-wrap gap-3">
              <p className="inline-flex rounded-md border border-[#126eff]/70 bg-[#126eff]/20 px-3 py-2 text-sm font-bold uppercase text-white shadow-[0_0_28px_rgba(18,110,255,0.24)]">
                {page.eyebrow}
              </p>
              <Link
                className="focus-ring inline-flex rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold uppercase text-white transition hover:bg-white hover:text-ink"
                href={page.languageHref}
              >
                {page.languageLabel}
              </Link>
            </div>
            <p className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.26em] text-[#6ea8ff]">
              <Flame aria-hidden="true" className="h-4 w-4 text-[#126eff]" />
              RumoAoPro short offseason
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl uppercase leading-[0.98] text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.42)] sm:text-5xl lg:text-6xl">
              {page.h1}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/74 sm:text-lg">
              {page.lead}
            </p>
            {reviewGroupKey ? (
              <ReviewBadge
                className="mt-6"
                groupKey={reviewGroupKey}
                locale={locale}
                tone="dark"
              />
            ) : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#126eff] px-5 py-3 text-sm font-bold text-white shadow-[0_16px_48px_rgba(18,110,255,0.34)] transition hover:bg-[#0c55cc]"
                href={shopifyProducts.offseason30}
              >
                {page.primaryCta}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>
              <Link
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                href="#estrutura"
              >
                {page.secondaryCta}
              </Link>
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-white/45">
              {page.storeNote}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
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

          <div className="relative mx-auto w-full max-w-[610px] py-6">
            <div className="relative mx-auto w-[82%] max-w-[430px] overflow-hidden rounded-lg border border-white/16 bg-[linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.02))] p-3 shadow-[0_34px_110px_rgba(0,0,0,0.72)]">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#126eff] to-transparent" />
              <Image
                alt="Offseason Program 30 Days cover"
                className="aspect-[4/5] w-full rounded-md object-cover object-top"
                height={1440}
                priority
                src={assets.offseason30Cover}
                width={1020}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {page.stats.map(([value, label]) => (
                <div
                  className="rounded-lg border border-white/10 bg-black/48 p-4 text-center backdrop-blur"
                  key={label}
                >
                  <p className="font-display text-2xl uppercase text-[#2f7dff]">
                    {value}
                  </p>
                  <p className="mt-1 text-[11px] font-bold uppercase leading-4 text-white/50">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {reviewGroupKey ? (
        <ReviewsSection
          groupKey={reviewGroupKey}
          locale={locale}
          title={
            locale === "pt"
              ? "Avaliações de atletas RumoAoPro"
              : "Reviews from equivalent RumoAoPro programs"
          }
          tone="dark"
        />
      ) : null}

      <section className="bg-[#07080b] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-[#4f8fff]">
              <Target aria-hidden="true" className="mr-2 inline h-4 w-4" />
              {page.fitTitle}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-white sm:text-4xl">
              {page.fitH2}
            </h2>
            <p className="mt-5 text-base leading-8 text-white/68">
              {page.fitLead}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.28)]">
              <p className="text-sm font-bold uppercase text-turf">
                {page.goodFitLabel}
              </p>
              <ul className="mt-4 space-y-3">
                {page.goodFit.map((item) => (
                  <li
                    className="flex gap-3 text-sm leading-6 text-white/72"
                    key={item}
                  >
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-1 h-4 w-4 shrink-0 text-turf"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-[#126eff]/35 bg-[#126eff]/[0.08] p-5 shadow-[0_18px_70px_rgba(18,110,255,0.12)]">
              <p className="text-sm font-bold uppercase text-[#6ea8ff]">
                {page.notFitLabel}
              </p>
              <ul className="mt-4 space-y-3">
                {page.notFit.map((item) => (
                  <li
                    className="flex gap-3 text-sm leading-6 text-white/72"
                    key={item}
                  >
                    <ShieldCheck
                      aria-hidden="true"
                      className="mt-1 h-4 w-4 shrink-0 text-[#6ea8ff]"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
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
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">
              {page.structureH2}
            </h2>
            <p className="mt-5 text-base leading-8 text-white/70">
              {page.structureLead}
            </p>
          </div>

          <div className="mt-9 grid gap-5 lg:grid-cols-4">
            {page.weeks.map((week) => (
              <article
                className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)]"
                key={week.week}
              >
                <p className="text-xs font-bold uppercase text-[#6ea8ff]">
                  {week.week}
                </p>
                <h3 className="mt-3 font-display text-2xl uppercase leading-none text-white">
                  {week.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-white/66">
                  {week.body}
                </p>
                <ul className="mt-5 space-y-3">
                  {week.points.map((point) => (
                    <li
                      className="flex gap-3 text-sm leading-5 text-white/72"
                      key={point}
                    >
                      <CheckCircle2
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#071020_0%,#070708_56%,#050608_100%)] py-16 text-white">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#126eff] to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-[#6ea8ff]">
              <BadgeCheck aria-hidden="true" className="mr-2 inline h-4 w-4" />
              {page.includedTitle}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase text-white sm:text-4xl">
              {page.includedH2}
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {page.included.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.24)]"
                  key={item.title}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#126eff] text-white shadow-[0_0_30px_rgba(18,110,255,0.26)]">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/66">
                    {item.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#07080b] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-start lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-[#6ea8ff]">
              <Trophy aria-hidden="true" className="mr-2 inline h-4 w-4" />
              {page.rulesTitle}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase text-white sm:text-4xl">
              {page.rulesH2}
            </h2>
          </div>
          <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.055]">
            {page.rules.map(([label, body]) => (
              <div
                className="grid gap-2 border-b border-white/10 p-5 last:border-b-0 sm:grid-cols-[190px_1fr]"
                key={label}
              >
                <p className="font-display text-lg uppercase text-[#6ea8ff]">
                  {label}
                </p>
                <p className="text-sm leading-6 text-white/70">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-smoke py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase text-signal">
                {page.previewTitle}
              </p>
              <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-4xl">
                {page.previewH2}
              </h2>
            </div>
            <p className="max-w-3xl text-base leading-8 text-graphite/72">
              {page.previewLead}
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {page.previewImages.map((image) => (
              <figure
                className="group overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-ink/10"
                key={image.src}
              >
                <Image
                  alt={image.alt}
                  className="aspect-[4/5] w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                  height={1220}
                  src={image.src}
                  width={860}
                />
                <figcaption className="border-t border-ink/10 p-4">
                  <span className="inline-flex rounded-md bg-ink px-3 py-2 text-xs font-bold uppercase text-white">
                    {image.label}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#050608] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-[#6ea8ff]">
              {page.authorityTitle}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-white sm:text-4xl">
              {page.authorityH2}
            </h2>
            <p className="mt-5 text-base leading-8 text-white/70">
              {page.authorityBody}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {page.authorityStats.map(([value, label]) => (
              <article
                className="rounded-lg border border-white/10 bg-white/[0.055] p-5"
                key={value}
              >
                <p className="font-display text-2xl uppercase text-[#6ea8ff]">
                  {value}
                </p>
                <p className="mt-3 text-sm font-semibold leading-6 text-white/68">
                  {label}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0b0b0d] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-[#6ea8ff]">
              {page.faqTitle}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase text-white sm:text-4xl">
              {page.faqH2}
            </h2>
          </div>
          <div className="grid gap-4">
            {page.faqs.map((faq) => (
              <article
                className="rounded-lg border border-white/10 bg-white/[0.055] p-5"
                key={faq.question}
              >
                <h3 className="text-lg font-bold text-white">
                  {faq.question}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/66">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#050608] py-14 text-white">
        <Image
          alt="Offseason 30 Days cover background"
          className="absolute inset-0 h-full w-full object-cover object-[58%_center] opacity-24"
          fill
          sizes="100vw"
          src={assets.offseason30Cover}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#050608_0%,rgba(5,6,8,0.92)_52%,rgba(18,110,255,0.46)_100%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-white/75">
              Offseason Program 30 Days
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">
              {page.finalTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/82">
              {page.finalBody}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <a
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#126eff] px-5 py-3 text-sm font-bold text-white shadow-[0_16px_48px_rgba(18,110,255,0.34)] transition hover:bg-[#0c55cc]"
              href={shopifyProducts.offseason30}
            >
              {page.finalCta}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
            <Link
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-white/40 bg-black/25 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
              href={coachingHref}
            >
              {page.coachingCta}
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
