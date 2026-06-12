import Image from "next/image";
import { ArrowRight, CheckCircle2, ChevronDown, Star } from "lucide-react";
import { ApplicationForm } from "@/components/application-form";
import { CtaButton } from "@/components/cta-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  assets,
  countriesWorked,
  performanceEnvironments,
  playerPathLogos,
  successCases,
  testimonialScreens
} from "@/lib/content";
import type { CoachingCopy } from "@/lib/content";

export function CoachingPage({ copy }: { copy: CoachingCopy }) {
  const formId = copy.locale === "pt" ? "aplicacao" : "application";
  const methodId = copy.locale === "pt" ? "metodo" : "method";
  const currentSuccessCases =
    copy.locale === "pt" ? successCases.pt : successCases.en;
  const methodImage =
    copy.locale === "pt" ? assets.trainingOrganizationPt : assets.howWorkWasDoneEn;
  const proofImages = [
    {
      alt:
        copy.locale === "pt"
          ? "Microciclo de temporada organizado para Theo Ferreira"
          : "In-season microcycle organized for Theo Ferreira",
      fit: "cover",
      src: assets.theoMicrocycle
    },
    {
      alt:
        copy.locale === "pt"
          ? "Microciclo semanal organizado para atleta profissional"
          : "Weekly microcycle organized for a professional athlete",
      fit: "cover",
      src: methodImage
    },
    {
      alt:
        copy.locale === "pt"
          ? "Treino concluído no acompanhamento individual"
          : "Training completed in the individual coaching system",
      fit: "contain",
      src: assets.theoTrainingCompleted
    }
  ];
  const applicationSpots =
    copy.locale === "pt"
      ? "Apenas 3 vagas disponíveis no momento"
      : "Only 3 spots available right now";
  const ratingLabel =
    copy.locale === "pt"
      ? "Avaliações 5 estrelas de atletas acompanhados"
      : "5-star feedback from coached athletes";
  const appIntro =
    copy.locale === "pt"
      ? "O atleta recebe a semana organizada no app: calendário, sessões do dia, instruções, controle de esforço, comentários e ajustes sem ficar perdido em planilhas soltas."
      : "The athlete sees the week organized inside the app: calendar, daily sessions, instructions, effort control, comments and adjustments without getting lost in loose spreadsheets.";
  const appDetails = [
    copy.locale === "pt"
      ? "Semana visual com treino, recuperação e dias de jogo"
      : "Visual week with training, recovery and match days",
    copy.locale === "pt"
      ? "Exercícios com séries, repetições, carga e observações"
      : "Exercises with sets, reps, load and notes",
    copy.locale === "pt"
      ? "Feedback e comentários para ajustar o microciclo"
      : "Feedback and comments to adjust the microcycle"
  ];
  const appScreens = [
    {
      alt:
        copy.locale === "pt"
          ? "Calendário semanal do atleta dentro do app"
          : "Athlete weekly calendar inside the app",
      label: copy.locale === "pt" ? "Calendário semanal" : "Weekly calendar",
      src: assets.appCalendarScreen
    },
    {
      alt:
        copy.locale === "pt"
          ? "Sessão individual com esforço, duração, carga e exercícios"
          : "Individual session with effort, duration, load and exercises",
      label: copy.locale === "pt" ? "Sessão do dia" : "Daily session",
      src: assets.appInterface
    }
  ];

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
                height={1254}
                src={methodImage}
                width={1254}
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

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-signal">
              {copy.locale === "pt" ? "Prova do método" : "Method proof"}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-4xl">
              {copy.caseTitle}
            </h2>
            <p className="mt-5 text-base leading-7 text-graphite/75">
              {copy.caseLead}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {proofImages.map((image) => (
              <figure
                className="overflow-hidden rounded-lg border border-ink/10 bg-ink shadow-sm"
                key={image.src}
              >
                <Image
                  alt={image.alt}
                  className={`aspect-square h-full w-full transition duration-300 hover:scale-[1.02] ${
                    image.fit === "contain" ? "object-contain p-2" : "object-cover"
                  }`}
                  height={1254}
                  src={image.src}
                  width={1254}
                />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-gold">
              {copy.locale === "pt" ? "Por dentro do app" : "Inside the app"}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">
              {copy.locale === "pt"
                ? "Você enxerga exatamente o que precisa fazer"
                : "You see exactly what needs to be done"}
            </h2>
            <p className="mt-5 text-base leading-8 text-white/70">{appIntro}</p>
            <div className="mt-8 grid gap-3">
              {appDetails.map((detail) => (
                <div
                  className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.06] px-4 py-3"
                  key={detail}
                >
                  <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-gold" />
                  <span className="text-sm font-semibold text-white/75">
                    {detail}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
            {appScreens.map((screen) => (
              <figure
                className="overflow-hidden rounded-lg border border-white/10 bg-graphite p-3 shadow-sm"
                key={screen.src}
              >
                <div className="mb-3 flex items-center justify-between">
                  <figcaption className="text-sm font-black uppercase text-white">
                    {screen.label}
                  </figcaption>
                  <span className="rounded-md bg-signal px-2 py-1 text-xs font-black uppercase text-white">
                    Live view
                  </span>
                </div>
                <Image
                  alt={screen.alt}
                  className="h-full max-h-[560px] w-full rounded-md object-contain"
                  height={1024}
                  src={screen.src}
                  width={1536}
                />
              </figure>
            ))}
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
              {copy.credentials.map((credential) => {
                const isCbf = credential.toLowerCase().includes("cbf");

                return (
                  <div
                    className="flex items-center gap-3 rounded-md border border-white/10 bg-white/10 px-4 py-3"
                    key={credential}
                  >
                    {isCbf ? (
                      <span className="grid h-12 w-12 place-items-center rounded-md border border-gold/50 bg-white/5 p-1">
                        <Image
                          alt="CBF logo"
                          className="h-full w-full object-contain"
                          height={64}
                          src={assets.logoCbf}
                          width={64}
                        />
                      </span>
                    ) : (
                      <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-gold" />
                    )}
                    <span className="text-sm font-semibold text-white/80">
                      {credential}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.06] p-5">
              <p className="text-sm font-bold uppercase text-white/50">
                {copy.locale === "pt"
                  ? "Experiência em ambientes internacionais"
                  : "International performance environments"}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                {countriesWorked.map((country) => (
                  <div
                    className="rounded-md border border-white/10 bg-ink/35 px-3 py-3 text-center"
                    key={country.label}
                  >
                    <p className="text-2xl" aria-hidden="true">
                      {country.flag}
                    </p>
                    <p className="mt-2 text-xs font-bold uppercase text-white/70">
                      {country.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.06] p-5">
              <p className="text-sm font-bold uppercase text-white/50">
                {copy.locale === "pt"
                  ? "Clubes, universidade e performance"
                  : "Clubs, university and performance"}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {performanceEnvironments.map((item) => (
                  <div
                    className="flex min-h-20 items-center gap-3 rounded-md border border-white/10 bg-ink/35 px-3 py-3"
                    key={item.name}
                  >
                    {item.image ? (
                      <Image
                        alt={`${item.name} logo`}
                        className={`h-12 w-12 rounded-md object-contain p-1 ${
                          item.name.includes("Extratime")
                            ? "brightness-0 invert"
                            : ""
                        }`}
                        height={64}
                        src={item.image}
                        width={64}
                      />
                    ) : (
                      <span className="grid h-11 w-11 place-items-center rounded-md border border-gold/40 bg-gold/10 text-xs font-black uppercase text-gold">
                        {item.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .slice(0, 3)}
                      </span>
                    )}
                    <span>
                      <span className="block text-sm font-bold text-white">
                        {item.name}
                      </span>
                      <span className="mt-1 block text-xs font-semibold uppercase text-white/45">
                        {item.role}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 rounded-lg border border-gold/25 bg-gold/10 p-5">
              <p className="text-sm font-bold uppercase text-gold">
                {copy.locale === "pt"
                  ? "Também viveu o jogo como atleta"
                  : "He also lived the game as a player"}
              </p>
              <p className="mt-3 text-sm leading-6 text-white/70">
                {copy.locale === "pt"
                  ? "A leitura da assessoria vem de quem já esteve no vestiário, em universidade nos EUA, base profissional, Europa e rotina competitiva."
                  : "The coaching lens comes from someone who has been inside the locker room, college soccer in the US, academy environments, Europe and competitive routines."}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                {playerPathLogos.map((item) => (
                  <div
                    className="rounded-md border border-white/10 bg-ink/40 px-3 py-4 text-center"
                    key={item.name}
                  >
                    <Image
                      alt={`${item.name} logo`}
                      className="mx-auto h-12 w-12 object-contain"
                      height={72}
                      src={item.image}
                      width={72}
                    />
                    <p className="mt-3 text-xs font-bold uppercase text-white/80">
                      {item.name}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold uppercase text-white/45">
                      {item.role}
                    </p>
                  </div>
                ))}
              </div>
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
              height={2800}
              src={assets.coachGym}
              width={2100}
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
                ? "Casos de sucesso"
                : "Success stories"}
            </h2>
            <p className="mt-4 text-base leading-7 text-graphite/70">
              {copy.locale === "pt"
                ? "Atletas que treinaram com acompanhamento individual, organização de carga e uma rotina pensada para a realidade competitiva."
                : "Players supported with individual programming, load organization and a routine built around the competitive reality."}
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {currentSuccessCases.map((item) => (
              <article
                className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm"
                key={item.name}
              >
                <Image
                  alt={
                    copy.locale === "pt"
                      ? `Caso de sucesso de ${item.name}`
                      : `${item.name} success story`
                  }
                  className="aspect-[4/4.6] w-full object-cover"
                  height={906}
                  src={item.image}
                  width={812}
                />
                <div className="p-5">
                  <h3 className="text-base font-black text-ink">{item.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-graphite/75">
                    {item.quote}
                  </p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-10">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-bold uppercase text-signal">
                  {copy.locale === "pt" ? "Depoimentos reais" : "Real feedback"}
                </p>
                <h3 className="mt-2 font-display text-2xl uppercase text-ink sm:text-3xl">
                  {copy.locale === "pt"
                    ? "Prints de atletas acompanhados"
                    : "Screenshots from coached athletes"}
                </h3>
              </div>
              <p className="max-w-xl text-sm leading-6 text-graphite/65">
                {copy.locale === "pt"
                  ? "Feedbacks de atletas que buscaram mais velocidade, resistência, consistência, retorno seguro e uma rotina de treino mais profissional."
                  : "Feedback from athletes looking for more speed, endurance, consistency, safer return to play and a more professional training routine."}
              </p>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {testimonialScreens.map((src, index) => (
                <figure
                  className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm"
                  key={src}
                >
                  <Image
                    alt={
                      copy.locale === "pt"
                        ? `Depoimento de atleta ${index + 1}`
                        : `Athlete testimonial ${index + 1}`
                    }
                    className="h-auto w-full object-cover"
                    height={1080}
                    src={src}
                    width={1080}
                  />
                </figure>
              ))}
            </div>
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
            <div className="relative mt-8 overflow-hidden rounded-lg border border-ink/10 bg-ink">
              <Image
                alt={
                  copy.locale === "pt"
                    ? "Lukaz de Paula orientando atletas na assessoria"
                    : "Lukaz de Paula coaching athletes in the performance program"
                }
                className="h-auto w-full object-contain opacity-90"
                height={2800}
                src={assets.coachGymInstruction}
                width={2100}
              />
              <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-white/15 bg-ink/85 p-4 text-white shadow-sm backdrop-blur">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex gap-1 text-gold">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        aria-hidden="true"
                        className="h-4 w-4 fill-current"
                        key={index}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-black uppercase text-white/80">
                    {ratingLabel}
                  </p>
                </div>
                <p className="mt-4 inline-flex animate-pulse rounded-md bg-signal px-4 py-3 text-sm font-black uppercase text-white shadow-lg shadow-signal/30">
                  {applicationSpots}
                </p>
              </div>
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
