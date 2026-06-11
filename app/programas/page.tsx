import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import { CtaButton } from "@/components/cta-button";
import { ProgramsSection } from "@/components/programs-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  assets,
  nav,
  productLadder,
  programDecisionRows,
  trainingPillars
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Programas de treinamento e esteira de produtos",
  description:
    "Nova esteira RumoAoPro com diagnóstico, programas de treinamento, ciclos guiados, assessoria online e planejamento de temporada."
};

export default function ProgramasPage() {
  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader navItems={nav.pt} ctaHref="/assessoria#aplicacao" />
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <Image
          alt="Lukaz de Paula orientando treino físico em campo"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[62%_center]"
          fill
          priority
          sizes="100vw"
          src={assets.coachGym}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,9,11,0.96)_0%,rgba(8,9,11,0.82)_46%,rgba(8,9,11,0.34)_100%)]" />
        <div className="mx-auto flex min-h-[calc(82svh-var(--header-height))] max-w-7xl items-center px-4 py-10 sm:px-6 md:min-h-[calc(78vh-var(--header-height))] lg:px-8">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold uppercase text-gold">
              Nova esteira RumoAoPro
            </p>
            <h1 className="mt-5 font-display text-4xl uppercase leading-[1.03] sm:text-5xl lg:text-6xl">
              Do primeiro treino organizado à temporada planejada.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
              A nova estrutura organiza os produtos por nível de acompanhamento:
              diagnóstico, programas prontos, ciclo guiado, assessoria individual
              e planejamento de temporada para atletas que precisam de mais
              proximidade.
            </p>
            <p className="mt-4 max-w-xl text-sm font-bold uppercase leading-6 text-ice">
              Força, velocidade, resistência e recuperação conectadas ao
              calendário real do atleta.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaButton href="#esteira" icon={ArrowRight}>
                Ver esteira
              </CtaButton>
              <CtaButton href="/assessoria#aplicacao" variant="secondary">
                Quero algo personalizado
              </CtaButton>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              {[
                ["5", "níveis de produto"],
                ["3", "programas ativos"],
                ["1:1", "assessoria personalizada"]
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

      <section className="bg-white py-16" id="esteira">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-signal">
              Esteira de produtos
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase text-ink sm:text-4xl">
              Uma rota para cada nível de compromisso
            </h2>
            <p className="mt-4 text-base leading-7 text-graphite/75">
              A ideia é deixar claro o próximo passo: começar com direção,
              comprar uma estrutura pronta, entrar em um ciclo guiado ou aplicar
              para acompanhamento individual.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-5">
            {productLadder.map((product) => {
              const Icon = product.icon;
              const isExternal =
                !product.href.startsWith("/") &&
                !product.href.startsWith("#");

              return (
                <article
                  className="flex min-h-[430px] flex-col rounded-lg border border-ink/10 bg-smoke p-5"
                  key={product.title}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-ink text-white">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </div>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-bold uppercase text-graphite/60">
                      {product.step}
                    </span>
                  </div>
                  <p className="mt-5 text-xs font-bold uppercase text-signal">
                    {product.tier}
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-ink">
                    {product.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-graphite/70">
                    {product.audience}
                  </p>
                  <p className="mt-4 text-sm font-bold leading-6 text-ink">
                    {product.promise}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-graphite/70">
                    {product.delivery}
                  </p>
                  <div className="mt-auto pt-6">
                    {isExternal ? (
                      <a
                        className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-white transition hover:bg-graphite"
                        href={product.href}
                      >
                        {product.cta}
                        <MessageCircle
                          aria-hidden="true"
                          className="h-4 w-4"
                        />
                      </a>
                    ) : (
                      <Link
                        className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-white transition hover:bg-graphite"
                        href={product.href}
                      >
                        {product.cta}
                        <ArrowRight aria-hidden="true" className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-[0.8fr_1.2fr] md:items-start lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-gold">
              Programa de treinamento
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">
              O método por trás da nova linha
            </h2>
            <p className="mt-5 text-base leading-8 text-white/70">
              Todo produto precisa parecer parte do mesmo sistema: treino físico
              específico para futebol, controle de carga e progressão que respeita
              a rotina real do atleta.
            </p>
            <div className="mt-8 overflow-hidden rounded-lg border border-white/10">
              <Image
                alt="Exemplo de calendário de treino no aplicativo"
                className="aspect-[16/10] w-full object-cover"
                height={900}
                src={assets.appCalendar}
                width={1440}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {trainingPillars.map((pillar) => {
              const Icon = pillar.icon;

              return (
                <article
                  className="rounded-lg border border-white/10 bg-white/[0.06] p-5"
                  key={pillar.title}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white text-ink">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-white">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/68">
                    {pillar.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <ProgramsSection />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-sm font-bold uppercase text-signal">
                Rota recomendada
              </p>
              <h2 className="mt-3 font-display text-3xl uppercase text-ink sm:text-4xl">
                Escolha pelo momento do atleta
              </h2>
              <p className="mt-4 text-base leading-7 text-graphite/75">
                A página de programas vira uma triagem leve: o atleta se reconhece
                em uma situação e entende qual oferta faz mais sentido.
              </p>
            </div>
            <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
              {programDecisionRows.map((row) => (
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

      <SiteFooter />
    </main>
  );
}
