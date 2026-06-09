import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { CtaButton } from "@/components/cta-button";
import { ProgramsSection } from "@/components/programs-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { assets, nav } from "@/lib/content";

export const metadata: Metadata = {
  title: "Treinamento de futebol e assessoria online",
  description:
    "Nova casa da RumoAoPro: assessoria online, programas de treinamento e links principais."
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader navItems={nav.pt} />
      <section className="hero-image min-h-[calc(86vh-var(--header-height))] text-white">
        <div className="mx-auto flex min-h-[calc(86vh-var(--header-height))] max-w-7xl items-center px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-bold text-white/80">
              RumoAoPro Performance
            </p>
            <h1 className="font-display text-4xl uppercase leading-[1.02] sm:text-5xl lg:text-6xl">
              Treine com estrutura de atleta, não com treino aleatório.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
              Assessoria individual, programas de treinamento e uma nova
              experiência digital para atletas que querem evoluir no futebol.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaButton href="/assessoria" icon={ArrowRight}>
                Ver assessoria
              </CtaButton>
              <CtaButton href="/en/coaching" variant="secondary">
                English coaching
              </CtaButton>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[0.82fr_1.18fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-signal">
              Produto principal
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase text-ink sm:text-4xl">
              Assessoria Online RumoAoPro
            </h2>
            <p className="mt-5 text-base leading-7 text-graphite/75">
              A primeira fase do novo site prioriza a assessoria: aplicação,
              triagem manual e atendimento em português ou inglês.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <CtaButton href="/assessoria" variant="dark">
                Português
              </CtaButton>
              <CtaButton href="/en/coaching" variant="dark">
                English
              </CtaButton>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-ink/10">
            <Image
              alt="Lukaz de Paula em sessões de treino com atletas"
              className="h-full max-h-[520px] w-full object-cover"
              height={1536}
              src={assets.coachCollage}
              width={864}
            />
          </div>
        </div>
      </section>

      <ProgramsSection compact />
      <SiteFooter />
    </main>
  );
}
