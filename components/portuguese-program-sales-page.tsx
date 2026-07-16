import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  FileText,
  ShieldCheck,
  Target,
  Zap
} from "lucide-react";
import { CtaButton } from "@/components/cta-button";
import { ReviewBadge, ReviewsSection } from "@/components/reviews";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { nav, portugueseProgramSalesPages } from "@/lib/content";
import { getReviewGroupForProgramHref } from "@/lib/reviews";

type PortugueseProgram =
  (typeof portugueseProgramSalesPages)[keyof typeof portugueseProgramSalesPages];

type PortugueseProgramSalesPageProps = {
  program: PortugueseProgram;
};

const quickFacts = [
  {
    icon: CalendarDays,
    label: "Duração"
  },
  {
    icon: Target,
    label: "Foco"
  },
  {
    icon: FileText,
    label: "Entrega"
  }
];

export function PortugueseProgramSalesPage({
  program
}: PortugueseProgramSalesPageProps) {
  const reviewGroupKey = getReviewGroupForProgramHref(
    `/programas/${program.slug}`
  );

  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader
        navItems={nav.pt}
        ctaHref={program.checkoutHref}
        ctaLabel="Comprar"
      />

      <section className="relative isolate overflow-hidden bg-ink text-white">
        <Image
          alt=""
          className={`absolute inset-0 -z-20 h-full w-full object-cover ${program.heroImageClass}`}
          fill
          priority
          sizes="100vw"
          src={program.heroImage}
        />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_18%,rgba(213,22,42,0.28),transparent_34%),radial-gradient(circle_at_12%_78%,rgba(213,174,82,0.14),transparent_30%),linear-gradient(90deg,rgba(8,9,11,0.98)_0%,rgba(8,9,11,0.88)_48%,rgba(8,9,11,0.46)_100%)]" />
        <div className="mx-auto grid min-h-[calc(82svh-var(--header-height))] max-w-7xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1.02fr_0.78fr] md:items-center lg:px-8">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold uppercase text-gold">
              {program.eyebrow}
            </p>
            <h1 className="mt-5 font-display text-4xl uppercase leading-[1.02] sm:text-5xl lg:text-6xl">
              {program.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/76 sm:text-lg">
              {program.lead}
            </p>
            {reviewGroupKey ? (
              <ReviewBadge
                className="mt-6"
                groupKey={reviewGroupKey}
                locale="pt"
                tone="dark"
              />
            ) : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaButton href={program.checkoutHref} icon={ArrowRight}>
                Comprar programa
              </CtaButton>
              <CtaButton href="#detalhes" variant="secondary">
                Ver detalhes
              </CtaButton>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[430px]">
            <div className="absolute -inset-5 rounded-[2rem] bg-white/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-lg border border-white/15 bg-white p-3 shadow-card">
              <Image
                alt={`Capa do ${program.title}`}
                className={`aspect-square w-full rounded-md bg-smoke ${program.coverClass}`}
                height={720}
                src={program.cover}
                width={720}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12" id="detalhes">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {quickFacts.map((item, index) => {
              const Icon = item.icon;
              const value =
                index === 0
                  ? program.duration
                  : index === 1
                    ? program.level
                    : "Área do cliente";

              return (
                <div
                  className="rounded-lg border border-ink/10 bg-smoke p-5"
                  key={item.label}
                >
                  <Icon aria-hidden="true" className="h-5 w-5 text-signal" />
                  <p className="mt-4 text-xs font-bold uppercase text-graphite/55">
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg font-bold text-ink">{value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {reviewGroupKey ? (
        <ReviewsSection
          groupKey={reviewGroupKey}
          locale="pt"
          title="Avaliações da comunidade RumoAoPro"
        />
      ) : null}

      <section className="surface-gradient py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-[0.85fr_1.15fr] md:items-start lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-signal">
              Para quem é
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-4xl">
              Treine com a metodologia de um atleta profissional.
            </h2>
            <p className="mt-5 text-base leading-8 text-graphite/75">
              {program.bestFor}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {program.outcomes.map((outcome) => (
              <div
                className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm"
                key={outcome}
              >
                <CheckCircle2
                  aria-hidden="true"
                  className="h-5 w-5 text-signal"
                />
                <p className="mt-4 text-sm font-bold leading-6 text-ink">
                  {outcome}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          <div className="rounded-lg bg-ink p-6 text-white">
            <Dumbbell aria-hidden="true" className="h-6 w-6 text-gold" />
            <h2 className="mt-5 font-display text-3xl uppercase leading-tight">
              O que vem no programa
            </h2>
            <div className="mt-6 space-y-4">
              {program.includes.map((item) => (
                <div
                  className="flex gap-3 border-t border-white/10 pt-4 first:border-t-0 first:pt-0"
                  key={item}
                >
                  <BadgeCheck
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 flex-none text-gold"
                  />
                  <p className="text-sm leading-6 text-white/76">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-ink/10 bg-smoke p-6">
            <Zap aria-hidden="true" className="h-6 w-6 text-signal" />
            <h2 className="mt-5 font-display text-3xl uppercase leading-tight text-ink">
              Como a estrutura evolui
            </h2>
            <div className="mt-6 grid gap-3">
              {program.structure.map((item, index) => (
                <div
                  className="grid grid-cols-[auto_1fr] items-center gap-4 rounded-lg bg-white p-4 ring-1 ring-ink/10"
                  key={item}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-sm font-bold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm font-bold text-ink">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-gold">
              Compra e acesso
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">
              Compre agora e acesse pela área do cliente.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/70">
              Depois do pagamento confirmado, o acesso fica ligado ao seu
              e-mail e o material aparece em Meus Programas.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">
              {program.note}
            </p>
          </div>
          <CtaButton href={program.checkoutHref} icon={ArrowRight}>
            Comprar programa
          </CtaButton>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div className="flex items-center gap-3">
            <ShieldCheck aria-hidden="true" className="h-5 w-5 text-signal" />
            <p className="text-sm font-bold text-ink">
              Pagamento por Stripe ou Mercado Pago, com acesso automático na
              área do cliente.
            </p>
          </div>
          <Link
            className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-ink/15 px-5 text-sm font-bold text-ink transition hover:bg-ink hover:text-white"
            href="/programas"
          >
            Ver todos os programas
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
