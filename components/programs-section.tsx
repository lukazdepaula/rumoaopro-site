"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  Dumbbell,
  ExternalLink,
  Gauge,
  PlayCircle,
  ShieldCheck
} from "lucide-react";
import { useState } from "react";
import { CtaButton } from "@/components/cta-button";
import { ReviewBadge } from "@/components/reviews";
import { checkoutProducts, formatMoney } from "@/lib/checkout/products";
import type { CheckoutProduct } from "@/lib/checkout/types";
import { programs, programsEn } from "@/lib/content";
import { getReviewGroupForProgramHref } from "@/lib/reviews";

type ProgramsSectionProps = {
  compact?: boolean;
  locale?: "pt" | "en";
};

type DisplayCurrency = "BRL" | "USD";

const normalizeProgramPath = (href: string) =>
  href
    .replace(/^\/en\/programs\//, "")
    .replace(/^\/programas\//, "")
    .replace(/^\/checkout\//, "")
    .replace(/^\/+/, "");

const findCheckoutProduct = (href: string): CheckoutProduct | undefined => {
  const path = normalizeProgramPath(href);

  return checkoutProducts.find((product) => {
    const productPaths = [
      product.slug,
      normalizeProgramPath(product.sales_page_path),
      ...(product.aliases || [])
    ];

    return productPaths.includes(path);
  });
};

const getDisplayPrice = (
  product: CheckoutProduct | undefined,
  currency: DisplayCurrency
) => {
  if (!product) return null;
  if (currency === "USD" && product.checkout_country_lock === "BR") return null;

  const value =
    currency === "BRL" ? product.price_brl_estimated : product.base_price_usd;

  return formatMoney(value, currency);
};

const getProgramFeatures = (href: string, locale: "pt" | "en") => {
  const labels = {
    pt: {
      field: "Campo",
      gym: "Academia",
      speed: "Velocidade",
      videos: "Vídeos",
      calendar: "Calendário",
      matches: "Entre jogos",
      recovery: "Progressão",
      app: "No app",
      strength: "Força",
      power: "Potência",
      sessions: "3 + 1 treinos"
    },
    en: {
      field: "Field",
      gym: "Gym",
      speed: "Speed",
      videos: "Videos",
      calendar: "Calendar",
      matches: "Between games",
      recovery: "Progression",
      app: "In the app",
      strength: "Strength",
      power: "Power",
      sessions: "3 + 1 sessions"
    }
  }[locale];

  if (href.includes("projeto-36") || href.includes("project-36")) {
    return [
      [Gauge, labels.speed],
      [Activity, labels.field],
      [Dumbbell, labels.gym],
      [PlayCircle, labels.videos]
    ] as const;
  }

  if (href.includes("power-pro")) {
    return [
      [Dumbbell, labels.gym],
      [ShieldCheck, labels.strength],
      [Activity, labels.power],
      [CalendarDays, labels.sessions]
    ] as const;
  }

  if (href.includes("elanga-in-season")) {
    return [
      [CalendarDays, labels.calendar],
      [ShieldCheck, labels.matches],
      [Dumbbell, labels.gym],
      [Activity, labels.speed]
    ] as const;
  }

  if (href.includes("de-volta-aos-gramados")) {
    return [
      [ShieldCheck, labels.recovery],
      [Dumbbell, labels.gym],
      [Activity, labels.field],
      [PlayCircle, labels.app]
    ] as const;
  }

  return [
    [CalendarDays, labels.calendar],
    [Activity, labels.field],
    [Dumbbell, labels.gym],
    [PlayCircle, labels.videos]
  ] as const;
};

export function ProgramsSection({
  compact = false,
  locale = "pt"
}: ProgramsSectionProps) {
  const [currency, setCurrency] = useState<DisplayCurrency>(
    locale === "pt" ? "BRL" : "USD"
  );
  const selectedPrograms = locale === "en" ? programsEn : programs;
  const visiblePrograms = compact
    ? selectedPrograms.slice(0, 3)
    : selectedPrograms;
  const copy = {
    pt: {
      eyebrow: "Programas disponíveis",
      title: "Escolha o programa certo para o seu objetivo",
      body:
        "Power Pro e De Volta aos Gramados estão disponíveis em português. Offseason 30 Days, Speed Pro e In-Season Pro estão disponíveis em português e inglês. Confira o idioma indicado antes da compra.",
      seeAll: "Ver todos",
      priceLabel: "Preço",
      currencyLabel: "Moeda de referência",
      chooseEyebrow: "Assessoria esportiva",
      chooseTitle: "Sua rotina muda. Seu treinamento também deve mudar.",
      chooseBody:
        "Para resultados personalizados e acompanhamento completo, a Assessoria Esportiva continua sendo a melhor escolha.",
      apply: "Aplicar para a assessoria",
      applyHref: "/assessoria#aplicacao"
    },
    en: {
      eyebrow: "Available programs",
      title: "Choose the right program for your goal",
      body:
        "Offseason 30 Days, Speed Pro and In-Season Pro are available in English and Portuguese. Power Pro and Back to the Pitch are currently delivered in Portuguese.",
      seeAll: "See all",
      priceLabel: "Price",
      currencyLabel: "Reference currency",
      chooseEyebrow: "Online coaching",
      chooseTitle: "Your routine changes. Your training should too.",
      chooseBody:
        "For personalized results and complete follow-up, Online Coaching is the most complete and recommended option.",
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
          <div className="flex flex-col gap-3 sm:flex-row md:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase text-graphite/50">
                {copy.currencyLabel}
              </p>
              <div className="inline-flex rounded-md border border-ink/10 bg-white p-1 shadow-sm">
                {(["BRL", "USD"] as DisplayCurrency[]).map((option) => (
                  <button
                    className={`min-h-10 rounded px-4 text-sm font-bold transition ${
                      currency === option
                        ? "bg-ink text-white"
                        : "text-ink hover:bg-smoke"
                    }`}
                    key={option}
                    onClick={() => setCurrency(option)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
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
        </div>

        <div
          className={
            compact
              ? "mt-8 grid gap-5 md:grid-cols-3"
              : "mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4"
          }
        >
          {visiblePrograms.map((program) => {
            const isExternal =
              !program.href.startsWith("/") && !program.href.startsWith("#");
            const reviewGroupKey = getReviewGroupForProgramHref(program.href);
            const product = findCheckoutProduct(program.href);
            const displayPrice = getDisplayPrice(product, currency);
            const features = getProgramFeatures(program.href, locale);

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
                    <div className="flex min-h-[54px] flex-wrap items-start justify-between gap-3">
                      <p className="max-w-[180px] text-xs font-bold uppercase leading-5 text-signal">
                        {program.level}
                      </p>
                      {displayPrice ? (
                        <div className="text-right">
                          <p className="text-[11px] font-bold uppercase text-graphite/45">
                            {copy.priceLabel}
                          </p>
                          <p className="text-lg font-bold text-ink">
                            {displayPrice}
                          </p>
                        </div>
                      ) : null}
                    </div>
                    {reviewGroupKey ? (
                      <ReviewBadge
                        className="mt-3"
                        groupKey={reviewGroupKey}
                        locale={locale}
                      />
                    ) : null}
                    <h3 className="mt-3 min-h-[56px] text-xl font-bold leading-7 text-ink">
                      {program.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-graphite/70">
                      {program.body}
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-2 border-t border-ink/10 pt-4">
                      {features.map(([Icon, label]) => (
                        <span
                          className="inline-flex min-h-9 items-center gap-2 rounded-md bg-smoke px-2.5 text-[10px] font-bold uppercase leading-4 text-graphite/70"
                          key={label}
                        >
                          <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-signal" />
                          {label}
                        </span>
                      ))}
                    </div>
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
