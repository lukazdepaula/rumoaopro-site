import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Dumbbell,
  GraduationCap,
  MessageCircle,
  ShieldCheck,
  Trophy,
  Users,
  Zap
} from "lucide-react";
import { CtaButton } from "@/components/cta-button";
import { ProgramsSection } from "@/components/programs-section";
import { ReviewsSection } from "@/components/reviews";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  assets,
  nav,
  performanceEnvironments,
  playerPathLogos,
  successCases
} from "@/lib/content";

export const metadata: Metadata = {
  title: "RumoAoPro | Treinamento, programas e assessoria para futebol",
  description:
    "Escolha entre assessoria online, programas individuais e conteúdos educacionais para evoluir no futebol com metodologia profissional."
};

const productPaths = [
  {
    title: "Assessoria Online",
    href: "/assessoria",
    badge: "Mais completo",
    icon: MessageCircle,
    body:
      "Para atletas que precisam de acompanhamento individual, ajustes semanais e um plano feito em cima da rotina real.",
    detail: "Aplicação + triagem"
  },
  {
    title: "Programas individuais",
    href: "/programas",
    badge: "Compra direta",
    icon: Dumbbell,
    body:
      "Para quem quer seguir uma estrutura pronta em uma fase específica: offseason, pré-temporada, temporada ou retorno.",
    detail: "A partir de $40"
  },
  {
    title: "Cursos",
    href: "#cursos",
    badge: "Em breve",
    icon: GraduationCap,
    body:
      "Para atletas e treinadores que querem entender melhor performance, preparação física, recuperação e rotina profissional.",
    detail: "Conteúdo educacional"
  }
];

const productExplainers = [
  {
    title: "Assessoria Online",
    eyebrow: "Quando escolher",
    icon: Users,
    body:
      "Escolha a assessoria quando sua semana muda, você tem treinos do time, jogos, viagem, histórico de lesão ou precisa de um plano realmente ajustado para você.",
    points: [
      "Planejamento individual",
      "Suporte e ajustes semanais",
      "Melhor opção para performance completa"
    ],
    href: "/assessoria",
    cta: "Ver assessoria"
  },
  {
    title: "Programas individuais",
    eyebrow: "Quando escolher",
    icon: Zap,
    body:
      "Escolha um programa quando você já sabe a fase do ano em que está e quer uma direção clara para treinar força, velocidade, potência ou condicionamento.",
    points: [
      "Compra e acesso imediato",
      "Programas por fase da temporada",
      "Área do cliente com materiais"
    ],
    href: "/programas",
    cta: "Ver programas"
  },
  {
    title: "Cursos",
    eyebrow: "Próxima etapa",
    icon: BookOpen,
    body:
      "Os cursos entram como uma camada de educação: para aprender os princípios por trás do treinamento e tomar melhores decisões na sua rotina.",
    points: [
      "Conteúdo direto ao ponto",
      "Performance e rotina do atleta",
      "Planejado para a próxima fase do site"
    ],
    href: "#cursos",
    cta: "Ver previsão"
  }
];

const stats = [
  { value: "CBF A", label: "licença em preparação física no futebol" },
  { value: "4", label: "países entre carreira e trabalho de performance" },
  { value: "1:1", label: "metodologia aplicada em atletas reais" }
];

export default function HomePage() {
  const featuredCases = successCases.pt.slice(0, 3);

  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader navItems={nav.pt} ctaLabel="Começar" ctaHref="#caminhos" />

      <section className="hero-image min-h-[calc(92vh-var(--header-height))] text-white">
        <div className="mx-auto flex min-h-[calc(92vh-var(--header-height))] max-w-7xl items-center px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-bold uppercase text-white/80">
              RumoAoPro Performance
            </p>
            <h1 className="font-display text-4xl uppercase leading-[1.02] sm:text-5xl lg:text-7xl">
              Escolha o caminho certo para evoluir no futebol.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
              Assessoria individual, programas prontos e conteúdos de
              performance para atletas que querem treinar com método
              profissional durante o ano inteiro.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaButton href="/assessoria" icon={ArrowRight}>
                Assessoria Online
              </CtaButton>
              <CtaButton href="/programas" variant="secondary">
                Ver programas
              </CtaButton>
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-16 pb-14" id="caminhos">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {productPaths.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  className="group flex min-h-[260px] flex-col justify-between rounded-lg border border-ink/10 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:border-signal/35"
                  href={item.href}
                  key={item.title}
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-ink text-white">
                        <Icon aria-hidden="true" className="h-5 w-5" />
                      </span>
                      <span className="rounded-md bg-smoke px-3 py-2 text-xs font-bold uppercase text-graphite/60">
                        {item.badge}
                      </span>
                    </div>
                    <h2 className="mt-6 text-2xl font-bold text-ink">
                      {item.title}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-graphite/68">
                      {item.body}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-5">
                    <span className="text-xs font-bold uppercase text-signal">
                      {item.detail}
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="h-5 w-5 text-ink transition group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-signal">
              O que vendemos
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-4xl">
              Uma solução para cada momento da sua evolução.
            </h2>
            <p className="mt-4 text-base leading-7 text-graphite/72">
              A RumoAoPro não é apenas uma loja de PDF. A ideia é ajudar o
              atleta a entender qual formato faz sentido agora: acompanhamento,
              programa pronto ou educação para treinar melhor.
            </p>
          </div>

          <div className="mt-9 grid gap-5 lg:grid-cols-3">
            {productExplainers.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  className="rounded-lg border border-ink/10 bg-smoke p-6"
                  id={item.href === "#cursos" ? "cursos" : undefined}
                  key={item.title}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white text-signal shadow-sm">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <p className="text-xs font-bold uppercase text-graphite/50">
                      {item.eyebrow}
                    </p>
                  </div>
                  <h3 className="mt-5 text-2xl font-bold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-graphite/72">
                    {item.body}
                  </p>
                  <div className="mt-5 grid gap-3">
                    {item.points.map((point) => (
                      <p
                        className="flex gap-2 text-sm font-semibold text-graphite/76"
                        key={point}
                      >
                        <CheckCircle2
                          aria-hidden="true"
                          className="mt-0.5 h-4 w-4 shrink-0 text-turf"
                        />
                        <span>{point}</span>
                      </p>
                    ))}
                  </div>
                  <Link
                    className="mt-6 inline-flex items-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-bold text-white transition hover:bg-graphite"
                    href={item.href}
                  >
                    {item.cta}
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <ProgramsSection compact />

      <section className="bg-ink py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8">
          <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
            <Image
              alt="Lukaz de Paula orientando atletas no treino"
              className="aspect-[4/5] h-full w-full object-cover object-[center_18%]"
              height={1536}
              src={assets.coachGymInstruction}
              width={1152}
            />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold uppercase text-gold">
              Quem está por trás
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">
              Treine com a metodologia de um atleta profissional.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/72">
              Lukaz de Paula é preparador físico com licença CBF A, atua em
              ambientes de performance na Espanha e já trabalhou com atletas em
              diferentes contextos no Brasil, Estados Unidos, Arábia Saudita e
              Europa. A RumoAoPro une experiência prática de campo, carreira
              como atleta e programação física aplicada ao futebol real.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  className="rounded-lg border border-white/10 bg-white/[0.06] p-4"
                  key={stat.label}
                >
                  <p className="font-display text-3xl uppercase text-white">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-xs font-bold uppercase leading-5 text-white/55">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-bold uppercase text-white/50">
                Experiência em ambientes de performance
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {performanceEnvironments.map((environment) => (
                  <div
                    className="flex min-h-[116px] flex-col justify-between rounded-md bg-white p-3 text-ink"
                    key={environment.name}
                  >
                    <Image
                      alt={environment.name}
                      className="h-10 w-full object-contain object-left"
                      height={60}
                      src={environment.image}
                      width={140}
                    />
                    <div>
                      <p className="mt-3 text-sm font-bold">
                        {environment.name}
                      </p>
                      <p className="mt-1 text-[11px] font-bold uppercase text-graphite/45">
                        {environment.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase text-signal">
                Atletas treinados
              </p>
              <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-4xl">
                A metodologia já apareceu em diferentes níveis do futebol.
              </h2>
              <p className="mt-4 text-base leading-7 text-graphite/70">
                Do atleta em formação ao profissional, o objetivo é sempre
                organizar força, velocidade, potência, recuperação e rotina com
                mais clareza.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-ink/10 bg-smoke px-4 py-3 text-sm font-bold text-graphite/70">
              <Trophy aria-hidden="true" className="h-5 w-5 text-gold" />
              Casos reais da RumoAoPro
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {featuredCases.map((item) => (
              <article
                className="overflow-hidden rounded-lg border border-ink/10 bg-smoke"
                key={item.name}
              >
                <Image
                  alt={item.name}
                  className="aspect-[16/12] w-full object-cover object-top"
                  height={520}
                  src={item.image}
                  width={720}
                />
                <div className="p-5">
                  <h3 className="text-xl font-bold text-ink">{item.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-graphite/70">
                    {item.quote}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-ink/10 bg-ink p-5 text-white">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-gold">
                  Clubes e caminhos de atletas
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/62">
                  A RumoAoPro conversa com atletas que buscam estrutura para
                  competir melhor em base, universidade, semiprofissional e
                  profissional.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {playerPathLogos.map((logo) => (
                  <div
                    className="flex h-16 items-center justify-center rounded-md bg-white p-3"
                    key={logo.name}
                  >
                    <Image
                      alt={logo.name}
                      className="max-h-10 w-full object-contain"
                      height={60}
                      src={logo.image}
                      width={120}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <ReviewsSection
        eyebrow="Avaliações"
        groupKey="coaching"
        locale="pt"
        title="O que atletas dizem sobre treinar com a RumoAoPro"
      />

      <section className="bg-signal py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-bold uppercase text-white/75">
              <ShieldCheck aria-hidden="true" className="h-5 w-5" />
              Decida pelo momento da sua temporada
            </div>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">
              Quer acompanhamento total ou um programa para executar agora?
            </h2>
            <p className="mt-4 text-base leading-7 text-white/75">
              Se a rotina é complexa, comece pela assessoria. Se você já sabe a
              fase do ano, escolha um programa e acesse o material direto pela
              área do cliente.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-steel"
              href="/assessoria"
            >
              Ver assessoria
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
              href="/programas"
            >
              Ver programas
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
