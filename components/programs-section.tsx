import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import { CtaButton } from "@/components/cta-button";
import { programs } from "@/lib/content";

type ProgramsSectionProps = {
  compact?: boolean;
};

export function ProgramsSection({ compact = false }: ProgramsSectionProps) {
  const visiblePrograms = compact ? programs.slice(0, 3) : programs;

  return (
    <section className="surface-grid bg-smoke py-16" id="programas">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase text-signal">
              Programas de treinamento
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase text-ink sm:text-4xl">
              Treinos prontos para entrar na rotina sem virar tentativa solta
            </h2>
            <p className="mt-4 text-base leading-7 text-graphite/75">
              Cada programa resolve um momento específico da jornada do atleta:
              pré-temporada, ganho de força ou retorno ao campo. A compra segue
              pela loja atual durante a transição da nova esteira.
            </p>
          </div>
          {compact ? (
            <CtaButton href="/programas" variant="dark" icon={ArrowRight}>
              Ver todos
            </CtaButton>
          ) : null}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {visiblePrograms.map((program) => {
            const isExternal =
              !program.href.startsWith("/") && !program.href.startsWith("#");

            return (
              <article
                className="group flex overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-ink/10"
                key={program.title}
              >
                <div className="flex w-full flex-col">
                  <div className="relative overflow-hidden bg-ink">
                    <Image
                      alt={program.title}
                      className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                      height={480}
                      src={program.image}
                      width={640}
                    />
                    <div className="absolute left-4 top-4 rounded-md bg-white px-3 py-2 text-xs font-bold uppercase text-ink shadow-sm">
                      {program.tag}
                    </div>
                    <div className="absolute bottom-4 left-4 rounded-md bg-ink/85 px-3 py-2 text-xs font-bold uppercase text-white backdrop-blur">
                      {program.duration}
                    </div>
                  </div>
                  <div className="flex min-h-[360px] flex-1 flex-col p-5">
                    <p className="text-xs font-bold uppercase text-signal">
                      {program.level}
                    </p>
                    <h3 className="mt-3 text-xl font-bold text-ink">
                      {program.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-graphite/70">
                      {program.body}
                    </p>
                    <ul className="mt-5 space-y-3">
                      {program.outcomes.map((outcome) => (
                        <li
                          className="flex gap-3 text-sm leading-5 text-graphite/75"
                          key={outcome}
                        >
                          <CheckCircle2
                            aria-hidden="true"
                            className="mt-0.5 h-4 w-4 shrink-0 text-turf"
                          />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-6">
                      {isExternal ? (
                        <a
                          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-white transition hover:bg-graphite"
                          href={program.href}
                        >
                          {program.cta}
                          <ExternalLink
                            aria-hidden="true"
                            className="h-4 w-4"
                          />
                        </a>
                      ) : (
                        <Link
                          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-white transition hover:bg-graphite"
                          href={program.href}
                        >
                          {program.cta}
                          <ArrowRight aria-hidden="true" className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {!compact ? (
          <div className="mt-10 border-t border-ink/10 pt-8">
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <p className="text-sm font-bold uppercase text-signal">
                  Como escolher
                </p>
                <h3 className="mt-3 text-xl font-bold text-ink">
                  Programa, ciclo guiado ou assessoria?
                </h3>
              </div>
              <p className="text-sm leading-6 text-graphite/70">
                Escolha um programa se você quer seguir uma estrutura pronta
                para um objetivo específico. Suba para a assessoria se precisa
                de ajustes semanais, controle de carga e um plano em volta da
                sua rotina real.
              </p>
              <div className="flex items-start md:justify-end">
                <Link
                  className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md bg-signal px-5 text-sm font-bold text-white transition hover:bg-[#b90f20]"
                  href="/assessoria"
                >
                  Aplicar para a assessoria
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
