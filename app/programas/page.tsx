import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { CtaButton } from "@/components/cta-button";
import { ProgramsSection } from "@/components/programs-section";
import { SeasonProgramMap } from "@/components/season-program-map";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { assets, nav } from "@/lib/content";

export const metadata: Metadata = {
  title: "Programas de treinamento para futebol",
  description:
    "Programas RumoAoPro para atletas treinarem força, velocidade, condicionamento e performance em cada fase da temporada."
};

export default function ProgramasPage() {
  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader
        navItems={nav.pt}
        ctaHref="/assessoria#aplicacao"
        languageHref="/en/programs"
      />

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
                🇧🇷 Português → English
              </Link>
            </div>
            <h1 className="mt-5 font-display text-4xl uppercase leading-[1.03] sm:text-5xl lg:text-6xl">
              Treine com o plano certo para cada fase da sua temporada.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
              Evolua o ano inteiro com uma sequência clara: construa força e
              velocidade na offseason, acelere a reta final antes da
              pré-temporada e mantenha o desempenho durante os jogos.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaButton href="#programas" icon={ArrowRight}>
                Escolher meu programa
              </CtaButton>
              <CtaButton href="#mapa-da-temporada" variant="secondary">
                Ver mapa da temporada
              </CtaButton>
            </div>
          </div>
        </div>
      </section>

      <ProgramsSection />

      <SeasonProgramMap locale="pt" />

      <section className="bg-ink py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[0.85fr_1.15fr] md:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-gold">
              Quando escolher assessoria
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">
              Sua rotina muda. Seu treinamento também deve mudar.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/70">
              Os programas funcionam melhor quando o objetivo é claro e a rotina
              permite seguir uma estrutura. Se você precisa ajustar carga por
              jogo, fadiga, lesão ou treino do time, a assessoria individual é o
              caminho mais completo.
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
              Treinamento individual de alta performance para atletas que buscam o próximo nível.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-graphite/75">
              Quer alcançar seu máximo potencial? A Assessoria Esportiva é a
              nossa solução mais completa e recomendada, com plano ajustado à
              sua rotina real.
            </p>
          </div>
          <Link
            className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-signal px-5 text-sm font-bold text-white transition hover:bg-[#b90f20]"
            href="/assessoria#aplicacao"
          >
            Aplicar para assessoria
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
