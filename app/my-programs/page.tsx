import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, LogOut } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { requireCustomer } from "@/lib/checkout/customer-auth";
import { getUserPrograms } from "@/lib/checkout/db";
import { nav } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Meus programas - RumoAoPro",
  description: "Biblioteca dos programas comprados na RumoAoPro."
};

export default async function MyProgramsPage() {
  const user = await requireCustomer();
  const programs = await getUserPrograms(user.id);

  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader navItems={nav.pt} ctaHref="/programas" ctaLabel="Programas" />
      <section className="bg-ink py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase text-gold">Conta</p>
              <h1 className="mt-3 font-display text-4xl uppercase leading-tight sm:text-5xl">
                Meus programas
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
                Acesso liberado para {user.email}. Cada programa aparece aqui
                somente quando existe um acesso ativo vinculado ao seu e-mail.
              </p>
            </div>
            <form action="/api/auth/logout" method="post">
              <button className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/15 px-4 text-sm font-bold text-white" type="submit">
                <LogOut aria-hidden="true" className="h-4 w-4" />
                Sair
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {programs.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {programs.map(({ entitlement, product }) => (
                <Link
                  className="focus-ring group block overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-card"
                  href={`/my-programs/${product.slug}`}
                  key={entitlement.id}
                >
                  <Image
                    alt={product.name}
                    className="aspect-[16/11] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    height={520}
                    src={product.cover_image}
                    width={760}
                  />
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase text-signal">
                      {product.language}
                    </p>
                    <h2 className="mt-3 text-xl font-bold text-ink">
                      {product.name}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-graphite/70">
                      Acesso ativo desde{" "}
                      {new Date(entitlement.granted_at).toLocaleDateString("pt-BR")}.
                    </p>
                    <p className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-ink">
                      Acessar programa
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-ink/10 bg-white p-6 text-center shadow-sm">
              <h2 className="font-display text-3xl uppercase text-ink">
                Nenhum programa liberado ainda
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-graphite/70">
                Se você acabou de comprar, aguarde a confirmação do pagamento.
                Se usou outro e-mail, saia e entre com o e-mail correto.
              </p>
              <Link
                className="focus-ring mt-6 inline-flex min-h-12 items-center justify-center rounded-md bg-signal px-5 text-sm font-bold uppercase text-white"
                href="/programas"
              >
                Ver programas
              </Link>
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
