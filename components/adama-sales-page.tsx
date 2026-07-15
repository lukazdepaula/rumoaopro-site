import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  Flame,
  Globe2,
  Languages,
  LineChart,
  PlayCircle,
  ShieldCheck,
  Target,
  Trophy,
  Zap
} from "lucide-react";
import { ReviewBadge, ReviewsSection } from "@/components/reviews";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { assets, nav, shopifyProducts, successCases } from "@/lib/content";
import { getReviewGroupForProgramHref } from "@/lib/reviews";

type AdamaSalesPageProps = {
  locale: "pt" | "en";
};

const copy = {
  pt: {
    nav: nav.pt,
    ctaLabel: "Comprar",
    languageHref: "/en/programs/adama-strength-power",
    languageLabel: "🇺🇸 English",
    eyebrow: "Adama Offseason Strength & Power",
    h1: "Construa força real para voltar mais potente ao campo.",
    lead:
      "Um programa de 12 semanas para atletas de futebol que querem transformar a offseason em ganho de força, potência, velocidade e presença física.",
    primaryCta: "Comprar programa",
    secondaryCta: "Ver estrutura",
    storeNote: "Compra finalizada pela loja RumoAoPro.",
    chips: ["12 semanas", "3 fases", "Gym + field", "PT + EN"],
    coverStatLabel: "semanas para construir força, potência e velocidade",
    stats: [
      ["3", "fases progressivas"],
      ["12", "semanas de offseason"],
      ["5-6", "dias de treino por semana"]
    ],
    fitTitle: "Para quem é o Adama Project",
    fitH2: "Offseason feita para jogador treinado.",
    fitLead:
      "Esse não é um PDF solto. É uma progressão de offseason para atleta treinado que quer organizar a academia, o campo e a preparação física em uma mesma lógica.",
    goodFitLabel: "Boa escolha",
    notFitLabel: "Melhor escolher assessoria",
    goodFit: [
      "Atletas com acesso a academia e campo",
      "Jogadores em offseason ou pre-temporada distante",
      "Quem quer ganhar força sem ficar pesado ou lento",
      "Quem precisa de velocidade, potência e condicionamento como suporte"
    ],
    notFit: [
      "Atleta voltando de lesão sem liberação",
      "Iniciante total sem experiência de treino",
      "Quem precisa de ajustes semanais individualizados",
      "Quem não consegue treinar pelo menos 4 vezes na semana"
    ],
    phasesTitle: "3 fases para construir, carregar e chegar pronto",
    phasesH2: "Construa a base. Aumente a força. Chegue pronto.",
    phasesLead:
      "Cada fase tem foco próprio, regras de carga, semanas de progressão e uma semana de ajuste para o corpo absorver o trabalho.",
    phases: [
      {
        title: "Phase 1 - Athletic Foundation",
        weeks: "Semanas 1-4",
        image: assets.adamaPhase1Overview,
        body:
          "Constrói a base: força full-body, hipertrofia útil, posterior, adutores, mecânica de aceleração e suporte aeróbico.",
        points: [
          "Squat load +5 a 10%",
          "Sprint exposure 2x/semana",
          "Semana 4 como reload"
        ]
      },
      {
        title: "Phase 2 - Force Development",
        weeks: "Semanas 5-8",
        image: assets.adamaPhase2Overview,
        body:
          "Aumenta a carga: força específica para futebol, produção de força nos levantamentos principais, potência unilateral, top speed e mudança de direção.",
        points: [
          "Main lift load +5 a 8%",
          "Mais força sem perder qualidade",
          "Semana 8 como reload"
        ]
      },
      {
        title: "Phase 3 - Strength & Power Peak",
        weeks: "Semanas 9-12",
        image: assets.adamaPhase3Overview,
        body:
          "Faz o atleta chegar pronto: pico de força, potência explosiva, repeated sprint ability, aerobic power e taper final.",
        points: [
          "Week 11 mais intensa",
          "Week 12 taper/reload",
          "Chegar pronto, não destruído"
        ]
      }
    ],
    includedTitle: "O que você recebe",
    includedH2: "Tudo que o atleta precisa para executar.",
    included: [
      {
        icon: CalendarDays,
        title: "12 semanas organizadas",
        body:
          "Um plano completo dividido em fases, com lógica de progressão e semanas de ajuste."
      },
      {
        icon: Dumbbell,
        title: "Treinos de academia",
        body:
          "Sessões de força, potência, posterior, upper body, full body e trabalho unilateral."
      },
      {
        icon: Zap,
        title: "Sessões de campo",
        body:
          "Aceleração, top speed, re-aceleração, mudança de direção e condicionamento específico."
      },
      {
        icon: PlayCircle,
        title: "Demos e instruções",
        body:
          "Referências de execução, aquecimentos e notas de coach para saber como aplicar cada sessão."
      },
      {
        icon: LineChart,
        title: "Progressão de carga",
        body:
          "Semanas desenhadas para aumentar força e potência sem transformar tudo em fadiga."
      },
      {
        icon: ShieldCheck,
        title: "Regras de fase",
        body:
          "Orientações para controlar intensidade, manter qualidade e respeitar reload/taper."
      }
    ],
    methodTitle: "A lógica do programa",
    methodH2:
      "Força e potência primeiro. O resto entra para servir o futebol.",
    methodLead:
      "Força e potência são prioridade. Velocidade, aeróbico e condicionamento entram como suporte para o jogador chegar mais forte, mais rápido e mais disponível.",
    methodRows: [
      ["Gym", "Construção de força, potência e estabilidade"],
      ["Field", "Aceleração, velocidade máxima e mudança de direção"],
      ["Conditioning", "Suporte aeróbico sem roubar potência"],
      ["Reload", "Semanas de ajuste para absorver a carga"]
    ],
    fieldTitle: "Do peso ao campo",
    fieldH2: "O programa não termina no agachamento.",
    fieldLead:
      "O Adama usa a academia para construir força e potência, mas sempre com intenção de futebol: acelerar melhor, sustentar contato, repetir ações e chegar mais disponível para treinar e competir.",
    fieldCards: [
      ["Strength", "Base para duelo, desaceleração e potência"],
      ["Speed", "Exposição de aceleração e velocidade máxima"],
      ["Conditioning", "Suporte para repetir ações sem perder qualidade"]
    ],
    successTitle: "Casos de sucesso",
    successH2: "O método já aparece em atletas reais.",
    successLead:
      "A lógica do Adama nasce do mesmo princípio aplicado na assessoria: força útil, velocidade, consistência e preparação física conectada ao calendário do futebol.",
    authorityTitle: "Programado por quem trabalha com futebol real",
    authorityH2: "Criado por Lukaz de Paula.",
    authorityLogoLabel: "Experiência em performance",
    authorityBody:
      "Preparador físico com licença CBF A em Strength & Conditioning, experiência em FC Málaga City, CD Almuñécar City, Lindsey Wilson University e Extratime Performance. Além de treinador, Lukaz também viveu o jogo como atleta. Essa mistura importa: o programa foi desenhado por alguém que entende a exigência física e também sabe como o atleta sente o treino no corpo.",
    authorityMiniTitle: "Visão de treinador + atleta",
    authorityMiniBody:
      "Criado a partir da academia, do campo e da rotina real de um jogador de futebol.",
    authorityStats: [
      ["CBF A", "licença aplicada à preparação física no futebol"],
      ["4 países", "Brasil, EUA, Arábia Saudita e Espanha"],
      ["Coach + atleta", "visão de treinador e experiência de atleta"]
    ],
    caseLabel: "Caso RumoAoPro",
    faqTitle: "Perguntas rápidas",
    faqH2: "Antes de comprar",
    faqs: [
      {
        question: "O programa é individualizado?",
        answer:
          "Não. Ele é um programa pronto de 12 semanas. Se você precisa de ajuste semanal, controle de carga e adaptação ao calendário, o ideal é aplicar para a assessoria."
      },
      {
        question: "Preciso de academia?",
        answer:
          "Sim. O Adama foi feito para atletas com acesso a academia e espaço de campo para velocidade e condicionamento."
      },
      {
        question: "Serve para voltar de lesão?",
        answer:
          "Não é a primeira escolha para retorno de lesão. Nesse caso, use um programa específico de retorno ou aplique para uma avaliação individual."
      },
      {
        question: "Tem versão em inglês e português?",
        answer:
          "A página já nasce bilíngue e a linha Adama será organizada para venda nos dois idiomas."
      }
    ],
    finalTitle: "Pronto para construir a offseason?",
    finalBody:
      "Se você quer uma estrutura forte, direta e feita para futebol, o Adama é o ponto de partida premium da coleção RumoAoPro.",
    finalCta: "Comprar Adama Project",
    coachingCta: "Preciso de assessoria"
  },
  en: {
    nav: nav.en,
    ctaLabel: "Buy",
    languageHref: "/programas/adama-strength-power",
    languageLabel: "🇧🇷 Português",
    eyebrow: "Adama Offseason Strength & Power",
    h1: "Build real strength so you return to the field more powerful.",
    lead:
      "A 12-week football offseason program for players who want to build strength, power, speed exposure and physical presence.",
    primaryCta: "Buy program",
    secondaryCta: "See structure",
    storeNote: "Checkout runs through the RumoAoPro store.",
    chips: ["12 weeks", "3 phases", "Gym + field", "EN + PT"],
    coverStatLabel: "weeks to build strength, power and speed",
    stats: [
      ["3", "progressive phases"],
      ["12", "offseason weeks"],
      ["5-6", "training days per week"]
    ],
    fitTitle: "Who the Adama Project is for",
    fitH2: "An offseason built for trained football players.",
    fitLead:
      "This is not a loose PDF. It is an offseason progression for trained football players who want gym work, field work and physical preparation connected in one system.",
    goodFitLabel: "Good fit",
    notFitLabel: "Better choose coaching",
    goodFit: [
      "Players with gym and field access",
      "Footballers in offseason or early pre-season prep",
      "Players who want strength without becoming slow",
      "Athletes who need speed, power and conditioning as support"
    ],
    notFit: [
      "Players returning from injury without clearance",
      "Complete beginners with no training background",
      "Players who need weekly individual adjustments",
      "Athletes who cannot train at least 4 times per week"
    ],
    phasesTitle: "3 phases to build, load and arrive ready",
    phasesH2: "Build the base. Load the machine. Arrive ready.",
    phasesLead:
      "Each phase has its own focus, loading rules, progression weeks and a deload/taper strategy so the body can absorb the work.",
    phases: [
      {
        title: "Phase 1 - Athletic Foundation",
        weeks: "Weeks 1-4",
        image: assets.adamaPhase1Overview,
        body:
          "Build the base: full-body strength, useful hypertrophy, posterior chain, adductors, acceleration mechanics and aerobic support.",
        points: [
          "Squat load +5 to 10%",
          "Sprint exposure 2x/week",
          "Week 4 as reload"
        ]
      },
      {
        title: "Phase 2 - Force Development",
        weeks: "Weeks 5-8",
        image: assets.adamaPhase2Overview,
        body:
          "Load the machine: football-specific strength, force production in main lifts, unilateral power, top speed and change of direction.",
        points: [
          "Main lift load +5 to 8%",
          "Heavier strength without losing quality",
          "Week 8 as reload"
        ]
      },
      {
        title: "Phase 3 - Strength & Power Peak",
        weeks: "Weeks 9-12",
        image: assets.adamaPhase3Overview,
        body:
          "Arrive ready: peak strength, explosive power, repeated sprint ability, aerobic power and final taper.",
        points: [
          "Week 11 is the hardest",
          "Week 12 taper/reload",
          "Arrive ready, not destroyed"
        ]
      }
    ],
    includedTitle: "What you get",
    includedH2: "Everything the player needs to execute.",
    included: [
      {
        icon: CalendarDays,
        title: "12 organized weeks",
        body:
          "A complete plan split into phases, with progression logic and reload weeks."
      },
      {
        icon: Dumbbell,
        title: "Gym sessions",
        body:
          "Strength, power, posterior chain, upper body, full body and unilateral work."
      },
      {
        icon: Zap,
        title: "Field sessions",
        body:
          "Acceleration, top speed, re-acceleration, change of direction and football conditioning."
      },
      {
        icon: PlayCircle,
        title: "Demos and instructions",
        body:
          "Execution references, warm-ups and coach notes to understand each session."
      },
      {
        icon: LineChart,
        title: "Loading progression",
        body:
          "Weeks designed to raise strength and power without turning everything into fatigue."
      },
      {
        icon: ShieldCheck,
        title: "Phase rules",
        body:
          "Guidance to control intensity, keep quality high and respect reload/taper weeks."
      }
    ],
    methodTitle: "The training logic",
    methodH2:
      "Strength and power first. Everything else supports football performance.",
    methodLead:
      "Strength and power stay the priority. Speed, aerobic support and conditioning are added to help the player arrive stronger, faster and more available.",
    methodRows: [
      ["Gym", "Build strength, power and stability"],
      ["Field", "Acceleration, max velocity and change of direction"],
      ["Conditioning", "Aerobic support without stealing power"],
      ["Reload", "Adjustment weeks to absorb the workload"]
    ],
    fieldTitle: "From weight room to pitch",
    fieldH2: "The program does not end with the squat.",
    fieldLead:
      "Adama uses the gym to build strength and power, but the intent stays connected to football: accelerate better, handle contact, repeat actions and arrive more available for training and competition.",
    fieldCards: [
      ["Strength", "Base for duels, deceleration and power"],
      ["Speed", "Acceleration and max velocity exposure"],
      ["Conditioning", "Support to repeat actions without losing quality"]
    ],
    successTitle: "Success cases",
    successH2: "The method already shows up with real players.",
    successLead:
      "Adama follows the same logic used inside online coaching: useful strength, speed, consistency and physical preparation connected to the football calendar.",
    authorityTitle: "Built by someone working in real football",
    authorityH2: "Created by Lukaz de Paula.",
    authorityLogoLabel: "Performance background",
    authorityBody:
      "CBF A licensed strength and conditioning coach with experience at FC Málaga City, CD Almuñécar City, Lindsey Wilson University and Extratime Performance. Lukaz also lived the game as a player. That mix matters: the program was built by someone who understands football demands and knows what the athlete feels inside the training process.",
    authorityMiniTitle: "Coach + player perspective",
    authorityMiniBody:
      "Built from the weight room, the field and the real routine of a football player.",
    authorityStats: [
      ["CBF A", "football strength and conditioning background"],
      ["4 countries", "Brazil, USA, Saudi Arabia and Spain"],
      ["Coach + player", "coaching eye with player experience"]
    ],
    caseLabel: "RumoAoPro case",
    faqTitle: "Quick questions",
    faqH2: "Before you buy",
    faqs: [
      {
        question: "Is the program individualized?",
        answer:
          "No. This is a ready-to-follow 12-week program. If you need weekly adjustments, load monitoring and calendar adaptation, online coaching is the better option."
      },
      {
        question: "Do I need gym access?",
        answer:
          "Yes. Adama was built for players with gym access and enough field space for speed and conditioning work."
      },
      {
        question: "Is it for return from injury?",
        answer:
          "It is not the first choice for injury return. In that case, use a specific return-to-play product or apply for individual screening."
      },
      {
        question: "Is there an English and Portuguese version?",
        answer:
          "The sales page is bilingual and the Adama line is being organized for both languages."
      }
    ],
    finalTitle: "Ready to build your offseason?",
    finalBody:
      "If you want a strong, direct and football-specific structure, Adama is the premium starting point in the RumoAoPro collection.",
    finalCta: "Buy Adama Project",
    coachingCta: "I need coaching"
  }
};

const adamaGallery = [
  {
    src: assets.adamaSprintFront,
    alt: "Football player sprinting forward on the field",
    label: "Acceleration"
  },
  {
    src: assets.adamaFieldPlay,
    alt: "Lukaz de Paula training on the field",
    label: "Football transfer"
  }
];

const authorityLogos = [
  { name: "CBF A", image: assets.logoCbf },
  { name: "FC Malaga City", image: assets.logoMalagaCity },
  { name: "CD Almunecar City", image: assets.logoAlmunecar },
  { name: "Lindsey Wilson", image: assets.logoLindseyWilson },
  { name: "Extratime", image: assets.logoExtratime, tone: "light" }
];

export function AdamaSalesPage({ locale }: AdamaSalesPageProps) {
  const page = copy[locale];
  const selectedSuccessCases = successCases[locale].slice(0, 3);
  const coachingHref =
    locale === "pt" ? "/assessoria#aplicacao" : "/en/coaching#application";
  const programHref =
    locale === "pt"
      ? "/programas/adama-strength-power"
      : "/en/programs/adama-strength-power";
  const reviewGroupKey = getReviewGroupForProgramHref(programHref);

  return (
    <main className="min-h-screen bg-[#070708]">
      <SiteHeader
        navItems={page.nav}
        ctaHref={shopifyProducts.adama}
        ctaLabel={page.ctaLabel}
      />

      <section className="relative isolate overflow-hidden bg-[#050506] text-white">
        <Image
          alt="Football player sprinting during Adama Project training"
          className="absolute inset-0 -z-30 h-full w-full object-cover object-[58%_center] opacity-24"
          fill
          priority
          sizes="100vw"
          src={assets.adamaSprintSide}
        />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_82%_18%,rgba(231,18,38,0.48),transparent_31%),radial-gradient(circle_at_12%_82%,rgba(255,210,94,0.14),transparent_28%),linear-gradient(90deg,#050506_0%,rgba(5,5,6,0.96)_42%,rgba(5,5,6,0.74)_100%)]" />
        <div className="absolute inset-0 -z-10 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.13)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.13)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute left-[-8%] top-16 -z-10 hidden h-[640px] w-32 -rotate-[18deg] bg-signal/50 blur-[2px] lg:block" />
        <div className="absolute bottom-0 left-0 right-0 -z-10 h-28 bg-gradient-to-t from-[#070708] to-transparent" />

        <div className="mx-auto grid min-h-[calc(92svh-var(--header-height))] max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.96fr_1.04fr] lg:items-center lg:px-8">
          <div className="relative z-10">
            <div className="flex flex-wrap gap-3">
              <p className="inline-flex rounded-md border border-signal/60 bg-signal/20 px-3 py-2 text-sm font-bold uppercase text-white shadow-[0_0_28px_rgba(231,18,38,0.22)]">
                {page.eyebrow}
              </p>
              <Link
                className="focus-ring inline-flex rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold uppercase text-white transition hover:bg-white hover:text-ink"
                href={page.languageHref}
              >
                {page.languageLabel}
              </Link>
            </div>
            <p className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.26em] text-gold/90">
              <Flame aria-hidden="true" className="h-4 w-4 text-signal" />
              RumoAoPro original program
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl uppercase leading-[0.98] text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.42)] sm:text-5xl lg:text-7xl">
              {page.h1}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
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
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-signal px-5 py-3 text-sm font-bold text-white shadow-[0_16px_48px_rgba(231,18,38,0.38)] transition hover:bg-[#b90f20]"
                href={shopifyProducts.adama}
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
                  className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-xs font-bold uppercase text-white/70 backdrop-blur"
                  key={chip}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[600px] py-6 lg:min-h-[690px]">
            <div className="absolute left-0 top-8 hidden w-[38%] -rotate-6 overflow-hidden rounded-lg border border-white/10 bg-black/50 shadow-[0_24px_70px_rgba(0,0,0,0.54)] sm:block">
              <Image
                alt="Lukaz de Paula playing football"
                className="aspect-[4/5] w-full object-cover object-[48%_center] opacity-85"
                height={980}
                src={assets.adamaFieldPlay}
                width={720}
              />
            </div>
            <div className="absolute bottom-12 right-0 hidden w-[38%] rotate-3 rounded-lg border border-signal/35 bg-black/70 p-5 shadow-[0_24px_70px_rgba(231,18,38,0.18)] backdrop-blur md:block">
              <p className="font-display text-5xl uppercase text-signal">12</p>
              <p className="mt-1 text-xs font-bold uppercase leading-5 tracking-[0.22em] text-white/55">
                {page.coverStatLabel}
              </p>
            </div>
            <div className="relative mx-auto w-[82%] max-w-[430px] overflow-hidden rounded-lg border border-white/18 bg-[linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.02))] p-3 shadow-[0_34px_110px_rgba(0,0,0,0.72)]">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-signal to-transparent" />
              <Image
                alt="The Adama Project cover"
                className="aspect-[4/5] w-full rounded-md object-cover"
                height={1200}
                priority
                src={assets.adamaCover}
                width={960}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {page.stats.map(([value, label]) => (
                <div
                  className="rounded-lg border border-white/10 bg-black/45 p-4 text-center backdrop-blur"
                  key={label}
                >
                  <p className="font-display text-2xl uppercase text-signal">
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

      <section className="bg-[#070708] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-signal">
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
            <div className="rounded-lg border border-signal/30 bg-signal/[0.08] p-5 shadow-[0_18px_70px_rgba(231,18,38,0.12)]">
              <p className="text-sm font-bold uppercase text-signal">
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
                      className="mt-1 h-4 w-4 shrink-0 text-signal"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0b0b0d] py-16 text-white">
        <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="absolute right-[-12%] top-[-18%] h-72 w-72 rounded-full bg-signal/25 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-9 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-gold">
              <Globe2 aria-hidden="true" className="mr-2 inline h-4 w-4" />
              {page.fieldTitle}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-white sm:text-5xl">
              {page.fieldH2}
            </h2>
            <p className="mt-5 text-base leading-8 text-white/68">
              {page.fieldLead}
            </p>
            <div className="mt-7 grid gap-3">
              {page.fieldCards.map(([label, body]) => (
                <div
                  className="grid gap-2 border-l-2 border-signal bg-white/[0.045] p-4 sm:grid-cols-[130px_1fr]"
                  key={label}
                >
                  <p className="font-display text-xl uppercase text-signal">
                    {label}
                  </p>
                  <p className="text-sm leading-6 text-white/70">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {adamaGallery.map((photo) => (
              <figure
                className="group relative overflow-hidden rounded-lg border border-white/10 bg-black shadow-[0_22px_60px_rgba(0,0,0,0.34)]"
                key={photo.src}
              >
                <Image
                  alt={photo.alt}
                  className="aspect-[5/6] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  height={1080}
                  src={photo.src}
                  width={810}
                />
                <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/68 to-transparent p-4">
                  <span className="inline-flex rounded-md bg-signal px-2.5 py-1 text-xs font-bold uppercase text-white">
                    {photo.label}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 text-white" id="estrutura">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-gold">
              <LayersIcon />
              {page.phasesTitle}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">
              {page.phasesH2}
            </h2>
            <p className="mt-5 text-base leading-8 text-white/70">
              {page.phasesLead}
            </p>
          </div>

          <div className="mt-9 grid gap-5 lg:grid-cols-3">
            {page.phases.map((phase) => (
              <article
                className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.06]"
                key={phase.title}
              >
                <Image
                  alt={phase.title}
                  className="aspect-[4/5] w-full object-cover object-top"
                  height={1180}
                  src={phase.image}
                  width={900}
                />
                <div className="p-5">
                  <p className="text-xs font-bold uppercase text-signal">
                    {phase.weeks}
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-white">
                    {phase.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/66">
                    {phase.body}
                  </p>
                  <ul className="mt-5 space-y-3">
                    {phase.points.map((point) => (
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
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#111114_0%,#070708_52%,#26060b_100%)] py-16 text-white">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal to-transparent" />
        <div className="absolute left-[-10%] top-1/3 h-56 w-56 rounded-full bg-signal/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-signal">
              <Languages aria-hidden="true" className="mr-2 inline h-4 w-4" />
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
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-signal text-white shadow-[0_0_30px_rgba(231,18,38,0.25)]">
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

      <section className="bg-[#070708] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-signal">
              <Activity aria-hidden="true" className="mr-2 inline h-4 w-4" />
              {page.methodTitle}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-white sm:text-4xl">
              {page.methodH2}
            </h2>
            <p className="mt-5 text-base leading-8 text-white/68">
              {page.methodLead}
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            {page.methodRows.map(([label, body]) => (
              <div
                className="grid gap-2 border-b border-white/10 p-5 last:border-b-0 sm:grid-cols-[210px_1fr]"
                key={label}
              >
                <p className="font-display text-lg uppercase text-signal sm:text-xl">
                  {label}
                </p>
                <p className="text-sm leading-6 text-white/70">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#050506] py-16 text-white">
        <div className="absolute inset-0 opacity-[0.10] [background-image:linear-gradient(135deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="absolute bottom-[-18%] right-[-8%] h-96 w-96 rounded-full bg-signal/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase text-gold">
                <Trophy aria-hidden="true" className="mr-2 inline h-4 w-4" />
                {page.authorityTitle}
              </p>
              <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">
                {page.authorityH2}
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/70">
                {page.authorityBody}
              </p>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {page.authorityStats.map(([value, label]) => (
                <div
                  className="rounded-lg border border-white/10 bg-white/[0.055] p-4"
                  key={value}
                >
                  <BadgeCheck
                    aria-hidden="true"
                    className="mb-3 h-5 w-5 text-signal"
                  />
                  <p className="font-display text-2xl uppercase text-white">
                    {value}
                  </p>
                  <p className="mt-2 text-xs font-bold uppercase leading-5 text-white/50">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-white/52">
              <Building2 aria-hidden="true" className="h-4 w-4 text-signal" />
              {page.authorityLogoLabel}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {authorityLogos.map((logo) => (
                <div
                  className="flex min-h-20 items-center justify-center rounded-md border border-white/10 bg-white/[0.035] p-3"
                  key={logo.name}
                >
                  <Image
                    alt={logo.name}
                    className={`max-h-14 w-auto object-contain ${
                      "tone" in logo && logo.tone === "light"
                        ? "brightness-0 invert"
                        : ""
                    }`}
                    height={92}
                    src={logo.image}
                    width={140}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#101012] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase text-signal">
                {page.successTitle}
              </p>
              <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-white sm:text-4xl">
                {page.successH2}
              </h2>
            </div>
            <p className="max-w-3xl text-base leading-8 text-white/66">
              {page.successLead}
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {selectedSuccessCases.map((item) => (
              <article
                className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] shadow-[0_22px_70px_rgba(0,0,0,0.24)]"
                key={item.name}
              >
                <Image
                  alt={item.name}
                  className="aspect-[4/3] w-full object-cover"
                  height={840}
                  src={item.image}
                  width={1120}
                />
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.20em] text-signal">
                    {page.caseLabel}
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-white">
                    {item.name}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/66">
                    {item.quote}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0b0b0d] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-signal">
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

      <section className="relative overflow-hidden bg-[#050506] py-14 text-white">
        <Image
          alt="Adama Project strength and power cover background"
          className="absolute inset-0 h-full w-full object-cover object-[62%_center] opacity-24"
          fill
          sizes="100vw"
          src={assets.adamaCover}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#050506_0%,rgba(5,5,6,0.90)_52%,rgba(231,18,38,0.52)_100%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-white/75">
              Adama Project
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
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-signal px-5 py-3 text-sm font-bold text-white shadow-[0_16px_48px_rgba(231,18,38,0.36)] transition hover:bg-[#b90f20]"
              href={shopifyProducts.adama}
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

function LayersIcon() {
  return <Dumbbell aria-hidden="true" className="mr-2 inline h-4 w-4" />;
}
