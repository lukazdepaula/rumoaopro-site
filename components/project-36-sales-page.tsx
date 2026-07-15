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
  Trophy,
  Zap
} from "lucide-react";
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
    eyebrow: "Project 36km/h",
    h1: "Construa aceleração, velocidade máxima e ação de jogo em 12 semanas.",
    lead:
      "Um sistema de offseason para jogadores de futebol que querem melhorar aceleração, top speed, re-aceleração e velocidade aplicada ao jogo.",
    primaryCta: "Comprar Projeto 36",
    secondaryCta: "Ver fases",
    storeNote: "Compra finalizada pela loja RumoAoPro.",
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
      ["37", "paginas nos 3 PDFs"]
    ],
    fitTitle: "Para quem é",
    fitH2: "Feito para atleta que precisa correr melhor, não só cansar mais.",
    fitLead:
      "O Projeto 36 organiza velocidade como qualidade neural: descanso suficiente, intenção máxima, mecânica limpa e progressão entre campo, academia e condicionamento.",
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
    includedH2: "PDF visual, progressão clara e regras para sprintar com intenção.",
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
    previewH2: "O Projeto 36 já chega com visual forte e páginas práticas.",
    previewLead:
      "A galeria mostra as páginas reais do material: visão das fases, regras de descanso e exemplos de sessão.",
    previewImages: [
      {
        src: assets.project36HowToUse,
        alt: "Pagina Start Here do Projeto 36km/h",
        label: "How to use"
      },
      {
        src: assets.project36RestRules,
        alt: "Regras de descanso de sprint do Projeto 36km/h",
        label: "Sprint rest rules"
      },
      {
        src: assets.project36Phase1Day1,
        alt: "Sessao Day 1 Acceleration + Plyometrics do Projeto 36km/h",
        label: "Field session"
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
      "Entre no Projeto 36 com uma progressão clara para acelerar, atingir top speed e transferir velocidade para ações de jogo.",
    finalCta: "Comprar Projeto 36",
    coachingCta: "Quero algo individual"
  },
  en: {
    nav: nav.en,
    ctaLabel: "Buy",
    languageHref: "/programas/projeto-36kmh",
    languageLabel: "🇺🇸 EN → PT",
    eyebrow: "Project 36km/h",
    h1: "Build acceleration, max velocity and game-speed actions in 12 weeks.",
    lead:
      "An offseason system for footballers who want to improve acceleration, top speed, re-acceleration and speed that shows up in the game.",
    primaryCta: "Buy Project 36",
    secondaryCta: "See phases",
    storeNote: "Checkout runs through the RumoAoPro store.",
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
      ["37", "pages across 3 PDFs"]
    ],
    fitTitle: "Who it is for",
    fitH2: "Built for players who need to run better, not just suffer more.",
    fitLead:
      "Project 36 organizes speed as a nervous system quality: enough rest, maximal intent, clean mechanics and progression between field, gym and conditioning.",
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
    includedH2: "A visual PDF system with clear progression and speed rules.",
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
    previewH2: "Project 36 already feels like a premium training guide.",
    previewLead:
      "The gallery shows real pages from the material: phase overview, sprint rest rules and sample sessions.",
    previewImages: [
      {
        src: assets.project36HowToUse,
        alt: "Project 36km/h Start Here page",
        label: "How to use"
      },
      {
        src: assets.project36RestRules,
        alt: "Project 36km/h sprint rest rules page",
        label: "Sprint rest rules"
      },
      {
        src: assets.project36Phase1Day1,
        alt: "Project 36km/h Day 1 acceleration and plyometrics session",
        label: "Field session"
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
      "Enter Project 36 with a clear progression to accelerate, hit top speed and transfer speed into game actions.",
    finalCta: "Buy Project 36",
    coachingCta: "I need coaching"
  }
};

export function Project36SalesPage({ locale }: Project36SalesPageProps) {
  const page = copy[locale];
  const programHref =
    locale === "pt" ? "/programas/projeto-36kmh" : "/en/programs/project-36kmh";
  const reviewGroupKey = getReviewGroupForProgramHref(programHref);

  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader
        navItems={page.nav}
        ctaHref={shopifyProducts.projeto36}
        ctaLabel={page.ctaLabel}
      />

      <section className="relative isolate overflow-hidden bg-ink text-white">
        <Image
          alt="Project 36km/h Speed and Acceleration Program cover"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[58%_center] opacity-80"
          fill
          priority
          sizes="100vw"
          src={assets.project36Cover}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,9,11,0.98)_0%,rgba(8,9,11,0.88)_42%,rgba(8,9,11,0.34)_100%)]" />
        <div className="mx-auto flex min-h-[calc(74svh-var(--header-height))] max-w-7xl items-center px-4 py-8 sm:px-6 md:min-h-[calc(70vh-var(--header-height))] lg:px-8">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-3">
              <p className="inline-flex rounded-md border border-lime-400/35 bg-lime-400/10 px-3 py-2 text-sm font-bold uppercase text-lime-300">
                {page.eyebrow}
              </p>
              <Link
                className="focus-ring inline-flex rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold uppercase text-white transition hover:bg-white hover:text-ink"
                href={page.languageHref}
              >
                {page.languageLabel}
              </Link>
            </div>
            <h1 className="mt-5 font-display text-3xl uppercase leading-[1.04] sm:text-4xl lg:text-5xl">
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
            <div className="mt-6 flex flex-wrap gap-2">
              {page.chips.map((chip) => (
                <span
                  className="rounded-md border border-white/12 bg-white/[0.08] px-3 py-2 text-xs font-bold uppercase text-white/80"
                  key={chip}
                >
                  {chip}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-lime-400 px-5 text-sm font-bold uppercase text-ink transition hover:bg-lime-300"
                href={shopifyProducts.projeto36}
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

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-[0.9fr_1.1fr] md:items-start lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-signal">
              {page.fitTitle}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-4xl">
              {page.fitH2}
            </h2>
            <p className="mt-5 text-base leading-8 text-graphite/74">
              {page.fitLead}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-turf/20 bg-turf/5 p-5">
              <div className="flex items-center gap-2 text-sm font-bold uppercase text-turf">
                <BadgeCheck aria-hidden="true" className="h-4 w-4" />
                {page.goodFitLabel}
              </div>
              <ul className="mt-5 space-y-3">
                {page.goodFit.map((item) => (
                  <li className="flex gap-3 text-sm leading-6 text-graphite/75" key={item}>
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-1 h-4 w-4 shrink-0 text-turf"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-ink/10 bg-smoke p-5">
              <div className="flex items-center gap-2 text-sm font-bold uppercase text-graphite">
                <Target aria-hidden="true" className="h-4 w-4" />
                {page.notFitLabel}
              </div>
              <ul className="mt-5 space-y-3">
                {page.notFit.map((item) => (
                  <li className="flex gap-3 text-sm leading-6 text-graphite/72" key={item}>
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-1 h-4 w-4 shrink-0 text-graphite/50"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-grid bg-smoke py-16" id="fases">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-signal">
              {page.phasesTitle}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-4xl">
              {page.phasesH2}
            </h2>
            <p className="mt-4 text-base leading-7 text-graphite/75">
              {page.phasesLead}
            </p>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {page.phases.map((phase) => (
              <article
                className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-ink/10"
                key={phase.title}
              >
                <Image
                  alt={phase.title}
                  className="aspect-[4/5] w-full object-cover object-top"
                  height={900}
                  src={phase.image}
                  width={720}
                />
                <div className="p-5">
                  <p className="text-xs font-bold uppercase text-signal">
                    {phase.weeks}
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-ink">
                    {phase.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-graphite/72">
                    {phase.body}
                  </p>
                  <ul className="mt-5 space-y-2">
                    {phase.points.map((point) => (
                      <li className="flex gap-2 text-sm font-semibold text-graphite/75" key={point}>
                        <Zap
                          aria-hidden="true"
                          className="mt-0.5 h-4 w-4 shrink-0 text-lime-600"
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
            <div className="mt-8 overflow-hidden rounded-lg border border-white/10">
              <Image
                alt="Project 36km/h PDF cover"
                className="aspect-[4/5] w-full object-cover object-top"
                height={900}
                src={assets.project36Cover}
                width={720}
              />
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

      <section className="surface-grid bg-smoke py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-signal">
              {page.previewTitle}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-4xl">
              {page.previewH2}
            </h2>
            <p className="mt-4 text-base leading-7 text-graphite/75">
              {page.previewLead}
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {page.previewImages.map((image) => (
              <figure
                className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-ink/10"
                key={image.src}
              >
                <Image
                  alt={image.alt}
                  className="aspect-[4/5] w-full object-cover object-top"
                  height={900}
                  src={image.src}
                  width={720}
                />
                <figcaption className="border-t border-ink/10 px-4 py-3 text-xs font-bold uppercase text-graphite/65">
                  {image.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase text-signal">
                {page.sampleTitle}
              </p>
              <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-4xl">
                {page.sampleH2}
              </h2>
            </div>
            <Trophy aria-hidden="true" className="hidden h-12 w-12 text-lime-600 md:block" />
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {page.sampleCards.map((card) => (
              <article
                className="overflow-hidden rounded-lg border border-ink/10 bg-white"
                key={card.title}
              >
                <Image
                  alt={card.title}
                  className="aspect-[4/5] w-full object-cover object-top"
                  height={900}
                  src={card.image}
                  width={720}
                />
                <div className="p-5">
                  <h3 className="text-lg font-bold text-ink">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-graphite/72">
                    {card.body}
                  </p>
                </div>
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
              Project 36km/h
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
              href={shopifyProducts.projeto36}
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
