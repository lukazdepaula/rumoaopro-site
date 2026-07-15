"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
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

  const value =
    currency === "BRL" ? product.price_brl_estimated : product.base_price_usd;

  return formatMoney(value, currency);
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
      eyebrow: "Nossa linha de programas de performance",
      title: "Treine com estratégia durante todo o ano",
      body:
        "Os programas estão disponíveis em inglês. Antes de finalizar sua compra, consulte esta página para entender qual treinamento é mais indicado para cada fase da sua temporada e escolher a opção ideal para alcançar seus objetivos.",
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
      eyebrow: "Performance program line",
      title: "Train strategically through the whole year",
      body:
        "Use the offseason to build strength and speed, sharpen the final 30 days before return, then maintain performance during the season.",
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
              : "mt-8 flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:thin]"
          }
        >
          {visiblePrograms.map((program) => {
            const isExternal =
              !program.href.startsWith("/") && !program.href.startsWith("#");
            const reviewGroupKey = getReviewGroupForProgramHref(program.href);
            const product = findCheckoutProduct(program.href);
            const displayPrice = getDisplayPrice(product, currency);

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
                    <div className="mt-5 grid gap-2 border-t border-ink/10 pt-4">
                      {program.outcomes.slice(0, 2).map((outcome) => (
                        <p
                          className="text-xs font-bold uppercase leading-5 text-graphite/55"
                          key={outcome}
                        >
                          {outcome}
                        </p>
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
                className={
                  compact
                    ? "focus-ring block"
                    : "focus-ring block min-w-[min(82vw,340px)] snap-start md:min-w-[340px] xl:min-w-[300px]"
                }
                href={program.href}
                key={program.title}
                rel="noreferrer"
                target="_blank"
              >
                {content}
              </a>
            ) : (
              <Link
                className={
                  compact
                    ? "focus-ring block"
                    : "focus-ring block min-w-[min(82vw,340px)] snap-start md:min-w-[340px] xl:min-w-[300px]"
                }
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
