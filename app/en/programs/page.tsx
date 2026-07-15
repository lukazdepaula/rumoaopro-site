import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ExternalLink } from "lucide-react";
import { CtaButton } from "@/components/cta-button";
import { ProgramsSection } from "@/components/programs-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { assets, nav } from "@/lib/content";

export const metadata: Metadata = {
  title: "Football training programs",
  description:
    "RumoAoPro football training programs for offseason strength, speed, final 30 days of preparation and in-season maintenance."
};

const annualPath = [
  {
    step: "01",
    title: "Offseason",
    body:
      "Build a solid base of strength, power and speed with Adama and Project 36.",
    image: assets.programsGymBriefing,
    imageClass: "object-[center_18%]",
    href: "#programas",
    cta: "See offseason"
  },
  {
    step: "02",
    title: "Final 30 days before preseason",
    body:
      "Use Offseason 30 Days to sharpen conditioning and arrive prepared for the return to training.",
    image: assets.programsPlayerReady,
    imageClass: "object-[center_18%]",
    href: "/en/programs/offseason-30-days",
    cta: "See 30 days"
  },
  {
    step: "03",
    title: "During the season",
    body:
      "Maintain performance with Elanga, preserving strength, speed and power without disrupting team training and matches.",
    image: assets.programsProMatch,
    imageClass: "object-center",
    href: "/en/programs/elanga-in-season",
    cta: "See Elanga"
  }
];

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
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              {[
                ["4", "English options"],
                ["Full year", "offseason to season"],
                ["1:1", "when you need adjustments"]
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

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-[0.7fr_1.3fr] md:items-end">
            <div>
              <p className="text-sm font-bold uppercase text-signal">
                Player path
              </p>
              <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-4xl">
                A complete method to evolve through the whole year.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-graphite/75">
              The ideal preparation starts in the offseason with Adama and
              Project 36. The final 30 days before preseason are sharpened with
              Offseason 30 Days. During the season, Elanga helps maintain
              strength and speed without compromising recovery.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {annualPath.map((item) => (
              <Link
                className="focus-ring group block overflow-hidden rounded-lg bg-smoke shadow-sm ring-1 ring-ink/10 transition hover:-translate-y-1 hover:shadow-card"
                href={item.href}
                key={item.step}
              >
                <div className="relative overflow-hidden bg-ink">
                  <Image
                    alt={item.title}
                    className={`aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-105 ${item.imageClass}`}
                    height={620}
                    src={item.image}
                    width={960}
                  />
                  <div className="absolute left-4 top-4 rounded-md bg-white px-3 py-2 text-xs font-bold uppercase text-ink">
                    {item.step}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-ink">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-graphite/72">
                    {item.body}
                  </p>
                  <p className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-signal">
                    {item.cta}
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ProgramsSection locale="en" />

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
