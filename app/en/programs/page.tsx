import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ExternalLink } from "lucide-react";
import { CtaButton } from "@/components/cta-button";
import { ProgramsSection } from "@/components/programs-section";
import { SeasonProgramMap } from "@/components/season-program-map";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { assets, nav } from "@/lib/content";

export const metadata: Metadata = {
  title: "Football training programs",
  description:
    "RumoAoPro football programs for players to train strength, speed, conditioning and performance in every season phase."
};

export default function EnglishProgramsPage() {
  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader
        navItems={nav.en}
        ctaHref="/en/coaching#application"
        ctaLabel="Apply"
        languageHref="/programas"
      />

      <section className="relative isolate overflow-hidden bg-ink text-white">
        <Image
          alt="Football player sprinting in a match"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[58%_center]"
          fill
          priority
          sizes="100vw"
          src={assets.programsSprintChase}
        />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_16%,rgba(213,22,42,0.22),transparent_34%),radial-gradient(circle_at_16%_76%,rgba(119,213,223,0.13),transparent_30%),linear-gradient(90deg,rgba(8,9,11,0.97)_0%,rgba(8,9,11,0.84)_48%,rgba(8,9,11,0.30)_100%)]" />
        <div className="mx-auto flex min-h-[calc(76svh-var(--header-height))] max-w-7xl items-center px-4 py-10 sm:px-6 md:min-h-[calc(72vh-var(--header-height))] lg:px-8">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-3">
              <p className="inline-flex rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold uppercase text-gold">
                RumoAoPro programs
              </p>
              <Link
                className="focus-ring inline-flex rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold uppercase text-white transition hover:bg-white hover:text-ink"
                href="/programas"
              >
                🇺🇸 English → Português
              </Link>
            </div>
            <h1 className="mt-5 font-display text-4xl uppercase leading-[1.03] sm:text-5xl lg:text-6xl">
              Train with the right plan for each phase of your season.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
              Build strength and speed in the offseason, sharpen the final block
              before preseason and maintain performance once matches are back.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaButton href="#programas" icon={ArrowRight}>
                See programs
              </CtaButton>
              <CtaButton href="/en/coaching#application" variant="secondary">
                I need 1:1 coaching
              </CtaButton>
            </div>
          </div>
        </div>
      </section>

      <ProgramsSection locale="en" />

      <SeasonProgramMap locale="en" />

      <section className="bg-ink py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[0.85fr_1.15fr] md:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-gold">
              When to choose coaching
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">
              Your routine changes. Your training should too.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/70">
              Programs work best when the goal is clear and the schedule allows
              structure. If you need load changes around matches, fatigue,
              injury history or team training, 1:1 coaching is the safer path.
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <Image
              alt="Coach testing a football player's jump in a performance facility"
              className="aspect-[16/11] w-full object-cover object-[center_42%]"
              height={820}
              src={assets.programsJumpTest}
              width={1200}
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
              High-performance individual training for athletes chasing the next level.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-graphite/75">
              If your schedule changes every week, Online Coaching is the most
              complete option, with a plan adjusted around your real routine.
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
