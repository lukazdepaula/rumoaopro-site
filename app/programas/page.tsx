import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ExternalLink } from "lucide-react";
import { CtaButton } from "@/components/cta-button";
import { ProgramsSection } from "@/components/programs-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { assets, nav, programsPtLegacy } from "@/lib/content";

export const metadata: Metadata = {
  title: "Programas de treinamento para futebol",
  description:
    "Programas RumoAoPro para offseason, velocidade, últimos 30 dias de preparação e manutenção durante a temporada."
};

const annualPath = [
  {
    step: "01",
    title: "Construa na offseason",
    body:
      "Use Adama para força e potência. Use Project 36 para velocidade, aceleração e top speed.",
    image: assets.programsGymBriefing,
    imageClass: "object-[center_18%]",
    href: "#programas",
    cta: "Ver offseason"
  },
  {
    step: "02",
    title: "Ajuste os últimos 30 dias",
    body:
      "Quando a volta ao clube, peneira ou pré-temporada está perto, o Offseason 30 Days organiza a reta final.",
    image: assets.programsPlayerReady,
    imageClass: "object-[center_18%]",
    href: "/programas/offseason-30-days",
    cta: "Ver 30 dias"
  },
  {
    step: "03",
    title: "Mantenha durante a temporada",
    body:
      "Depois que jogos e treinos do time entram na rotina, o Elanga mantém força e velocidade com dose baixa.",
    image: assets.programsProMatch,
    imageClass: "object-center",
    href: "/programas/elanga-in-season",
    cta: "Ver Elanga"
  }
];

export default function ProgramasPage() {
  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader navItems={nav.pt} ctaHref="/assessoria#aplicacao" />

      <section className="relative isolate overflow-hidden bg-ink text-white">
        <Image
          alt="Jogador protegendo a bola em partida de futebol"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[58%_center]"
          fill
          priority
          sizes="100vw"
          src={assets.programsGameDuel}
        />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_16%,rgba(213,22,42,0.22),transparent_34%),radial-gradient(circle_at_16%_76%,rgba(119,213,223,0.13),transparent_30%),linear-gradient(90deg,rgba(8,9,11,0.97)_0%,rgba(8,9,11,0.84)_48%,rgba(8,9,11,0.30)_100%)]" />
        <div className="mx-auto flex min-h-[calc(76svh-var(--header-height))] max-w-7xl items-center px-4 py-10 sm:px-6 md:min-h-[calc(72vh-var(--header-height))] lg:px-8">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-3">
              <p className="inline-flex rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold uppercase text-gold">
                Programas RumoAoPro
              </p>
              <Link
                className="focus-ring inline-flex rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold uppercase text-white transition hover:bg-white hover:text-ink"
                href="/en/programs"
              >
                🇺🇸 English
              </Link>
            </div>
            <h1 className="mt-5 font-display text-4xl uppercase leading-[1.03] sm:text-5xl lg:text-6xl">
              Treine com um plano para cada fase do ano.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
              Os quatro programas principais cobrem offseason, velocidade,
              últimos 30 dias de preparação e manutenção em temporada. No
              momento, essa coleção principal está em inglês.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaButton href="#programas" icon={ArrowRight}>
                Ver programas em inglês
              </CtaButton>
              <CtaButton href="#programas-portugues" variant="secondary">
                Ver programas em português
              </CtaButton>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              {[
                ["4", "programas globais"],
                ["4", "opções em português"],
                ["Ano todo", "offseason até temporada"]
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
                Rota do atleta
              </p>
              <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-4xl">
                Força, velocidade, reta final e temporada.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-graphite/75">
              O jogador pode usar Adama e Project 36 durante a offseason para
              construir força e velocidade. Nos últimos 30 dias, entra o
              Offseason 30 Days. Em temporada, o Elanga ajuda a manter o nível
              sem brigar com jogos e treinos do time.
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

      <ProgramsSection />

      <section className="bg-white py-16" id="programas-portugues">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase text-signal">
                Coleção em português
              </p>
              <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-4xl">
                Programas antigos para comprar em português.
              </h2>
              <p className="mt-4 text-base leading-7 text-graphite/75">
                Estes produtos continuam sendo uma opção para quem prefere
                material em português. Eles levam para o site atual da
                RumoAoPro enquanto migramos a estrutura completa.
              </p>
            </div>
            <Link
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-ink px-5 text-sm font-bold text-white transition hover:bg-graphite"
              href="#programas"
            >
              Comparar com os novos
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {programsPtLegacy.map((program) => (
              <a
                className="focus-ring group block overflow-hidden rounded-lg bg-smoke shadow-sm ring-1 ring-ink/10 transition hover:-translate-y-1 hover:shadow-card"
                href={program.href}
                key={program.title}
                rel="noreferrer"
                target="_blank"
              >
                <div className="relative overflow-hidden bg-ink">
                  <Image
                    alt={program.title}
                    className={`aspect-[16/12] w-full object-cover transition duration-500 group-hover:scale-105 ${program.imageClass}`}
                    height={520}
                    src={program.image}
                    width={720}
                  />
                  <div className="absolute left-4 top-4 rounded-md bg-white/95 px-3 py-2 text-[11px] font-bold uppercase text-ink shadow-sm">
                    {program.tag}
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase text-signal">
                    {program.level}
                  </p>
                  <h3 className="mt-3 min-h-[56px] text-xl font-bold leading-7 text-ink">
                    {program.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-graphite/72">
                    {program.body}
                  </p>
                  <p className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-ink">
                    {program.cta}
                    <ExternalLink aria-hidden="true" className="h-4 w-4" />
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[0.85fr_1.15fr] md:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-gold">
              Quando escolher assessoria
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">
              Se sua semana muda toda hora, programa pronto não resolve tudo.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/70">
              Os programas funcionam melhor quando o objetivo é claro e a rotina
              permite seguir uma estrutura. Se você precisa ajustar carga por
              jogo, fadiga, lesão ou treino do time, a assessoria é o caminho
              mais seguro.
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <Image
              alt="Treinador avaliando salto em ambiente de performance"
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
              Precisa de algo individual?
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase text-ink sm:text-4xl">
              A assessoria continua sendo o produto principal.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-graphite/75">
              Se você tem jogos, treinos do time, fadiga, lesão recente ou uma
              rotina que muda toda semana, o plano 1:1 com suporte semanal e o
              caminho mais seguro.
            </p>
          </div>
          <Link
            className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-signal px-5 text-sm font-bold text-white transition hover:bg-[#b90f20]"
            href="/assessoria#aplicacao"
          >
            Aplicar para assessoria
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
