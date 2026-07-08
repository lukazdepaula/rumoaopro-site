import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { CtaButton } from "@/components/cta-button";
import { programs, programsEn } from "@/lib/content";

type ProgramsSectionProps = {
  compact?: boolean;
  locale?: "pt" | "en";
};

export function ProgramsSection({
  compact = false,
  locale = "pt"
}: ProgramsSectionProps) {
  const selectedPrograms = locale === "en" ? programsEn : programs;
  const visiblePrograms = compact
    ? selectedPrograms.slice(0, 3)
    : selectedPrograms;
  const copy = {
    pt: {
      eyebrow: "Programas principais",
      title: "Quatro caminhos para treinar o ano inteiro",
      body:
        "Esta coleção está disponível em inglês no momento. Use a página em português para entender qual programa encaixa no seu calendário antes de comprar.",
      seeAll: "Ver todos",
      chooseEyebrow: "Como escolher",
      chooseTitle: "Programa ou assessoria?",
      chooseBody:
        "Escolha um programa se você quer uma estrutura pronta para um objetivo específico. Aplique para a assessoria se precisa de ajustes semanais, controle de carga e um plano em volta da sua rotina real.",
      apply: "Aplicar para a assessoria",
      applyHref: "/assessoria#aplicacao"
    },
    en: {
      eyebrow: "Training programs",
      title: "Four programs to cover the whole football year",
      body:
        "Use the offseason to build strength and speed, sharpen the final 30 days before return, then maintain the work during the season.",
      seeAll: "See all",
      chooseEyebrow: "How to choose",
      chooseTitle: "Program or coaching?",
      chooseBody:
        "Choose a program if you want a ready structure for one specific goal. Apply for coaching if you need weekly adjustments, load control and a plan built around your real schedule.",
      apply: "Apply for coaching",
      applyHref: "/en/coaching#application"
    }
  }[locale];

  return (
    <section className="surface-gradient py-16" id="programas">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase text-signal">
              {copy.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase text-ink sm:text-4xl">
              {copy.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-graphite/75">
              {copy.body}
            </p>
          </div>
          {compact ? (
            <CtaButton
              href={locale === "en" ? "/en/programs" : "/programas"}
              variant="dark"
              icon={ArrowRight}
            >
              {copy.seeAll}
            </CtaButton>
          ) : null}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {visiblePrograms.map((program) => {
            const isExternal =
              !program.href.startsWith("/") && !program.href.startsWith("#");

            const content = (
              <article
                className="group flex h-full overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-ink/10 transition hover:-translate-y-1 hover:shadow-card"
                key={program.title}
              >
                <div className="flex w-full flex-col">
                  <div className="relative overflow-hidden bg-ink">
                    <Image
                      alt={program.title}
                      className={`aspect-[16/12] w-full object-cover transition duration-500 group-hover:scale-105 ${"imageClass" in program ? program.imageClass : "object-center"}`}
                      height={520}
                      src={program.image}
                      width={720}
                    />
                    <div className="absolute left-4 top-4 rounded-md bg-white/95 px-3 py-2 text-[11px] font-bold uppercase text-ink shadow-sm">
                      {program.tag}
                    </div>
                    <div className="absolute bottom-4 left-4 rounded-md bg-ink/85 px-3 py-2 text-[11px] font-bold uppercase text-white backdrop-blur">
                      {program.duration}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs font-bold uppercase text-signal">
                      {program.level}
                    </p>
                    <h3 className="mt-3 min-h-[56px] text-xl font-bold leading-7 text-ink">
                      {program.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-graphite/70">
                      {program.body}
                    </p>
                    <p className="mt-auto inline-flex pt-5 text-sm font-bold text-ink">
                      {program.cta}
                      {isExternal ? (
                        <ExternalLink
                          aria-hidden="true"
                          className="ml-2 mt-0.5 h-4 w-4"
                        />
                      ) : (
                        <ArrowRight
                          aria-hidden="true"
                          className="ml-2 mt-0.5 h-4 w-4"
                        />
                      )}
                    </p>
                  </div>
                </div>
              </article>
            );

            return isExternal ? (
              <a
                className="focus-ring block"
                href={program.href}
                key={program.title}
                rel="noreferrer"
                target="_blank"
              >
                {content}
              </a>
            ) : (
              <Link
                className="focus-ring block"
                href={program.href}
                key={program.title}
              >
                {content}
              </Link>
            );
          })}
        </div>

        {!compact ? (
          <div className="mt-10 border-t border-ink/10 pt-8">
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <p className="text-sm font-bold uppercase text-signal">
                  {copy.chooseEyebrow}
                </p>
                <h3 className="mt-3 text-xl font-bold text-ink">
                  {copy.chooseTitle}
                </h3>
              </div>
              <p className="text-sm leading-6 text-graphite/70">
                {copy.chooseBody}
              </p>
              <div className="flex items-start md:justify-end">
                <Link
                  className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md bg-signal px-5 text-sm font-bold text-white transition hover:bg-[#b90f20]"
                  href={copy.applyHref}
                >
                  {copy.apply}
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
