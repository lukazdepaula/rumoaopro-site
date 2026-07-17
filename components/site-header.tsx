"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { assets } from "@/lib/content";

type SiteHeaderProps = {
  navItems: { label: string; href: string }[];
  ctaLabel?: string;
  ctaHref?: string;
  languageHref?: string;
};

const isLanguageItem = (label: string) =>
  label.includes("English") || label.includes("Português");

const languageLabel = (label: string) => {
  const targetIsEnglish = label.includes("English");

  return targetIsEnglish ? "🇧🇷 PT → EN" : "🇺🇸 EN → PT";
};

export function SiteHeader({
  navItems,
  ctaLabel = "Aplicar",
  ctaHref = "/assessoria#aplicacao",
  languageHref
}: SiteHeaderProps) {
  const pathname = usePathname();
  const english = pathname === "/en" || pathname.startsWith("/en/");
  const menuLanguageLabel = english ? "Language" : "Idioma";
  const mobileNavLabel = english ? "Mobile navigation" : "Navegação mobile";
  const menuButtonLabel = english ? "Open menu" : "Abrir menu";

  const isActive = (href: string) => {
    if (href === "/" || href === "/en") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/95 text-white backdrop-blur">
      <div className="mx-auto flex h-[var(--header-height)] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          className="flex items-center gap-3 focus-ring rounded-md"
          href={english ? "/en" : "/"}
        >
          <img
            alt="RumoAoPro"
            className="h-10 w-10 object-contain"
            height={40}
            src={assets.logo}
            width={40}
          />
          <span className="hidden font-display text-lg uppercase sm:inline">
            RumoAoPro
          </span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-5 lg:flex">
          {navItems.map((item) => {
            const isLanguage = isLanguageItem(item.label);
            const href = isLanguage && languageHref ? languageHref : item.href;

            return (
              <Link
                className={
                  isLanguage
                    ? "focus-ring rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold text-white transition hover:bg-white hover:text-ink"
                    : "focus-ring rounded-md text-sm font-semibold text-white/80 transition hover:text-white"
                }
                href={href}
                key={item.href}
              >
                {isLanguage ? languageLabel(item.label) : item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Link
            className="focus-ring inline-flex min-h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-bold text-ink transition hover:bg-steel"
            href={ctaHref}
          >
            {ctaLabel}
          </Link>
        </div>
        <details className="group lg:hidden">
          <summary
            aria-label={menuButtonLabel}
            className="focus-ring inline-flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-md border border-white/15 bg-white/10 text-white transition hover:bg-white hover:text-ink [&::-webkit-details-marker]:hidden"
            title={menuButtonLabel}
          >
            <Menu aria-hidden="true" className="h-5 w-5 group-open:hidden" />
            <X
              aria-hidden="true"
              className="hidden h-5 w-5 group-open:block"
            />
          </summary>

          <nav
            aria-label={mobileNavLabel}
            className="absolute inset-x-0 top-full border-b border-white/10 bg-ink px-4 pb-5 pt-3 shadow-2xl"
            id="mobile-navigation"
          >
            <div className="mx-auto grid max-w-7xl gap-1">
              {navItems.map((item) => {
                const isLanguage = isLanguageItem(item.label);
                const href = isLanguage && languageHref ? languageHref : item.href;

                return (
                  <Link
                    aria-current={!isLanguage && isActive(href) ? "page" : undefined}
                    className={
                      isLanguage
                        ? "focus-ring mt-2 flex min-h-12 items-center justify-between rounded-md border border-white/15 bg-white/10 px-4 text-sm font-bold text-white"
                        : `focus-ring flex min-h-12 items-center rounded-md px-4 text-base font-bold transition ${
                            isActive(href)
                              ? "bg-white text-ink"
                              : "text-white/80 hover:bg-white/10 hover:text-white"
                          }`
                    }
                    href={href}
                    key={item.href}
                  >
                    {isLanguage ? (
                      <>
                        <span>{menuLanguageLabel}</span>
                        <span>{languageLabel(item.label)}</span>
                      </>
                    ) : (
                      item.label
                    )}
                  </Link>
                );
              })}
              <Link
                className="focus-ring mt-2 inline-flex min-h-12 items-center justify-center rounded-md bg-white px-4 text-sm font-bold uppercase text-ink"
                href={ctaHref}
              >
                {ctaLabel}
              </Link>
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}
