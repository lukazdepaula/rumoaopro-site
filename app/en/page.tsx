import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Dumbbell,
  GraduationCap,
  LayoutDashboard,
  MessageCircle,
  ShieldCheck,
  Trophy,
  Users,
  Zap
} from "lucide-react";
import { HomeProgramCollections } from "@/components/home-program-collections";
import { LoadProPromo } from "@/components/loadpro-promo";
import { ReviewsSection } from "@/components/reviews";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  assets,
  nav,
  performanceEnvironments,
  playerPathLogos,
  successCases
} from "@/lib/content";

export const metadata: Metadata = {
  title: "RumoAoPro | Football performance, programs and coaching",
  description:
    "Coaching, interactive RaptorPro programs, courses and LoadPro software for football players and coaches."
};

const entryCards = [
  {
    title: "Online Coaching",
    href: "/en/coaching",
    eyebrow: "Individual plan",
    image: assets.coachFieldDrillWide,
    icon: MessageCircle,
    body:
      "For players who want coaching, weekly adjustments, and a training plan built around real life.",
    cta: "Enter coaching"
  },
  {
    title: "Individual Programs",
    href: "/en/programs",
    eyebrow: "In RaptorPro",
    image: assets.programsGameDuel,
    icon: Dumbbell,
    body:
      "Offseason 30 Days, Speed Pro and Elanga for every phase of the season.",
    cta: "View programs"
  },
  {
    title: "Preparador PRO",
    href: "/en/courses",
    eyebrow: "Course for coaches",
    image: assets.programsGymBriefing,
    icon: GraduationCap,
    body:
      "Learn how to organize and apply physical preparation for football players. Available in Portuguese.",
    cta: "Explore the course"
  },
  {
    title: "LoadPro",
    href: "/en/apps",
    eyebrow: "App for coaches",
    image: assets.coachCollage,
    icon: LayoutDashboard,
    body:
      "Plan the microcycle, monitor training load and manage your players in one place.",
    cta: "Explore LoadPro"
  }
];

const productBlocks = [
  {
    title: "Online Coaching",
    eyebrow: "Best for personalization",
    icon: Users,
    image: assets.coachGymInstruction,
    body:
      "Your routine changes. Your training should change with it. Coaching organizes field work, gym work, matches, travel, recovery, and your physical history into one individual plan.",
    points: [
      "Planning adjusted to your week",
      "Coach feedback and support",
      "Recommended for players who want to evolve like professionals"
    ],
    href: "/en/coaching",
    cta: "Explore coaching"
  },
  {
    title: "Individual Programs",
    eyebrow: "Train with strategy in RaptorPro",
    icon: Zap,
    image: assets.sprintSide,
    body:
      "Offseason 30 Days, Speed Pro and Elanga combine planning, videos and workout tracking in an interactive experience.",
    points: [
      "Offseason 30 Days, Speed Pro and Elanga",
      "Calendar, videos, loads, comments and RPE",
      "English and Portuguese with lifetime access"
    ],
    href: "/en/programs",
    cta: "Compare programs"
  },
  {
    title: "Preparador PRO",
    eyebrow: "Practical education for coaches",
    icon: BookOpen,
    image: assets.coachGym,
    body:
      "A direct platform to learn how to plan power, periodization, assessments, speed and endurance for football players.",
    points: [
      "Online content currently in Portuguese",
      "Practical application for performance coaches",
      "Purchase and access processed by Kiwify"
    ],
    href: "/en/courses",
    cta: "Explore Preparador PRO"
  }
];

const trainerStats = [
  { value: "CBF A", label: "football physical preparation license" },
  { value: "4", label: "countries across career and performance work" },
  { value: "1:1", label: "methodology applied with real players" }
];

const seasonFlow = [
  {
    step: "01",
    title: "Choose your program",
    body:
      "Choose Offseason 30 Days, Speed Pro or Elanga according to your goal and current season phase."
  },
  {
    step: "02",
    title: "Follow the calendar",
    body:
      "Open RaptorPro, select the day and see the complete workout organized in a clear sequence."
  },
  {
    step: "03",
    title: "Track your progress",
    body:
      "Save loads, comments and RPE to review what you completed and train with greater intent."
  }
];

export default function EnglishHomePage() {
  const featuredCases = successCases.en.slice(0, 3);

  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader navItems={nav.en} ctaLabel="Start" ctaHref="#entry" />

      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 -z-10">
          <Image
            alt="Football players competing for the ball"
            className="h-full w-full object-cover object-center opacity-45"
            fill
            priority
            sizes="100vw"
            src={assets.programsGameDuel}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/65 to-ink" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-smoke to-transparent" />
        </div>

        <div className="mx-auto flex min-h-[calc(100vh-var(--header-height))] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="inline-flex rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold uppercase text-white/75">
              RumoAoPro Performance
            </p>
            <h1 className="mt-6 font-display text-4xl uppercase leading-[1.02] sm:text-6xl lg:text-7xl">
              What do you need right now to evolve in football?
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
              Choose between individual coaching, interactive player programs,
              professional education and technology that helps coaches and
              performance staff organize their work.
            </p>
          </div>

          <div className="mt-10" id="entry">
            <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-white/55">
              <span className="h-px w-10 bg-signal" />
              Choose your entry point
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
              {entryCards.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    className="group relative min-h-[220px] overflow-hidden rounded-xl border border-white/15 bg-black shadow-[0_20px_55px_rgba(0,0,0,0.32)] transition hover:-translate-y-1 hover:border-white/35 sm:min-h-[280px] xl:min-h-[310px]"
                    href={item.href}
                    key={item.title}
                  >
                    <Image
                      alt=""
                      className={`h-full w-full object-cover opacity-60 transition duration-500 group-hover:scale-105 group-hover:opacity-75 ${item.title === "LoadPro" ? "object-[50%_38%]" : "object-center"}`}
                      fill
                      sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 25vw"
                      src={item.image}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.58)_48%,rgba(0,0,0,0.96)_100%)]" />
                    <div className="relative flex h-full min-h-[220px] flex-col justify-between p-4 sm:min-h-[280px] sm:p-5 xl:min-h-[310px]">
                      <div className="flex items-start justify-between gap-4">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-white text-ink">
                          <Icon aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <span className="max-w-[102px] rounded-md border border-white/10 bg-black/75 px-2 py-2 text-[9px] font-bold uppercase leading-4 text-white/82 backdrop-blur-md sm:max-w-none sm:px-3 sm:text-xs">
                          {item.eyebrow}
                        </span>
                      </div>
                      <div>
                        <h2 className="font-display text-2xl uppercase leading-none text-white sm:text-3xl">
                          {item.title}
                        </h2>
                        <p className="mt-3 hidden max-w-sm text-sm font-semibold leading-6 text-white/82 sm:block">
                          {item.body}
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 border-t border-white/15 pt-4 text-[11px] font-bold uppercase leading-4 text-white sm:mt-5 sm:text-sm">
                          {item.cta}
                          <ArrowRight
                            aria-hidden="true"
                            className="h-4 w-4 transition group-hover:translate-x-1"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <HomeProgramCollections locale="en" />

      <LoadProPromo locale="en" />

      <section className="bg-smoke py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase text-signal">
                Overview
              </p>
              <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-5xl">
                Solutions for players and coaches.
              </h2>
            </div>
            <p className="text-base leading-8 text-graphite/70">
              RumoAoPro connects coaching, interactive programs, education and
              technology for people who want to train, plan and make clearer
              decisions in football.
            </p>
          </div>

          <div className="mt-9 grid gap-5 lg:grid-cols-3">
            {productBlocks.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm"
                  id={item.href.includes("course") ? "courses" : undefined}
                  key={item.title}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      alt={item.title}
                      className="h-full w-full object-cover object-center"
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      src={item.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className="absolute left-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-white text-signal">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                  </div>

                  <div className="p-6">
                    <p className="text-xs font-bold uppercase text-signal">
                      {item.eyebrow}
                    </p>
                    <h3 className="mt-3 text-2xl font-bold text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-graphite/70">
                      {item.body}
                    </p>

                    <div className="mt-5 grid gap-3">
                      {item.points.map((point) => (
                        <p
                          className="flex gap-2 text-sm font-semibold leading-6 text-graphite/75"
                          key={point}
                        >
                          <CheckCircle2
                            aria-hidden="true"
                            className="mt-0.5 h-4 w-4 shrink-0 text-turf"
                          />
                          <span>{point}</span>
                        </p>
                      ))}
                    </div>

                    <Link
                      className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-bold text-white transition hover:bg-graphite"
                      href={item.href}
                    >
                      {item.cta}
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase text-signal">
                Programs in RaptorPro
              </p>
              <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-5xl">
                A clearer experience from the first to the final workout.
              </h2>
            </div>
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink/10 bg-smoke px-4 py-3 text-sm font-bold text-ink transition hover:bg-steel"
              href="/en/programs"
            >
              View all programs
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {seasonFlow.map((item) => (
              <article
                className="rounded-lg border border-ink/10 bg-smoke p-6"
                key={item.step}
              >
                <p className="font-display text-4xl uppercase text-signal">
                  {item.step}
                </p>
                <h3 className="mt-4 text-xl font-bold text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-graphite/70">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
              <Image
                alt="Lukaz de Paula coaching players in the gym"
                className="aspect-[4/5] h-full w-full object-cover object-[center_16%]"
                height={1536}
                src={assets.coachGymInstruction}
                width={1152}
              />
            </div>
            <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] sm:mt-12">
              <Image
                alt="Lukaz de Paula playing football"
                className="aspect-[4/5] h-full w-full object-cover object-center"
                height={1536}
                src={assets.coachFieldPlaying}
                width={1152}
              />
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold uppercase text-gold">
              Who is behind it
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-5xl">
              A coaching methodology shaped by real player experience.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/75">
              Lukaz de Paula is a CBF A licensed physical coach who built
              RumoAoPro by combining study, field work, gym work, and his own
              player career. The method comes from practice: understanding what
              players feel, what the season demands, and how to turn training
              into performance.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {trainerStats.map((stat) => (
                <div
                  className="rounded-lg border border-white/10 bg-white/[0.06] p-4"
                  key={stat.label}
                >
                  <p className="font-display text-3xl uppercase text-white">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-xs font-bold uppercase leading-5 text-white/60">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
                <div className="flex items-center gap-2 text-sm font-bold uppercase text-gold">
                  <Trophy aria-hidden="true" className="h-5 w-5" />
                  As a coach
                </div>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  Experience in performance environments such as FC Malaga
                  City, CD Almunecar City, Lindsey Wilson University, and
                  Extratime Performance.
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
                <div className="flex items-center gap-2 text-sm font-bold uppercase text-gold">
                  <ShieldCheck aria-hidden="true" className="h-5 w-5" />
                  As a player
                </div>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  Player pathway through college soccer in the United States
                  and clubs including Colorado Rapids U23, Desportivo Brasil,
                  Vasalunds IF, and CD Almunecar City.
                </p>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[...performanceEnvironments, ...playerPathLogos]
                .slice(0, 8)
                .map((item) => (
                  <div
                    className="flex min-h-[88px] items-center justify-center rounded-md bg-white p-3"
                    key={`${item.name}-${item.role}`}
                  >
                    <Image
                      alt={item.name}
                      className="max-h-12 w-full object-contain"
                      height={64}
                      src={item.image}
                      width={140}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-smoke py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase text-signal">
                Trained players
              </p>
              <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-5xl">
                The methodology has already appeared across different levels of
                football.
              </h2>
              <p className="mt-4 text-base leading-7 text-graphite/70">
                From developing players to professionals, the goal is to
                organize strength, speed, power, recovery, and routine with
                more clarity.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-ink/10 bg-white px-4 py-3 text-sm font-bold text-graphite/70">
              <Trophy aria-hidden="true" className="h-5 w-5 text-gold" />
              Real RumoAoPro cases
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {featuredCases.map((item) => (
              <article
                className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm"
                key={item.name}
              >
                <Image
                  alt={item.name}
                  className="aspect-[16/12] w-full object-cover object-top"
                  height={520}
                  src={item.image}
                  width={720}
                />
                <div className="p-5">
                  <h3 className="text-xl font-bold text-ink">{item.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-graphite/70">
                    {item.quote}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ReviewsSection
        eyebrow="Reviews"
        groupKey="coaching"
        locale="en"
        showSourceNote={false}
        title="What players say about training with RumoAoPro"
      />

      <section className="bg-signal py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-bold uppercase text-white/75">
              <ShieldCheck aria-hidden="true" className="h-5 w-5" />
              Start with the right product
            </div>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">
              Do you need full coaching or a program you can execute now?
            </h2>
            <p className="mt-4 text-base leading-7 text-white/75">
              If your routine changes every week, choose coaching. To train with
              Offseason 30 Days or Speed Pro, buy once and follow the program
              inside RaptorPro. Classic programs remain available in the catalog.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-steel"
              href="/en/coaching"
            >
              Online Coaching
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
              href="/en/programs"
            >
              Individual Programs
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
