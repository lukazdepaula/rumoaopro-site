import Link from "next/link";

type AdminShellProps = {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
};

export function AdminShell({ title, eyebrow = "Admin", children }: AdminShellProps) {
  return (
    <main className="min-h-screen bg-smoke">
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-white">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link className="font-display text-lg uppercase text-ink" href="/admin">
            RumoAoPro Admin
          </Link>
          <nav className="flex items-center gap-2 text-sm font-bold">
            <Link className="rounded-md px-3 py-2 text-graphite hover:bg-smoke" href="/admin">
              Home
            </Link>
            <Link className="rounded-md px-3 py-2 text-graphite hover:bg-smoke" href="/admin/orders">
              Pedidos
            </Link>
            <Link className="rounded-md px-3 py-2 text-graphite hover:bg-smoke" href="/admin/entitlements">
              Acessos
            </Link>
            <Link className="rounded-md px-3 py-2 text-graphite hover:bg-smoke" href="/admin/products">
              Produtos
            </Link>
            <Link className="rounded-md px-3 py-2 text-graphite hover:bg-smoke" href="/admin/discounts">
              Descontos
            </Link>
            <Link className="rounded-md px-3 py-2 text-graphite hover:bg-smoke" href="/admin/fiscal">
              Fiscal
            </Link>
            <Link className="rounded-md px-3 py-2 text-graphite hover:bg-smoke" href="/admin/account">
              Minha conta
            </Link>
            <form action="/api/admin/logout" method="post">
              <button className="rounded-md bg-ink px-3 py-2 text-white" type="submit">
                Sair
              </button>
            </form>
          </nav>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm font-bold uppercase text-signal">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl uppercase text-ink sm:text-4xl">
          {title}
        </h1>
        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}
