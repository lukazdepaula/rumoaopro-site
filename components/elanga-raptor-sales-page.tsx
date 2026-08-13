import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Gauge,
  ShieldCheck,
  Target
} from "lucide-react";
import { elangaSalesCopy } from "@/components/elanga-sales-page";
import { ProgramPurchaseSummary } from "@/components/program-purchase-summary";
import {
  RaptorPhoneMockup,
  RaptorProgramExperience,
  raptorAppScreens
} from "@/components/raptor-program-experience";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { shopifyProducts } from "@/lib/content";

type ElangaRaptorSalesPageProps = {
  locale: "pt" | "en";
};

const athletePhotos = {
  match: "/assets/photos/lukaz-field-playing.jpg",
  coach: "/assets/photos/lukaz-gym-instruction.jpg"
};

const inSeasonAssets = {
  heroBackground: "/assets/programs/in-season/in-season-hero-bg-v2.png",
  productCover: "/assets/programs/in-season/in-season-pro-cover-v2.png"
};

const extraCopy = {
  pt: {
    positioning:
      "A temporada exige manutenção inteligente: estímulo suficiente para continuar forte e rápido, sem transformar o trabalho extra em mais uma fonte de fadiga.",
    problemEyebrow: "O desafio da temporada",
    problemTitle: "Treinar mais nem sempre significa performar melhor.",
    problemBody:
      "Entre treinos do time, viagens e partidas, o jogador precisa proteger velocidade, força e potência. O In-Season Pro organiza a dose mínima efetiva para que o trabalho individual complemente o futebol.",
    matchEyebrow: "Organização por match day",
    matchTitle: "Uma estrutura que se adapta a semanas com um ou dois jogos.",
    oneGame: "Semana com 1 jogo",
    twoGames: "Semana com 2 jogos",
    oneGameSteps: [
      "Lower Strength / Power distante do jogo",
      "Upper Strength / Core com baixo custo de fadiga",
      "Field Speed / Sprint quando o atleta estiver fresco"
    ],
    twoGameSteps: [
      "Reduza para a dose mínima efetiva",
      "Priorize disponibilidade e recuperação",
      "Use minutos jogados e sensação das pernas para ajustar"
    ],
    appEyebrow: "Entregue dentro do RaptorPro",
    appTitle: "Você não recebe um PDF. Você entra em uma experiência guiada.",
    appBody:
      "Após a compra, o programa aparece na sua conta RaptorPro. Cada sessão abre no celular com calendário, vídeos, instruções, check de exercícios, readiness e registro da carga realizada.",
    appFeatures: [
      "Calendário completo das 28 semanas",
      "Vídeos e instruções dentro de cada exercício",
      "Check-in pré-treino e score de readiness",
      "RPE, duração e carga depois da sessão",
      "Histórico para acompanhar o que foi concluído"
    ],
    phoneCalendar: "Sua temporada organizada",
    phoneWorkout: "Treino guiado no celular",
    authorityEyebrow: "Metodologia RumoAoPro",
    authorityTitle: "Construído para a rotina real do futebol.",
    authorityBody:
      "O programa nasce da experiência de Lukaz de Paula como preparador físico e jogador, trabalhando com atletas em contextos de clube, college e futebol profissional. O In-Season Pro traduz essa metodologia em uma progressão prática para a temporada competitiva.",
    accessNote:
      "Compra única. Acesso liberado na sua conta RaptorPro após a confirmação do pagamento.",
    phaseLabel: "Fase",
    weeksLabel: "Semanas",
    finalBadge: "28 semanas dentro do app",
    viewProgram: "Ver como funciona no RaptorPro",
    coverLabel: "Capa do programa",
    appLabel: "Calendário real no RaptorPro",
    proof: [
      ["28 semanas", "Planejamento completo"],
      ["1 ou 2 jogos", "Microciclo ajustável"],
      ["PT + EN", "Experiência bilíngue"],
      ["Compra única", "Acesso no RaptorPro"]
    ]
  },
  en: {
    positioning:
      "The season requires intelligent maintenance: enough stimulus to stay strong and fast, without turning extra work into another source of fatigue.",
    problemEyebrow: "The in-season challenge",
    problemTitle: "Training more does not always mean performing better.",
    problemBody:
      "Between team sessions, travel and matches, players need to protect speed, strength and power. In-Season Pro organizes the minimum effective dose so individual work supports football instead of competing with it.",
    matchEyebrow: "Match-day organization",
    matchTitle: "A structure that fits one-game and two-game weeks.",
    oneGame: "One-game week",
    twoGames: "Two-game week",
    oneGameSteps: [
      "Lower Strength / Power away from match day",
      "Upper Strength / Core with a low fatigue cost",
      "Field Speed / Sprint only when the player is fresh"
    ],
    twoGameSteps: [
      "Reduce work to the minimum effective dose",
      "Prioritize availability and recovery",
      "Use minutes played and leg freshness to adjust"
    ],
    appEyebrow: "Delivered inside RaptorPro",
    appTitle: "You do not receive a PDF. You enter a guided experience.",
    appBody:
      "After purchase, the program appears in your RaptorPro account. Every session opens on mobile with a calendar, videos, instructions, exercise checks, readiness and completed-load tracking.",
    appFeatures: [
      "The complete 28-week calendar",
      "Videos and instructions inside each exercise",
      "Pre-session check-in and readiness score",
      "Session RPE, duration and training load",
      "History of every completed session"
    ],
    phoneCalendar: "Your season organized",
    phoneWorkout: "Guided training on mobile",
    authorityEyebrow: "RumoAoPro methodology",
    authorityTitle: "Built for the real football schedule.",
    authorityBody:
      "The program is informed by Lukaz de Paula's work as a performance coach and player across club, college and professional football environments. In-Season Pro turns that methodology into a practical progression for the competitive season.",
    accessNote:
      "One-time purchase. Access is released to your RaptorPro account after payment confirmation.",
    phaseLabel: "Phase",
    weeksLabel: "Weeks",
    finalBadge: "28 weeks inside the app",
    viewProgram: "See the RaptorPro experience",
    coverLabel: "Program cover",
    appLabel: "Real calendar in RaptorPro",
    proof: [
      ["28 weeks", "Complete progression"],
      ["1 or 2 matches", "Adaptable microcycle"],
      ["PT + EN", "Bilingual experience"],
      ["One payment", "Access in RaptorPro"]
    ]
  }
};

function InSeasonHeroVisual({ locale }: { locale: "pt" | "en" }) {
  const extra = extraCopy[locale];

  return (
    <div className="relative mx-auto min-h-[470px] w-full max-w-[650px] sm:min-h-[610px] lg:min-h-[650px]">
      <div className="absolute left-1/2 top-1/2 h-[78%] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.3),rgba(249,115,22,0.08)_48%,transparent_72%)] blur-3xl" />

      <div className="absolute left-[1%] top-[8%] z-10 w-[48%] -rotate-[4deg] sm:left-[4%] sm:w-[45%]">
        <div className="relative aspect-[2/3] overflow-hidden rounded-[2rem] border border-orange-300/20 bg-black shadow-[0_38px_110px_rgba(0,0,0,0.72)] ring-1 ring-white/10">
          <Image
            alt={
              locale === "pt"
                ? "Capa premium do programa In-Season Pro"
                : "Premium In-Season Pro program cover"
            }
            className="h-full w-full object-cover object-center"
            fill
            priority
            sizes="(min-width: 1024px) 300px, 46vw"
            src={inSeasonAssets.productCover}
          />
        </div>
        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-orange-300/25 bg-black/85 px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-orange-200 shadow-xl backdrop-blur sm:text-[10px]">
          {extra.coverLabel}
        </span>
      </div>

      <div className="absolute right-[1%] top-[3%] z-30 w-[52%] rotate-[3deg] sm:right-[2%] sm:w-[50%]">
        <RaptorPhoneMockup
          alt={
            locale === "pt"
              ? "Calendário real do In-Season Pro no RaptorPro"
              : "Real In-Season Pro calendar in RaptorPro"
          }
          className="w-full"
          src={raptorAppScreens.inSeasonWeek}
        />
        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-black/85 px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-white shadow-xl backdrop-blur sm:text-[10px]">
          {extra.appLabel}
        </span>
      </div>
    </div>
  );
}

export function ElangaRaptorSalesPage({ locale }: ElangaRaptorSalesPageProps) {
  const page = elangaSalesCopy[locale];
  const extra = extraCopy[locale];
  const checkoutHref =
    locale === "en" ? "/en/checkout/elanga-in-season" : shopifyProducts.elanga;
  const coachingHref =
    locale === "en" ? "/en/coaching#application" : "/assessoria#aplicacao";

  return (
    <main className="min-h-screen bg-[#080907] text-white">
      <SiteHeader
        navItems={page.nav}
        ctaHref={checkoutHref}
        ctaLabel={page.ctaLabel}
      />

      <section className="relative isolate overflow-hidden border-b border-orange-400/20 bg-[#080907]">
        <Image
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-30 h-full w-full object-cover object-center opacity-95"
          fill
          priority
          sizes="100vw"
          src={inSeasonAssets.heroBackground}
        />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(5,6,4,0.98)_0%,rgba(5,6,4,0.9)_40%,rgba(5,6,4,0.18)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_16%,rgba(249,115,22,0.17),transparent_30%),linear-gradient(180deg,rgba(0,0,0,0.08)_35%,rgba(8,9,7,0.94)_100%)]" />

        <div className="mx-auto grid min-h-[calc(92svh-var(--header-height))] max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-14">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-orange-300/35 bg-orange-500/12 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-orange-200 backdrop-blur">
                {page.eyebrow}
              </span>
              <Link
                className="focus-ring rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-black"
                href={page.languageHref}
              >
                {page.languageLabel}
              </Link>
            </div>

            <h1 className="mt-6 max-w-3xl font-display text-4xl uppercase leading-[0.98] sm:text-5xl lg:text-7xl">
              {page.h1}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/76 sm:text-lg">
              {page.lead}
            </p>

            <div className="mt-7 grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4">
              {page.chips.map((chip) => (
                <div
                  className="rounded-xl border border-white/10 bg-black/45 px-3 py-3 text-center text-[11px] font-extrabold uppercase leading-5 text-white/80 backdrop-blur"
                  key={chip}
                >
                  {chip}
                </div>
              ))}
            </div>

            <ProgramPurchaseSummary locale={locale} />

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                className="focus-ring inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-orange-400 px-7 text-sm font-extrabold uppercase tracking-[0.08em] text-white shadow-[0_18px_50px_rgba(249,115,22,0.28)] transition hover:brightness-110"
                href={checkoutHref}
              >
                {page.primaryCta}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>
              <Link
                className="focus-ring inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-white/18 bg-black/30 px-7 text-sm font-bold uppercase text-white backdrop-blur transition hover:bg-white hover:text-black"
                href="#raptorpro"
              >
                {extra.viewProgram}
              </Link>
            </div>
            <p className="mt-4 max-w-xl text-xs font-semibold leading-5 text-white/48">
              {extra.accessNote}
            </p>
          </div>

          <InSeasonHeroVisual locale={locale} />
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0d0e0c]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-white/10 px-4 sm:px-6 md:grid-cols-4 md:divide-y-0 lg:px-8">
          {extra.proof.map(([value, label]) => (
            <div className="px-4 py-5 text-center sm:py-6" key={label}>
              <p className="font-display text-xl uppercase text-orange-400 sm:text-2xl">
                {value}
              </p>
              <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white/42 sm:text-[11px]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(249,115,22,0.16),transparent_28%),radial-gradient(circle_at_90%_80%,rgba(245,158,11,0.10),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-orange-400">
              {extra.problemEyebrow}
            </p>
            <h2 className="mt-4 font-display text-3xl uppercase leading-tight sm:text-5xl">
              {extra.problemTitle}
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/65">
              {extra.problemBody}
            </p>
            <p className="mt-6 border-l-2 border-orange-500 bg-gradient-to-r from-orange-500/12 to-transparent px-5 py-4 text-sm font-semibold leading-7 text-orange-100/80">
              {extra.positioning}
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {page.stats.map(([value, label]) => (
                <div
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  key={label}
                >
                  <p className="font-display text-3xl text-orange-400">{value}</p>
                  <p className="mt-2 text-[11px] font-bold uppercase leading-5 text-white/48">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[440px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#11120f]">
            <Image
              alt={locale === "pt" ? "Atleta em ação no futebol" : "Football player in action"}
              className="absolute inset-0 h-full w-full object-cover object-center"
              fill
              sizes="(min-width:1024px) 55vw, 100vw"
              src={athletePhotos.match}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="max-w-xl text-lg font-bold leading-7 text-white">
                {page.fitLead}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/8 bg-[#11120f] py-20" id="estrutura">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-orange-400">
              {page.structureTitle}
            </p>
            <h2 className="mt-4 font-display text-3xl uppercase leading-tight sm:text-5xl">
              {page.structureH2}
            </h2>
            <p className="mt-5 text-base leading-8 text-white/62">
              {page.structureLead}
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {page.sessions.map((session, index) => {
              const Icon = session.icon;
              return (
                <article
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.025] p-6"
                  key={session.title}
                >
                  <div className="absolute right-4 top-2 font-display text-7xl text-white/[0.04]">
                    0{index + 1}
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-300 text-black">
                    <Icon aria-hidden="true" className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-extrabold text-white">
                    {session.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/58">
                    {session.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.18),transparent_38%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-orange-400">
              {extra.matchEyebrow}
            </p>
            <h2 className="mt-4 font-display text-3xl uppercase leading-tight sm:text-5xl">
              {extra.matchTitle}
            </h2>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {[
              { title: extra.oneGame, steps: extra.oneGameSteps, icon: CalendarDays },
              { title: extra.twoGames, steps: extra.twoGameSteps, icon: Gauge }
            ].map((week, weekIndex) => {
              const Icon = week.icon;
              return (
                <article
                  className="rounded-3xl border border-orange-300/15 bg-gradient-to-br from-orange-500/12 via-white/[0.035] to-transparent p-6 sm:p-8"
                  key={week.title}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-black">
                      <Icon aria-hidden="true" className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-extrabold">{week.title}</h3>
                  </div>
                  <div className="mt-7 space-y-4">
                    {week.steps.map((step, index) => (
                      <div className="flex gap-4" key={step}>
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-orange-400/40 bg-orange-500/10 text-xs font-extrabold text-orange-300">
                          {index + 1}
                        </span>
                        <p className="text-sm leading-7 text-white/65">{step}</p>
                      </div>
                    ))}
                  </div>
                  {weekIndex === 1 ? (
                    <p className="mt-7 border-t border-white/10 pt-5 text-xs font-bold uppercase leading-5 text-orange-200/70">
                      {page.rules[3][1]}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-white/8 bg-[#11120f] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-orange-400">
              {page.phasesTitle}
            </p>
            <h2 className="mt-4 font-display text-3xl uppercase leading-tight sm:text-5xl">
              {page.phasesH2}
            </h2>
            <p className="mt-5 text-base leading-8 text-white/62">
              {page.phasesLead}
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {page.phases.map((phase, index) => (
              <article
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#080907] p-5"
                key={phase.title}
              >
                <div className="absolute -right-3 -top-5 font-display text-8xl text-orange-400/[0.07]">
                  {index + 1}
                </div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-orange-400">
                  {extra.phaseLabel} {index + 1} · {phase.weeks.replace(/Weeks|Semanas/g, extra.weeksLabel)}
                </p>
                <h3 className="mt-4 text-lg font-extrabold leading-6 text-white">
                  {phase.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-white/55">{phase.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div id="raptorpro">
        <RaptorProgramExperience locale={locale} variant="elanga" />
      </div>

      <section className="border-y border-white/8 bg-[#11120f] py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
          <div className="relative min-h-[500px] overflow-hidden rounded-[2rem] border border-white/10">
            <Image
              alt={locale === "pt" ? "Treinador orientando atleta" : "Coach guiding a player"}
              className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
              fill
              sizes="(min-width:1024px) 52vw, 100vw"
              src={athletePhotos.coach}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-orange-400">
              {extra.authorityEyebrow}
            </p>
            <h2 className="mt-4 font-display text-3xl uppercase leading-tight sm:text-5xl">
              {extra.authorityTitle}
            </h2>
            <p className="mt-6 text-base leading-8 text-white/64">
              {extra.authorityBody}
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {page.rules.map(([label, body]) => (
                <div
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  key={label}
                >
                  <p className="flex items-center gap-2 text-xs font-extrabold uppercase text-orange-300">
                    <Activity aria-hidden="true" className="h-4 w-4" />
                    {label}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/54">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-orange-400">
              {page.fitTitle}
            </p>
            <h2 className="mt-4 font-display text-3xl uppercase leading-tight sm:text-5xl">
              {page.fitH2}
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <article className="rounded-3xl border border-orange-300/20 bg-orange-500/[0.08] p-6">
              <p className="flex items-center gap-2 text-sm font-extrabold uppercase text-orange-300">
                <BadgeCheck aria-hidden="true" className="h-5 w-5" />
                {page.goodFitLabel}
              </p>
              <ul className="mt-5 space-y-4">
                {page.goodFit.map((item) => (
                  <li className="flex gap-3 text-sm leading-6 text-white/65" key={item}>
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-orange-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
            <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
              <p className="flex items-center gap-2 text-sm font-extrabold uppercase text-white/70">
                <Target aria-hidden="true" className="h-5 w-5" />
                {page.notFitLabel}
              </p>
              <ul className="mt-5 space-y-4">
                {page.notFit.map((item) => (
                  <li className="flex gap-3 text-sm leading-6 text-white/55" key={item}>
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-white/35" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="border-y border-white/8 bg-[#11120f] py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.65fr_1.35fr] lg:px-8">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-orange-400">
              {page.faqTitle}
            </p>
            <h2 className="mt-4 font-display text-3xl uppercase sm:text-5xl">
              {page.faqH2}
            </h2>
          </div>
          <div className="grid gap-4">
            {page.faqs.map((faq) => (
              <article
                className="rounded-2xl border border-white/10 bg-black/25 p-5"
                key={faq.question}
              >
                <h3 className="text-base font-extrabold text-white">{faq.question}</h3>
                <p className="mt-3 text-sm leading-7 text-white/56">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-700/45 via-orange-500/16 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <span className="inline-flex rounded-full border border-orange-300/30 bg-orange-500/12 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-orange-200">
              {extra.finalBadge}
            </span>
            <h2 className="mt-5 max-w-3xl font-display text-3xl uppercase leading-tight sm:text-5xl">
              {page.finalTitle}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/65">
              {page.finalBody}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              className="focus-ring inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-orange-400 px-7 text-sm font-extrabold uppercase text-white shadow-[0_18px_50px_rgba(249,115,22,0.25)] transition hover:brightness-110"
              href={checkoutHref}
            >
              {page.finalCta}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
            <Link
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full border border-white/18 px-6 text-sm font-bold uppercase text-white transition hover:bg-white hover:text-black"
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
