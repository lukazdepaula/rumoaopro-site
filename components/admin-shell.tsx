"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgePercent,
  BellRing,
  ExternalLink,
  FileKey2,
  Home,
  KeyRound,
  Link2,
  LogOut,
  Package,
  ReceiptText,
  RefreshCcw,
  ShoppingBag,
  UserRound,
  UsersRound
} from "lucide-react";

type AdminShellProps = {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
};

const navigation = [
  { href: "/admin", label: "Visão geral", icon: Home, exact: true },
  { href: "/admin/orders", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/entitlements", label: "Acessos", icon: KeyRound },
  { href: "/admin/legacy-access", label: "Migrações", icon: RefreshCcw },
  { href: "/admin/products", label: "Produtos", icon: Package },
  { href: "/admin/payment-links", label: "Links", icon: Link2 },
  { href: "/admin/discounts", label: "Descontos", icon: BadgePercent },
  { href: "/admin/fiscal", label: "Fiscal", icon: ReceiptText }
];

const accountNavigation = [
  { href: "/admin/notifications", label: "Alertas", icon: BellRing },
  { href: "/admin/account", label: "Minha conta", icon: UserRound },
  { href: "/admin/team", label: "Equipe", icon: UsersRound }
];

function isActivePath(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  icon: Icon,
  exact = false,
  compact = false
}: {
  href: string;
  label: string;
  icon: typeof Home;
  exact?: boolean;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href, exact);

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={`flex shrink-0 items-center gap-2 rounded-lg font-semibold transition ${
        compact ? "px-3 py-2 text-xs" : "px-3 py-2.5 text-sm"
      } ${
        active
          ? "bg-white text-ink shadow-sm ring-1 ring-ink/5"
          : compact
            ? "text-white/70 hover:bg-white/10 hover:text-white"
            : "text-graphite/70 hover:bg-white/70 hover:text-ink"
      }`}
      href={href}
    >
      <Icon className="h-4 w-4" strokeWidth={active ? 2.4 : 1.9} />
      <span>{label}</span>
    </Link>
  );
}

export function AdminShell({ title, eyebrow = "Admin", children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#f6f6f7] text-ink">
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-[#1a1a1a] text-white lg:hidden">
        <div className="flex min-h-14 items-center justify-between gap-3 px-4">
          <Link className="flex items-center gap-2 font-display text-base uppercase" href="/admin">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-signal text-xs">R</span>
            RumoAoPro
          </Link>
          <Link
            aria-label="Abrir site"
            className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            href="/"
            target="_blank"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
        <nav className="flex max-w-full gap-1 overflow-x-auto px-3 pb-3">
          {[...navigation, ...accountNavigation].map((item) => (
            <NavLink compact key={item.href} {...item} />
          ))}
          <form action="/api/admin/logout" method="post">
            <button className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white" type="submit">
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </form>
        </nav>
      </header>

      <div className="mx-auto min-h-screen max-w-[1600px] lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-screen flex-col border-r border-ink/10 bg-[#ebebeb] p-3 lg:flex">
          <Link className="mb-5 flex h-11 items-center gap-3 px-2" href="/admin">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-signal font-display text-sm text-white shadow-sm">R</span>
            <span>
              <span className="block font-display text-base uppercase leading-none">RumoAoPro</span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-graphite/45">Administração</span>
            </span>
          </Link>

          <nav className="grid gap-1">
            {navigation.map((item) => <NavLink key={item.href} {...item} />)}
          </nav>

          <div className="mt-auto border-t border-ink/10 pt-3">
            <nav className="grid gap-1">
              {accountNavigation.map((item) => <NavLink key={item.href} {...item} />)}
            </nav>
            <Link
              className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-graphite/70 transition hover:bg-white/70 hover:text-ink"
              href="/"
              target="_blank"
            >
              <ExternalLink className="h-4 w-4" />
              Ver site
            </Link>
            <form action="/api/admin/logout" className="mt-1" method="post">
              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-graphite/70 transition hover:bg-white/70 hover:text-ink" type="submit">
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </form>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="hidden h-14 items-center justify-between border-b border-ink/10 bg-white px-8 lg:flex">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-graphite/45">
              <FileKey2 className="h-4 w-4" />
              Área protegida
            </div>
            <Link className="flex items-center gap-2 rounded-lg border border-ink/10 bg-white px-3 py-2 text-xs font-bold text-graphite/70 transition hover:border-ink/20 hover:text-ink" href="/" target="_blank">
              Ver loja
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </header>

          <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-graphite/45">{eyebrow}</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-ink sm:text-3xl">{title}</h1>
            <div className="mt-6">{children}</div>
          </section>
        </main>
      </div>
    </div>
  );
}
