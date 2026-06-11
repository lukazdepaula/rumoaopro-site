import Link from "next/link";
import { assets } from "@/lib/content";

type SiteHeaderProps = {
  navItems: { label: string; href: string }[];
  ctaLabel?: string;
  ctaHref?: string;
};

export function SiteHeader({
  navItems,
  ctaLabel = "Aplicar",
  ctaHref = "/assessoria#aplicacao"
}: SiteHeaderProps) {
  const languageItem = navItems.find(
    (item) => item.label.includes("English") || item.label.includes("Português")
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/90 text-white backdrop-blur">
      <div className="mx-auto flex h-[var(--header-height)] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3 focus-ring rounded-md" href="/">
          <img
            alt="RumoAoPro"
            className="h-10 w-10 object-contain"
            height={40}
            src={assets.logo}
            width={40}
          />
          <span className="font-display text-lg uppercase">RumoAoPro</span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => {
            const isLanguage =
              item.label.includes("English") || item.label.includes("Português");

            return (
              <Link
                className={
                  isLanguage
                    ? "focus-ring rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold text-white transition hover:bg-white hover:text-ink"
                    : "focus-ring rounded-md text-sm font-semibold text-white/80 transition hover:text-white"
                }
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          {languageItem ? (
            <Link
              className="focus-ring inline-flex min-h-10 items-center justify-center rounded-md border border-white/15 bg-white/10 px-3 text-sm font-bold text-white md:hidden"
              href={languageItem.href}
            >
              {languageItem.label}
            </Link>
          ) : null}
          <Link
            className="focus-ring inline-flex min-h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-bold text-ink transition hover:bg-steel"
            href={ctaHref}
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
