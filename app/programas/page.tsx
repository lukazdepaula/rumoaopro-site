import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { CtaButton } from "@/components/cta-button";
import { ProgramsSection } from "@/components/programs-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { nav } from "@/lib/content";

export const metadata: Metadata = {
  title: "Programas de treinamento",
  description:
    "Programas RumoAoPro para pré-temporada, força, hipertrofia e retorno aos gramados."
};

export default function ProgramasPage() {
  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader navItems={nav.pt} ctaHref="/assessoria#aplicacao" />
      <section className="bg-ink py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[1fr_0.72fr] md:items-end lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-gold">
              Programas RumoAoPro
            </p>
            <h1 className="mt-3 font-display text-4xl uppercase leading-tight sm:text-5xl">
              Estruturas prontas para objetivos específicos no futebol.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/70">
              Os programas seguem ativos na loja atual enquanto a nova
              experiência nasce. Eles funcionam como complemento da assessoria
              ou como porta de entrada para atletas que querem começar com uma
              direção clara.
            </p>
          </div>
          <div className="flex md:justify-end">
            <CtaButton href="/assessoria" icon={ArrowRight}>
              Quero algo personalizado
            </CtaButton>
          </div>
        </div>
      </section>
      <ProgramsSection />
      <SiteFooter />
    </main>
  );
}
