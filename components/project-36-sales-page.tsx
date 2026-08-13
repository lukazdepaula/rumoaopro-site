import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  Gauge,
  PlayCircle,
  ShieldCheck,
  Target,
  Zap
} from "lucide-react";
import {
  RaptorPhoneMockup,
  raptorAppScreens
} from "@/components/raptor-program-experience";
import { ProgramDeviceShowcase } from "@/components/program-device-showcase";
import { ReviewBadge, ReviewsSection } from "@/components/reviews";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { assets, nav, shopifyProducts } from "@/lib/content";
import { getReviewGroupForProgramHref } from "@/lib/reviews";

type Project36SalesPageProps = {
  locale: "pt" | "en";
};

const copy = {
  pt: {
    nav: nav.pt,
    ctaLabel: "Comprar",
    languageHref: "/en/programs/project-36kmh",
    languageLabel: "🇧🇷 PT → EN",
    eyebrow: "SPEED PRO · RUMOAOPRO",
    h1: "Programa de Velocidade e Aceleração para Futebol",
    lead:
      "12 semanas para desenvolver aceleração, velocidade máxima, potência e mecânica de sprint aplicada ao futebol.",
    primaryCta: "Comprar Speed Pro",
    secondaryCta: "Ver fases",
    storeNote: "Após a confirmação, o programa aparece automaticamente na sua conta RaptorPro.",
    chips: [
      "12 semanas",
      "3 fases",
      "2 speed days",
      "2 gym days",
      "1 conditioning"
    ],
    stats: [
      ["3", "fases progressivas"],
      ["12", "semanas de offseason"],
      ["84", "dias organizados no app"]
    ],
    fitTitle: "Para quem é",
    fitH2: "Feito para atleta que precisa correr melhor, não só cansar mais.",
    fitLead:
      "O Speed Pro organiza velocidade como qualidade neural: descanso suficiente, intenção máxima, mecânica limpa e progressão entre campo, academia e condicionamento.",
    goodFitLabel: "Boa escolha",
    notFitLabel: "Melhor ajustar individual",
    goodFit: [
      "Você quer melhorar aceleração, top speed e re-aceleração",
      "Você está em offseason e consegue treinar campo e academia",
      "Você já tem alguma experiência de treino",
      "Você precisa de uma estrutura visual e objetiva para seguir"
    ],
    notFit: [
      "Você está voltando de lesão sem liberação",
      "Você precisa encaixar tudo em jogos semanais do clube",
      "Você não tem espaço para sprintar com segurança",
      "Você quer apenas condicionamento sem trabalho de velocidade"
    ],
    phasesTitle: "As 3 fases",
    phasesH2: "Base atlética, aceleração forte e velocidade de jogo.",
    phasesLead:
      "Cada fase mantém a semana simples: dois dias de velocidade em campo, dois dias de academia, um dia de condicionamento e dois dias de recuperação.",
    phases: [
      {
        title: "Phase 1 - Athletic Foundation",
        weeks: "Semanas 1-4",
        image: assets.project36Phase1Overview,
        body:
          "Constrói a base: mecânica de sprint, tolerância a pliometria, força geral e condicionamento controlado.",
        points: [
          "Sprint mechanics",
          "Plyometric tolerance",
          "Strength foundation"
        ]
      },
      {
        title: "Phase 2 - Acceleration Power",
        weeks: "Semanas 5-8",
        image: assets.project36Phase2Overview,
        body:
          "Transforma a base em aceleração mais agressiva: força horizontal, primeiros passos mais fortes e sprints resistidos.",
        points: [
          "Sled ou hill sprints",
          "First-step power",
          "Re-aceleração mais agressiva"
        ]
      },
      {
        title: "Phase 3 - Max Velocity & Game Speed",
        weeks: "Semanas 9-12",
        image: assets.project36Phase3Overview,
        body:
          "Leva o trabalho para top speed e velocidade de jogo: flying sprints, elasticidade, COD e ações mais específicas do futebol.",
        points: [
          "Max-speed exposure",
          "Flying sprint work",
          "Game-speed patterns"
        ]
      }
    ],
    includedTitle: "O que vem dentro",
    includedH2: "Calendário completo no RaptorPro, progressão clara e vídeos dentro do treino.",
    included: [
      {
        icon: CalendarDays,
        title: "12 semanas organizadas",
        body:
          "Três fases com estrutura semanal simples para campo, academia, condicionamento e recuperação."
      },
      {
        icon: Zap,
        title: "Velocidade em campo",
        body:
          "Aceleração, sprints resistidos, top speed, re-aceleração, COD e ações de game speed."
      },
      {
        icon: Dumbbell,
        title: "Suporte de força",
        body:
          "Dias de lower body, upper body, core e potência para sustentar a velocidade."
      },
      {
        icon: Activity,
        title: "Condicionamento separado",
        body:
          "Conditioning tem dia próprio para não transformar treino de velocidade em treino de fadiga."
      },
      {
        icon: ShieldCheck,
        title: "Regras de descanso",
        body:
          "O guia deixa claro quanto descansar, quando parar a série e como preservar qualidade."
      },
      {
        icon: PlayCircle,
        title: "Video demos",
        body:
          "As sessões internas indicam demos para reduzir dúvida na execução dos exercícios."
      }
    ],
    methodTitle: "A lógica do sprint",
    methodH2: "Velocidade precisa de intenção, descanso e mecânica limpa.",
    methodLead:
      "A regra central do programa é simples: para repetições máximas, descanse aproximadamente 1 minuto para cada 10 metros sprintados. Se postura, contato ou intenção caem, a série acabou.",
    methodRows: [
      ["Rest rule", "10m = 1 minuto, 20m = 2 minutos, 40m = 4 minutos"],
      ["Quality rule", "Cada sprint deve parecer rápido, limpo e controlado"],
      ["Stop rule", "Pare se postura quebra, contato pesa ou velocidade cai"],
      ["Ball work", "Pode entrar, mas técnico e com baixa/moderada intensidade"]
    ],
    previewTitle: "Dentro do produto",
    previewH2: "Treino de campo, força e velocidade dentro de uma única jornada.",
    previewLead:
      "Você abre o dia, acompanha a sessão no celular, assiste às demonstrações e registra o treino no RaptorPro.",
    previewImages: [
      {
        src: "/assets/programs/project-36/project-36-training.jpg",
        alt: "Treino de futebol RumoAoPro",
        label: "Velocidade aplicada ao futebol"
      },
      {
        src: "/assets/programs/project-36/project-36-sprint.jpg",
        alt: "Sessão de sprint do Speed Pro",
        label: "Exposição real à velocidade"
      },
      {
        src: "/assets/programs/project-36/project-36-coach.jpg",
        alt: "Treinador RumoAoPro orientando atletas",
        label: "Método construído no campo"
      }
    ],
    sampleTitle: "Exemplos de sessões",
    sampleH2: "Do primeiro passo à velocidade de jogo.",
    sampleCards: [
      {
        title: "Acceleration + Plyometrics",
        body: "Primeira fase para melhorar mecânica, rigidez útil e intenção nos primeiros metros.",
        image: assets.project36Phase1Day1
      },
      {
        title: "Acceleration Power",
        body: "Sled ou hill sprint para construir força horizontal e passos iniciais mais agressivos.",
        image: assets.project36Phase2Day1
      },
      {
        title: "Max Velocity + Flying Sprints",
        body: "Exposição de top speed para correr mais solto, rápido e com melhor ritmo.",
        image: assets.project36Phase3Day1
      }
    ],
    faqTitle: "Perguntas rápidas",
    faqH2: "Antes de comprar",
    faqs: [
      {
        question: "Esse programa é para iniciantes?",
        answer:
          "Funciona melhor para atletas com alguma experiência. Iniciantes podem usar, mas devem reduzir volume e priorizar técnica."
      },
      {
        question: "Preciso de trenó para sprint resistido?",
        answer:
          "Não obrigatoriamente. O próprio material sugere hill sprints como alternativa quando você não tem sled."
      },
      {
        question: "Posso fazer trabalho com bola junto?",
        answer:
          "Sim, desde que seja técnico e com intensidade baixa a moderada. Evite adicionar jogos reduzidos pesados ou condicionamento extra."
      },
      {
        question: "Serve durante a temporada?",
        answer:
          "Ele é um programa de offseason. Em temporada, o ideal é reduzir volume e encaixar velocidade com cuidado em volta dos jogos."
      }
    ],
    finalTitle: "Quer correr melhor? Pare de tratar sprint como cardio.",
    finalBody:
      "Entre no Speed Pro com uma progressão clara para acelerar, atingir top speed e transferir velocidade para ações de jogo.",
    finalCta: "Comprar Speed Pro",
    coachingCta: "Quero algo individual"
  },
  en: {
    nav: nav.en,
    ctaLabel: "Buy",
    languageHref: "/programas/projeto-36kmh",
    languageLabel: "🇺🇸 EN → PT",
    eyebrow: "SPEED PRO · RUMOAOPRO",
    h1: "Football Speed & Acceleration Program",
    lead:
      "12 weeks to develop acceleration, maximum velocity, power and football-specific sprint mechanics.",
    primaryCta: "Buy Speed Pro",
    secondaryCta: "See phases",
    storeNote: "After confirmation, the program appears automatically in your RaptorPro account.",
    chips: [
      "12 weeks",
      "3 phases",
      "2 speed days",
      "2 gym days",
      "1 conditioning"
    ],
    stats: [
      ["3", "progressive phases"],
      ["12", "offseason weeks"],
      ["84", "days organized in the app"]
    ],
    fitTitle: "Who it is for",
    fitH2: "Built for players who need to run better, not just suffer more.",
    fitLead:
      "Speed Pro organizes speed as a nervous system quality: enough rest, maximal intent, clean mechanics and progression between field, gym and conditioning.",
    goodFitLabel: "Good fit",
    notFitLabel: "Better choose coaching",
    goodFit: [
      "You want better acceleration, top speed and re-acceleration",
      "You are in the offseason and can train field plus gym",
      "You already have some training experience",
      "You want a visual, direct structure to follow"
    ],
    notFit: [
      "You are returning from injury without clearance",
      "You need to fit everything around weekly matches",
      "You do not have safe space to sprint",
      "You only want conditioning without true speed work"
    ],
    phasesTitle: "The 3 phases",
    phasesH2: "Athletic base, stronger acceleration and game speed.",
    phasesLead:
      "Each phase keeps the week simple: two field speed days, two gym days, one conditioning day and two recovery days.",
    phases: [
      {
        title: "Phase 1 - Athletic Foundation",
        weeks: "Weeks 1-4",
        image: assets.project36Phase1Overview,
        body:
          "Builds the base: sprint mechanics, plyometric tolerance, strength foundation and controlled conditioning.",
        points: [
          "Sprint mechanics",
          "Plyometric tolerance",
          "Strength foundation"
        ]
      },
      {
        title: "Phase 2 - Acceleration Power",
        weeks: "Weeks 5-8",
        image: assets.project36Phase2Overview,
        body:
          "Turns the base into more aggressive acceleration: horizontal force, sharper first steps and resisted sprint work.",
        points: [
          "Sled or hill sprints",
          "First-step power",
          "More aggressive re-acceleration"
        ]
      },
      {
        title: "Phase 3 - Max Velocity & Game Speed",
        weeks: "Weeks 9-12",
        image: assets.project36Phase3Overview,
        body:
          "Moves toward top speed and game speed: flying sprints, elasticity, COD and football-specific speed patterns.",
        points: [
          "Max-speed exposure",
          "Flying sprint work",
          "Game-speed patterns"
        ]
      }
    ],
    includedTitle: "What is inside",
    includedH2: "A full RaptorPro calendar with clear progression and in-session videos.",
    included: [
      {
        icon: CalendarDays,
        title: "12 organized weeks",
        body:
          "Three phases with a simple weekly structure for field, gym, conditioning and recovery."
      },
      {
        icon: Zap,
        title: "Field speed sessions",
        body:
          "Acceleration, resisted sprinting, top speed, re-acceleration, COD and game-speed actions."
      },
      {
        icon: Dumbbell,
        title: "Strength support",
        body:
          "Lower body, upper body, core and power days to support faster sprint qualities."
      },
      {
        icon: Activity,
        title: "Separate conditioning",
        body:
          "Conditioning has its own day so speed work does not turn into fatigue work."
      },
      {
        icon: ShieldCheck,
        title: "Rest rules",
        body:
          "The guide explains how long to rest, when to stop the set and how to protect quality."
      },
      {
        icon: PlayCircle,
        title: "Video demos",
        body:
          "Internal sessions point to demos to reduce confusion around exercise execution."
      }
    ],
    methodTitle: "Sprint logic",
    methodH2: "Speed needs intent, rest and clean mechanics.",
    methodLead:
      "The central rule is simple: for maximal sprint reps, rest about 1 minute for every 10 meters sprinted. If posture, contacts or intent drop, the set is over.",
    methodRows: [
      ["Rest rule", "10m = 1 minute, 20m = 2 minutes, 40m = 4 minutes"],
      ["Quality rule", "Every sprint should look fast, sharp and controlled"],
      ["Stop rule", "Stop if posture breaks, contacts get heavy or speed drops"],
      ["Ball work", "Keep it technical and low to moderate intensity"]
    ],
    previewTitle: "Inside the product",
    previewH2: "Field, strength and speed training inside one clear journey.",
    previewLead:
      "Open the day, follow the session on your phone, watch demonstrations and log the workout in RaptorPro.",
    previewImages: [
      {
        src: "/assets/programs/project-36/project-36-training.jpg",
        alt: "RumoAoPro football training",
        label: "Speed applied to football"
      },
      {
        src: "/assets/programs/project-36/project-36-sprint.jpg",
        alt: "Speed Pro sprint session",
        label: "Real speed exposure"
      },
      {
        src: "/assets/programs/project-36/project-36-coach.jpg",
        alt: "RumoAoPro coach working with athletes",
        label: "Built on the field"
      }
    ],
    sampleTitle: "Session examples",
    sampleH2: "From first-step power to game speed.",
    sampleCards: [
      {
        title: "Acceleration + Plyometrics",
        body: "Phase 1 improves mechanics, useful stiffness and intent over the first meters.",
        image: assets.project36Phase1Day1
      },
      {
        title: "Acceleration Power",
        body: "Sled or hill sprint work builds horizontal force and more aggressive first steps.",
        image: assets.project36Phase2Day1
      },
      {
        title: "Max Velocity + Flying Sprints",
        body: "Top-speed exposure helps the player run faster, smoother and with better rhythm.",
        image: assets.project36Phase3Day1
      }
    ],
    faqTitle: "Quick questions",
    faqH2: "Before buying",
    faqs: [
      {
        question: "Is this program for beginners?",
        answer:
          "It works best for athletes with some training experience. Beginners can use it, but should reduce volume and focus on technique first."
      },
      {
        question: "Do I need a sled?",
        answer:
          "Not necessarily. The material itself suggests hill sprints as an alternative when a sled is not available."
      },
      {
        question: "Can I do ball work with it?",
        answer:
          "Yes, as long as it stays technical and low to moderate intensity. Avoid adding hard small-sided games or extra conditioning."
      },
      {
        question: "Can I use it during the season?",
        answer:
          "This is an offseason program. In-season athletes should reduce volume and place speed work carefully around match days."
      }
    ],
    finalTitle: "Want to run faster? Stop treating sprint like cardio.",
    finalBody:
      "Enter Speed Pro with a clear progression to accelerate, hit top speed and transfer speed into game actions.",
    finalCta: "Buy Speed Pro",
    coachingCta: "I need coaching"
  }
};

export function Project36SalesPage({ locale }: Project36SalesPageProps) {
  const page = copy[locale];
  const checkoutHref =
    locale === "en" ? "/en/checkout/project-36" : shopifyProducts.projeto36;
  const programHref =
    locale === "pt" ? "/programas/projeto-36kmh" : "/en/programs/project-36kmh";
  const reviewGroupKey = getReviewGroupForProgramHref(programHref);

  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader
        navItems={page.nav}
        ctaHref={checkoutHref}
        ctaLabel={page.ctaLabel}
      />

      <section className="relative isolate overflow-hidden bg-[#030806] text-white">
        <Image
          alt="Speed Pro football speed and acceleration training"
          className="absolute inset-0 -z-30 h-full w-full object-cover object-[61%_50%] sm:object-[58%_48%]"
          fill
          priority
          sizes="100vw"
          src="/assets/programs/project-36/project-36-sprint.jpg"
        />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,#030806_0%,rgba(3,8,6,0.96)_37%,rgba(3,8,6,0.48)_67%,rgba(3,8,6,0.16)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,#030806_0%,transparent_38%),radial-gradient(circle_at_76%_48%,rgba(163,230,53,0.16),transparent_30%)]" />
        <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:linear-gradient(rgba(163,230,53,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(163,230,53,0.12)_1px,transparent_1px)] [background-size:58px_58px]" />

        <div className="pointer-events-none absolute -right-4 top-4 hidden font-display text-[20rem] leading-none text-white/[0.035] lg:block">
          36
        </div>

        <div className="mx-auto grid min-h-[calc(88svh-var(--header-height))] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(300px,0.68fr)] lg:px-8 lg:py-16">
          <div className="max-w-3xl py-4 lg:py-10">
            <div className="flex flex-wrap gap-3">
              <p className="inline-flex rounded-md border border-lime-300/40 bg-[#071a10]/75 px-3 py-2 text-sm font-bold uppercase tracking-[0.1em] text-lime-300 backdrop-blur">
                {page.eyebrow}
              </p>
              <Link
                className="focus-ring inline-flex rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold uppercase text-white transition hover:bg-white hover:text-ink"
                href={page.languageHref}
              >
                {page.languageLabel}
              </Link>
            </div>
            <p className="mt-7 text-xs font-black uppercase tracking-[0.32em] text-lime-300/85">
              {locale === "en" ? "Speed development system" : "Sistema de desenvolvimento de velocidade"}
            </p>
            <h1 className="mt-3 max-w-4xl font-display text-4xl uppercase leading-[0.94] sm:text-5xl lg:text-7xl">
              {page.h1}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/76 sm:text-lg">
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
            <div className="mt-7 flex flex-wrap items-end gap-x-5 gap-y-3 border-l-2 border-lime-300 pl-4">
              <div className="min-w-[190px]">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                  {locale === "en" ? "Limited launch offer" : "Oferta de lançamento · tempo limitado"}
                </p>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="text-sm font-bold text-white/45 line-through">R$ 249,90</span>
                  <strong className="font-display text-5xl text-white">R$ 199,90</strong>
                </div>
              </div>
              <p className="max-w-xs text-xs leading-5 text-white/55">
                {locale === "en" ? "One-time payment. Full PT/EN access in RaptorPro." : "Pagamento único. Acesso completo PT/EN dentro do RaptorPro."}
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {page.chips.map((chip) => (
                <span
                  className="rounded-md border border-white/12 bg-black/35 px-3 py-2 text-xs font-bold uppercase text-white/80 backdrop-blur"
                  key={chip}
                >
                  {chip}
                </span>
              ))}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                className="focus-ring inline-flex min-h-14 items-center justify-center gap-2 rounded-md bg-lime-300 px-6 text-sm font-black uppercase text-[#061008] shadow-[0_18px_60px_rgba(163,230,53,0.28)] transition hover:bg-lime-200"
                href={checkoutHref}
              >
                {page.primaryCta}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>
              <Link
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/10 px-5 text-sm font-bold uppercase text-white transition hover:bg-white hover:text-ink"
                href="#fases"
              >
                {page.secondaryCta}
              </Link>
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-white/48">
              {page.storeNote}
            </p>
          </div>
          <div className="relative flex h-full min-h-[480px] items-center justify-end sm:min-h-[560px] lg:min-h-[610px]">
            <ProgramDeviceShowcase
              accent="lime"
              className="max-w-[600px]"
              coverAlt={
                locale === "en"
                  ? "Speed Pro football speed training"
                  : "Treinamento de velocidade do Speed Pro"
              }
              coverEyebrow={
                locale === "en"
                  ? "Speed & acceleration"
                  : "Velocidade & aceleração"
              }
              coverImage={assets.sprintSide}
              coverMeta={
                locale === "en"
                  ? "12 weeks · Field + Gym"
                  : "12 semanas · Campo + Academia"
              }
              coverPosition="object-[62%_50%]"
              coverTitle="Speed Pro"
              screenImage="/assets/programs/raptorpro/speed-pro-workout-mobile.jpg"
              screenAlt={
                locale === "en"
                  ? "Real Speed Pro workout in RaptorPro"
                  : "Treino real do Speed Pro no RaptorPro"
              }
            />
            <div className="absolute bottom-10 left-0 z-20 max-w-[230px] rounded-2xl border border-white/15 bg-black/55 p-4 shadow-2xl backdrop-blur-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-300">
                {locale === "en" ? "Built in 3 phases" : "Construído em 3 fases"}
              </p>
              <p className="mt-2 text-sm font-bold leading-5 text-white">
                {locale === "en" ? "Foundation → Acceleration → Game speed" : "Base → Aceleração → Velocidade de jogo"}
              </p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto grid max-w-7xl grid-cols-3 border-t border-white/10 px-4 sm:px-6 lg:px-8">
          {page.stats.map(([value, label]) => (
            <div className="border-r border-white/10 px-3 py-5 text-center last:border-r-0 sm:py-6" key={label}>
              <p className="font-display text-3xl text-lime-300 sm:text-4xl">{value}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.08em] text-white/48 sm:text-xs">{label}</p>
            </div>
          ))}
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
        />
      ) : null}

      <section className="relative isolate overflow-hidden bg-[#07100b] py-20 text-white">
        <div className="absolute inset-y-0 right-0 -z-30 w-full md:w-[58%]">
          <Image
            alt="RumoAoPro football training"
            className="object-cover object-[58%_45%] opacity-42"
            fill
            sizes="(min-width: 768px) 58vw, 100vw"
            src="/assets/programs/project-36/project-36-training.jpg"
          />
        </div>
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,#07100b_0%,#07100b_46%,rgba(7,16,11,0.88)_66%,rgba(7,16,11,0.36)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,#07100b_0%,transparent_45%,#07100b_100%)] md:hidden" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 md:grid-cols-[0.9fr_1.1fr] md:items-center lg:px-8">
          <div className="max-w-xl">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-lime-300">
              {page.fitTitle}
            </p>
            <h2 className="mt-3 font-display text-4xl uppercase leading-[0.96] text-white sm:text-5xl">
              {page.fitH2}
            </h2>
            <p className="mt-5 text-base leading-8 text-white/68">
              {page.fitLead}
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-lime-300/20 bg-black/42 p-5 backdrop-blur-md">
              <div className="flex items-center gap-2 text-sm font-bold uppercase text-lime-300">
                <BadgeCheck aria-hidden="true" className="h-4 w-4" />
                {page.goodFitLabel}
              </div>
              <ul className="mt-5 space-y-3">
                {page.goodFit.map((item) => (
                  <li className="flex gap-3 text-sm leading-6 text-white/70" key={item}>
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-1 h-4 w-4 shrink-0 text-lime-300"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/42 p-5 backdrop-blur-md">
              <div className="flex items-center gap-2 text-sm font-bold uppercase text-white/60">
                <Target aria-hidden="true" className="h-4 w-4" />
                {page.notFitLabel}
              </div>
              <ul className="mt-5 space-y-3">
                {page.notFit.map((item) => (
                  <li className="flex gap-3 text-sm leading-6 text-white/58" key={item}>
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-1 h-4 w-4 shrink-0 text-white/35"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            </div>
          </div>
          <div className="hidden min-h-[620px] md:block" />
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#030806] py-20 text-white" id="fases">
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/12 blur-[130px]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-lime-300">
              {page.phasesTitle}
            </p>
            <h2 className="mt-3 font-display text-4xl uppercase leading-[0.96] text-white sm:text-5xl">
              {page.phasesH2}
            </h2>
            <p className="mt-5 text-base leading-7 text-white/62">
              {page.phasesLead}
            </p>
          </div>
          <div className="relative mt-12 grid gap-4 lg:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-8 hidden h-px bg-gradient-to-r from-lime-300/20 via-lime-300/80 to-lime-300/20 lg:block" />
            {page.phases.map((phase, index) => (
              <article
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.26)]"
                key={phase.title}
              >
                <span className="absolute -right-2 -top-5 font-display text-8xl text-white/[0.035]">0{index + 1}</span>
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-lime-300/35 bg-[#07130c] font-display text-xl text-lime-300 shadow-[0_0_0_8px_rgba(163,230,53,0.04)]">
                  0{index + 1}
                </div>
                <div className="relative z-10 mt-8">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-lime-300">
                    {phase.weeks}
                  </p>
                  <h3 className="mt-2 text-2xl font-black leading-tight text-white">
                    {phase.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-white/60">
                    {phase.body}
                  </p>
                  <ul className="mt-5 space-y-2">
                    {phase.points.map((point) => (
                      <li className="flex gap-2 text-sm font-semibold text-white/72" key={point}>
                        <Zap
                          aria-hidden="true"
                          className="mt-0.5 h-4 w-4 shrink-0 text-lime-300"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-lime-300">
              {page.includedTitle}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">
              {page.includedH2}
            </h2>
            <div className="relative mt-8 min-h-[540px] overflow-hidden rounded-[2rem] border border-emerald-300/15 bg-[#07100b]">
              <Image
                alt="Coach presenting the Speed Pro training method"
                className="absolute inset-0 h-full w-full object-cover object-center opacity-55"
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                src="/assets/programs/project-36/project-36-coach.jpg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07100b] via-[#07100b]/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-[-84px] flex justify-center">
                <div className="w-[66%] max-w-[290px] scale-[0.78] sm:scale-[0.84]">
                  <RaptorPhoneMockup
                    alt={locale === "en" ? "Real workout inside RaptorPro" : "Treino real dentro do RaptorPro"}
                    className="w-full"
                    src={raptorAppScreens.workout}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {page.included.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  className="rounded-lg border border-white/10 bg-white/[0.06] p-5"
                  key={item.title}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-lime-400 text-ink">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/68">
                    {item.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[0.8fr_1.2fr] md:items-start lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-signal">
              {page.methodTitle}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-4xl">
              {page.methodH2}
            </h2>
            <p className="mt-5 text-base leading-8 text-graphite/74">
              {page.methodLead}
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border border-ink/10 bg-smoke">
            {page.methodRows.map(([label, body]) => (
              <div
                className="grid gap-3 border-b border-ink/10 p-5 last:border-b-0 sm:grid-cols-[0.34fr_1fr]"
                key={label}
              >
                <p className="flex items-center gap-2 text-sm font-bold uppercase text-ink">
                  <Gauge aria-hidden="true" className="h-4 w-4 text-signal" />
                  {label}
                </p>
                <p className="text-sm leading-6 text-graphite/72">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#030806] py-20 text-white">
        <div className="absolute inset-y-0 right-0 -z-30 w-full lg:w-[56%]">
          <Image
            alt="Speed Pro speed session"
            className="object-cover object-[62%_50%] opacity-30"
            fill
            sizes="(min-width: 1024px) 56vw, 100vw"
            src="/assets/programs/project-36/project-36-sprint.jpg"
          />
        </div>
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,#030806_0%,#030806_48%,rgba(3,8,6,0.83)_70%,rgba(3,8,6,0.35)_100%)]" />
        <div className="absolute inset-0 -z-10 opacity-[0.1] [background-image:linear-gradient(rgba(163,230,53,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(163,230,53,0.12)_1px,transparent_1px)] [background-size:52px_52px]" />

        <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-lime-300">
              {page.previewTitle}
            </p>
            <h2 className="mt-3 font-display text-4xl uppercase leading-[0.96] text-white sm:text-5xl">
              {page.previewH2}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/64">
              {page.previewLead}
            </p>

            <div className="mt-9 grid gap-3">
              {[
                locale === "en" ? ["01", "Open your week", "See every field, gym, conditioning and recovery day in order."] : ["01", "Abra sua semana", "Veja campo, academia, condicionamento e recuperação na ordem certa."],
                locale === "en" ? ["02", "Follow the session", "Coach notes, exercise demos and clear rest instructions stay inside the workout."] : ["02", "Siga a sessão", "Notas, demonstrações e descansos ficam dentro do próprio treino."],
                locale === "en" ? ["03", "Track the work", "Log readiness, RPE and duration without leaving RaptorPro."] : ["03", "Registre o trabalho", "Salve readiness, RPE e duração sem sair do RaptorPro."]
              ].map(([step, title, body]) => (
                <article className="flex gap-4 rounded-xl border border-white/10 bg-black/38 p-4 backdrop-blur" key={step}>
                  <span className="font-display text-2xl text-lime-300">{step}</span>
                  <div>
                    <h3 className="text-base font-black text-white">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-white/55">{body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="relative mx-auto min-h-[620px] w-full max-w-[700px] sm:min-h-[700px]">
            <div className="absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(163,230,53,0.2),rgba(16,185,129,0.08)_46%,transparent_72%)] blur-2xl" />
            <div className="absolute left-[1%] top-[20%] z-10 w-[38%] -rotate-6 opacity-70 sm:left-[5%]">
              <RaptorPhoneMockup
                alt={locale === "en" ? "Real athlete calendar in RaptorPro" : "Calendário real do atleta no RaptorPro"}
                className="w-full"
                src={raptorAppScreens.calendar}
              />
            </div>
            <div className="absolute left-1/2 top-[3%] z-30 w-[44%] -translate-x-1/2">
              <RaptorPhoneMockup
                alt={locale === "en" ? "Real readiness screen in RaptorPro" : "Tela real de prontidão no RaptorPro"}
                className="w-full"
                src={raptorAppScreens.readiness}
              />
            </div>
            <div className="absolute right-[1%] top-[20%] z-20 w-[38%] rotate-6 opacity-85 sm:right-[5%]">
              <RaptorPhoneMockup
                alt={locale === "en" ? "Real Speed Pro workout in RaptorPro" : "Treino real do Speed Pro no RaptorPro"}
                className="w-full"
                src={raptorAppScreens.workout}
              />
            </div>
            <div className="absolute bottom-[7%] left-[3%] z-40 max-w-[260px] rounded-2xl border border-lime-300/20 bg-[#07100b]/92 p-5 shadow-2xl backdrop-blur-xl sm:left-[8%]">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-300">
                {locale === "en" ? "Not another PDF" : "Não é mais um PDF"}
              </p>
              <p className="mt-2 text-lg font-black leading-6 text-white">
                {locale === "en" ? "The full 12-week system lives in your pocket." : "O sistema completo de 12 semanas fica no seu bolso."}
              </p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 border-t border-white/10 pt-10 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-lime-300">{page.sampleTitle}</p>
              <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-white sm:text-4xl">{page.sampleH2}</h2>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {page.sampleCards.map((card, index) => (
              <article className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.055] p-6" key={card.title}>
                <span className="absolute -right-1 -top-5 font-display text-7xl text-white/[0.035]">0{index + 1}</span>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-300">
                  {locale === "en" ? `Phase ${index + 1}` : `Fase ${index + 1}`}
                </p>
                <h3 className="mt-3 text-xl font-black text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/58">{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-smoke py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[0.65fr_1.35fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-signal">
              {page.faqTitle}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase text-ink sm:text-4xl">
              {page.faqH2}
            </h2>
          </div>
          <div className="grid gap-4">
            {page.faqs.map((faq) => (
              <article
                className="rounded-lg border border-ink/10 bg-white p-5"
                key={faq.question}
              >
                <h3 className="text-base font-bold text-ink">{faq.question}</h3>
                <p className="mt-3 text-sm leading-6 text-graphite/72">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-14 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-lime-300">
              Speed Pro
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">
              {page.finalTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
              {page.finalBody}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <a
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-lime-400 px-5 text-sm font-bold uppercase text-ink transition hover:bg-lime-300"
              href={checkoutHref}
            >
              {page.finalCta}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
            <Link
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-white/15 px-5 text-sm font-bold uppercase text-white transition hover:bg-white hover:text-ink"
              href={locale === "en" ? "/en/coaching#application" : "/assessoria#aplicacao"}
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
