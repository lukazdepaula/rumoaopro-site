import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  GraduationCap,
  HeartPulse,
  PlayCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  Zap
} from "lucide-react";
import { ReviewBadge, ReviewsSection } from "@/components/reviews";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { assets, nav } from "@/lib/content";

type PreparadorProPageProps = {
  locale: "pt" | "en";
};

const checkoutBaseUrl = "https://pay.kiwify.com.br/ANEoMiE";

const checkoutUrl = (placement: string) =>
  `${checkoutBaseUrl}?utm_source=rumoaopro&utm_medium=site&utm_campaign=preparador_pro&utm_content=${placement}`;

const screenAssets = {
  platform: "/assets/courses/preparador-pro/screens/platform-home.webp",
  lessons: "/assets/courses/preparador-pro/screens/featured-lessons.webp",
  player: "/assets/courses/preparador-pro/screens/lesson-player.webp",
  modules: "/assets/courses/preparador-pro/screens/modules-list.webp"
};

const copy = {
  pt: {
    cta: "Entrar no Preparador PRO",
    eyebrow: "Formação prática para treinadores de futebol",
    heroTitle: "Prepare atletas com método. Não no improviso.",
    heroBody:
      "Aprenda a avaliar jogadores, planejar o microciclo, desenvolver capacidades físicas e controlar a carga com decisões que fazem sentido para o futebol.",
    explore: "Ver aulas e módulos",
    heroTags: ["Acesso vitalício", "Aulas novas", "Suporte no WhatsApp", "7 dias de garantia"],
    platformBadge: "Plataforma atualizada",
    platformNote: "Assista no seu ritmo, reveja quando quiser e receba as próximas aulas sem pagar novamente.",
    heroLessons: [
      ["Módulo prático", "Controle de carga"],
      ["Testar para treinar", "Testes físicos"],
      ["Aplicação no campo", "Velocidade e potência"]
    ],
    problemEyebrow: "Da teoria para o campo",
    problemTitle: "Você não precisa de mais exercícios soltos. Precisa saber quando e por que usar cada estímulo.",
    problemBody:
      "O Preparador PRO organiza a preparação física como um sistema: avaliar, interpretar, planejar, aplicar e ajustar. A proposta é dar clareza para quem trabalha — ou quer trabalhar — com jogadores de futebol.",
    outcomesEyebrow: "O que você vai dominar",
    outcomesTitle: "Decisões melhores em cada etapa da preparação física.",
    outcomes: [
      ["Avaliar antes de prescrever", "Use testes de potência, velocidade, mudança de direção e resistência para entender o atleta."],
      ["Planejar o microciclo", "Organize offseason e temporada sem criar conflito com treinos, jogos e recuperação."],
      ["Treinar velocidade e potência", "Aplique sprints, pliometria, VBT, contrastes e complexos com mais intenção."],
      ["Controlar a carga", "Monitore PSE, carga em AU, monotonia e strain mesmo sem depender de GPS."],
      ["Condicionar para o futebol", "Estruture resistência aeróbia e anaeróbia de acordo com a demanda do jogo."],
      ["Transformar conhecimento em trabalho", "Amplie seu repertório para atuar com atletas, base, clubes e projetos internacionais."]
    ],
    insideEyebrow: "Por dentro da plataforma",
    insideTitle: "Aulas reais, exemplos reais e aplicação direta.",
    insideBody:
      "Nada de vender uma promessa abstrata. Estas são telas atuais do curso e alguns dos conteúdos que já estão disponíveis para os alunos.",
    screenLabels: ["Biblioteca de aulas", "Aula: controle de carga", "Módulos organizados"],
    lessonsEyebrow: "Conteúdo em expansão",
    lessonsTitle: "Uma formação que continua crescendo com você.",
    lessonsBody:
      "O curso recebe novas aulas e estudos práticos continuamente. Você entra uma vez e mantém acesso às próximas atualizações.",
    lessonPill: "Novas aulas sem custo adicional",
    curriculumEyebrow: "Currículo atual",
    curriculumTitle: "Do fundamento à aplicação avançada.",
    curriculumBody:
      "Os módulos são independentes para você estudar conforme a necessidade, mas juntos formam uma base completa para preparar jogadores.",
    curriculum: [
      {
        title: "Avaliação e tomada de decisão",
        count: "5 temas",
        lessons: ["Fundamentos da preparação física", "Testar para treinar", "Como avaliar um atleta com o MyJump", "Testes de velocidade e mudança de direção", "Testes de potência: CMJ, SJ e Drop Jump"]
      },
      {
        title: "Planejamento e periodização",
        count: "3 temas",
        lessons: ["Periodização: offseason e in-season", "Exemplo de microciclo em temporada", "Aplicativo para montagem de programas"]
      },
      {
        title: "Resistência e controle de carga",
        count: "4 temas",
        lessons: ["Resistência aeróbia e anaeróbia", "Controle de carga sem GPS", "Como fazer o YoYo Test", "PSE, AU, monotonia e strain no futebol"]
      },
      {
        title: "Força, potência e velocidade",
        count: "8 temas",
        lessons: ["Como treinar Hill Sprints", "Como implementar o Complexo Francês", "Treino de contraste x complexos", "Pliometria", "Como programar sprints resistidos", "Treinamento de potência", "Velocidade", "Método VBT: como utilizar"]
      },
      {
        title: "Aplicações especiais e carreira",
        count: "2 temas",
        lessons: ["Como treinar crianças", "Empregos em outros países"]
      }
    ],
    audienceEyebrow: "Para quem é",
    audienceTitle: "Para quem quer preparar jogadores com mais segurança.",
    audience: ["Preparadores físicos que querem ampliar o repertório", "Treinadores que precisam organizar melhor a parte física", "Estudantes de Educação Física que querem entrar no futebol", "Profissionais de categorias de base e projetos de formação"],
    authorityEyebrow: "Quem conduz as aulas",
    authorityTitle: "Conteúdo construído por quem vive o campo e a academia.",
    authorityBody:
      "Lukaz de Paula reúne experiência como atleta, treinador e preparador físico em ambientes do Brasil, Estados Unidos, Espanha e outros mercados do futebol.",
    authorityPoints: ["Experiência prática com atletas e equipes", "Vivência internacional no futebol", "Método aplicado em campo, academia e monitoramento"],
    offerEyebrow: "Sua entrada no Preparador PRO",
    offerTitle: "Uma compra. Acesso para sempre.",
    priceLabel: "Acesso vitalício",
    price: "R$ 349,90",
    installments: "ou em até 3x de R$ 116,63",
    included: ["Acesso vitalício à plataforma", "Novas aulas e atualizações futuras", "Suporte direto via WhatsApp", "Garantia de 7 dias", "Conteúdo 100% em português"],
    externalNote: "Pagamento e liberação de acesso processados com segurança pela Kiwify.",
    guaranteeTitle: "Teste por 7 dias",
    guaranteeBody:
      "Entre, conheça a plataforma e assista às aulas. Se o conteúdo não fizer sentido para você, solicite o reembolso dentro do prazo de garantia.",
    reviewsEyebrow: "Quem já entrou",
    reviewsTitle: "Treinadores estão levando o conteúdo para a prática.",
    faqEyebrow: "Antes de entrar",
    faqTitle: "Perguntas frequentes",
    faq: [
      ["Por quanto tempo tenho acesso?", "O acesso é vitalício. Você pode rever as aulas sempre que precisar."],
      ["As novas aulas estão incluídas?", "Sim. O curso continua recebendo novos conteúdos e quem já é aluno acessa as atualizações sem uma nova compra."],
      ["O curso oferece certificado?", "Não. O Preparador PRO é uma formação prática e atualmente não emite certificado."],
      ["Como funciona o suporte?", "O suporte aos alunos acontece pelo WhatsApp para dúvidas sobre acesso e orientação relacionada ao conteúdo."],
      ["Posso pedir reembolso?", "Sim. A compra possui garantia de 7 dias, seguindo o processo da Kiwify e a política de reembolso do RumoAoPro."],
      ["Preciso já trabalhar no futebol?", "Não. O curso atende profissionais e estudantes, mas pressupõe interesse real em preparação física aplicada ao futebol."]
    ],
    finalEyebrow: "Preparador PRO",
    finalTitle: "Pare de depender do improviso para preparar jogadores.",
    finalBody: "Construa uma base prática para avaliar, planejar e aplicar a preparação física no futebol.",
    mobilePrice: "Vitalício · R$ 349,90",
    back: "Voltar para a Home"
  },
  en: {
    cta: "Join Preparador PRO",
    eyebrow: "Practical education for football coaches",
    heroTitle: "Prepare players with a method. Not guesswork.",
    heroBody:
      "Learn how to assess players, plan the microcycle, develop physical qualities and monitor training load through decisions that make sense for football.",
    explore: "Explore lessons and modules",
    heroTags: ["Lifetime access", "New lessons", "WhatsApp support", "7-day guarantee"],
    platformBadge: "Updated platform",
    platformNote: "Study at your own pace, revisit lessons and receive future classes without paying again.",
    heroLessons: [
      ["Practical module", "Load monitoring"],
      ["Test to train", "Physical testing"],
      ["On-field application", "Speed and power"]
    ],
    problemEyebrow: "From theory to the pitch",
    problemTitle: "You do not need more random exercises. You need to know when and why to use each stimulus.",
    problemBody:
      "Preparador PRO organizes physical preparation as a system: assess, interpret, plan, apply and adjust. It is designed to give clarity to people who work — or want to work — with football players.",
    outcomesEyebrow: "What you will master",
    outcomesTitle: "Better decisions at every stage of physical preparation.",
    outcomes: [
      ["Assess before prescribing", "Use power, speed, change-of-direction and endurance tests to understand the player."],
      ["Plan the microcycle", "Organize offseason and in-season work around football sessions, matches and recovery."],
      ["Train speed and power", "Apply sprints, plyometrics, VBT, contrasts and complexes with greater intent."],
      ["Monitor training load", "Track RPE, AU, monotony and strain without depending on GPS."],
      ["Condition for football", "Build aerobic and anaerobic endurance around the demands of the game."],
      ["Turn knowledge into work", "Expand your toolkit for athletes, academies, clubs and international opportunities."]
    ],
    insideEyebrow: "Inside the platform",
    insideTitle: "Real lessons, real examples and direct application.",
    insideBody: "These are current screens from the course and examples of content already available to students.",
    screenLabels: ["Lesson library", "Lesson: load monitoring", "Organized modules"],
    lessonsEyebrow: "Growing content library",
    lessonsTitle: "Education that keeps growing with you.",
    lessonsBody: "The course receives new lessons and practical studies over time. Purchase once and retain access to future updates.",
    lessonPill: "Future lessons included",
    curriculumEyebrow: "Current curriculum",
    curriculumTitle: "From foundations to advanced application.",
    curriculumBody: "Modules can be studied independently, but together they build a complete foundation. All lessons are taught in Portuguese.",
    curriculum: [
      { title: "Assessment and decisions", count: "5 topics", lessons: ["Physical preparation foundations", "Test to train", "Assessing a player with MyJump", "Speed and change-of-direction tests", "Power tests: CMJ, SJ and Drop Jump"] },
      { title: "Planning and periodization", count: "3 topics", lessons: ["Offseason and in-season periodization", "In-season microcycle example", "Program-building application"] },
      { title: "Endurance and load monitoring", count: "4 topics", lessons: ["Aerobic and anaerobic endurance", "Load monitoring without GPS", "How to conduct the YoYo Test", "RPE, AU, monotony and strain in football"] },
      { title: "Strength, power and speed", count: "8 topics", lessons: ["Hill Sprints", "French Contrast", "Contrast training and complexes", "Plyometrics", "Programming resisted sprints", "Power training", "Speed", "Using the VBT method"] },
      { title: "Special applications and career", count: "2 topics", lessons: ["Training children", "Jobs in other countries"] }
    ],
    audienceEyebrow: "Who it is for",
    audienceTitle: "For people who want to prepare players with greater confidence.",
    audience: ["Physical coaches expanding their toolkit", "Football coaches organizing physical preparation", "Physical Education students entering football", "Academy and youth development professionals"],
    authorityEyebrow: "Your instructor",
    authorityTitle: "Content built by someone who lives the pitch and the gym.",
    authorityBody: "Lukaz de Paula brings together experience as a player, coach and physical coach in Brazil, the United States, Spain and other football environments.",
    authorityPoints: ["Practical work with players and teams", "International football experience", "A method applied on the pitch, in the gym and through monitoring"],
    offerEyebrow: "Join Preparador PRO",
    offerTitle: "One purchase. Access for life.",
    priceLabel: "Lifetime access",
    price: "R$ 349.90",
    installments: "or up to 3 installments of R$ 116.63",
    included: ["Lifetime platform access", "Future lessons and updates", "Direct WhatsApp support", "7-day guarantee", "Course taught in Portuguese"],
    externalNote: "Payment and course access are securely processed by Kiwify.",
    guaranteeTitle: "Try it for 7 days",
    guaranteeBody: "Enter the platform and explore the lessons. If the content is not right for you, request a refund within the guarantee period.",
    reviewsEyebrow: "Student reviews",
    reviewsTitle: "Coaches are taking the content into practice.",
    faqEyebrow: "Before you join",
    faqTitle: "Frequently asked questions",
    faq: [
      ["How long do I have access?", "Access is lifetime. You can revisit the lessons whenever needed."],
      ["Are future lessons included?", "Yes. Existing students receive future course updates without another purchase."],
      ["Does the course include a certificate?", "No. Preparador PRO is a practical education product and does not currently issue a certificate."],
      ["How does support work?", "Students receive WhatsApp support for access questions and course-related guidance."],
      ["Can I request a refund?", "Yes. The purchase includes a 7-day guarantee through Kiwify and the RumoAoPro refund policy."],
      ["Is the course available in English?", "Not yet. The platform and lessons are currently taught in Portuguese."]
    ],
    finalEyebrow: "Preparador PRO",
    finalTitle: "Stop relying on guesswork to prepare players.",
    finalBody: "Build a practical foundation to assess, plan and apply football physical preparation.",
    mobilePrice: "Lifetime · R$ 349.90",
    back: "Back to Home"
  }
} as const;

const outcomeIcons = [Target, CalendarRange, Zap, BarChart3, HeartPulse, GraduationCap];

const partnerLogos = [
  { alt: "CBF Academy", src: assets.logoCbf },
  { alt: "FC Málaga City", src: assets.logoMalagaCity },
  { alt: "Lindsey Wilson College", src: assets.logoLindseyWilson },
  { alt: "Almuñécar City", src: assets.logoAlmunecar }
];

function CheckoutLink({ children, className, placement }: { children: ReactNode; className: string; placement: string }) {
  return (
    <a className={className} data-checkout-product="preparador-pro" href={checkoutUrl(placement)} rel="noreferrer" target="_blank">
      {children}
    </a>
  );
}

export function PreparadorProPage({ locale }: PreparadorProPageProps) {
  const page = copy[locale];
  const isEnglish = locale === "en";

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f4f1] pb-20 lg:pb-0">
      <SiteHeader ctaHref="#oferta" ctaLabel={page.cta} languageHref={isEnglish ? "/cursos" : "/en/courses"} navItems={nav[locale]} />

      <section className="relative isolate overflow-hidden bg-[#070809] text-white">
        <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_82%_18%,rgba(218,17,38,.3),transparent_33%),linear-gradient(135deg,#070809_0%,#111318_58%,#21080d_100%)]" />
        <div className="absolute inset-0 -z-20 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:54px_54px]" />
        <div className="mx-auto grid min-h-[min(820px,calc(100vh-var(--header-height)))] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-20">
          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#ffcf57] sm:text-sm"><Sparkles aria-hidden="true" className="h-4 w-4" />{page.eyebrow}</p>
            <h1 className="mt-5 max-w-3xl font-display text-4xl uppercase leading-[0.95] sm:text-6xl lg:text-7xl">{page.heroTitle}</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">{page.heroBody}</p>
            <div className="mt-7 flex flex-wrap gap-2">
              {page.heroTags.map((tag) => <span className="rounded-full border border-white/15 bg-white/[0.07] px-3 py-2 text-xs font-bold text-white/80" key={tag}><Check aria-hidden="true" className="mr-1.5 inline h-3.5 w-3.5 text-[#ff344b]" />{tag}</span>)}
            </div>
            <div className="mt-7"><ReviewBadge groupKey="preparadorPro" locale={locale} tone="dark" /></div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CheckoutLink className="focus-ring inline-flex min-h-[52px] items-center justify-center gap-2 rounded-md bg-signal px-6 py-3.5 text-sm font-black uppercase text-white shadow-[0_18px_45px_rgba(218,17,38,.28)] transition hover:-translate-y-0.5 hover:bg-[#b90f20]" placement="hero">{page.cta}<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></CheckoutLink>
              <a className="focus-ring inline-flex min-h-[52px] items-center justify-center gap-2 rounded-md border border-white/20 bg-white/[0.06] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white hover:text-ink" href="#conteudo">{page.explore}<ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
            </div>
          </div>

          <div className="relative mx-auto min-h-[430px] w-full max-w-[780px] sm:min-h-[560px] lg:mx-0 lg:min-h-[620px]">
            <div className="absolute inset-x-[6%] top-[4%] h-[64%] rounded-full bg-signal/25 blur-[95px]" />
            <div className="absolute -inset-x-[7%] -top-[2%] z-10 aspect-[1.5] overflow-hidden [mask-image:radial-gradient(ellipse_at_center,black_68%,transparent_100%)] sm:-inset-x-[4%] lg:-inset-x-[8%]">
              <Image alt={`${page.screenLabels[0]} no notebook`} className="object-contain" fill priority sizes="(max-width: 1024px) 105vw, 59vw" src="/assets/courses/preparador-pro/preparador-pro-laptop-v3.png" />
            </div>

            <div className="absolute inset-x-0 bottom-2 z-20 h-[42%] sm:bottom-2 sm:h-[39%]">
              {page.heroLessons.map(([eyebrow, title], index) => {
                const cardPosition = [
                  "left-0 top-4 w-[47%] -rotate-[4deg] sm:left-[2%] sm:top-7 sm:w-[31%]",
                  "right-0 top-8 w-[47%] rotate-[4deg] sm:right-[2%] sm:top-7 sm:w-[31%]",
                  "left-1/2 top-[30%] hidden w-[29%] -translate-x-1/2 rotate-[1deg] sm:block"
                ][index];
                const imagePosition = ["0% center", "33.333% center", "66.666% center"][index];

                return (
                  <div className={`absolute ${cardPosition}`} key={title}>
                    <article className="group relative rounded-xl border border-white/25 bg-gradient-to-b from-[#24262b] to-[#101114] p-1.5 shadow-[0_26px_65px_rgba(0,0,0,.7)] transition duration-300 hover:-translate-y-1 sm:rounded-2xl sm:p-2">
                      <div className="absolute -bottom-2.5 left-2 right-[-3px] top-3 -z-10 rounded-xl border border-white/10 bg-gradient-to-br from-[#6f101f] via-[#2a0a10] to-[#08090b] sm:rounded-2xl" />
                      <div className="relative aspect-[1.38] overflow-hidden rounded-lg bg-[#0a0b0d] sm:rounded-xl">
                        <div className="absolute inset-0 bg-no-repeat" style={{ backgroundImage: `url(${screenAssets.lessons})`, backgroundPosition: imagePosition, backgroundSize: "400% auto" }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/15" />
                        <span className="absolute left-2 top-2 rounded-full border border-white/15 bg-black/65 px-2 py-1 text-[7px] font-black uppercase tracking-[0.13em] text-[#ffcf57] backdrop-blur sm:left-3 sm:top-3 sm:text-[8px]">{eyebrow}</span>
                      </div>
                      <div className="flex items-end justify-between gap-2 px-2 pb-2 pt-2.5 sm:px-3 sm:pb-3 sm:pt-3"><p className="text-[11px] font-black uppercase leading-tight text-white sm:text-sm">{title}</p><span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-signal text-white shadow-[0_6px_18px_rgba(218,17,38,.35)] sm:h-7 sm:w-7"><PlayCircle aria-hidden="true" className="h-3.5 w-3.5" /></span></div>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-white py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-end lg:px-8">
          <div><p className="text-sm font-black uppercase tracking-[0.18em] text-signal">{page.problemEyebrow}</p><h2 className="mt-3 font-display text-3xl uppercase leading-[1.02] text-ink sm:text-5xl">{page.problemTitle}</h2></div>
          <p className="max-w-2xl text-base leading-8 text-graphite/72 lg:justify-self-end">{page.problemBody}</p>
        </div>
      </section>

      <section className="bg-[#f4f4f1] py-16" id="conteudo">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl"><p className="text-sm font-black uppercase tracking-[0.18em] text-signal">{page.outcomesEyebrow}</p><h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-5xl">{page.outcomesTitle}</h2></div>
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {page.outcomes.map(([title, body], index) => {
              const Icon = outcomeIcons[index];
              return <article className="group rounded-xl border border-ink/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-card" key={title}><div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-signal/10 text-signal transition group-hover:bg-signal group-hover:text-white"><Icon aria-hidden="true" className="h-5 w-5" /></div><h3 className="mt-5 text-xl font-black text-ink">{title}</h3><p className="mt-3 text-sm leading-6 text-graphite/68">{body}</p></article>;
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#090a0c] py-16 text-white">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_10%,#e0112b,transparent_26%),radial-gradient(circle_at_90%_85%,#7d0716,transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end"><div><p className="text-sm font-black uppercase tracking-[0.18em] text-[#ffcf57]">{page.insideEyebrow}</p><h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-5xl">{page.insideTitle}</h2></div><p className="max-w-2xl text-base leading-8 text-white/68 lg:justify-self-end">{page.insideBody}</p></div>
          <div className="mt-10 grid gap-5 lg:grid-cols-[1.45fr_0.55fr]">
            <article className="overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] p-2 shadow-2xl sm:p-3"><div className="relative aspect-[1.91] overflow-hidden rounded-xl bg-black"><Image alt={page.screenLabels[1]} className="object-cover object-top" fill sizes="(max-width: 1024px) 100vw, 72vw" src={screenAssets.player} /></div><p className="px-3 pb-2 pt-4 text-sm font-black uppercase tracking-[0.16em] text-white/70"><PlayCircle aria-hidden="true" className="mr-2 inline h-4 w-4 text-signal" />{page.screenLabels[1]}</p></article>
            <article className="overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] p-2 shadow-2xl sm:p-3"><div className="relative min-h-[440px] overflow-hidden rounded-xl bg-black lg:h-full"><Image alt={page.screenLabels[2]} className="object-cover object-top" fill sizes="(max-width: 1024px) 100vw, 28vw" src={screenAssets.modules} /></div><p className="px-3 pb-2 pt-4 text-sm font-black uppercase tracking-[0.16em] text-white/70"><BookOpen aria-hidden="true" className="mr-2 inline h-4 w-4 text-signal" />{page.screenLabels[2]}</p></article>
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] p-2 sm:p-3"><div className="relative aspect-[2.54] min-h-[260px] overflow-hidden rounded-xl bg-black sm:min-h-0"><Image alt={page.screenLabels[0]} className="object-cover object-center" fill sizes="100vw" src={screenAssets.lessons} /></div></div>
        </div>
      </section>

      <section className="bg-signal py-12 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8"><div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[0.2em] text-white/65">{page.lessonsEyebrow}</p><h2 className="mt-2 font-display text-3xl uppercase leading-tight sm:text-4xl">{page.lessonsTitle}</h2><p className="mt-3 text-sm leading-7 text-white/78">{page.lessonsBody}</p></div><div className="shrink-0 rounded-full border border-white/20 bg-black/15 px-5 py-3 text-sm font-black"><RefreshCw aria-hidden="true" className="mr-2 inline h-4 w-4" />{page.lessonPill}</div></div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end"><div><p className="text-sm font-black uppercase tracking-[0.18em] text-signal">{page.curriculumEyebrow}</p><h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-5xl">{page.curriculumTitle}</h2></div><p className="max-w-2xl text-base leading-8 text-graphite/70 lg:justify-self-end">{page.curriculumBody}</p></div>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {page.curriculum.map((module, index) => <details className={`group rounded-xl border border-ink/10 bg-[#f7f7f5] p-5 open:bg-white open:shadow-card ${index === page.curriculum.length - 1 ? "lg:col-span-2" : ""}`} key={module.title}><summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 rounded-md [&::-webkit-details-marker]:hidden"><span className="flex min-w-0 items-center gap-4"><span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink text-sm font-black text-white">{String(index + 1).padStart(2, "0")}</span><span><span className="block text-lg font-black text-ink">{module.title}</span><span className="mt-1 block text-xs font-bold uppercase tracking-[0.14em] text-signal">{module.count}</span></span></span><ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 text-graphite/50 transition group-open:rotate-180" /></summary><div className="mt-5 grid gap-2 border-t border-ink/10 pt-5 sm:grid-cols-2">{module.lessons.map((lesson) => <p className="flex items-start gap-2 text-sm leading-6 text-graphite/72" key={lesson}><CheckCircle2 aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-signal" />{lesson}</p>)}</div></details>)}
          </div>
        </div>
      </section>

      <section className="bg-[#0b0c0e] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-8">
          <div className="relative min-h-[500px] overflow-hidden rounded-2xl border border-white/12 bg-[#15171b] shadow-2xl"><Image alt="Lukaz de Paula treinando jogadores de futebol" className="object-cover object-[50%_35%]" fill sizes="(max-width: 1024px) 100vw, 44vw" src={assets.coachGymInstruction} /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6 sm:p-8"><p className="font-display text-3xl uppercase">Lukaz de Paula</p><p className="mt-1 text-sm font-bold uppercase tracking-[0.15em] text-[#ffcf57]">Coach · Preparador físico · Ex-atleta</p></div></div>
          <div><p className="text-sm font-black uppercase tracking-[0.18em] text-[#ffcf57]">{page.authorityEyebrow}</p><h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-5xl">{page.authorityTitle}</h2><p className="mt-5 text-base leading-8 text-white/68">{page.authorityBody}</p><div className="mt-7 grid gap-3">{page.authorityPoints.map((item) => <p className="flex items-start gap-3 text-sm font-bold leading-6 text-white/78" key={item}><BadgeCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-signal" />{item}</p>)}</div><div className="mt-9 grid grid-cols-4 gap-3">{partnerLogos.map((logo) => <div className="flex aspect-square items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] p-3" key={logo.alt}><Image alt={logo.alt} className="h-full w-full object-contain" height={90} src={logo.src} width={90} /></div>)}</div></div>
        </div>
      </section>

      <section className="bg-[#f4f4f1] py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:px-8"><div><p className="text-sm font-black uppercase tracking-[0.18em] text-signal">{page.audienceEyebrow}</p><h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-5xl">{page.audienceTitle}</h2></div><div className="grid gap-3 sm:grid-cols-2">{page.audience.map((item) => <p className="flex min-h-24 items-start gap-3 rounded-xl border border-ink/10 bg-white p-5 text-sm font-bold leading-6 text-graphite/75 shadow-sm" key={item}><CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-signal" />{item}</p>)}</div></div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6" id="oferta">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-ink/10 bg-ink text-white shadow-[0_35px_100px_rgba(8,9,11,.2)] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[420px] overflow-hidden border-b border-white/10 p-8 lg:border-b-0 lg:border-r"><Image alt="Preparador PRO" className="object-cover opacity-45" fill sizes="(max-width: 1024px) 100vw, 42vw" src={assets.preparadorProCover} /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" /><div className="relative z-10 flex h-full flex-col justify-end"><ShieldCheck aria-hidden="true" className="h-10 w-10 text-[#ffcf57]" /><p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-[#ffcf57]">{page.guaranteeTitle}</p><p className="mt-3 max-w-md text-base leading-7 text-white/72">{page.guaranteeBody}</p></div></div>
          <div className="p-7 sm:p-10"><p className="text-sm font-black uppercase tracking-[0.18em] text-[#ffcf57]">{page.offerEyebrow}</p><h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-5xl">{page.offerTitle}</h2><div className="mt-7 border-y border-white/12 py-6"><p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">{page.priceLabel}</p><p className="mt-2 font-display text-5xl uppercase text-white">{page.price}</p><p className="mt-1 text-sm font-semibold text-white/55">{page.installments}</p></div><div className="mt-7 grid gap-3 sm:grid-cols-2">{page.included.map((item) => <p className="flex items-start gap-2 text-sm font-bold leading-6 text-white/75" key={item}><Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-[#ff344b]" />{item}</p>)}</div><CheckoutLink className="focus-ring mt-8 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-md bg-signal px-6 py-3.5 text-sm font-black uppercase text-white transition hover:bg-[#b90f20]" placement="offer">{page.cta}<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></CheckoutLink><p className="mt-4 text-center text-xs leading-5 text-white/45">{page.externalNote}</p></div>
        </div>
      </section>

      <ReviewsSection eyebrow={page.reviewsEyebrow} groupKey="preparadorPro" locale={locale} title={page.reviewsTitle} />

      <section className="bg-[#f4f4f1] py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8"><div className="text-center"><p className="text-sm font-black uppercase tracking-[0.18em] text-signal">{page.faqEyebrow}</p><h2 className="mt-3 font-display text-3xl uppercase leading-tight text-ink sm:text-5xl">{page.faqTitle}</h2></div><div className="mt-9 grid gap-3">{page.faq.map(([question, answer]) => <details className="group rounded-xl border border-ink/10 bg-white p-5 shadow-sm" key={question}><summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 rounded-md text-base font-black text-ink [&::-webkit-details-marker]:hidden"><span className="flex items-center gap-3"><CircleHelp aria-hidden="true" className="h-5 w-5 shrink-0 text-signal" />{question}</span><ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 text-graphite/45 transition group-open:rotate-180" /></summary><p className="mt-4 border-t border-ink/10 pt-4 text-sm leading-7 text-graphite/68">{answer}</p></details>)}</div></div>
      </section>

      <section className="bg-signal py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8"><div className="max-w-3xl"><p className="text-sm font-black uppercase tracking-[0.18em] text-white/65">{page.finalEyebrow}</p><h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-5xl">{page.finalTitle}</h2><p className="mt-4 text-base leading-7 text-white/78">{page.finalBody}</p></div><div className="flex shrink-0 flex-col gap-3"><CheckoutLink className="focus-ring inline-flex min-h-[52px] items-center justify-center gap-2 rounded-md bg-white px-6 py-3.5 text-sm font-black uppercase text-ink transition hover:bg-steel" placement="final">{page.cta}<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></CheckoutLink><Link className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20" href={isEnglish ? "/en" : "/"}>{page.back}</Link></div></div>
      </section>

      <SiteFooter locale={locale} />

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#090a0c]/95 p-3 text-white shadow-[0_-12px_40px_rgba(0,0,0,.28)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3"><div className="min-w-0 flex-1"><p className="truncate text-xs font-black uppercase tracking-[0.12em] text-white/55">Preparador PRO</p><p className="truncate text-sm font-black">{page.mobilePrice}</p></div><CheckoutLink className="focus-ring inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-md bg-signal px-4 text-xs font-black uppercase text-white" placement="sticky_mobile">{page.cta}<ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" /></CheckoutLink></div>
      </div>
    </main>
  );
}
