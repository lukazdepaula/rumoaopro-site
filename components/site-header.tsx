import Link from "next/link";
import { Dumbbell } from "lucide-react";

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
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/90 text-white backdrop-blur">
      <div className="mx-auto flex h-[var(--header-height)] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3 focus-ring rounded-md" href="/">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-signal">
            <Dumbbell aria-hidden="true" className="h-5 w-5" />
          </span>
          <span className="font-display text-lg uppercase">RumoAoPro</span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              className="text-sm font-semibold text-white/80 transition hover:text-white focus-ring rounded-md"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          className="focus-ring inline-flex min-h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-bold text-ink transition hover:bg-steel"
          href={ctaHref}
        >
          {ctaLabel}
        </Link>
      </div>
    </header>
  );
}
