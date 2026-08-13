import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Gauge,
  HeartPulse,
  ShieldCheck
} from "lucide-react";
import { assets } from "@/lib/content";

type SeasonProgramMapProps = {
  locale: "pt" | "en";
};

const content = {
  pt: {
    eyebrow: "Rota do atleta",
    title: "Um programa para cada momento da temporada.",
    body:
      "Em vez de repetir os mesmos produtos, este mapa mostra onde cada programa entra e qual problema ele resolve.",
    featureEyebrow: "Desenvolvimento físico",
    featureTitle: "Aumente sua força e velocidade.",
    featureBody:
      "Use a offseason para construir força, potência, aceleração e velocidade máxima com uma progressão clara.",
    featureCta: "Conhecer o Speed Pro",
    featureHref: "/programas/projeto-36kmh",
    mapEyebrow: "Mapa da temporada",
    mapTitle: "Escolha pelo seu momento, não pelo nome.",
    phases: [
      {
        label: "Offseason",
        title: "Construir capacidade",
        body: "Speed Pro · força, potência, aceleração e velocidade.",
        href: "/programas/projeto-36kmh",
        icon: Gauge,
        accent: "bg-lime-300 text-[#07100b]"
      },
      {
        label: "30 dias finais",
        title: "Chegar pronto à pré-temporada",
        body: "Offseason 30 Days · campo, academia e condicionamento.",
        href: "/programas/offseason-30-days",
        icon: CalendarClock,
        accent: "bg-blue-600 text-white"
      },
      {
        label: "Temporada competitiva",
        title: "Manter sem atrapalhar os jogos",
        body: "In-Season Pro · dose de força, potência e velocidade entre partidas.",
        href: "/programas/elanga-in-season",
        icon: ShieldCheck,
        accent: "bg-orange-500 text-white"
      },
      {
        label: "Quando necessário",
        title: "Reconstruir o retorno ao campo",
        body: "De Volta aos Gramados · progressão após liberação profissional.",
        href: "/programas/de-volta-aos-gramados",
        icon: HeartPulse,
        accent: "bg-emerald-500 text-white"
      }
    ]
  },
  en: {
    eyebrow: "Athlete pathway",
    title: "A program for every stage of the season.",
    body:
      "Instead of repeating the same product cards, this map shows where each program fits and which problem it solves.",
    featureEyebrow: "Physical development",
    featureTitle: "Build strength and speed.",
    featureBody:
      "Use the offseason to develop strength, power, acceleration and top speed through a clear progression.",
    featureCta: "Explore Speed Pro",
    featureHref: "/en/programs/project-36kmh",
    mapEyebrow: "Season map",
    mapTitle: "Choose by your moment, not just by the name.",
    phases: [
      {
        label: "Offseason",
        title: "Build capacity",
        body: "Speed Pro · strength, power, acceleration and top speed.",
        href: "/en/programs/project-36kmh",
        icon: Gauge,
        accent: "bg-lime-300 text-[#07100b]"
      },
      {
        label: "Final 30 days",
        title: "Arrive ready for preseason",
        body: "Offseason 30 Days · field, gym and conditioning work.",
        href: "/en/programs/offseason-30-days",
        icon: CalendarClock,
        accent: "bg-blue-600 text-white"
      },
      {
        label: "Competitive season",
        title: "Maintain without fighting match demands",
        body: "In-Season Pro · strength, power and speed between matches.",
        href: "/en/programs/elanga-in-season",
        icon: ShieldCheck,
        accent: "bg-orange-500 text-white"
      },
      {
        label: "When needed",
        title: "Rebuild the return to football",
        body: "Back to the Pitch · progression after professional clearance.",
        href: "/en/programs/de-volta-aos-gramados",
        icon: HeartPulse,
        accent: "bg-emerald-500 text-white"
      }
    ]
  }
} as const;

export function SeasonProgramMap({ locale }: SeasonProgramMapProps) {
  const page = content[locale];

  return (
    <section className="bg-white py-16" id="mapa-da-temporada">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[0.78fr_1.22fr] md:items-end">
          <div>
            <p className="text-sm font-bold uppercase text-signal">
              {page.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-5xl">
              {page.title}
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-graphite/72">
            {page.body}
          </p>
        </div>

        <div className="mt-9 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Link
            className="focus-ring group relative min-h-[430px] overflow-hidden rounded-2xl bg-ink text-white shadow-card"
            href={page.featureHref}
          >
            <Image
              alt={page.featureTitle}
              className="h-full w-full object-cover object-[64%_50%] transition duration-700 group-hover:scale-105"
              fill
              sizes="(max-width: 1023px) 100vw, 45vw"
              src={assets.sprintSide}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_15%,rgba(0,0,0,0.28)_48%,rgba(0,0,0,0.94)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-lime-300">
                {page.featureEyebrow}
              </p>
              <h3 className="mt-3 max-w-lg font-display text-3xl uppercase leading-none sm:text-5xl">
                {page.featureTitle}
              </h3>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/72 sm:text-base">
                {page.featureBody}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-black uppercase text-white">
                {page.featureCta}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          <div className="rounded-2xl border border-ink/10 bg-smoke p-5 sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-signal">
              {page.mapEyebrow}
            </p>
            <h3 className="mt-3 text-2xl font-black leading-tight text-ink sm:text-3xl">
              {page.mapTitle}
            </h3>

            <div className="relative mt-6 grid gap-3 before:absolute before:bottom-8 before:left-[23px] before:top-8 before:w-px before:bg-ink/12 sm:before:left-[27px]">
              {page.phases.map((phase) => {
                const Icon = phase.icon;

                return (
                  <Link
                    className="focus-ring group relative grid grid-cols-[48px_1fr_auto] items-center gap-3 rounded-xl border border-ink/9 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-md sm:grid-cols-[56px_1fr_auto] sm:p-4"
                    href={phase.href}
                    key={phase.label}
                  >
                    <span className={`relative z-10 grid h-12 w-12 place-items-center rounded-xl sm:h-14 sm:w-14 ${phase.accent}`}>
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-signal">
                        {phase.label}
                      </span>
                      <span className="mt-1 block text-base font-black text-ink">
                        {phase.title}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-graphite/62 sm:text-sm">
                        {phase.body}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-ink/35 transition group-hover:translate-x-1 group-hover:text-signal" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
