import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleX,
  Dumbbell,
  Gauge,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Zap
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ReviewsSection } from "@/components/reviews";
import { nav, shopifyProducts } from "@/lib/content";

const stats = [
  ["12", "semanas organizadas"],
  ["3", "fases progressivas"],
  ["36", "sessões principais"],
  ["12", "sessões opcionais"],
  ["100%", "academia"]
];

const qualities = [
  {
    icon: Dumbbell,
    title: "Força fundamental",
    body:
      "Agachamentos, levantamentos, presses, remadas, Chin-Ups e Dips organizados com progressão de carga e RPE."
  },
  {
    icon: Zap,
    title: "Potência",
    body:
      "Saltos, Push Press, Hang Clean ou Hang Clean Pull e blocos de contraste para produzir força rapidamente."
  },
  {
    icon: Target,
    title: "Força unilateral",
    body:
      "Bulgarian Split Squat, avanços e outros movimentos para desenvolver cada perna com maior controle."
  },
  {
    icon: Gauge,
    title: "Cadeia posterior",
    body:
      "Glúteos e posteriores trabalhados com RDL, Trap Bar Deadlift, Hip Thrust e Leg Curl ao longo das fases."
  },
  {
    icon: ShieldCheck,
    title: "Estrutura atlética",
    body:
      "Adutores, panturrilhas e core inseridos com volume controlado para complementar os exercícios principais."
  },
  {
    icon: Sparkles,
    title: "Hipertrofia funcional",
    body:
      "Volume planejado para peito, costas, ombros, braços e pernas, construindo massa muscular útil para um físico mais forte e atlético."
  }
];

const goodFit = [
  "Você é jogador de futebol e possui acesso a uma academia.",
  "Você não possui campo disponível para treinar.",
  "Você está em offseason ou em um período sem calendário competitivo intenso.",
  "Você consegue treinar três vezes por semana.",
  "Você deseja uma quarta sessão opcional para superiores.",
  "Você quer aumentar força, potência e desenvolver um físico mais atlético.",
  "Você já possui experiência básica com exercícios de academia.",
  "Você quer treinos organizados no celular, com vídeos e progressão."
];

const otherPath = [
  "Você está lesionado ou retornando de lesão sem liberação profissional.",
  "Você joga e treina com o time várias vezes por semana e precisa de baixa carga.",
  "Sua prioridade principal é sprint, aceleração e velocidade máxima no campo.",
  "Você precisa de uma preparação completa com campo, academia e condicionamento.",
  "Você precisa que a programação seja ajustada semanalmente à sua rotina."
];

const phases = [
  {
    number: "01",
    weeks: "Semanas 1 a 4",
    title: "Fase 1 — Base Atlética",
    subtitle: "Técnica, estrutura e força fundamental.",
    body:
      "A primeira fase constrói a base do programa por meio de exercícios tradicionais, maior volume, controle de movimento e cargas progressivas.",
    points: [
      "Back Squat",
      "Bench Press",
      "Romanian Deadlift",
      "Chin-Up e Dips",
      "Força unilateral",
      "Saltos simples e aterrissagens controladas"
    ]
  },
  {
    number: "02",
    weeks: "Semanas 5 a 8",
    title: "Fase 2 — Força Máxima",
    subtitle: "Eleve seu teto de força.",
    body:
      "As repetições diminuem, as cargas aumentam e os descansos ficam maiores. O objetivo é produzir mais força sem buscar falha muscular.",
    points: [
      "Front Squat",
      "Paused Bench Press",
      "Trap Bar Deadlift",
      "Weighted Chin-Up",
      "Weighted Dips",
      "Top sets e séries de back-off"
    ]
  },
  {
    number: "03",
    weeks: "Semanas 9 a 12",
    title: "Fase 3 — Potência Aplicada",
    subtitle: "Transforme força em movimentos mais rápidos.",
    body:
      "A última fase utiliza Hang Clean ou Hang Clean Pull, Push Press, saltos e treinamento de contraste para trabalhar produção rápida de força.",
    points: [
      "Hang Clean ou Hang Clean Pull",
      "Back Squat + salto",
      "Bench Press + Plyometric Push-Up",
      "Trap Bar Deadlift + salto",
      "Push Press",
      "Registros de salto vertical e horizontal"
    ]
  }
];

const raptorSteps = [
  {
    number: "01",
    title: "Abra sua semana",
    body: "Veja treinos, sessões opcionais e dias de descanso na ordem correta."
  },
  {
    number: "02",
    title: "Siga cada sessão",
    body:
      "Acesse blocos, exercícios, séries, repetições, RPE, descansos, notas e vídeos. RPE é a percepção de esforço de cada série."
  },
  {
    number: "03",
    title: "Registre sua evolução",
    body:
      "Salve cargas, duração, RPE e comentários para acompanhar o que foi realizado."
  }
];

const included = [
  "Calendário completo de 12 semanas",
  "Três fases progressivas",
  "Três sessões obrigatórias por semana",
  "Uma sessão opcional de superiores",
  "Dias de descanso organizados",
  "Aquecimentos dentro das sessões",
  "Séries, repetições, RPE e descansos",
  "Vídeos demonstrativos nos exercícios disponíveis",
  "Alternativas para equipamentos",
  "Orientações de progressão de carga",
  "Registro de treino no RaptorPro",
  "Hang Clean Pull como alternativa ao Hang Clean",
  "Testes ou registros de salto vertical e horizontal",
  "Programa em português"
];

const comparisons = [
  {
    name: "Power Pro",
    priority: "Força, potência e hipertrofia funcional",
    environment: "100% academia",
    duration: "12 semanas",
    choice:
      "Você só possui academia ou quer priorizar desenvolvimento físico.",
    href: "/programas/power-pro",
    featured: true
  },
  {
    name: "Speed Pro",
    priority: "Aceleração, velocidade máxima e mecânica de sprint",
    environment: "Campo + academia",
    duration: "12 semanas",
    choice: "Sua prioridade é correr mais rápido e você possui espaço para sprintar.",
    href: "/programas/projeto-36kmh"
  },
  {
    name: "Offseason 30 Days",
    priority: "Preparação completa antes da pré-temporada",
    environment: "Campo + academia + condicionamento",
    duration: "30 dias",
    choice: "Faltam aproximadamente quatro semanas para voltar ao time.",
    href: "/programas/offseason-30-days"
  },
  {
    name: "In-Season Pro",
    priority: "Manutenção entre jogos",
    environment: "Academia + velocidade de baixo volume",
    duration: "28 semanas",
    choice: "Você está competindo e precisa treinar sem lutar contra jogos e sessões do clube.",
    href: "/programas/elanga-in-season"
  }
];

const faqs = [
  [
    "Preciso de campo?",
    "Não. O Power Pro foi criado para ser realizado na academia. Não existem sessões obrigatórias de sprint, corrida, bola ou campo."
  ],
  [
    "O programa é de três ou quatro dias?",
    "Três sessões formam o programa completo. A quarta sessão é opcional e acrescenta volume para membros superiores."
  ],
  [
    "Posso fazer durante a temporada?",
    "O Power Pro funciona melhor na offseason ou em períodos sem calendário competitivo intenso. Para quem possui jogos e vários treinos com o time, o In-Season Pro é a escolha mais adequada."
  ],
  [
    "O Power Pro vai me deixar mais rápido?",
    "O programa desenvolve força e potência que podem sustentar ações mais explosivas. Porém, velocidade também precisa ser treinada por meio de sprints e mecânica. Para priorizar velocidade, escolha o Speed Pro."
  ],
  [
    "O Hang Clean é obrigatório?",
    "Não. O Hang Clean Pull é a alternativa oficial para quem ainda não domina a recepção da barra."
  ],
  [
    "Preciso de Trap Bar?",
    "Não. O Conventional Deadlift é a alternativa oficial quando a academia não possui Trap Bar."
  ],
  [
    "Preciso ter experiência em academia?",
    "O programa funciona melhor para quem já possui experiência básica. Atletas iniciantes devem utilizar cargas conservadoras, priorizar técnica e buscar orientação quando necessário."
  ],
  [
    "Posso pular a Fase 1?",
    "Não é recomendado. Cada fase prepara o atleta para os exercícios, cargas e métodos da fase seguinte."
  ],
  [
    "Posso acrescentar outros treinos?",
    "Evite adicionar outro treinamento pesado de pernas, saltos ou condicionamento intenso. Trabalho técnico com bola pode ser realizado, desde que não prejudique a recuperação."
  ],
  [
    "O Power Pro serve para recuperação de lesão?",
    "Não. O programa não é uma reabilitação. Atletas com dor, lesão ou restrição médica devem buscar avaliação e liberação profissional antes de iniciar."
  ],
  [
    "Como recebo o acesso?",
    "Após a confirmação do pagamento, sua conta é criada ou localizada e o Power Pro é liberado no RaptorPro pelo mesmo fluxo dos programas atuais da RumoAoPro."
  ]
];

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Power Pro — Força, Potência e Hipertrofia",
  description:
    "Programa de 12 semanas, 100% academia, para jogadores desenvolverem força, potência, hipertrofia e um físico atlético com treinos no RaptorPro.",
  image:
    "https://rumoaopro.com/assets/programs/power-pro/power-pro-cover-v2.png",
  brand: {
    "@type": "Brand",
    name: "RumoAoPro"
  },
  offers: {
    "@type": "Offer",
    priceCurrency: "BRL",
    price: "199.00",
    availability: "https://schema.org/InStock",
    url: "https://rumoaopro.com/checkout/power-pro"
  }
};

const sectionLabel = "text-xs font-black uppercase tracking-[0.18em] text-signal";
const sectionTitle = "mt-3 font-display text-3xl uppercase leading-[1.02] text-ink sm:text-5xl";

export function PowerProSalesPage() {
  const checkoutHref = shopifyProducts.powerPro;

  return (
    <main className="min-h-screen bg-smoke">
      <SiteHeader
        ctaHref={checkoutHref}
        ctaLabel="Começar agora"
        navItems={nav.pt}
      />
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        type="application/ld+json"
      />

      <section className="relative isolate overflow-hidden bg-ink text-white">
        <Image
          alt="Lukaz de Paula jogando futebol"
          className="-z-20 object-cover object-[center_42%] opacity-35"
          fill
          priority
          sizes="100vw"
          src="/assets/photos/lukaz-field-playing.jpg"
        />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_35%,rgba(204,20,40,0.25),transparent_31%),linear-gradient(90deg,rgba(8,10,13,0.98)_0%,rgba(8,10,13,0.9)_52%,rgba(8,10,13,0.68)_100%)]" />
        <div className="mx-auto grid min-h-[720px] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.98fr_1.02fr] lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">
              POWER PRO · POTÊNCIA E HIPERTROFIA
            </p>
            <h1 className="mt-5 font-display text-4xl uppercase leading-[0.96] sm:text-5xl lg:text-[3.7rem]">
              Força, potência e hipertrofia para o futebol
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-xl">
              12 semanas, 100% academia, com três treinos completos e uma sessão opcional para construir força, potência e massa muscular com progressão clara.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {["12 semanas", "3 fases progressivas", "3 treinos + 1 opcional", "100% academia", "Força · potência · hipertrofia"].map((item) => (
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-white/85 backdrop-blur" key={item}>
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="focus-ring inline-flex min-h-14 items-center justify-center gap-2 rounded-md bg-signal px-6 py-4 text-sm font-black text-white transition hover:bg-[#b90f20]" href={checkoutHref}>
                Começar o Power Pro
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link className="focus-ring inline-flex min-h-14 items-center justify-center rounded-md border border-white/25 bg-white/10 px-6 py-4 text-sm font-black text-white transition hover:bg-white/20" href="#fases">
                Ver as 3 fases
              </Link>
            </div>
            <p className="mt-4 text-xs leading-5 text-white/55">
              Pagamento único de R$ 199,00. Acesso digital pelo RaptorPro após a confirmação.
            </p>
          </div>
          <div className="relative mx-auto min-h-[550px] w-full max-w-[540px] sm:min-h-[610px]" aria-label="Power Pro no celular">
            <div className="absolute left-[4%] top-3 w-[47%] -rotate-[7deg] sm:left-[7%] sm:w-[45%]">
              <PhoneFrame label="Capa do programa Power Pro">
                <Image
                  alt="Capa Power Pro com Lukaz de Paula realizando levantamento terra"
                  className="object-cover"
                  fill
                  priority
                  sizes="260px"
                  src="/assets/programs/power-pro/power-pro-cover-v2.png"
                />
              </PhoneFrame>
            </div>
            <div className="absolute bottom-[12%] right-0 z-10 w-[70%] rotate-[5deg] sm:bottom-[14%] sm:right-[1%] sm:w-[68%]">
              <PhoneFrame label="Calendário do atleta no RaptorPro" orientation="landscape">
                <Image
                  alt="Calendário de treino do atleta no RaptorPro"
                  className="object-cover"
                  fill
                  sizes="390px"
                  src="/assets/programs/power-pro/power-pro-athlete-calendar-v2.png"
                />
              </PhoneFrame>
            </div>
            <div className="absolute bottom-14 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/15 bg-black/75 px-4 py-2 text-center text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-xl backdrop-blur sm:bottom-20">
              Seu plano, semana por semana
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 px-4 py-7 sm:px-6 md:grid-cols-5 lg:px-8">
          {stats.map(([value, label]) => (
            <div className="border-ink/10 px-3 py-4 text-center md:border-r md:last:border-r-0" key={label}>
              <p className="font-display text-4xl uppercase text-ink">{value}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-graphite/55">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <ReviewsSection
        eyebrow="Resultados da metodologia RumoAoPro"
        groupKey="adama"
        locale="pt"
        title="Atletas que buscaram mais força e massa muscular."
      />

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
          <div className="relative min-h-[430px] overflow-hidden rounded-2xl bg-ink shadow-card">
            <Image alt="Lukaz de Paula preparado para entrar em campo" className="object-cover object-[center_35%]" fill sizes="(max-width: 1023px) 100vw, 45vw" src="/assets/photos/programs/programs-player-ready.jpg" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(0,0,0,0.75))]" />
          </div>
          <div>
            <p className={sectionLabel}>O problema</p>
            <h2 className={sectionTitle}>Você não precisa de mais uma ficha aleatória de academia.</h2>
            <div className="mt-6 space-y-4 text-base leading-8 text-graphite/72">
              <p>Muitos jogadores querem ficar mais fortes e potentes, mas não possuem campo, treinador ou uma estrutura de performance à disposição.</p>
              <p>O resultado costuma ser uma rotina de musculação sem progressão, exercícios trocados toda semana e pouca conexão com as exigências físicas do futebol.</p>
              <p>O Power Pro organiza 12 semanas de treinamento em uma jornada clara: primeiro você constrói a base, depois eleva sua força e, por último, aprende a produzir essa força com mais velocidade.</p>
              <p className="font-bold text-ink">Sem campo obrigatório. Sem corrida obrigatória. Sem trocar exercícios apenas para criar novidade.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-gradient py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className={sectionLabel}>O que o programa desenvolve</p>
          <h2 className={`${sectionTitle} max-w-4xl`}>Potência, força e hipertrofia — tudo dentro da academia.</h2>
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {qualities.map(({ icon: Icon, title, body }) => (
              <article className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm" key={title}>
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-signal text-white"><Icon aria-hidden="true" className="h-5 w-5" /></span>
                <h3 className="mt-5 text-xl font-black text-ink">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-graphite/68">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">Para quem é</p>
          <h2 className="mt-3 max-w-4xl font-display text-3xl uppercase leading-[1.02] sm:text-5xl">Feito para quem quer força, potência e hipertrofia.</h2>
          <div className="mt-9 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-6 sm:p-8">
              <h3 className="text-xl font-black text-emerald-200">Boa escolha</h3>
              <ul className="mt-5 space-y-3">
                {goodFit.map((item) => <li className="flex gap-3 text-sm leading-6 text-white/75" key={item}><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />{item}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 sm:p-8">
              <h3 className="text-xl font-black text-white">Melhor escolher outro caminho</h3>
              <ul className="mt-5 space-y-3">
                {otherPath.map((item) => <li className="flex gap-3 text-sm leading-6 text-white/65" key={item}><CircleX className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24" id="fases">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className={sectionLabel}>As três fases</p>
          <h2 className={sectionTitle}>Cada fase prepara você para a próxima.</h2>
          <div className="mt-9 grid gap-5 lg:grid-cols-3">
            {phases.map((phase) => (
              <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-smoke" key={phase.number}>
                <div className="bg-ink p-6 text-white">
                  <p className="font-display text-5xl text-red-300">{phase.number}</p>
                  <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-white/50">{phase.weeks}</p>
                  <h3 className="mt-2 text-2xl font-black">{phase.title}</h3>
                  <p className="mt-2 text-sm font-bold text-red-200">{phase.subtitle}</p>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-sm leading-6 text-graphite/70">{phase.body}</p>
                  <ul className="mt-5 space-y-2 border-t border-ink/10 pt-5">
                    {phase.points.map((item) => <li className="flex gap-2 text-sm font-semibold text-ink" key={item}><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-signal" />{item}</li>)}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-gradient py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:px-8">
          <div>
            <p className={sectionLabel}>Três ou quatro treinos</p>
            <h2 className={sectionTitle}>Três treinos formam o programa completo.</h2>
            <p className="mt-5 text-base leading-8 text-graphite/72">As Sessões A, B e C entregam toda a progressão principal do Power Pro. A quarta sessão é um complemento opcional para peito, costas, ombros e braços. Ela deve ser realizada somente quando o atleta estiver recuperado.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-signal">Plano de três dias</p>
              <p className="mt-3 text-2xl font-black text-ink">Sessões A, B e C</p>
              <p className="mt-3 text-sm leading-6 text-graphite/65">A estrutura completa e toda a progressão principal.</p>
            </div>
            <div className="rounded-2xl bg-signal p-6 text-white shadow-card">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/70">Plano de quatro dias</p>
              <p className="mt-3 text-2xl font-black">A, B e C + Upper Body Builder</p>
              <p className="mt-3 text-sm leading-6 text-white/75">Complemento opcional quando a recuperação permitir.</p>
            </div>
            <p className="rounded-xl border border-ink/10 bg-ink p-5 text-sm font-bold leading-6 text-white sm:col-span-2">Você não perde parte do programa ao treinar três vezes. A quarta sessão é um bônus, não uma obrigação.</p>
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">Dentro do RaptorPro</p>
              <h2 className="mt-3 font-display text-3xl uppercase leading-[1.02] sm:text-5xl">Abra o app. Veja o treino. Execute.</h2>
              <div className="mt-7 space-y-4">
                {raptorSteps.map((step) => (
                  <div className="grid grid-cols-[44px_1fr] gap-4 rounded-xl border border-white/10 bg-white/[0.045] p-4" key={step.number}>
                    <span className="grid h-11 w-11 place-items-center rounded-lg bg-signal text-sm font-black">{step.number}</span>
                    <div><h3 className="font-black">{step.title}</h3><p className="mt-1 text-sm leading-6 text-white/60">{step.body}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111] p-2 shadow-2xl">
              <Image alt="Tela real do atleta com o calendário do Power Pro organizado por semanas no RaptorPro" className="h-auto w-full rounded-xl" height={710} sizes="(max-width: 1023px) 100vw, 55vw" src="/assets/programs/power-pro/power-pro-athlete-calendar-v2.png" width={1265} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className={sectionLabel}>O que o comprador recebe</p>
          <h2 className={sectionTitle}>Tudo para treinar sem improvisar.</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {included.map((item) => <div className="flex gap-3 rounded-xl border border-ink/10 bg-smoke p-4 text-sm font-semibold leading-6 text-ink" key={item}><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-signal" />{item}</div>)}
          </div>
        </div>
      </section>

      <section className="surface-gradient py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className={sectionLabel}>Comparação entre programas</p>
          <h2 className={sectionTitle}>Escolha o programa certo para o seu momento.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {comparisons.map((program) => (
              <Link className={`focus-ring flex h-full flex-col rounded-2xl border p-6 transition hover:-translate-y-1 hover:shadow-card ${program.featured ? "border-signal bg-ink text-white" : "border-ink/10 bg-white text-ink"}`} href={program.href} key={program.name}>
                <h3 className="text-xl font-black">{program.name}</h3>
                <dl className="mt-5 space-y-4 text-sm">
                  <div><dt className={`text-[10px] font-black uppercase tracking-[0.14em] ${program.featured ? "text-red-300" : "text-signal"}`}>Prioridade</dt><dd className={`mt-1 leading-5 ${program.featured ? "text-white/72" : "text-graphite/70"}`}>{program.priority}</dd></div>
                  <div><dt className={`text-[10px] font-black uppercase tracking-[0.14em] ${program.featured ? "text-red-300" : "text-signal"}`}>Ambiente</dt><dd className="mt-1 font-bold">{program.environment}</dd></div>
                  <div><dt className={`text-[10px] font-black uppercase tracking-[0.14em] ${program.featured ? "text-red-300" : "text-signal"}`}>Duração</dt><dd className="mt-1 font-bold">{program.duration}</dd></div>
                  <div><dt className={`text-[10px] font-black uppercase tracking-[0.14em] ${program.featured ? "text-red-300" : "text-signal"}`}>Escolha quando</dt><dd className={`mt-1 leading-5 ${program.featured ? "text-white/72" : "text-graphite/70"}`}>{program.choice}</dd></div>
                </dl>
                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-black">Ver programa <ArrowRight className="h-4 w-4" /></span>
              </Link>
            ))}
          </div>
          <p className="mt-6 rounded-xl border border-ink/10 bg-white p-5 text-sm leading-6 text-graphite/70">Se sua rotina muda toda semana ou precisa de ajustes individuais, a <Link className="font-black text-signal underline-offset-4 hover:underline" href="/assessoria#aplicacao">Assessoria Online</Link> é a escolha mais completa.</p>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:px-8">
          <div className="grid h-48 place-items-center rounded-2xl bg-signal text-white sm:h-64"><BarChart3 aria-hidden="true" className="h-20 w-20" /></div>
          <div>
            <p className={sectionLabel}>Honestidade sobre velocidade</p>
            <h2 className={sectionTitle}>Força e potência ajudam. Sprint continua sendo uma habilidade.</h2>
            <div className="mt-5 space-y-4 text-base leading-8 text-graphite/72">
              <p>O Power Pro desenvolve qualidades físicas que sustentam ações explosivas: força relativa, potência, cadeia posterior, força unilateral e capacidade de produzir força.</p>
              <p>Mas velocidade também depende de correr rápido, trabalhar mecânica e receber exposição adequada a sprints.</p>
              <p className="font-bold text-ink">Se sua prioridade principal é aceleração e velocidade máxima, escolha o <Link className="text-signal underline-offset-4 hover:underline" href="/programas/projeto-36kmh">Speed Pro</Link>.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-smoke py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className={sectionLabel}>Perguntas frequentes</p>
          <h2 className={sectionTitle}>Antes de começar.</h2>
          <div className="mt-8 space-y-3">
            {faqs.map(([question, answer]) => (
              <details className="group rounded-xl border border-ink/10 bg-white p-5" key={question}>
                <summary className="cursor-pointer list-none pr-8 text-base font-black text-ink">{question}</summary>
                <p className="mt-3 text-sm leading-6 text-graphite/70">{answer}</p>
              </details>
            ))}
          </div>
          <div className="mt-8 flex gap-4 rounded-xl border border-amber-600/20 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
            <ShieldCheck className="h-6 w-6 shrink-0" />
            <p>O Power Pro é um programa educacional de treinamento destinado a atletas saudáveis e aptos à prática de exercícios de força. Ele não substitui avaliação médica, fisioterapêutica ou acompanhamento individual. Interrompa qualquer exercício que provoque dor e procure orientação profissional.</p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-signal py-16 text-white sm:py-24">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/65">Power Pro</p>
          <h2 className="mt-4 font-display text-4xl uppercase leading-[0.98] sm:text-6xl">Construa força. Eleve a potência. Ganhe massa muscular.</h2>
          <div className="mx-auto mt-6 max-w-3xl space-y-3 text-base leading-7 text-white/78">
            <p>Você não precisa de mais exercícios aleatórios.</p>
            <p>Precisa de 12 semanas em que cada treino tenha uma função e cada fase prepare você para a próxima.</p>
            <p>Entre no Power Pro e construa na academia o físico que o futebol exige.</p>
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link className="focus-ring inline-flex min-h-14 items-center justify-center gap-2 rounded-md bg-white px-6 py-4 text-sm font-black text-ink transition hover:bg-smoke" href={checkoutHref}>Começar o Power Pro por R$ 199,00 <ArrowRight className="h-4 w-4" /></Link>
            <Link className="focus-ring inline-flex min-h-14 items-center justify-center rounded-md border border-white/30 bg-white/10 px-6 py-4 text-sm font-black text-white transition hover:bg-white/20" href="/assessoria#aplicacao">Quero algo individual</Link>
          </div>
          <p className="mt-4 text-xs text-white/60">Pagamento único. Acesso digital pelo RaptorPro após a confirmação.</p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function PhoneFrame({
  children,
  label,
  orientation = "portrait"
}: {
  children: ReactNode;
  label: string;
  orientation?: "portrait" | "landscape";
}) {
  const isLandscape = orientation === "landscape";

  return (
    <div
      aria-label={label}
      className={`relative overflow-hidden border-[5px] border-[#282828] bg-black p-[3px] shadow-[0_30px_75px_rgba(0,0,0,0.65)] ring-1 ring-white/20 ${isLandscape ? "aspect-[19.5/9] rounded-[2rem]" : "aspect-[9/19.5] rounded-[2.2rem]"}`}
      role="img"
    >
      <div className={`${isLandscape ? "left-2 top-1/2 h-[42%] w-5 -translate-y-1/2" : "left-1/2 top-2 h-5 w-[42%] -translate-x-1/2"} absolute z-20 rounded-full bg-black`} />
      <div className={`relative h-full w-full overflow-hidden bg-[#111] ${isLandscape ? "rounded-[1.5rem]" : "rounded-[1.72rem]"}`}>
        {children}
      </div>
      <div className={`${isLandscape ? "right-2 top-1/2 h-[32%] w-1 -translate-y-1/2" : "bottom-2 left-1/2 h-1 w-[32%] -translate-x-1/2"} absolute z-20 rounded-full bg-white/80`} />
    </div>
  );
}
