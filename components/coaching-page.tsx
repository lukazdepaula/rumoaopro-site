import Image from "next/image";
import { ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";
import { ApplicationForm } from "@/components/application-form";
import { CtaButton } from "@/components/cta-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { assets, testimonials } from "@/lib/content";
import type { CoachingCopy } from "@/lib/content";

export function CoachingPage({ copy }: { copy: CoachingCopy }) {
  const formId = copy.locale === "pt" ? "aplicacao" : "application";
  const methodId = copy.locale === "pt" ? "metodo" : "method";
  const currentTestimonials =
    copy.locale === "pt" ? testimonials.pt : testimonials.en;

  return (
    <main className="min-h-screen bg-smoke" lang={copy.locale === "pt" ? "pt-BR" : "en"}>
      <SiteHeader
        ctaHref={`#${formId}`}
        ctaLabel={copy.locale === "pt" ? "Aplicar" : "Apply"}
        navItems={copy.nav}
      />

      <section className={`${copy.heroClass} min-h-[calc(92vh-var(--header-height))] text-white`}>
        <div className="mx-auto flex min-h-[calc(92vh-var(--header-height))] max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-bold text-white/80">
              {copy.eyebrow}
            </p>
            <h1 className="font-display text-4xl uppercase leading-[1.02] text-white sm:text-5xl lg:text-6xl">
              {copy.h1}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
              {copy.lead}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaButton href={`#${formId}`} icon={ArrowRight}>
                {copy.primaryCta}
              </CtaButton>
              <CtaButton href={`#${methodId}`} variant="secondary">
                {copy.secondaryCta}
              </CtaButton>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {copy.proof.map((item) => (
                <span
                  className="rounded-md border border-white/20 bg-ink/40 px-3 py-2 text-sm font-semibold text-white/80"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
          {copy.stats.map((stat) => (
            <div className="border-l-4 border-signal bg-smoke p-5" key={stat.label}>
              <p className="font-display text-3xl text-ink">{stat.value}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-graphite/70">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-grid bg-smoke py-16" id={methodId}>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-signal">
              {copy.locale === "pt" ? "Método" : "Method"}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-4xl">
              {copy.methodTitle}
            </h2>
            <p className="mt-5 text-base leading-7 text-graphite/75">
              {copy.methodLead}
            </p>
            <div className="mt-8 overflow-hidden rounded-lg border border-ink/10 bg-white">
              <Image
                alt={
                  copy.locale === "pt"
                    ? "Exemplo de calendário de treinos individual"
                    : "Example individual training calendar"
                }
                className="h-auto w-full object-cover"
                height={760}
                src={assets.appCalendar}
                width={1120}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {copy.benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <article
                  className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm"
                  key={benefit.title}
                >
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-signal text-white">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-ink">{benefit.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-graphite/70">
                    {benefit.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-gold">
              {copy.locale === "pt" ? "Autoridade" : "Authority"}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">
              {copy.coachTitle}
            </h2>
            <p className="mt-5 text-base leading-8 text-white/70">{copy.coachBody}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {copy.credentials.map((credential) => (
                <div
                  className="flex items-center gap-3 rounded-md border border-white/10 bg-white/10 px-4 py-3"
                  key={credential}
                >
                  <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-gold" />
                  <span className="text-sm font-semibold text-white/80">
                    {credential}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <Image
              alt={
                copy.locale === "pt"
                  ? "Lukaz de Paula acompanhando atletas em treino"
                  : "Lukaz de Paula coaching athletes in training"
              }
              className="h-full min-h-[420px] w-full object-cover"
              height={1536}
              src={assets.coachCollage}
              width={864}
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase text-signal">
                {copy.locale === "pt" ? "Processo" : "Process"}
              </p>
              <h2 className="mt-3 font-display text-3xl uppercase text-ink sm:text-4xl">
                {copy.processTitle}
              </h2>
            </div>
            <ChevronDown aria-hidden="true" className="hidden h-8 w-8 text-signal md:block" />
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {copy.process.map((step, index) => (
              <article className="border-t-4 border-ink bg-smoke p-5" key={step.title}>
                <p className="font-display text-2xl text-signal">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 text-lg font-bold text-ink">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-graphite/70">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-smoke py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase text-signal">
              {copy.locale === "pt" ? "Resultados" : "Results"}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase text-ink sm:text-4xl">
              {copy.locale === "pt"
                ? "Atletas que sentiram diferença na rotina"
                : "Athletes who felt the difference in their routine"}
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {currentTestimonials.map((item) => (
              <figure className="rounded-lg bg-white p-6 shadow-sm" key={item.name}>
                <blockquote className="text-base leading-7 text-graphite/80">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-5 text-sm font-bold text-ink">
                  {item.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16" id={formId}>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-signal">
              {copy.locale === "pt" ? "Aplicação" : "Application"}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase text-ink sm:text-4xl">
              {copy.formTitle}
            </h2>
            <p className="mt-5 text-base leading-7 text-graphite/75">
              {copy.formLead}
            </p>
            <div className="mt-8 overflow-hidden rounded-lg border border-ink/10">
              <Image
                alt={
                  copy.locale === "pt"
                    ? "Tela de comunicação e suporte do aplicativo de treino"
                    : "Training app communication and support screen"
                }
                className="h-auto w-full object-cover"
                height={1040}
                src={assets.appCommunication}
                width={1120}
              />
            </div>
          </div>
          <ApplicationForm
            copy={{
              emailSubject: copy.emailSubject,
              form: copy.form,
              locale: copy.locale,
              thankYouPath: copy.thankYouPath
            }}
            id={`${formId}-form`}
          />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
