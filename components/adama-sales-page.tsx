import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  Languages,
  LineChart,
  PlayCircle,
  ShieldCheck,
  Target,
  Trophy,
  Zap
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { assets, nav, shopifyProducts } from "@/lib/content";

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
    authorityTitle: "Programado por quem trabalha com futebol real",
    authorityH2: "Força que transfere para o futebol.",
    authorityBody:
      "Criado por Lukaz de Paula, preparador físico com licença CBF A, experiência em FC Málaga City, CD Almuñécar City, Lindsey Wilson University e Extratime Performance. A lógica vem do campo: força que transfere, não treino aleatório.",
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
    authorityTitle: "Built by someone working in real football",
    authorityH2: "Strength that transfers to football.",
    authorityBody:
      "Created by Lukaz de Paula, CBF A licensed strength and conditioning coach with experience at FC Málaga City, CD Almuñécar City, Lindsey Wilson University and Extratime Performance. The logic comes from the field: strength that transfers, not random gym work.",
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

export function AdamaSalesPage({ locale }: AdamaSalesPageProps) {
  const page = copy[locale];
  const coachingHref =
    locale === "pt" ? "/assessoria#aplicacao" : "/en/coaching#application";

  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader
        navItems={page.nav}
        ctaHref={shopifyProducts.adama}
        ctaLabel={page.ctaLabel}
      />

      <section className="relative isolate overflow-hidden bg-ink text-white">
        <Image
          alt="Adama Project Offseason Strength and Power cover"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[68%_center] opacity-40"
          fill
          priority
          sizes="100vw"
          src={assets.adamaCover}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,9,11,0.98)_0%,rgba(8,9,11,0.90)_48%,rgba(8,9,11,0.62)_100%)]" />
        <div className="mx-auto grid min-h-[calc(88svh-var(--header-height))] max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.03fr_0.97fr] lg:items-center lg:px-8">
          <div>
            <div className="flex flex-wrap gap-3">
              <p className="inline-flex rounded-md border border-red-500/40 bg-red-500/15 px-3 py-2 text-sm font-bold uppercase text-white">
                {page.eyebrow}
              </p>
              <Link
                className="focus-ring inline-flex rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold uppercase text-white transition hover:bg-white hover:text-ink"
                href={page.languageHref}
              >
                {page.languageLabel}
              </Link>
            </div>
            <h1 className="mt-6 font-display text-4xl uppercase leading-[1.02] sm:text-5xl lg:text-7xl">
              {page.h1}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
              {page.lead}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-signal px-5 py-3 text-sm font-bold text-white shadow-clean transition hover:bg-[#b90f20]"
                href={shopifyProducts.adama}
                rel="noreferrer"
                target="_blank"
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
                  className="rounded-md border border-white/10 bg-white/[0.08] px-3 py-2 text-xs font-bold uppercase text-white/70"
                  key={chip}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="mx-auto w-full max-w-[460px]">
            <div className="overflow-hidden rounded-lg border border-white/12 bg-white/[0.06] p-3 shadow-clean">
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
                  className="rounded-lg border border-white/10 bg-white/[0.06] p-4 text-center"
                  key={label}
                >
                  <p className="font-display text-2xl uppercase text-white">
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

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-signal">
              <Target aria-hidden="true" className="mr-2 inline h-4 w-4" />
              {page.fitTitle}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-4xl">
              {page.fitH2}
            </h2>
            <p className="mt-5 text-base leading-8 text-graphite/75">
              {page.fitLead}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-ink/10 bg-smoke p-5">
              <p className="text-sm font-bold uppercase text-turf">
                {page.goodFitLabel}
              </p>
              <ul className="mt-4 space-y-3">
                {page.goodFit.map((item) => (
                  <li
                    className="flex gap-3 text-sm leading-6 text-graphite/76"
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
            <div className="rounded-lg border border-ink/10 bg-white p-5">
              <p className="text-sm font-bold uppercase text-signal">
                {page.notFitLabel}
              </p>
              <ul className="mt-4 space-y-3">
                {page.notFit.map((item) => (
                  <li
                    className="flex gap-3 text-sm leading-6 text-graphite/76"
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

      <section className="surface-grid bg-smoke py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-signal">
              <Languages aria-hidden="true" className="mr-2 inline h-4 w-4" />
              {page.includedTitle}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase text-ink sm:text-4xl">
              {page.includedH2}
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {page.included.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm"
                  key={item.title}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-ink text-white">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-graphite/72">
                    {item.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-signal">
              <Activity aria-hidden="true" className="mr-2 inline h-4 w-4" />
              {page.methodTitle}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-4xl">
              {page.methodH2}
            </h2>
            <p className="mt-5 text-base leading-8 text-graphite/75">
              {page.methodLead}
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
            {page.methodRows.map(([label, body]) => (
              <div
                className="grid gap-2 border-b border-ink/10 p-5 last:border-b-0 sm:grid-cols-[150px_1fr]"
                key={label}
              >
                <p className="font-display text-xl uppercase text-signal">
                  {label}
                </p>
                <p className="text-sm leading-6 text-graphite/75">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:px-8">
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
          <div className="overflow-hidden rounded-lg border border-white/10">
            <Image
              alt="Lukaz de Paula coaching athletes in the gym"
              className="aspect-[4/3] w-full object-cover"
              height={900}
              src={assets.coachGymInstruction}
              width={1200}
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
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
                className="rounded-lg border border-ink/10 bg-smoke p-5"
                key={faq.question}
              >
                <h3 className="text-lg font-bold text-ink">{faq.question}</h3>
                <p className="mt-3 text-sm leading-6 text-graphite/72">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-signal py-14 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
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
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-signal transition hover:bg-steel"
              href={shopifyProducts.adama}
              rel="noreferrer"
              target="_blank"
            >
              {page.finalCta}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
            <Link
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-white/40 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
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
