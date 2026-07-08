import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import { CheckoutForm } from "@/components/checkout-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { assets, nav } from "@/lib/content";
import { getProductBySlug } from "@/lib/checkout/products";

export const dynamic = "force-dynamic";

type CheckoutPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params
}: CheckoutPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  return {
    title: product ? `Checkout - ${product.name}` : "Checkout",
    description: product?.description || "Checkout seguro RumoAoPro."
  };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader navItems={nav.pt} ctaHref="/programas" ctaLabel="Programas" />

      <section className="relative isolate overflow-hidden bg-ink py-12 text-white">
        <Image
          alt="Lukaz de Paula treinando velocidade no campo"
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-45"
          fill
          priority
          sizes="100vw"
          src={assets.sprintFront}
        />
        <div className="absolute inset-0 -z-10 bg-ink/80" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            className="focus-ring inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold text-white"
            href="/programas"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Voltar aos programas
          </Link>
          <div className="mt-8 max-w-3xl">
            <p className="text-sm font-bold uppercase text-gold">
              Pagamento seguro
            </p>
            <h1 className="mt-3 font-display text-4xl uppercase leading-tight sm:text-5xl">
              Checkout RumoAoPro
            </h1>
            <p className="mt-4 text-base leading-8 text-white/72">
              O pedido é criado como pending e a liberação acontece somente
              depois da confirmação do pagamento. Nesta etapa, o gateway está em
              modo mock para testar o fluxo inteiro com segurança.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_0.55fr] lg:px-8">
          <CheckoutForm product={product} />
          <aside className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-ink text-white">
              <LockKeyhole aria-hidden="true" className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-ink">
              Liberação protegida por status
            </h2>
            <p className="mt-3 text-sm leading-6 text-graphite/72">
              O pedido nasce como pending. O acesso ao PDF ou onboarding só é
              liberado quando o pedido muda para paid pela função central de
              pagamento, pronta para receber webhooks oficiais depois.
            </p>
            <div className="mt-6 grid gap-3">
              {[
                "CPF/CNPJ exigido apenas para Brasil",
                "Gateway mock para validar aprovado e recusado",
                "Link temporário para download do PDF",
                "Pedido registrado no painel interno"
              ].map((item) => (
                <p className="flex gap-3 text-sm text-graphite/75" key={item}>
                  <ShieldCheck
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-turf"
                  />
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
