import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarRange,
  CheckCircle2,
  Gauge,
  GraduationCap,
  ShieldCheck,
  Users,
  Zap
} from "lucide-react";
import { ReviewBadge, ReviewsSection } from "@/components/reviews";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { assets, nav } from "@/lib/content";

type PreparadorProPageProps = {
  locale: "pt" | "en";
};

const checkoutUrl = "https://pay.kiwify.com.br/ANEoMiE";

const copy = {
  pt: {
    cta: "Comprar na Kiwify",
    eyebrow: "Curso online para treinadores",
    heroTitle: "Preparador PRO",
    heroBody:
      "Aprenda a planejar e aplicar a preparação física para jogadores de futebol com uma metodologia prática, organizada e direta ao ponto.",
    reviewLabel: "4,5 / 5 em avaliações verificadas",
    explore: "Ver o que você vai aprender",
    productEyebrow: "Plataforma Preparador PRO",
    productTitle: "Treine jogadores com mais método e menos improviso.",
    productBody:
      "O Preparador PRO reúne fundamentos que ajudam treinadores e estudantes de Educação Física a tomar decisões melhores na rotina do futebol: como organizar cargas, avaliar atletas e desenvolver as capacidades físicas que aparecem no jogo.",
    priceLabel: "Acesso ao curso",
    price: "R$ 349,90",
    installments: "ou em até 3x de R$ 116,63",
    externalNote:
      "Pagamento, acesso e suporte da compra são processados com segurança pela Kiwify.",
    learnEyebrow: "Conteúdo da plataforma",
    learnTitle: "Conhecimento para aplicar no campo e na academia.",
    learnBody:
      "Uma base prática para entender o que treinar, por que treinar e como organizar cada capacidade dentro da rotina do atleta.",
    topics: [
      ["Potência", "Estruture estímulos para desenvolver ações explosivas."],
      ["Periodização", "Organize os treinos ao longo da semana e da temporada."],
      ["Avaliações", "Use avaliações para orientar decisões de treinamento."],
      ["Velocidade", "Entenda como desenvolver aceleração e corrida em alta intensidade."],
      ["Resistência", "Planeje o condicionamento de acordo com a demanda do futebol."],
      ["Jovens atletas", "Adapte princípios de treinamento para crianças e categorias de base."]
    ],
    audienceEyebrow: "Para quem é",
    audienceTitle: "Uma formação para quem prepara jogadores.",
    audience: [
      "Preparadores físicos que querem ampliar seu repertório",
      "Treinadores que precisam organizar melhor a preparação física",
      "Estudantes de Educação Física que querem entrar no futebol",
      "Profissionais de categorias de base e projetos de formação"
    ],
    languageTitle: "Conteúdo em português",
    languageBody:
      "O Preparador PRO está disponível em português e a compra acontece fora do checkout RumoAoPro, diretamente na Kiwify.",
    reviewsEyebrow: "Avaliações do Preparador PRO",
    reviewsTitle: "Treinadores já estão aplicando o conteúdo na prática.",
    finalEyebrow: "Preparador PRO",
    finalTitle: "Pare de montar treinos no improviso.",
    finalBody:
      "Construa uma base mais sólida para avaliar, planejar e treinar jogadores de futebol.",
    back: "Voltar para a Home"
  },
  en: {
    cta: "Buy on Kiwify",
    eyebrow: "Online course for coaches",
    heroTitle: "Preparador PRO",
    heroBody:
      "Learn how to plan and apply physical preparation for football players through a practical, organized and direct methodology.",
    reviewLabel: "4.5 / 5 from verified reviews",
    explore: "See what you will learn",
    productEyebrow: "Preparador PRO platform",
    productTitle: "Coach players with more method and less guesswork.",
    productBody:
      "Preparador PRO brings together key principles that help coaches and Physical Education students make better decisions in football: organizing training loads, assessing players and developing the physical qualities that appear in the game.",
    priceLabel: "Course access",
    price: "R$ 349.90",
    installments: "or up to 3 installments of R$ 116.63",
    externalNote:
      "Payment, access and purchase support are securely processed by Kiwify.",
    learnEyebrow: "Platform content",
    learnTitle: "Knowledge you can apply on the field and in the gym.",
    learnBody:
      "A practical foundation to understand what to train, why to train it and how to organize each quality around the player's schedule.",
    topics: [
      ["Power", "Structure stimuli to develop explosive football actions."],
      ["Periodization", "Organize sessions across the week and the season."],
      ["Assessments", "Use player assessments to guide training decisions."],
      ["Speed", "Understand how to develop acceleration and high-speed running."],
      ["Endurance", "Plan conditioning around the demands of football."],
      ["Youth players", "Adapt training principles for children and academy players."]
    ],
    audienceEyebrow: "Who it is for",
    audienceTitle: "Education for people who prepare football players.",
    audience: [
      "Physical coaches who want to expand their training toolkit",
      "Football coaches who need to organize physical preparation",
      "Physical Education students who want to work in football",
      "Academy and youth development professionals"
    ],
    languageTitle: "Course taught in Portuguese",
    languageBody:
      "Preparador PRO is currently available in Portuguese. The purchase is completed outside the RumoAoPro checkout, directly through Kiwify.",
    reviewsEyebrow: "Preparador PRO reviews",
    reviewsTitle: "Coaches are already applying the content in practice.",
    finalEyebrow: "Preparador PRO",
    finalTitle: "Stop building sessions through guesswork.",
    finalBody:
      "Build a stronger foundation to assess, plan and train football players.",
    back: "Back to Home"
  }
} as const;

const topicIcons = [Zap, CalendarRange, BarChart3, Gauge, ShieldCheck, Users];

export function PreparadorProPage({ locale }: PreparadorProPageProps) {
  const page = copy[locale];
  const isEnglish = locale === "en";

  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader
        ctaHref="#comprar"
        ctaLabel={page.cta}
        languageHref={isEnglish ? "/cursos" : "/en/courses"}
        navItems={nav[locale]}
      />

      <section className="relative isolate overflow-hidden bg-ink text-white">
        <Image
          alt=""
          className="-z-20 object-cover object-[56%_28%] opacity-55"
          fill
          priority
          sizes="100vw"
          src={assets.programsGymBriefing}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,9,11,0.98)_0%,rgba(8,9,11,0.85)_52%,rgba(8,9,11,0.35)_100%)]" />
        <div className="mx-auto flex min-h-[min(720px,calc(100vh-var(--header-height)))] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-gold">{page.eyebrow}</p>
            <h1 className="mt-4 font-display text-4xl uppercase leading-none sm:text-6xl lg:text-7xl">
              {page.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
              {page.heroBody}
            </p>
            <div className="mt-7">
              <ReviewBadge groupKey="preparadorPro" locale={locale} tone="dark" />
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-signal px-5 py-3 text-sm font-bold uppercase text-white transition hover:bg-[#b90f20]"
                href={checkoutUrl}
                rel="noreferrer"
                target="_blank"
              >
                {page.cta}
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </a>
              <a
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-ink"
                href="#conteudo"
              >
                {page.explore}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16" id="comprar">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
          <div className="overflow-hidden rounded-lg border border-ink/10 bg-ink shadow-card">
            <Image
              alt="Capa da Plataforma Preparador PRO"
              className="aspect-square h-auto w-full object-cover"
              height={960}
              sizes="(max-width: 1024px) 100vw, 46vw"
              src={assets.preparadorProCover}
              width={960}
            />
          </div>

          <div>
            <p className="text-sm font-bold uppercase text-signal">
              {page.productEyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-5xl">
              {page.productTitle}
            </h2>
            <p className="mt-5 text-base leading-8 text-graphite/72">
              {page.productBody}
            </p>

            <div className="mt-7 border-y border-ink/10 py-6">
              <p className="text-xs font-bold uppercase text-graphite/55">
                {page.priceLabel}
              </p>
              <p className="mt-2 font-display text-4xl uppercase text-ink">
                {page.price}
              </p>
              <p className="mt-1 text-sm font-semibold text-graphite/65">
                {page.installments}
              </p>
            </div>

            <a
              className="focus-ring mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-signal px-5 py-3 text-sm font-bold uppercase text-white transition hover:bg-[#b90f20] sm:w-auto"
              href={checkoutUrl}
              rel="noreferrer"
              target="_blank"
            >
              {page.cta}
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </a>
            <p className="mt-4 max-w-xl text-xs leading-5 text-graphite/55">
              {page.externalNote}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-smoke py-16" id="conteudo">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-signal">
              {page.learnEyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-5xl">
              {page.learnTitle}
            </h2>
            <p className="mt-4 text-base leading-8 text-graphite/70">
              {page.learnBody}
            </p>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {page.topics.map(([title, body], index) => {
              const Icon = topicIcons[index];

              return (
                <article
                  className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm"
                  key={title}
                >
                  <Icon aria-hidden="true" className="h-7 w-7 text-signal" />
                  <h3 className="mt-5 text-xl font-bold text-ink">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-graphite/70">{body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-gold">
              {page.audienceEyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-5xl">
              {page.audienceTitle}
            </h2>
            <div className="mt-7 grid gap-4">
              {page.audience.map((item) => (
                <p
                  className="flex items-start gap-3 text-sm font-semibold leading-6 text-white/75"
                  key={item}
                >
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0 text-turf"
                  />
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-lg border border-white/12 bg-white/[0.06] p-7">
            <GraduationCap aria-hidden="true" className="h-9 w-9 text-gold" />
            <h3 className="mt-6 text-2xl font-bold">{page.languageTitle}</h3>
            <p className="mt-3 text-sm leading-7 text-white/65">
              {page.languageBody}
            </p>
            <a
              className="focus-ring mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold uppercase text-ink transition hover:bg-steel"
              href={checkoutUrl}
              rel="noreferrer"
              target="_blank"
            >
              {page.cta}
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <ReviewsSection
        eyebrow={page.reviewsEyebrow}
        groupKey="preparadorPro"
        locale={locale}
        title={page.reviewsTitle}
      />

      <section className="bg-signal py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase text-white/70">
              {page.finalEyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-5xl">
              {page.finalTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-white/75">
              {page.finalBody}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold uppercase text-ink transition hover:bg-steel"
              href={checkoutUrl}
              rel="noreferrer"
              target="_blank"
            >
              {page.cta}
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </a>
            <Link
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
              href={isEnglish ? "/en" : "/"}
            >
              {page.back}
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
