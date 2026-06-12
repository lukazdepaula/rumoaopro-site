import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import { CtaButton } from "@/components/cta-button";
import { ProgramsSection } from "@/components/programs-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { assets, nav } from "@/lib/content";

export const metadata: Metadata = {
  title: "Football training programs",
  description:
    "RumoAoPro training programs for offseason, strength and power, in-season maintenance and football performance."
};

const decisionRows = [
  {
    situation: "I have a short break and need structure fast.",
    path: "Offseason Program 30 Days",
    reason: "A direct 4-week plan for players who cannot waste the offseason."
  },
  {
    situation: "I want to build strength, power and physical presence.",
    path: "Adama Offseason Strength & Power",
    reason: "A 12-week offseason structure focused on strength and power."
  },
  {
    situation: "I am already in season and need to maintain my level.",
    path: "Projeto Elanga In-Season",
    reason: "Small doses of strength, speed and recovery around matches."
  },
  {
    situation: "My schedule changes every week and I need adjustments.",
    path: "Online Coaching",
    reason: "A 1:1 plan with weekly support, load control and direct feedback."
  }
];

export default function EnglishProgramsPage() {
  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader
        navItems={nav.en}
        ctaHref="/en/coaching#application"
        ctaLabel="Apply"
      />

      <section className="relative isolate overflow-hidden bg-ink text-white">
        <Image
          alt="Lukaz de Paula coaching athletes on the field"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[58%_center]"
          fill
          priority
          sizes="100vw"
          src={assets.coachFieldDrillWide}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,9,11,0.97)_0%,rgba(8,9,11,0.84)_48%,rgba(8,9,11,0.30)_100%)]" />
        <div className="mx-auto flex min-h-[calc(82svh-var(--header-height))] max-w-7xl items-center px-4 py-10 sm:px-6 md:min-h-[calc(78vh-var(--header-height))] lg:px-8">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-3">
              <p className="inline-flex rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold uppercase text-gold">
                RumoAoPro programs
              </p>
              <Link
                className="focus-ring inline-flex rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold uppercase text-white transition hover:bg-white hover:text-ink"
                href="/programas"
              >
                🇧🇷 Portugues
              </Link>
            </div>
            <h1 className="mt-5 font-display text-4xl uppercase leading-[1.03] sm:text-5xl lg:text-6xl">
              Choose the right training program for your football moment.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
              Ready-to-buy programs for serious players: short offseason,
              strength and power, and in-season maintenance. Built for football
              athletes who need direction, not random workouts.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaButton href="#programas" icon={ArrowRight}>
                See programs
              </CtaButton>
              <CtaButton href="/en/coaching#application" variant="secondary">
                I need 1:1 coaching
              </CtaButton>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              {[
                ["3", "English options"],
                ["PT + EN", "bilingual programs"],
                ["1:1", "custom coaching"]
              ].map(([value, label]) => (
                <div
                  className="rounded-lg border border-white/10 bg-white/[0.06] p-4"
                  key={label}
                >
                  <p className="font-display text-2xl uppercase text-white">
                    {value}
                  </p>
                  <p className="mt-2 text-xs font-bold uppercase leading-5 text-white/55">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ProgramsSection locale="en" />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-sm font-bold uppercase text-signal">
                What should I buy?
              </p>
              <h2 className="mt-3 font-display text-3xl uppercase text-ink sm:text-4xl">
                Choose by the problem you need to solve
              </h2>
              <p className="mt-4 text-base leading-7 text-graphite/75">
                Programs are best when the goal is clear. Coaching is better
                when your week changes constantly and you need adjustments.
              </p>
            </div>
            <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
              {decisionRows.map((row) => (
                <div
                  className="grid gap-4 border-b border-ink/10 p-5 last:border-b-0 md:grid-cols-[1fr_0.72fr_1fr]"
                  key={row.situation}
                >
                  <p className="text-sm font-semibold leading-6 text-ink">
                    {row.situation}
                  </p>
                  <p className="flex gap-2 text-sm font-bold leading-6 text-signal">
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0"
                    />
                    <span>{row.path}</span>
                  </p>
                  <p className="text-sm leading-6 text-graphite/70">
                    {row.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[1fr_1fr] md:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-gold">
              Inside the athlete app
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">
              Calendar, sessions and instructions in one place.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/70">
              The programs are built to help players see the week, follow the
              session, track completion and understand the purpose of each
              training day.
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <Image
              alt="Training program interface inside the athlete app"
              className="aspect-[16/10] w-full object-cover"
              height={900}
              src={assets.appCalendarScreen}
              width={1440}
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-signal">
              Need something individual?
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase text-ink sm:text-4xl">
              Online coaching is still the main product.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-graphite/75">
              If you have matches, team sessions, fatigue, injury history or a
              schedule that changes every week, the 1:1 plan is the safer path.
            </p>
          </div>
          <Link
            className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-signal px-5 text-sm font-bold text-white transition hover:bg-[#b90f20]"
            href="/en/coaching#application"
          >
            Apply for coaching
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
