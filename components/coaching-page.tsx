import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Medal,
  Star
} from "lucide-react";
import { ApplicationForm } from "@/components/application-form";
import { CtaButton } from "@/components/cta-button";
import { RaptorPhoneMockup } from "@/components/raptor-program-experience";
import { ReviewsSection } from "@/components/reviews";
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
  const credentialLogos = (credential: string) => {
    const normalized = credential.toLowerCase();

    if (normalized.includes("cbf")) {
      return [assets.logoCbf];
    }
    if (normalized.includes("málaga") || normalized.includes("malaga")) {
      return [assets.logoMalagaCity, assets.logoAlmunecar];
    }
    if (normalized.includes("lindsey")) {
      return [assets.logoLindseyWilson];
    }
    if (normalized.includes("extratime")) {
      return [assets.logoExtratime];
    }

    return [];
  };

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

      <section
        className="relative isolate overflow-hidden bg-[#08090b] py-16 text-white"
        id={methodId}
      >
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_8%_18%,rgba(213,22,42,0.34),transparent_34%),radial-gradient(circle_at_92%_78%,rgba(213,22,42,0.18),transparent_34%),linear-gradient(135deg,#08090b_0%,#151012_52%,#08090b_100%)]" />
        <div className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(115deg,transparent_0%,transparent_47%,rgba(255,255,255,0.28)_47.2%,transparent_47.6%)] [background-size:140px_140px]" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-signal">
              {copy.locale === "pt" ? "Método" : "Method"}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-white sm:text-4xl">
              {copy.methodTitle}
            </h2>
            <p className="mt-5 text-base leading-7 text-white/68">
              {copy.methodLead}
            </p>
            <div className="mt-8 overflow-hidden rounded-lg border border-white/12 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
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
                  className="rounded-lg border border-white/10 bg-white/[0.07] p-5 shadow-sm backdrop-blur"
                  key={benefit.title}
                >
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-signal text-white">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white">{benefit.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/62">
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
          <div className="relative mx-auto min-h-[610px] w-full max-w-[700px] sm:min-h-[680px]">
            <div className="absolute inset-x-[5%] top-[8%] overflow-hidden rounded-[2rem] border border-white/12 bg-[#111318] shadow-[0_30px_100px_rgba(0,0,0,0.48)] sm:left-0 sm:right-auto sm:w-[68%]">
              <div className="relative h-44 overflow-hidden sm:h-52">
                <Image
                  alt={
                    copy.locale === "pt"
                      ? "Gabriel, atleta do Mirassol acompanhado pela assessoria"
                      : "Gabriel, Mirassol player supported by coaching"
                  }
                  className="h-full w-full object-cover object-[center_26%]"
                  fill
                  sizes="(max-width: 639px) 90vw, 470px"
                  src={assets.successGabriel}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111318] via-transparent to-transparent" />
                <div className="absolute inset-x-5 bottom-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-300">
                    {copy.locale === "pt" ? "Visão do coach" : "Coach view"}
                  </p>
                  <p className="mt-1 text-xl font-black text-white">Gabriel · Mirassol</p>
                </div>
              </div>
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase text-white/50">
                    {copy.locale === "pt" ? "Microciclo individual" : "Individual microcycle"}
                  </p>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] font-black uppercase text-emerald-300">
                    {copy.locale === "pt" ? "Ajuste semanal" : "Weekly update"}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    [copy.locale === "pt" ? "SEG" : "MON", copy.locale === "pt" ? "Força" : "Strength"],
                    [copy.locale === "pt" ? "QUA" : "WED", copy.locale === "pt" ? "Velocidade" : "Speed"],
                    [copy.locale === "pt" ? "SEX" : "FRI", copy.locale === "pt" ? "Recuperação" : "Recovery"]
                  ].map(([day, session], index) => (
                    <div
                      className={`rounded-xl border p-3 ${
                        index === 1
                          ? "border-signal/50 bg-signal/12"
                          : "border-white/10 bg-white/[0.05]"
                      }`}
                      key={day}
                    >
                      <p className="text-[10px] font-black uppercase text-white/45">{day}</p>
                      <p className="mt-2 text-xs font-bold text-white">{session}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
                  {[
                    ["4/5", copy.locale === "pt" ? "sessões" : "sessions"],
                    ["7.2", "RPE"],
                    ["92%", copy.locale === "pt" ? "conclusão" : "completion"]
                  ].map(([value, label]) => (
                    <div key={label}>
                      <p className="text-base font-black text-white">{value}</p>
                      <p className="mt-1 text-[9px] font-bold uppercase text-white/38">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 right-[3%] z-20 w-[46%] sm:right-0 sm:w-[43%]">
              <RaptorPhoneMockup
                alt={
                  copy.locale === "pt"
                    ? "Calendário atual do atleta dentro do RaptorPro"
                    : "Current athlete calendar inside RaptorPro"
                }
                className="w-full"
                src="/assets/programs/offseason-30/raptor-athlete-calendar-mobile.png"
              />
              <span className="absolute -left-5 bottom-10 rounded-full border border-white/15 bg-black/80 px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-white shadow-xl backdrop-blur sm:text-[10px]">
                {copy.locale === "pt" ? "Visão do atleta" : "Athlete view"}
              </span>
            </div>
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
                const logos = credentialLogos(credential);

                return (
                  <div
                    className="flex items-center gap-3 rounded-md border border-white/10 bg-white/10 px-4 py-3"
                    key={credential}
                  >
                    {logos.length > 0 ? (
                      <span className="flex h-12 min-w-12 items-center justify-center -space-x-2 rounded-md border border-white/15 bg-white/95 px-1">
                        {logos.map((logo, index) => (
                          <Image
                            alt=""
                            aria-hidden="true"
                            className="h-9 w-9 rounded-full object-contain"
                            height={48}
                            key={logo}
                            src={logo}
                            style={{ zIndex: logos.length - index }}
                            width={48}
                          />
                        ))}
                      </span>
                    ) : (
                      <span className="grid h-12 w-12 place-items-center rounded-md border border-gold/40 bg-gold/10 text-gold">
                        <Medal aria-hidden="true" className="h-6 w-6" />
                      </span>
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
                      <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/95 p-1.5">
                        <Image
                          alt={`${item.name} logo`}
                          className="h-full w-full object-contain"
                          height={64}
                          src={item.image}
                          width={64}
                        />
                      </span>
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

      <ReviewsSection
        groupKey="coaching"
        locale={copy.locale}
        title={
          copy.locale === "pt"
            ? "Atletas que passaram pela assessoria"
            : "Players who went through coaching"
        }
      />

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
