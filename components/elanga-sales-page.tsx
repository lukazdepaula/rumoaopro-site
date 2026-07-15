import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Dumbbell,
  Gauge,
  ShieldCheck,
  Target,
  Zap
} from "lucide-react";
import { ReviewBadge, ReviewsSection } from "@/components/reviews";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { assets, nav, shopifyProducts } from "@/lib/content";
import { getReviewGroupForProgramHref } from "@/lib/reviews";

type ElangaSalesPageProps = {
  locale: "pt" | "en";
};

const copy = {
  pt: {
    nav: nav.pt,
    ctaLabel: "Comprar",
    languageHref: "/en/programs/elanga-in-season",
    languageLabel: "🇧🇷 PT → EN",
    eyebrow: "Projeto Elanga In-Season",
    h1: "Mantenha força, velocidade e potência durante a temporada.",
    lead:
      "Um sistema de 28 semanas para jogadores que já estão treinando e competindo, com sessões curtas de suporte para manter performance sem carregar fadiga para os jogos.",
    primaryCta: "Comprar Elanga Project",
    secondaryCta: "Ver estrutura",
    storeNote: "Compra finalizada pelo checkout RumoAoPro.",
    chips: ["28 semanas", "7 fases", "3 sessões/semana", "In-season"],
    stats: [
      ["7", "fases de 4 semanas"],
      ["3", "sessões-chave por semana"],
      ["1-2", "jogos por semana"]
    ],
    fitTitle: "Para quem é",
    fitH2: "Feito para jogador que precisa performar enquanto a temporada anda.",
    fitLead:
      "O Elanga não tenta construir uma offseason dentro da temporada. Ele usa dose mínima efetiva para manter força, sprint exposure, potência e prontidão sem competir com treino do time.",
    goodFitLabel: "Boa escolha",
    notFitLabel: "Melhor escolher outro caminho",
    goodFit: [
      "Você está em temporada, com treinos e jogos do time",
      "Você quer manter força e velocidade sem ficar pesado",
      "Você precisa de sessões curtas, claras e fáceis de encaixar",
      "Você joga semanas com 1 ou 2 partidas"
    ],
    notFit: [
      "Você está em offseason e quer ganhar muita massa ou força máxima",
      "Você está voltando de lesão sem liberação",
      "Você não consegue controlar minimamente a semana de jogos",
      "Você procura um plano individual ajustado dia a dia"
    ],
    structureTitle: "Estrutura do programa",
    structureH2: "Três sessões de suporte para manter o motor ligado.",
    structureLead:
      "A semana padrão gira em torno de lower body strength/power, upper body strength/core e field speed/sprint exposure. A ordem depende da distância até o próximo jogo.",
    sessions: [
      {
        icon: Dumbbell,
        title: "Day 1 - Lower Strength / Power",
        body:
          "Mantém força de membros inferiores, potência e robustez sem esmagar as pernas."
      },
      {
        icon: ShieldCheck,
        title: "Day 2 - Upper Strength / Core",
        body:
          "Sustenta tronco, contato, ombro e core com baixo custo de fadiga para a partida."
      },
      {
        icon: Zap,
        title: "Day 3 - Field Speed / Sprint Exposure",
        body:
          "Coloca velocidade na semana sem virar conditioning: qualidade, intenção e recuperação."
      }
    ],
    phasesTitle: "Mapa das 7 fases",
    phasesH2: "Progressão de temporada inteira, não treino solto.",
    phasesLead:
      "Cada fase dura 4 semanas e ajusta a prioridade conforme o calendário avança: base explosiva, aceleração, reload, velocidade máxima, domínio de speed, deload neural e manutenção final.",
    phases: [
      {
        title: "Phase 1 - Explosive Base",
        weeks: "Weeks 1-4",
        image: assets.elangaPhase1Overview,
        body: "Base explosiva com baixa dose, força de suporte e sprint exposure semanal."
      },
      {
        title: "Phase 2 - Acceleration & Reactivity",
        weeks: "Weeks 5-8",
        image: assets.elangaPhase2Overview,
        body: "Primeiros metros mais agressivos, reatividade e contatos rápidos sem excesso de volume."
      },
      {
        title: "Phase 3 - Strength Reload",
        weeks: "Weeks 9-12",
        image: assets.elangaPhase3Overview,
        body: "Reload controlado de força para recuperar suporte sem perder exposição de velocidade."
      },
      {
        title: "Phase 4 - Elastic Speed & Max Velocity",
        weeks: "Weeks 13-16",
        image: assets.elangaPhase4Overview,
        body: "Ênfase em elasticidade, postura e velocidade máxima com qualidade alta."
      },
      {
        title: "Phase 5 - Speed Dominance",
        weeks: "Weeks 17-20",
        image: assets.elangaPhase5Overview,
        body: "Mantém o atleta rápido, responsivo e pronto para ações explosivas do jogo."
      },
      {
        title: "Phase 6 - Neural Refresh / Deload",
        weeks: "Weeks 21-24",
        image: assets.elangaPhase6Overview,
        body: "Reduz carga para refrescar o sistema nervoso e manter o atleta disponível."
      },
      {
        title: "Phase 7 - End-Season Maintenance",
        weeks: "Weeks 25-28",
        image: assets.elangaPhase7Overview,
        body: "Manutenção final para chegar ao fim da temporada ainda forte, rápido e fresco."
      }
    ],
    rulesTitle: "Regras de execução",
    rulesH2: "In-season é sobre dose, não ego.",
    rulesLead:
      "O material deixa claro: sprint só quando fresco, recuperação completa entre esforços rápidos, 1-2 reps em reserva na força e ajuste de volume se as pernas pesarem.",
    rules: [
      ["Match-day order", "Use a ordem das sessões pela distância até o próximo jogo, não pelo dia da semana."],
      ["Low volume", "Lower-body limitado para manter força sem roubar energia do jogo."],
      ["Quality first", "Se a velocidade cai, o set acabou. Não transforme speed em sofrimento."],
      ["Load management", "Semana com dois jogos pede dose mínima efetiva, especialmente para titulares."]
    ],
    previewTitle: "Dentro do produto",
    previewH2: "Visual forte, sessão clara e objetivo de temporada real.",
    previewLead:
      "As páginas mostram como seguir o programa, o mapa das fases e sessões extras de condicionamento para semanas com poucos minutos de jogo.",
    previewImages: [
      {
        src: assets.elangaHowToFollow,
        alt: "Como seguir o Elanga Project",
        label: "How to follow"
      },
      {
        src: assets.elangaExtraAerobicBase,
        alt: "Sessão extra aerobic base conditioning do Elanga Project",
        label: "Extra aerobic base"
      },
      {
        src: assets.elangaExtraAerobicTempo,
        alt: "Sessão extra aerobic tempo intervals do Elanga Project",
        label: "Tempo intervals"
      }
    ],
    faqTitle: "Perguntas rápidas",
    faqH2: "Antes de comprar",
    faqs: [
      {
        question: "É offseason?",
        answer:
          "Não. O Elanga é para temporada. A meta é manter força, velocidade e prontidão sem acumular fadiga para partidas."
      },
      {
        question: "Serve para semana com dois jogos?",
        answer:
          "Sim. O programa foi desenhado para semanas com 1 ou 2 jogos, com regra de dose mínima efetiva."
      },
      {
        question: "Preciso fazer as 3 sessões toda semana?",
        answer:
          "A estrutura principal tem 3 sessões, mas a ordem e o volume dependem da distância até o próximo jogo e da fadiga."
      },
      {
        question: "Tem condicionamento extra?",
        answer:
          "Sim, mas apenas para quando os minutos de jogo estão baixos. As sessões extras são controladas para não interferir na velocidade."
      }
    ],
    finalTitle: "A temporada não é hora de improvisar.",
    finalBody:
      "Use o Elanga para manter o corpo forte, rápido e pronto para competir semana após semana.",
    finalCta: "Comprar Elanga Project",
    coachingCta: "Quero ajuste individual"
  },
  en: {
    nav: nav.en,
    ctaLabel: "Buy",
    languageHref: "/programas/elanga-in-season",
    languageLabel: "🇺🇸 EN → PT",
    eyebrow: "Elanga Project In-Season",
    h1: "Maintain strength, speed and power during the season.",
    lead:
      "A 28-week system for players who are already training and competing, using short support sessions to maintain performance without carrying fatigue into matches.",
    primaryCta: "Buy Elanga Project",
    secondaryCta: "See structure",
    storeNote: "Checkout runs through RumoAoPro.",
    chips: ["28 weeks", "7 phases", "3 sessions/week", "In-season"],
    stats: [
      ["7", "four-week phases"],
      ["3", "key sessions per week"],
      ["1-2", "matches per week"]
    ],
    fitTitle: "Who it is for",
    fitH2: "Built for players who need to perform while the season keeps moving.",
    fitLead:
      "Elanga does not try to force an offseason into the season. It uses the minimum effective dose to maintain strength, sprint exposure, power and readiness without fighting team training.",
    goodFitLabel: "Good fit",
    notFitLabel: "Better choose another path",
    goodFit: [
      "You are in-season with team training and matches",
      "You want to maintain strength and speed without feeling heavy",
      "You need short, clear sessions that fit the week",
      "You play one-game or two-game weeks"
    ],
    notFit: [
      "You are in the offseason and want major size or max strength gains",
      "You are returning from injury without clearance",
      "You cannot control your match week at all",
      "You need a day-by-day individual plan"
    ],
    structureTitle: "Program structure",
    structureH2: "Three support sessions to keep the engine on.",
    structureLead:
      "The standard week is built around lower body strength/power, upper body strength/core and field speed/sprint exposure. Placement depends on how far the athlete is from the next match.",
    sessions: [
      {
        icon: Dumbbell,
        title: "Day 1 - Lower Strength / Power",
        body:
          "Maintains lower-body force, power and robustness without crushing the legs."
      },
      {
        icon: ShieldCheck,
        title: "Day 2 - Upper Strength / Core",
        body:
          "Supports trunk, contact, shoulders and core with low fatigue cost for match day."
      },
      {
        icon: Zap,
        title: "Day 3 - Field Speed / Sprint Exposure",
        body:
          "Keeps speed in the week without turning it into conditioning: quality, intent and recovery."
      }
    ],
    phasesTitle: "The 7-phase map",
    phasesH2: "A full-season progression, not random maintenance.",
    phasesLead:
      "Each phase lasts 4 weeks and shifts the priority as the season moves: explosive base, acceleration, reload, max velocity, speed dominance, neural deload and final maintenance.",
    phases: [
      {
        title: "Phase 1 - Explosive Base",
        weeks: "Weeks 1-4",
        image: assets.elangaPhase1Overview,
        body: "Explosive base with low dose, strength support and weekly sprint exposure."
      },
      {
        title: "Phase 2 - Acceleration & Reactivity",
        weeks: "Weeks 5-8",
        image: assets.elangaPhase2Overview,
        body: "Sharper first steps, reactivity and faster contacts without excessive volume."
      },
      {
        title: "Phase 3 - Strength Reload",
        weeks: "Weeks 9-12",
        image: assets.elangaPhase3Overview,
        body: "Controlled force reload to rebuild support without losing speed exposure."
      },
      {
        title: "Phase 4 - Elastic Speed & Max Velocity",
        weeks: "Weeks 13-16",
        image: assets.elangaPhase4Overview,
        body: "Elasticity, posture and max velocity exposure with high quality."
      },
      {
        title: "Phase 5 - Speed Dominance",
        weeks: "Weeks 17-20",
        image: assets.elangaPhase5Overview,
        body: "Keeps the player fast, responsive and ready for explosive game actions."
      },
      {
        title: "Phase 6 - Neural Refresh / Deload",
        weeks: "Weeks 21-24",
        image: assets.elangaPhase6Overview,
        body: "Reduces load to refresh the nervous system and protect availability."
      },
      {
        title: "Phase 7 - End-Season Maintenance",
        weeks: "Weeks 25-28",
        image: assets.elangaPhase7Overview,
        body: "Final maintenance to reach the end of the season strong, fast and fresh."
      }
    ],
    rulesTitle: "Execution rules",
    rulesH2: "In-season is about dose, not ego.",
    rulesLead:
      "The material is clear: sprint only when fresh, full recovery between fast efforts, 1-2 reps in reserve on strength work and volume adjustments when legs feel heavy.",
    rules: [
      ["Match-day order", "Place sessions by distance from the next match, not by weekday."],
      ["Low volume", "Lower-body work is capped to maintain strength without stealing match energy."],
      ["Quality first", "If speed drops, the set is done. Do not turn speed into suffering."],
      ["Load management", "Two-game weeks require the minimum effective dose, especially for starters."]
    ],
    previewTitle: "Inside the product",
    previewH2: "Strong visuals, clear sessions and a real in-season goal.",
    previewLead:
      "The pages show how to follow the program, the phase map and extra conditioning sessions for weeks with low match minutes.",
    previewImages: [
      {
        src: assets.elangaHowToFollow,
        alt: "How to follow the Elanga Project",
        label: "How to follow"
      },
      {
        src: assets.elangaExtraAerobicBase,
        alt: "Elanga Project extra aerobic base conditioning session",
        label: "Extra aerobic base"
      },
      {
        src: assets.elangaExtraAerobicTempo,
        alt: "Elanga Project extra aerobic tempo intervals session",
        label: "Tempo intervals"
      }
    ],
    faqTitle: "Quick questions",
    faqH2: "Before buying",
    faqs: [
      {
        question: "Is this an offseason program?",
        answer:
          "No. Elanga is for the season. The goal is to maintain strength, speed and readiness without adding match-day fatigue."
      },
      {
        question: "Does it work for two-game weeks?",
        answer:
          "Yes. The program is designed for one-game and two-game weeks, using the minimum effective dose."
      },
      {
        question: "Do I need all 3 sessions every week?",
        answer:
          "The main structure has 3 sessions, but placement and volume depend on match distance and fatigue."
      },
      {
        question: "Are there extra conditioning sessions?",
        answer:
          "Yes, only for weeks when match minutes are low. They are controlled so they do not interfere with speed."
      }
    ],
    finalTitle: "The season is not the time to improvise.",
    finalBody:
      "Use Elanga to keep the body strong, fast and ready to compete week after week.",
    finalCta: "Buy Elanga Project",
    coachingCta: "I need individual coaching"
  }
};

export function ElangaSalesPage({ locale }: ElangaSalesPageProps) {
  const page = copy[locale];
  const programHref =
    locale === "pt"
      ? "/programas/elanga-in-season"
      : "/en/programs/elanga-in-season";
  const reviewGroupKey = getReviewGroupForProgramHref(programHref);

  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader
        navItems={page.nav}
        ctaHref={shopifyProducts.elanga}
        ctaLabel={page.ctaLabel}
      />

      <section className="relative isolate overflow-hidden bg-ink text-white">
        <Image
          alt="Elanga Project in-season program cover"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[58%_center] opacity-82"
          fill
          priority
          sizes="100vw"
          src={assets.elangaCover}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,9,11,0.98)_0%,rgba(8,9,11,0.86)_48%,rgba(8,9,11,0.36)_100%)]" />
        <div className="mx-auto flex min-h-[calc(74svh-var(--header-height))] max-w-7xl items-center px-4 py-8 sm:px-6 md:min-h-[calc(70vh-var(--header-height))] lg:px-8">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-3">
              <p className="inline-flex rounded-md border border-orange-400/35 bg-orange-500/10 px-3 py-2 text-sm font-bold uppercase text-orange-300">
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
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-orange-500 px-5 text-sm font-bold uppercase text-white transition hover:bg-orange-400"
                href={shopifyProducts.elanga}
              >
                {page.primaryCta}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>
              <Link
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/10 px-5 text-sm font-bold uppercase text-white transition hover:bg-white hover:text-ink"
                href="#estrutura"
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
              ? "Avaliações de atletas em temporada"
              : "Reviews from in-season RumoAoPro programs"
          }
        />
      ) : null}

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-[0.9fr_1.1fr] lg:px-8">
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
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              {page.stats.map(([value, label]) => (
                <div
                  className="rounded-lg border border-ink/10 bg-smoke p-4"
                  key={label}
                >
                  <p className="font-display text-2xl uppercase text-ink">
                    {value}
                  </p>
                  <p className="mt-2 text-xs font-bold uppercase leading-5 text-graphite/55">
                    {label}
                  </p>
                </div>
              ))}
            </div>
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

      <section className="surface-grid bg-smoke py-16" id="estrutura">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-sm font-bold uppercase text-signal">
                {page.structureTitle}
              </p>
              <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-4xl">
                {page.structureH2}
              </h2>
              <p className="mt-4 text-base leading-7 text-graphite/75">
                {page.structureLead}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {page.sessions.map((session) => {
                const Icon = session.icon;

                return (
                  <article
                    className="rounded-lg border border-ink/10 bg-white p-5"
                    key={session.title}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-orange-500 text-white">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-ink">
                      {session.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-graphite/72">
                      {session.body}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-orange-300">
              {page.phasesTitle}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">
              {page.phasesH2}
            </h2>
            <p className="mt-4 text-base leading-7 text-white/70">
              {page.phasesLead}
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {page.phases.map((phase) => (
              <article
                className="overflow-hidden rounded-lg bg-white text-ink shadow-sm"
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
                  <h3 className="mt-2 text-lg font-bold text-ink">
                    {phase.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-graphite/72">
                    {phase.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-signal">
              {page.rulesTitle}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-4xl">
              {page.rulesH2}
            </h2>
            <p className="mt-5 text-base leading-8 text-graphite/74">
              {page.rulesLead}
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border border-ink/10 bg-smoke">
            {page.rules.map(([label, body]) => (
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
                className="rounded-lg border border-ink/10 bg-smoke p-5"
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
            <p className="text-sm font-bold uppercase text-orange-300">
              Elanga Project
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
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-orange-500 px-5 text-sm font-bold uppercase text-white transition hover:bg-orange-400"
              href={shopifyProducts.elanga}
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
