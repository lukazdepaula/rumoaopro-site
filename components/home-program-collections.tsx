"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { ReviewBadge } from "@/components/reviews";
import { checkoutProducts, formatMoney } from "@/lib/checkout/products";
import type { CheckoutProduct } from "@/lib/checkout/types";
import { programs, programsEn, programsPtLegacy } from "@/lib/content";
import { getReviewGroupForProgramHref } from "@/lib/reviews";

type HomeProgramCollectionsProps = {
  locale: "pt" | "en";
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

export function HomeProgramCollections({
  locale
}: HomeProgramCollectionsProps) {
  const [currency, setCurrency] = useState<DisplayCurrency>(
    locale === "pt" ? "BRL" : "USD"
  );
  const copy = {
    pt: {
      eyebrow: "Programas de performance",
      title: "Escolha sua coleção",
      body:
        "Planos completos para cada fase da temporada, com acesso imediato e materiais organizados na sua área do cliente.",
      currency: "Mostrar preços em",
      price: "A partir de",
      cta: "Conhecer programa",
      portugueseTitle: "Programas em português",
      portugueseBody:
        "Treinamentos completos com materiais, instruções e suporte de acesso em português.",
      englishTitle: "Programas internacionais",
      englishBody:
        "A linha mais recente da RumoAoPro. Os materiais destes programas estão disponíveis em inglês.",
      portugueseLink: "Ver coleção em português",
      englishLink: "Ver coleção internacional"
    },
    en: {
      eyebrow: "Performance programs",
      title: "Choose your collection",
      body:
        "Complete plans for every phase of the season, with instant access and organized materials in your client area.",
      currency: "Show prices in",
      price: "From",
      cta: "Explore program",
      portugueseTitle: "Programs in Portuguese",
      portugueseBody:
        "Complete training plans with materials, instructions, and access support in Portuguese.",
      englishTitle: "International programs",
      englishBody:
        "The latest RumoAoPro program line, with all training materials available in English.",
      portugueseLink: "View Portuguese collection",
      englishLink: "View international collection"
    }
  }[locale];
  const collections =
    locale === "pt"
      ? [
          {
            title: copy.portugueseTitle,
            body: copy.portugueseBody,
            label: "Português",
            programs: programsPtLegacy,
            href: "/programas#programas-portugues",
            linkLabel: copy.portugueseLink
          },
          {
            title: copy.englishTitle,
            body: copy.englishBody,
            label: "English",
            programs,
            href: "/programas#programas",
            linkLabel: copy.englishLink
          }
        ]
      : [
          {
            title: copy.englishTitle,
            body: copy.englishBody,
            label: "English",
            programs: programsEn,
            href: "/en/programs#programas",
            linkLabel: copy.englishLink
          },
          {
            title: copy.portugueseTitle,
            body: copy.portugueseBody,
            label: "Português",
            programs: programsPtLegacy,
            href: "/programas#programas-portugues",
            linkLabel: copy.portugueseLink
          }
        ];

  return (
    <section className="border-b border-ink/10 bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-signal">
              {copy.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-5xl">
              {copy.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-graphite/70">
              {copy.body}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase text-graphite/50">
              {copy.currency}
            </p>
            <div className="inline-flex rounded-md border border-ink/10 bg-smoke p-1">
              {(["BRL", "USD"] as DisplayCurrency[]).map((option) => (
                <button
                  aria-pressed={currency === option}
                  className={`min-h-10 rounded px-4 text-sm font-bold transition ${
                    currency === option
                      ? "bg-ink text-white shadow-sm"
                      : "text-ink hover:bg-white"
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
        </div>

        <div className="mt-12 space-y-14">
          {collections.map((collection) => (
            <div key={collection.title}>
              <div className="flex flex-col justify-between gap-4 border-b border-ink/10 pb-5 sm:flex-row sm:items-end">
                <div className="max-w-2xl">
                  <h3 className="text-2xl font-bold text-ink">
                    {collection.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-graphite/65">
                    {collection.body}
                  </p>
                </div>
                <Link
                  className="focus-ring inline-flex items-center gap-2 text-sm font-bold text-ink hover:text-signal"
                  href={collection.href}
                >
                  {collection.linkLabel}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-5 flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:thin] md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4">
                {collection.programs.map((program) => {
                  const product = findCheckoutProduct(program.href);
                  const reviewGroupKey = getReviewGroupForProgramHref(
                    program.href
                  );
                  const price = product
                    ? formatMoney(
                        currency === "BRL"
                          ? product.price_brl_estimated
                          : product.base_price_usd,
                        currency
                      )
                    : null;

                  return (
                    <Link
                      className="focus-ring group block w-[82vw] max-w-[330px] shrink-0 snap-start md:w-auto md:max-w-none"
                      href={program.href}
                      key={program.title}
                    >
                      <article className="flex h-full flex-col overflow-hidden rounded-lg border border-ink/10 bg-white transition hover:-translate-y-1 hover:shadow-card">
                        <div className="relative aspect-[4/3] overflow-hidden bg-smoke">
                          <Image
                            alt={program.title}
                            className="object-contain p-4 transition duration-500 group-hover:scale-[1.03]"
                            fill
                            sizes="(max-width: 767px) 82vw, (max-width: 1023px) 50vw, 25vw"
                            src={product?.cover_image || program.image}
                          />
                          <span className="absolute left-3 top-3 rounded-md bg-ink/90 px-3 py-2 text-[11px] font-bold uppercase text-white backdrop-blur">
                            {collection.label}
                          </span>
                        </div>

                        <div className="flex flex-1 flex-col p-4">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-xs font-bold uppercase leading-5 text-signal">
                              {program.duration}
                            </p>
                            {price ? (
                              <div className="shrink-0 text-right">
                                <p className="text-[10px] font-bold uppercase text-graphite/45">
                                  {copy.price}
                                </p>
                                <p className="text-lg font-bold text-ink">
                                  {price}
                                </p>
                              </div>
                            ) : null}
                          </div>

                          {reviewGroupKey ? (
                            <ReviewBadge
                              className="mt-3 w-fit !border-0 !bg-transparent !px-0 !py-0 !shadow-none"
                              groupKey={reviewGroupKey}
                              locale={locale}
                            />
                          ) : null}

                          <h4 className="mt-3 text-lg font-bold leading-6 text-ink">
                            {program.title}
                          </h4>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-graphite/65">
                            {program.body}
                          </p>
                          <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-ink group-hover:text-signal">
                            {copy.cta}
                            <ArrowRight
                              aria-hidden="true"
                              className="h-4 w-4 transition group-hover:translate-x-1"
                            />
                          </span>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
