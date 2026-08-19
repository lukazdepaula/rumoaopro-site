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
import { HomeAppsShowcase } from "@/components/home-apps-showcase";
import { HomeProgramCollections } from "@/components/home-program-collections";
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
  title: "RumoAoPro | Treinamento, programas e assessoria para futebol",
  description:
    "Assessoria, programas interativos no RaptorPro, cursos e LoadPro para atletas e treinadores de futebol."
};

const entryCards = [
  {
    title: "Assessoria Online",
    href: "/assessoria",
    eyebrow: "Plano individual",
    image: assets.coachFieldDrillWide,
    icon: MessageCircle,
    body:
      "Para atletas que querem acompanhamento, ajustes semanais e um treino feito para a rotina real.",
    cta: "Entrar na assessoria"
  },
  {
    title: "Programas Individuais",
    href: "/programas",
    eyebrow: "No RaptorPro",
    image: assets.programsGameDuel,
    icon: Dumbbell,
    body:
      "Power Pro, Offseason 30 Days, Speed Pro e In-Season Pro para cada objetivo e fase da temporada.",
    cta: "Ver programas"
  },
  {
    title: "Preparador PRO",
    href: "/cursos",
    eyebrow: "Curso para treinadores",
    image: assets.programsGymBriefing,
    icon: GraduationCap,
    body:
      "Aprenda a organizar e aplicar a preparação física para jogadores de futebol.",
    cta: "Conhecer o curso"
  },
  {
    title: "LoadPro",
    href: "/apps",
    eyebrow: "App para treinadores",
    image: assets.coachCollage,
    icon: LayoutDashboard,
    body:
      "Planeje o microciclo, monitore a carga e acompanhe seus atletas em um só lugar.",
    cta: "Conhecer o LoadPro"
  }
];

const productBlocks = [
  {
    title: "Assessoria Online",
    eyebrow: "A melhor escolha para personalização",
    icon: Users,
    image: assets.coachGymInstruction,
    imagePosition: "object-[center_30%]",
    body:
      "Sua rotina muda. Seu treinamento também deve mudar. A assessoria organiza campo, academia, jogos, viagens, recuperação e histórico físico em um plano individual.",
    points: [
      "Planejamento ajustado para sua semana",
      "Acompanhamento e feedback com o treinador",
      "Indicado para atletas que querem evoluir como profissionais"
    ],
    href: "/assessoria",
    cta: "Conhecer assessoria"
  },
  {
    title: "Programas Individuais",
    eyebrow: "Treine com estratégia no RaptorPro",
    icon: Zap,
    image: assets.sprintSide,
    imagePosition: "object-[64%_50%]",
    body:
      "Power Pro, Offseason 30 Days, Speed Pro e In-Season Pro unem planejamento, vídeos e registro de treino em uma experiência interativa.",
    points: [
      "Power Pro, Offseason 30 Days, Speed Pro e In-Season Pro",
      "Calendário, vídeos, cargas, comentários e RPE",
      "Confira o idioma disponível em cada programa"
    ],
    href: "/programas",
    cta: "Comparar programas"
  },
  {
    title: "Preparador PRO",
    eyebrow: "Formação prática para treinadores",
    icon: BookOpen,
    image: assets.coachGym,
    imagePosition: "object-[center_30%]",
    body:
      "Uma plataforma direta ao ponto para aprender a planejar potência, periodização, avaliações, velocidade e resistência para jogadores de futebol.",
    points: [
      "Conteúdo online em português",
      "Aplicação prática na rotina do preparador",
      "Compra e acesso processados pela Kiwify"
    ],
    href: "/cursos",
    cta: "Conhecer Preparador PRO"
  }
];

const trainerStats = [
  { value: "CBF A", label: "licença em preparação física no futebol" },
  { value: "4", label: "países entre carreira e performance" },
  { value: "1:1", label: "metodologia aplicada em atletas reais" }
];

const seasonFlow = [
  {
    step: "01",
    title: "Escolha seu programa",
    body:
      "Escolha Power Pro, Offseason 30 Days, Speed Pro ou In-Season Pro de acordo com seu objetivo e momento da temporada."
  },
  {
    step: "02",
    title: "Siga o calendário",
    body:
      "Abra o RaptorPro, selecione o dia e veja o treino completo organizado em uma sequência clara."
  },
  {
    step: "03",
    title: "Registre sua evolução",
    body:
      "Salve cargas, comentários e RPE para acompanhar o que foi feito e treinar com mais intenção."
  }
];

export default function HomePage() {
  const featuredCases = successCases.pt.slice(0, 3);

  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader navItems={nav.pt} ctaLabel="Começar" ctaHref="#entradas" />

      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 -z-10">
          <Image
            alt="Atletas disputando a bola em campo"
            className="h-full w-full object-cover object-center opacity-75 saturate-[1.08]"
            fill
            priority
            sizes="100vw"
            src={assets.programsGameDuel}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,8,0.92)_0%,rgba(5,6,8,0.72)_43%,rgba(5,6,8,0.25)_76%,rgba(5,6,8,0.46)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_38%,rgba(216,20,43,0.24),transparent_42%)]" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-smoke via-ink/55 to-transparent" />
        </div>

        <div className="mx-auto flex min-h-[calc(100vh-var(--header-height))] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="inline-flex rounded-md border border-signal/55 bg-black/35 px-3 py-2 text-sm font-bold uppercase tracking-[0.14em] text-white/85 backdrop-blur-sm">
              A casa de quem trabalha
            </p>
            <h1 className="mt-6 max-w-3xl font-display text-4xl uppercase leading-[1.02] sm:text-6xl lg:text-7xl">
              Treine como jogador de verdade.
            </h1>
            <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-white/82 sm:text-lg">
              Assessoria, programas e tecnologia para atletas e treinadores que
              levam o futebol a sério.
            </p>
          </div>

          <div className="mt-10" id="entradas">
            <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-white/55">
              <span className="h-px w-10 bg-signal" />
              Escolha uma entrada
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
              {entryCards.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    className="group relative min-h-[220px] overflow-hidden rounded-xl border border-white/25 bg-black shadow-[0_20px_55px_rgba(0,0,0,0.3)] transition hover:-translate-y-1 hover:border-signal/80 sm:min-h-[280px] xl:min-h-[310px]"
                    href={item.href}
                    key={item.title}
                  >
                    <Image
                      alt=""
                      className={`h-full w-full object-cover opacity-85 saturate-[1.06] transition duration-500 group-hover:scale-105 group-hover:opacity-100 ${item.title === "LoadPro" ? "object-[50%_38%]" : "object-center"}`}
                      fill
                      sizes="(max-width: 1279px) 50vw, 25vw"
                      src={item.image}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.28)_42%,rgba(0,0,0,0.94)_100%)]" />
                    <div className="absolute inset-x-0 top-0 h-1 bg-signal/85" />
                    <div className="relative flex h-full min-h-[220px] flex-col justify-between p-3 sm:min-h-[280px] sm:p-5 xl:min-h-[310px]">
                      <div className="flex items-start justify-between gap-4">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-ink sm:h-11 sm:w-11">
                          <Icon aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <span className="max-w-[102px] rounded-md border border-white/10 bg-black/75 px-2 py-2 text-[9px] font-bold uppercase leading-4 text-white/82 backdrop-blur-md sm:max-w-none sm:px-3 sm:text-xs">
                          {item.eyebrow}
                        </span>
                      </div>
                      <div>
                        <span className="mb-3 block h-1 w-10 rounded-full bg-signal" />
                        <h2 className="home-entry-title font-display uppercase text-white sm:text-3xl">
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

      <HomeProgramCollections locale="pt" />

      <HomeAppsShowcase locale="pt" />

      <section className="bg-smoke py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase text-signal">
                Visão geral
              </p>
              <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-5xl">
                Soluções para atletas e treinadores.
              </h2>
            </div>
            <p className="text-base leading-8 text-graphite/70">
              A RumoAoPro conecta acompanhamento, programas interativos,
              educação e tecnologia para quem quer treinar, planejar e tomar
              decisões com mais clareza no futebol.
            </p>
          </div>

          <div className="mt-9 grid gap-5 lg:grid-cols-3">
            {productBlocks.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm"
                  id={item.href.includes("curs") ? "cursos" : undefined}
                  key={item.title}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      alt={item.title}
                      className={`h-full w-full object-cover ${item.imagePosition}`}
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
                Programas no RaptorPro
              </p>
              <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-5xl">
                Uma experiência mais clara do primeiro ao último treino.
              </h2>
            </div>
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink/10 bg-smoke px-4 py-3 text-sm font-bold text-ink transition hover:bg-steel"
              href="/programas"
            >
              Ver todos os programas
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
                alt="Lukaz de Paula orientando atletas no treino"
                className="aspect-[4/5] h-full w-full object-cover object-[center_16%]"
                height={1536}
                src={assets.coachGymInstruction}
                width={1152}
              />
            </div>
            <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] sm:mt-12">
              <Image
                alt="Lukaz de Paula jogando futebol"
                className="aspect-[4/5] h-full w-full object-cover object-center"
                height={1536}
                src={assets.coachFieldPlaying}
                width={1152}
              />
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold uppercase text-gold">
              Quem está por trás
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-5xl">
              Metodologia de treinador com vivência real de jogador.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/75">
              Lukaz de Paula é preparador físico com licença CBF A e construiu a
              RumoAoPro unindo estudo, campo, academia e carreira como atleta.
              A metodologia nasce da prática: entender o que o jogador sente,
              o que a temporada exige e como transformar treino em performance.
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
                  Como treinador
                </div>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  Experiência em ambientes de performance como FC Málaga City,
                  CD Almuñécar City, Lindsey Wilson University e Extratime
                  Performance.
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
                <div className="flex items-center gap-2 text-sm font-bold uppercase text-gold">
                  <ShieldCheck aria-hidden="true" className="h-5 w-5" />
                  Como jogador
                </div>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  Passagens por futebol universitário nos EUA e clubes como
                  Colorado Rapids U23, Desportivo Brasil, Vasalunds IF e CD
                  Almuñécar City.
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
                Atletas treinados
              </p>
              <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-5xl">
                A metodologia já apareceu em diferentes níveis do futebol.
              </h2>
              <p className="mt-4 text-base leading-7 text-graphite/70">
                Do atleta em formação ao profissional, o objetivo é organizar
                força, velocidade, potência, recuperação e rotina com mais
                clareza.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-ink/10 bg-white px-4 py-3 text-sm font-bold text-graphite/70">
              <Trophy aria-hidden="true" className="h-5 w-5 text-gold" />
              Casos reais da RumoAoPro
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
        eyebrow="Avaliações"
        groupKey="coaching"
        locale="pt"
        showSourceNote={false}
        title="O que atletas dizem sobre treinar com a RumoAoPro"
      />

      <section className="bg-signal py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-bold uppercase text-white/75">
              <ShieldCheck aria-hidden="true" className="h-5 w-5" />
              Comece pelo produto certo
            </div>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">
              Quer acompanhamento completo ou um programa para executar agora?
            </h2>
            <p className="mt-4 text-base leading-7 text-white/75">
              Se sua rotina muda toda semana, escolha a assessoria. Para treinar
              com o Power Pro, Offseason 30 Days ou Speed Pro, compre uma vez e acompanhe
              o programa pelo RaptorPro. Os programas clássicos continuam no catálogo.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-steel"
              href="/assessoria"
            >
              Assessoria Online
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
              href="/programas"
            >
              Programas Individuais
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
