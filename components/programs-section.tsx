"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, Star } from "lucide-react";
import { useState } from "react";
import { CtaButton } from "@/components/cta-button";
import { checkoutProducts, formatMoney } from "@/lib/checkout/products";
import type { CheckoutProduct } from "@/lib/checkout/types";
import { programs, programsEn } from "@/lib/content";
import {
  getReviewGroupForProgramHref,
  reviewGroups
} from "@/lib/reviews";

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

const getProgramFocuses = (href: string, locale: "pt" | "en") => {
  const labels = {
    pt: {
      endurance: "Resistência",
      strength: "Força",
      speed: "Velocidade",
      power: "Potência",
      hypertrophy: "Hipertrofia",
      maintenance: "Manutenção",
      return: "Retorno",
      running: "Corrida"
    },
    en: {
      endurance: "Endurance",
      strength: "Strength",
      speed: "Speed",
      power: "Power",
      hypertrophy: "Hypertrophy",
      maintenance: "Maintenance",
      return: "Return",
      running: "Running"
    }
  }[locale];

  if (href.includes("offseason-30-days")) {
    return [labels.endurance, labels.strength, labels.speed];
  }

  if (href.includes("projeto-36") || href.includes("project-36")) {
    return [labels.strength, labels.speed, labels.power];
  }

  if (
    href.includes("power-pro") ||
    href.includes("projeto-adama") ||
    href.includes("adama-strength-power")
  ) {
    return [labels.hypertrophy, labels.strength, labels.power];
  }

  if (href.includes("elanga-in-season")) {
    return [labels.maintenance, labels.strength, labels.speed];
  }

  if (href.includes("de-volta-aos-gramados")) {
    return [labels.return, labels.running, labels.strength];
  }

  return [labels.strength, labels.speed, labels.power];
};

const getProgramAccent = (href: string) => {
  if (href.includes("de-volta-aos-gramados")) {
    return {
      border: "from-teal-700/75 via-teal-500/55 to-cyan-400/70",
      label: "text-teal-700",
      chip:
        "bg-teal-50 text-teal-950 ring-1 ring-inset ring-teal-200/75"
    };
  }

  if (
    href.includes("power-pro") ||
    href.includes("projeto-adama") ||
    href.includes("adama-strength-power")
  ) {
    return {
      border: "from-red-800/80 via-red-600/60 to-rose-400/70",
      label: "text-red-700",
      chip: "bg-red-50 text-red-950 ring-1 ring-inset ring-red-200/75"
    };
  }

  if (href.includes("projeto-36") || href.includes("project-36")) {
    return {
      border:
        "from-emerald-800/75 via-emerald-500/55 to-lime-400/70",
      label: "text-emerald-700",
      chip:
        "bg-emerald-50 text-emerald-950 ring-1 ring-inset ring-emerald-200/75"
    };
  }

  if (href.includes("elanga-in-season")) {
    return {
      border: "from-orange-800/75 via-orange-500/55 to-amber-400/70",
      label: "text-orange-700",
      chip:
        "bg-orange-50 text-orange-950 ring-1 ring-inset ring-orange-200/75"
    };
  }

  return {
    border: "from-blue-800/75 via-blue-500/55 to-cyan-400/70",
    label: "text-blue-700",
    chip: "bg-blue-50 text-blue-950 ring-1 ring-inset ring-blue-200/75"
  };
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
        "Offseason 30 Days, Speed Pro, Power Pro e In-Season Pro estão disponíveis em português e inglês. De Volta aos Gramados está disponível em português. Confira o idioma indicado antes da compra.",
      seeAll: "Ver todos",
      priceLabel: "Preço",
      focusLabel: "Foco",
      reviewsLabel: "avaliações",
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
        "Offseason 30 Days, Speed Pro, Power Pro and In-Season Pro are available in English and Portuguese. Back to the Pitch is currently delivered in Portuguese.",
      seeAll: "See all",
      priceLabel: "Price",
      focusLabel: "Focus",
      reviewsLabel: "reviews",
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
              : "mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-8"
          }
        >
          {visiblePrograms.map((program, index) => {
            const isExternal =
              !program.href.startsWith("/") && !program.href.startsWith("#");
            const reviewGroupKey = getReviewGroupForProgramHref(program.href);
            const reviewGroup = reviewGroupKey
              ? reviewGroups[reviewGroupKey]
              : null;
            const product = findCheckoutProduct(program.href);
            const displayPrice = getDisplayPrice(product, currency);
            const focuses = getProgramFocuses(program.href, locale);
            const accent = getProgramAccent(program.href);
            const cardLayout = compact
              ? ""
              : `xl:col-span-2 ${
                  visiblePrograms.length === 5 && index === 4
                    ? "xl:col-start-4"
                    : ""
                }`;

            const content = (
              <article
                className={`group flex h-full overflow-hidden rounded-[10px] bg-gradient-to-br p-[2px] shadow-sm transition hover:-translate-y-1 hover:shadow-card ${accent.border}`}
                key={program.title}
              >
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[8px] bg-white">
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
                    <div className="grid min-h-[76px] grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <p
                        className={`pr-1 text-xs font-bold uppercase leading-5 ${accent.label}`}
                      >
                        {program.level}
                      </p>
                      {displayPrice ? (
                        <div className="min-w-[112px] text-right">
                          <p className="text-[11px] font-bold uppercase text-graphite/45">
                            {copy.priceLabel}
                          </p>
                          <p className="text-lg font-bold text-ink">
                            {displayPrice}
                          </p>
                          {reviewGroup ? (
                            <div
                              aria-label={`${reviewGroup.average.toFixed(1)} / 5 · ${reviewGroup.count} ${copy.reviewsLabel}`}
                              className="mt-1.5 flex items-center justify-end gap-1.5"
                            >
                              <span
                                aria-hidden="true"
                                className="inline-flex gap-px text-signal"
                              >
                                {Array.from({ length: 5 }).map((_, index) => (
                                  <Star
                                    className="h-2.5 w-2.5 fill-current"
                                    key={index}
                                  />
                                ))}
                              </span>
                              <span className="text-[10px] font-bold text-graphite/60">
                                {reviewGroup.average.toFixed(1)} ·{" "}
                                {reviewGroup.count}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                    <h3 className="mt-3 min-h-[56px] text-xl font-bold leading-7 text-ink">
                      {program.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-graphite/70">
                      {program.body}
                    </p>
                    <div className="mt-auto border-t border-ink/10 pt-4">
                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.14em] ${accent.label}`}
                      >
                        {copy.focusLabel}
                      </p>
                      <div className="mt-2 grid grid-cols-3 gap-1.5">
                        {focuses.map((focus) => (
                          <span
                            className={`inline-flex min-h-9 items-center justify-center rounded-md px-1.5 text-center text-[9px] font-black uppercase leading-4 tracking-[0.04em] ${accent.chip}`}
                            key={focus}
                          >
                            {focus}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="inline-flex pt-5 text-sm font-bold text-ink">
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
                className={`focus-ring block ${cardLayout}`}
                href={program.href}
                key={program.title}
                rel="noreferrer"
                target="_blank"
              >
                {content}
              </a>
            ) : (
              <Link
                className={`focus-ring block ${cardLayout}`}
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
