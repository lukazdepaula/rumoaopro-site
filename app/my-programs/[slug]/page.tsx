import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, FileText, LockKeyhole } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { requireCustomer } from "@/lib/checkout/customer-auth";
import { userHasAccessToProduct } from "@/lib/checkout/db";
import {
  generatePrivateMaterialUrl,
  getAccessibleProgramMaterials
} from "@/lib/checkout/materials";
import { getProductBySlug } from "@/lib/checkout/products";
import { nav } from "@/lib/content";

export const dynamic = "force-dynamic";

type ProgramAccessPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params
}: ProgramAccessPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  return {
    title: product ? `${product.name} - RumoAoPro` : "Programa - RumoAoPro"
  };
}

export default async function ProgramAccessPage({ params }: ProgramAccessPageProps) {
  const user = await requireCustomer();
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const hasAccess = await userHasAccessToProduct(user.id, product.id);
  const materials = hasAccess
    ? await getAccessibleProgramMaterials(user.id, product.id)
    : [];

  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader navItems={nav.pt} ctaHref="/my-programs" ctaLabel="Minha conta" />
      <section className="bg-ink py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            className="focus-ring inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold text-white"
            href="/my-programs"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Voltar
          </Link>
          <p className="mt-8 text-sm font-bold uppercase text-gold">
            {product.language}
          </p>
          <h1 className="mt-3 font-display text-4xl uppercase leading-tight sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/70">
            {product.description}
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {!hasAccess ? (
            <div className="rounded-lg border border-ink/10 bg-white p-6 text-center shadow-sm">
              <LockKeyhole aria-hidden="true" className="mx-auto h-10 w-10 text-signal" />
              <h2 className="mt-4 text-2xl font-bold text-ink">
                Acesso não liberado para esta conta
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-graphite/70">
                Entre com o e-mail usado na compra ou compre o programa para
                liberar os materiais.
              </p>
              <Link
                className="focus-ring mt-6 inline-flex min-h-12 items-center justify-center rounded-md bg-signal px-5 text-sm font-bold uppercase text-white"
                href={product.sales_page_path}
              >
                Ver página do programa
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {materials.map((material) => {
                const url = generatePrivateMaterialUrl(material);

                return (
                  <article
                    className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm"
                    key={material.id}
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-xs font-bold uppercase text-signal">
                          {material.type}
                        </p>
                        <h2 className="mt-2 text-xl font-bold text-ink">
                          {material.title}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-graphite/70">
                          {material.description}
                        </p>
                      </div>
                      {url ? (
                        <Link
                          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-white"
                          href={url}
                        >
                          <FileText aria-hidden="true" className="h-4 w-4" />
                          Abrir
                        </Link>
                      ) : (
                        <span className="inline-flex min-h-11 items-center justify-center rounded-md border border-ink/10 px-4 text-sm font-bold text-graphite/60">
                          Conteúdo
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
