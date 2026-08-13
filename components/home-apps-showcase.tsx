import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";

type HomeAppsShowcaseProps = {
  locale: "pt" | "en";
};

const copy = {
  pt: {
    eyebrow: "RumoAoPro Apps",
    title: "Tecnologia para quem treina e para quem treina atletas.",
    body:
      "Duas experiências conectadas ao futebol: gestão para treinadores e programas guiados para atletas.",
    allApps: "Conhecer os apps",
    loadProStatus: "Disponível agora",
    loadProTitle: "Microciclo e carga em um só lugar.",
    loadProBody:
      "Planejamento, prontidão, PSE, departamento médico e relatórios para a comissão.",
    loadProCta: "Testar grátis por 7 dias",
    raptorStatus: "Em breve",
    raptorTitle: "Treinos e coaching no celular.",
    raptorBody:
      "Calendário, vídeos, cargas, comentários e RPE para atletas e treinadores.",
    raptorCta: "Conhecer o RaptorPro"
  },
  en: {
    eyebrow: "RumoAoPro Apps",
    title: "Technology for players and the coaches who train them.",
    body:
      "Two football-focused experiences: team management for coaches and guided programs for players.",
    allApps: "Explore the apps",
    loadProStatus: "Available now",
    loadProTitle: "Microcycles and load in one place.",
    loadProBody:
      "Planning, readiness, RPE, medical workflow and staff-ready reports.",
    loadProCta: "Start your 7-day free trial",
    raptorStatus: "Coming soon",
    raptorTitle: "Training and coaching on your phone.",
    raptorBody:
      "Calendar, videos, loads, comments and RPE for players and coaches.",
    raptorCta: "Explore RaptorPro"
  }
} as const;

export function HomeAppsShowcase({ locale }: HomeAppsShowcaseProps) {
  const page = copy[locale];
  const appsHref = locale === "pt" ? "/apps" : "/en/apps";
  const loadProHref =
    locale === "pt"
      ? "/checkout/loadpro-founders"
      : "/en/checkout/loadpro-founders";

  return (
    <section className="border-b border-white/10 bg-ink py-14 text-white sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">
              {page.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-5xl">
              {page.title}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
              {page.body}
            </p>
          </div>
          <Link
            className="focus-ring inline-flex min-h-11 items-center gap-2 self-start rounded-md border border-white/15 px-4 py-3 text-xs font-black uppercase text-white transition hover:bg-white hover:text-ink md:self-auto"
            href={appsHref}
          >
            {page.allApps}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5">
          <Link
            className="group relative isolate min-h-[270px] overflow-hidden rounded-2xl border border-red-400/25 bg-[#16090b] p-4 shadow-[0_24px_60px_rgba(0,0,0,.3)] sm:min-h-[340px] sm:p-7"
            href={loadProHref}
          >
            <Image
              alt=""
              className="-z-20 object-cover object-left-top opacity-40 transition duration-500 group-hover:scale-105 group-hover:opacity-50"
              fill
              sizes="50vw"
              src="/assets/loadpro/product-dashboard-monitoring-v2.png"
            />
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,9,11,.2),rgba(8,9,11,.72)_42%,#08090b_100%)]" />

            <div className="flex h-full min-h-[238px] flex-col justify-between sm:min-h-[284px]">
              <span className="self-start rounded-full bg-emerald-400 px-2.5 py-2 text-[8px] font-black uppercase tracking-[0.1em] text-emerald-950 sm:px-3 sm:text-[10px] sm:tracking-[0.14em]">
                {page.loadProStatus}
              </span>
              <div>
                <Image
                  alt="LoadPro App"
                  className="h-auto w-[118px] object-contain sm:w-[180px]"
                  height={72}
                  src="/assets/loadpro/loadpro-logo-white-red-transparent.png"
                  width={340}
                />
                <h3 className="home-app-card-title mt-4 font-display uppercase text-white sm:text-3xl">
                  {page.loadProTitle}
                </h3>
                <p className="mt-3 hidden max-w-xl text-sm leading-6 text-white/65 sm:block">
                  {page.loadProBody}
                </p>
                <p className="mt-4 inline-flex items-center gap-2 border-t border-white/15 pt-3 text-[9px] font-black uppercase leading-4 text-white sm:text-sm">
                  {page.loadProCta}
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 transition group-hover:translate-x-1"
                  />
                </p>
              </div>
            </div>
          </Link>

          <Link
            className="group relative isolate min-h-[270px] overflow-hidden rounded-2xl border border-white/12 bg-[#111319] p-4 shadow-[0_24px_60px_rgba(0,0,0,.3)] sm:min-h-[340px] sm:p-7"
            href={`${appsHref}#raptorpro`}
          >
            <Image
              alt=""
              className="-z-20 object-cover object-top opacity-30 transition duration-500 group-hover:scale-105 group-hover:opacity-40"
              fill
              sizes="50vw"
              src="/assets/programs/offseason-30/raptor-athlete-calendar-mobile.png"
            />
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,9,11,.18),rgba(8,9,11,.76)_42%,#08090b_100%)]" />

            <div className="flex h-full min-h-[238px] flex-col justify-between sm:min-h-[284px]">
              <span className="self-start rounded-full border border-white/15 bg-black/55 px-2.5 py-2 text-[8px] font-black uppercase tracking-[0.1em] text-white/75 backdrop-blur sm:px-3 sm:text-[10px] sm:tracking-[0.14em]">
                {page.raptorStatus}
              </span>
              <div>
                <Clock3 aria-hidden="true" className="h-6 w-6 text-red-300 sm:h-7 sm:w-7" />
                <p className="mt-3 font-display text-lg uppercase leading-none text-white sm:text-4xl">
                  RaptorPro
                </p>
                <h3 className="home-app-card-title mt-2 font-display uppercase text-white sm:text-3xl">
                  {page.raptorTitle}
                </h3>
                <p className="mt-3 hidden max-w-xl text-sm leading-6 text-white/65 sm:block">
                  {page.raptorBody}
                </p>
                <p className="mt-4 inline-flex items-center gap-2 border-t border-white/15 pt-3 text-[9px] font-black uppercase leading-4 text-white sm:text-sm">
                  {page.raptorCta}
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 transition group-hover:translate-x-1"
                  />
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
