import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Dumbbell,
  GraduationCap,
  MessageCircle,
  ShieldCheck,
  Trophy,
  Users,
  Zap
} from "lucide-react";
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
    "RumoAoPro homepage with online coaching, individual football programs, courses, and football performance methodology."
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
    eyebrow: "Instant access",
    image: assets.programsGameDuel,
    icon: Dumbbell,
    body:
      "Pick a ready-to-follow plan for offseason, pre-season, in-season, or return-to-play phases.",
    cta: "View programs"
  },
  {
    title: "Courses",
    href: "#courses",
    eyebrow: "Coming soon",
    image: assets.programsGymBriefing,
    icon: GraduationCap,
    body:
      "Educational content for players and coaches who want to understand football performance better.",
    cta: "See the idea"
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
    eyebrow: "Train with strategy all year",
    icon: Zap,
    image: assets.programsSprintChase,
    body:
      "Choose the program that matches your season phase. Build your base in the offseason, sharpen the final 30 days, and maintain performance in-season.",
    points: [
      "Immediate access after payment",
      "Materials organized in your client area",
      "English programs with Portuguese options available"
    ],
    href: "/en/programs",
    cta: "Compare programs"
  },
  {
    title: "Courses",
    eyebrow: "The next RumoAoPro layer",
    icon: BookOpen,
    image: assets.coachGym,
    body:
      "Courses will help players and coaches understand the why behind the method: physical preparation, routine, recovery, speed, and better training decisions.",
    points: [
      "Direct educational content",
      "Built from practical football experience",
      "Planned for a future phase of the site"
    ],
    href: "#courses",
    cta: "See what is coming"
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
    title: "Offseason",
    body: "Build strength, power, and speed with Adama and Project 36."
  },
  {
    step: "02",
    title: "Final 30 days",
    body: "Use Offseason 30 Days to arrive ready for pre-season."
  },
  {
    step: "03",
    title: "In-season",
    body: "Maintain strength and speed with Elanga without disrupting team training and matches."
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
              Choose the right path: individual coaching, ready-to-follow
              programs by season phase, or content to understand how to train
              like an athlete.
            </p>
          </div>

          <div className="mt-10" id="entry">
            <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-white/55">
              <span className="h-px w-10 bg-signal" />
              Choose your entry point
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {entryCards.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    className="group relative min-h-[290px] overflow-hidden rounded-lg border border-white/15 bg-white/[0.06] shadow-card transition hover:-translate-y-1 hover:border-white/35"
                    href={item.href}
                    key={item.title}
                  >
                    <Image
                      alt=""
                      className="h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-85"
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      src={item.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/45 to-black/20" />
                    <div className="relative flex h-full min-h-[290px] flex-col justify-between p-5">
                      <div className="flex items-start justify-between gap-4">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-white text-ink">
                          <Icon aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <span className="rounded-md bg-black/45 px-3 py-2 text-xs font-bold uppercase text-white/75">
                          {item.eyebrow}
                        </span>
                      </div>
                      <div>
                        <h2 className="font-display text-3xl uppercase leading-none text-white sm:text-4xl">
                          {item.title}
                        </h2>
                        <p className="mt-3 max-w-sm text-sm font-semibold leading-6 text-white/75">
                          {item.body}
                        </p>
                        <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase text-white">
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

      <section className="bg-smoke py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase text-signal">
                Overview
              </p>
              <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-5xl">
                Three paths. One goal: play better.
              </h2>
            </div>
            <p className="text-base leading-8 text-graphite/70">
              RumoAoPro was built for players who want to stop training in the
              dark. Start with a ready-made product, enter individual coaching,
              or study the principles behind football physical preparation.
            </p>
          </div>

          <div className="mt-9 grid gap-5 lg:grid-cols-3">
            {productBlocks.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm"
                  id={item.href === "#courses" ? "courses" : undefined}
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
                Year-round training
              </p>
              <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-5xl">
                Train with the right plan for every phase of your season.
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
              If your routine changes every week, choose coaching. If you
              already know your season phase, choose a program and access the
              material directly in the client area.
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
