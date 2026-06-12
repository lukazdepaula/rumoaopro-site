import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Dumbbell,
  ExternalLink,
  Globe2,
  Instagram,
  MessageCircle,
  Star,
  Target,
  Youtube
} from "lucide-react";
import {
  assets,
  contact,
  performanceEnvironments,
  playerPathLogos,
  programsEn
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Links",
  description:
    "RumoAoPro main links for online coaching, football training programs, WhatsApp, Instagram and YouTube."
};

const socialLinks = [
  {
    label: "WhatsApp",
    href: `https://wa.me/${contact.whatsapp}`,
    icon: MessageCircle
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/lukazdepaula/",
    icon: Instagram
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@RumoAoPro",
    icon: Youtube
  }
];

export default function EnglishLinksPage() {
  return (
    <main className="min-h-screen bg-ink px-4 py-8 text-white sm:px-6">
      <section className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <Link className="focus-ring inline-flex items-center gap-3" href="/">
            <img
              alt="RumoAoPro"
              className="h-12 w-12 object-contain"
              height={48}
              src={assets.logo}
              width={48}
            />
            <span className="font-display text-xl uppercase">RumoAoPro</span>
          </Link>
          <Link
            className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 text-sm font-bold text-white transition hover:bg-white hover:text-ink"
            href="/links"
          >
            <Globe2 aria-hidden="true" className="h-4 w-4" />
            🇧🇷 PT
          </Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-white/10">
          <Image
            alt="Lukaz de Paula coaching athletes on the field"
            className="h-72 w-full object-cover object-[50%_35%]"
            height={1536}
            priority
            src={assets.coachFieldDrillWide}
            width={2300}
          />
        </div>

        <div className="mt-6">
          <p className="text-sm font-bold uppercase text-gold">
            Football performance coaching and programs
          </p>
          <h1 className="mt-3 font-display text-4xl uppercase leading-tight">
            Train with a football-specific structure.
          </h1>
          <p className="mt-4 text-base leading-7 text-white/72">
            Lukaz de Paula is a CBF A licensed strength and conditioning coach,
            currently physical performance coordinator for FC Malaga City and CD
            Almunecar City in Spain. He previously worked at Lindsey Wilson
            University in the United States and directed physical training at
            Extratime Performance in Jeddah. He also lived the game as a player:
            college soccer in the U.S., Colorado Rapids U23, Desportivo Brasil,
            Vasalunds IF and CD Almunecar City.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[...performanceEnvironments, ...playerPathLogos].map((item) => (
            <div
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-3"
              key={`${item.name}-${item.role}`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white p-2">
                <Image
                  alt={item.name}
                  className="h-full w-full object-contain"
                  height={48}
                  src={item.image}
                  width={48}
                />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{item.name}</p>
                <p className="text-xs font-semibold uppercase text-white/45">
                  {item.role}
                </p>
              </div>
            </div>
          ))}
        </div>

        <a
          className="focus-ring mt-6 block rounded-lg bg-signal p-5 text-white shadow-clean transition hover:bg-[#b90f20]"
          href="/en/coaching#application"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-1 text-sm font-bold uppercase text-white/85">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    aria-hidden="true"
                    className="h-4 w-4 fill-current"
                    key={star}
                  />
                ))}
                5-star rated support
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                Apply for Online Coaching
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/85">
                Individual program, personalized calendar, load monitoring and
                weekly support directly with the coach.
              </p>
              <p className="mt-4 inline-flex rounded-md bg-white px-3 py-2 text-xs font-bold uppercase text-signal">
                Only 3 spots currently available
              </p>
            </div>
            <ArrowRight aria-hidden="true" className="mt-1 h-6 w-6 shrink-0" />
          </div>
        </a>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            className="focus-ring flex min-h-14 items-center justify-between rounded-md border border-white/10 bg-white px-4 text-ink transition hover:bg-steel"
            href="/en/programs"
          >
            <span className="flex items-center gap-3 text-sm font-bold">
              <Dumbbell aria-hidden="true" className="h-5 w-5 text-signal" />
              See English programs
            </span>
            <ArrowRight aria-hidden="true" className="h-4 w-4 text-ink/50" />
          </Link>
          <Link
            className="focus-ring flex min-h-14 items-center justify-between rounded-md border border-white/10 bg-white px-4 text-ink transition hover:bg-steel"
            href="/programas"
          >
            <span className="flex items-center gap-3 text-sm font-bold">
              <Target aria-hidden="true" className="h-5 w-5 text-signal" />
              Catalogo em portugues
            </span>
            <ArrowRight aria-hidden="true" className="h-4 w-4 text-ink/50" />
          </Link>
        </div>

        <section className="mt-10">
          <p className="text-sm font-bold uppercase text-gold">
            Available programs
          </p>
          <div className="mt-4 grid gap-4">
            {programsEn.map((program) => (
              <a
                className="focus-ring grid overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] transition hover:bg-white/10 sm:grid-cols-[150px_1fr]"
                href={program.href}
                key={program.title}
                rel="noreferrer"
                target="_blank"
              >
                <Image
                  alt={program.title}
                  className="h-40 w-full object-cover sm:h-full"
                  height={300}
                  src={program.image}
                  width={300}
                />
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-bold uppercase text-ink">
                      {program.tag}
                    </span>
                    <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-bold uppercase text-white/70">
                      {program.duration}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-white">
                    {program.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    {program.body}
                  </p>
                  <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-gold">
                    Buy program
                    <ExternalLink aria-hidden="true" className="h-4 w-4" />
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {socialLinks.map((link) => {
            const Icon = link.icon;

            return (
              <a
                className="focus-ring flex min-h-14 items-center justify-between rounded-md border border-white/10 bg-white px-4 text-ink transition hover:bg-steel"
                href={link.href}
                key={link.label}
                rel="noreferrer"
                target="_blank"
              >
                <span className="flex items-center gap-3 text-sm font-bold">
                  <Icon aria-hidden="true" className="h-5 w-5 text-signal" />
                  {link.label}
                </span>
                <ExternalLink
                  aria-hidden="true"
                  className="h-4 w-4 text-ink/50"
                />
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}
