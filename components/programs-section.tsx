import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { CtaButton } from "@/components/cta-button";
import { programs } from "@/lib/content";

type ProgramsSectionProps = {
  compact?: boolean;
};

export function ProgramsSection({ compact = false }: ProgramsSectionProps) {
  return (
    <section className="surface-grid bg-smoke py-14" id="programas">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase text-signal">Programas</p>
            <h2 className="mt-3 font-display text-3xl uppercase text-ink sm:text-4xl">
              Produtos que continuam vendendo enquanto a nova estrutura nasce
            </h2>
            <p className="mt-4 text-base leading-7 text-graphite/75">
              Use os programas como porta de entrada ou complemento da
              assessoria. A compra ainda segue pela loja atual durante a
              transição.
            </p>
          </div>
          {compact ? (
            <CtaButton href="/programas" variant="dark" icon={ArrowRight}>
              Ver todos
            </CtaButton>
          ) : null}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {programs.map((program) => (
            <article
              className="overflow-hidden rounded-lg bg-white shadow-sm"
              key={program.title}
            >
              <Image
                alt={program.title}
                className="aspect-square w-full object-cover"
                height={480}
                src={program.image}
                width={480}
              />
              <div className="p-5">
                <div className="flex min-h-10 items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-ink">{program.title}</h3>
                  <span className="rounded-md bg-smoke px-2 py-1 text-xs font-bold uppercase text-graphite/70">
                    {program.tag}
                  </span>
                </div>
                <p className="mt-3 min-h-[96px] text-sm leading-6 text-graphite/70">
                  {program.body}
                </p>
                <a
                  className="focus-ring mt-5 inline-flex min-h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-white"
                  href={program.href}
                >
                  Ver na loja
                  <ExternalLink aria-hidden="true" className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </div>

        {!compact ? (
          <div className="mt-10 border-t border-ink/10 pt-8">
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <p className="text-sm font-bold uppercase text-signal">
                  Como escolher
                </p>
                <h3 className="mt-3 text-xl font-bold text-ink">
                  Programa ou assessoria?
                </h3>
              </div>
              <p className="text-sm leading-6 text-graphite/70">
                Escolha um programa se você quer seguir uma estrutura pronta
                para um objetivo específico. Escolha a assessoria se precisa de
                ajustes semanais, controle de carga e um plano em volta da sua
                rotina real.
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
