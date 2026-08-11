import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarRange,
  Clock3,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import { LoadProPromo } from "@/components/loadpro-promo";
import {
  RaptorPhoneMockup,
  raptorAppScreens
} from "@/components/raptor-program-experience";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { assets, nav } from "@/lib/content";

type AppsHubPageProps = {
  locale: "pt" | "en";
};

const copy = {
  pt: {
    languageHref: "/en/apps",
    languageLabel: "🇧🇷 PT → EN",
    eyebrow: "RumoAoPro Apps",
    title: "Tecnologia para organizar o futebol dentro e fora do campo.",
    lead:
      "Comece agora com o LoadPro. O RaptorPro está sendo preparado para reunir acompanhamento e programas em uma experiência própria para atletas e treinadores.",
    primaryCta: "Conhecer o LoadPro",
    loadProStatus: "Disponível agora",
    loadProBody:
      "Planejamento de microciclo, prontidão, dor, PSE, carga e relatórios para treinadores e comissões.",
    loadProCta: "Testar grátis por 7 dias",
    raptorStatus: "Em breve",
    raptorTitle: "RaptorPro",
    raptorBody:
      "A plataforma de coaching e execução dos programas RumoAoPro está evoluindo para uma experiência completa de treino no celular.",
    raptorPoints: [
      "Calendário individual de treinos",
      "Vídeos, cargas, comentários e RPE",
      "Comunicação entre atleta e treinador"
    ],
    raptorNote:
      "Os compradores dos programas compatíveis já recebem acesso ao ambiente atual do RaptorPro. O lançamento público do app será anunciado depois."
  },
  en: {
    languageHref: "/apps",
    languageLabel: "🇺🇸 EN → PT",
    eyebrow: "RumoAoPro Apps",
    title: "Technology to organize football on and off the pitch.",
    lead:
      "Start now with LoadPro. RaptorPro is being prepared to bring coaching and programs together in a dedicated experience for players and coaches.",
    primaryCta: "Explore LoadPro",
    loadProStatus: "Available now",
    loadProBody:
      "Microcycle planning, readiness, pain, RPE, training load and reports for coaches and performance staff.",
    loadProCta: "Start your 7-day free trial",
    raptorStatus: "Coming soon",
    raptorTitle: "RaptorPro",
    raptorBody:
      "The coaching and program-delivery platform is evolving into a complete mobile training experience.",
    raptorPoints: [
      "Individual training calendar",
      "Videos, loads, comments and RPE",
      "Player-to-coach communication"
    ],
    raptorNote:
      "Buyers of compatible programs already receive access to the current RaptorPro environment. The public app launch will be announced later."
  }
} as const;

export function AppsHubPage({ locale }: AppsHubPageProps) {
  const page = copy[locale];
  const coachingHref = locale === "pt" ? "/assessoria#aplicacao" : "/en/coaching#application";

  return (
    <main className="min-h-screen bg-[#07080c]">
      <SiteHeader
        ctaHref="#loadpro"
        ctaLabel={page.primaryCta}
        languageHref={page.languageHref}
        navItems={nav[locale]}
      />

      <section className="relative isolate overflow-hidden bg-[#07080c] text-white">
        <Image
          alt="Lukaz de Paula trabalhando como treinador"
          className="absolute inset-0 -z-30 h-full w-full object-cover object-[50%_36%] opacity-25"
          fill
          priority
          sizes="100vw"
          src={assets.coachCollage}
        />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,#07080c_0%,rgba(7,8,12,0.96)_48%,rgba(7,8,12,0.74)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_26%,rgba(239,35,60,0.24),transparent_34%)]" />

        <div className="mx-auto grid min-h-[calc(82svh-var(--header-height))] max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
          <div>
            <div className="flex flex-wrap gap-3">
              <p className="rounded-md border border-red-400/30 bg-red-500/15 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-red-200">
                {page.eyebrow}
              </p>
              <Link
                className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold uppercase text-white/72 transition hover:bg-white hover:text-ink"
                href={page.languageHref}
              >
                {page.languageLabel}
              </Link>
            </div>
            <h1 className="mt-6 max-w-3xl font-display text-4xl uppercase leading-[0.98] sm:text-5xl lg:text-6xl">
              {page.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
              {page.lead}
            </p>
            <Link
              className="focus-ring mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-signal px-6 text-sm font-black uppercase text-white transition hover:bg-[#b90f20]"
              href="#loadpro"
            >
              {page.primaryCta}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              className="group relative min-h-[370px] overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl"
              href="#loadpro"
            >
              <Image
                alt="LoadPro"
                className="object-cover object-center opacity-60 transition duration-500 group-hover:scale-105"
                fill
                sizes="(min-width: 1024px) 330px, 50vw"
                src="/assets/loadpro/product-dashboard-monitoring-v2.png"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
              <div className="relative flex min-h-[370px] flex-col justify-between p-5">
                <span className="self-start rounded-full bg-emerald-400 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-950">
                  {page.loadProStatus}
                </span>
                <div>
                  <BarChart3 aria-hidden="true" className="h-7 w-7 text-red-300" />
                  <h2 className="mt-4 font-display text-4xl uppercase text-white">LoadPro</h2>
                  <p className="mt-3 text-sm leading-6 text-white/72">{page.loadProBody}</p>
                  <p className="mt-5 inline-flex items-center gap-2 text-sm font-black uppercase text-white">
                    {page.loadProCta}
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </p>
                </div>
              </div>
            </Link>

            <article className="relative min-h-[370px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] p-5">
              <div className="absolute -bottom-24 -right-12 w-[70%] rotate-6 opacity-30">
                <RaptorPhoneMockup
                  alt="RaptorPro"
                  className="w-full"
                  src={raptorAppScreens.calendar}
                />
              </div>
              <div className="relative flex min-h-[330px] flex-col justify-between">
                <span className="self-start rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/72">
                  {page.raptorStatus}
                </span>
                <div className="max-w-[58%] sm:max-w-[62%]">
                  <Clock3 aria-hidden="true" className="h-7 w-7 text-red-300" />
                  <h2 className="mt-4 font-display text-3xl uppercase text-white">RaptorPro</h2>
                  <p className="mt-3 text-sm leading-6 text-white/62">{page.raptorBody}</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <LoadProPromo locale={locale} />

      <section className="bg-white py-16" id="raptorpro">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-signal">
              {page.raptorStatus}
            </p>
            <h2 className="mt-3 font-display text-4xl uppercase leading-[0.98] text-ink sm:text-5xl">
              {page.raptorTitle}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-graphite/72">
              {page.raptorBody}
            </p>
            <div className="mt-7 grid gap-3">
              {page.raptorPoints.map((point, index) => {
                const Icon = index === 0 ? CalendarRange : index === 1 ? Smartphone : ShieldCheck;
                return (
                  <div className="flex items-center gap-3 rounded-lg bg-smoke p-4 text-sm font-bold text-ink" key={point}>
                    <Icon aria-hidden="true" className="h-5 w-5 text-signal" />
                    {point}
                  </div>
                );
              })}
            </div>
            <p className="mt-6 rounded-lg border border-ink/10 bg-smoke p-4 text-sm leading-6 text-graphite/68">
              {page.raptorNote}
            </p>
          </div>

          <div className="relative mx-auto min-h-[500px] w-full max-w-[620px] sm:min-h-[620px]">
            <div className="absolute left-[3%] top-[16%] w-[42%] -rotate-6 opacity-70">
              <RaptorPhoneMockup
                alt="RaptorPro readiness"
                className="w-full"
                src={raptorAppScreens.readiness}
              />
            </div>
            <div className="absolute right-[5%] top-0 w-[48%] rotate-3">
              <RaptorPhoneMockup
                alt="RaptorPro workout"
                className="w-full"
                src={raptorAppScreens.workout}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink py-12 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-300">RumoAoPro</p>
            <p className="mt-2 max-w-2xl text-base text-white/65">
              {locale === "pt"
                ? "Precisa de um plano individual enquanto o RaptorPro evolui? A assessoria continua disponível."
                : "Need an individual plan while RaptorPro evolves? Online coaching remains available."}
            </p>
          </div>
          <Link
            className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/15 px-5 text-sm font-bold uppercase text-white transition hover:bg-white hover:text-ink"
            href={coachingHref}
          >
            {locale === "pt" ? "Conhecer assessoria" : "Explore coaching"}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
