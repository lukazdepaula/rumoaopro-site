import Image from "next/image";
import Link from "next/link";
import { Manrope, Sora } from "next/font/google";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  Dumbbell,
  Globe2,
  GraduationCap,
  Instagram,
  Mail,
  MessageCircle,
  Play,
  Star,
  Trophy,
  Youtube
} from "lucide-react";
import { assets, contact } from "@/lib/content";
import { checkoutProducts, formatMoney } from "@/lib/checkout/products";
import {
  getReviewGroupForProgramHref,
  reviewGroups
} from "@/lib/reviews";

type LinksLocale = "pt" | "en";

const bodyFont = Manrope({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-links-body"
});

const displayFont = Sora({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-links-display"
});

const heroImage = "/assets/photos/lukaz-trainer-hero.jpg";

const copy = {
  pt: {
    homeHref: "/",
    languageLabel: "EN",
    role: "Preparador físico CBF A · Ex-jogador profissional",
    heroTitle: "Performance para quem quer levar o futebol a sério.",
    heroBody:
      "Treinos, programas e bastidores de uma metodologia construída dentro do campo.",
    explore: "Explore",
    programs: "Programas",
    programsEyebrow: "Treine com direção",
    programsTitle: "Escolha o próximo passo da sua preparação.",
    programsBody:
      "Programas para diferentes momentos da temporada, com estrutura clara e aplicação prática.",
    coaching: "Assessoria individual",
    coachingBody:
      "Planejamento, controle de carga e ajustes semanais para a sua rotina real.",
    coachingCta: "Conhecer a assessoria",
    course: "Preparador PRO",
    courseBody: "Formação prática para treinadores de futebol.",
    athletesEyebrow: "Trabalho que chega ao campo",
    athletesTitle: "Atletas que fizeram parte da trajetória.",
    athletesBody:
      "Desenvolvimento individual aplicado em diferentes idades, países e níveis competitivos.",
    videosEyebrow: "RumoAoPro no YouTube",
    videosTitle: "Treino, carreira e vida no futebol.",
    trainingVideos: "Vídeos de treino",
    vlogs: "Vlogs",
    podcasts: "Podcasts",
    comingSoon: "Novos episódios em breve",
    watch: "Assistir",
    journeyEyebrow: "Experiência internacional",
    journeyTitle: "Onde trabalhei e joguei.",
    worked: "Trabalhei",
    played: "Joguei",
    bioEyebrow: "Sobre mim",
    bioTitle: "Lukaz de Paula",
    bio:
      "Preparador físico com licença CBF A e experiência no Brasil, Estados Unidos, Arábia Saudita e Espanha. Hoje trabalho com performance no FC Málaga City e no CD Almuñécar City, unindo a visão de treinador à experiência de quem também viveu o jogo como atleta.",
    email: "E-mail",
    whatsapp: "WhatsApp",
    reviews: "avaliações",
    englishProgram: "Programa em inglês",
    seeProgram: "Ver programa",
    verified: "Avaliações verificadas",
    allVideos: "Ver canal no YouTube",
    rights: "Performance para futebol"
  },
  en: {
    homeHref: "/en",
    languageLabel: "PT",
    role: "CBF A performance coach · Former professional player",
    heroTitle: "Performance for players who take football seriously.",
    heroBody:
      "Training, programs and behind-the-scenes content from a methodology built on the pitch.",
    explore: "Explore",
    programs: "Programs",
    programsEyebrow: "Train with direction",
    programsTitle: "Choose the next step in your preparation.",
    programsBody:
      "Programs for different moments of the season, with clear structure and practical application.",
    coaching: "Individual coaching",
    coachingBody:
      "Planning, load monitoring and weekly adjustments for your real schedule.",
    coachingCta: "Explore coaching",
    course: "Preparador PRO",
    courseBody: "Practical education for football coaches, in Portuguese.",
    athletesEyebrow: "Work that reaches the pitch",
    athletesTitle: "Athletes who are part of the journey.",
    athletesBody:
      "Individual development delivered across different ages, countries and competitive levels.",
    videosEyebrow: "RumoAoPro on YouTube",
    videosTitle: "Training, career and life in football.",
    trainingVideos: "Training videos",
    vlogs: "Vlogs",
    podcasts: "Podcasts",
    comingSoon: "New episodes coming soon",
    watch: "Watch",
    journeyEyebrow: "International experience",
    journeyTitle: "Where I worked and played.",
    worked: "Worked",
    played: "Played",
    bioEyebrow: "About me",
    bioTitle: "Lukaz de Paula",
    bio:
      "CBF A licensed performance coach with experience in Brazil, the United States, Saudi Arabia and Spain. I currently work in performance at FC Málaga City and CD Almuñécar City, combining a coach's perspective with the experience of having lived the game as a player.",
    email: "Email",
    whatsapp: "WhatsApp",
    reviews: "reviews",
    englishProgram: "Program in English",
    seeProgram: "View program",
    verified: "Verified reviews",
    allVideos: "Visit the YouTube channel",
    rights: "Football performance"
  }
} satisfies Record<LinksLocale, Record<string, string>>;

const productIds = {
  pt: [
    "project_36",
    "projeto_pre_temporada_pt",
    "projeto_adama_2022_pt",
    "de_volta_aos_gramados_pt",
    "offseason_30_days",
    "adama_strength_power",
    "elanga_in_season"
  ],
  en: [
    "offseason_30_days",
    "project_36",
    "adama_strength_power",
    "elanga_in_season"
  ]
} satisfies Record<LinksLocale, string[]>;

const englishSalesPages: Record<string, string> = {
  offseason_30_days: "/en/programs/offseason-30-days",
  project_36: "/en/programs/project-36kmh",
  adama_strength_power: "/en/programs/adama-strength-power",
  elanga_in_season: "/en/programs/elanga-in-season"
};

const programPresentation: Record<
  string,
  { image: string; imagePosition: string; ptName?: string; enName?: string; pt: string; en: string }
> = {
  offseason_30_days: {
    image: assets.programsFieldControl,
    imagePosition: "object-[50%_26%]",
    pt: "Campo, academia, velocidade e condicionamento organizados em 30 dias.",
    en: "Field work, gym, speed and conditioning organized across 30 days."
  },
  project_36: {
    image: assets.programsProject36Sprint,
    imagePosition: "object-center",
    ptName: "Projeto 36: Velocidade e Aceleração",
    enName: "Project 36: Speed & Acceleration",
    pt: "Doze semanas para desenvolver aceleração, velocidade máxima e re-aceleração.",
    en: "Twelve weeks to develop acceleration, top speed and re-acceleration."
  },
  adama_strength_power: {
    image: assets.programsAdamaDeadlift,
    imagePosition: "object-[50%_25%]",
    enName: "Adama Strength & Power",
    pt: "Força e potência construídas para transferir melhor ao jogo.",
    en: "Build strength and power designed to transfer to football."
  },
  projeto_adama_2022_pt: {
    image: assets.programsAdamaDeadlift,
    imagePosition: "object-[50%_25%]",
    ptName: "Projeto Adama: Força e Potência",
    pt: "Força, hipertrofia e presença física aplicadas às demandas do futebol.",
    en: "Strength, hypertrophy and physical presence for football."
  },
  projeto_pre_temporada_pt: {
    image: assets.programsFieldControl,
    imagePosition: "object-[50%_26%]",
    pt: "Doze semanas para organizar campo, academia e condicionamento antes da temporada.",
    en: "A twelve-week structure for field, gym and conditioning work."
  },
  de_volta_aos_gramados_pt: {
    image: assets.programsPlayerReady,
    imagePosition: "object-[50%_18%]",
    pt: "Uma progressão clara para recuperar confiança e retornar gradualmente ao campo.",
    en: "A clear progression to rebuild confidence and gradually return to the pitch."
  },
  elanga_in_season: {
    image: assets.programsProMatch,
    imagePosition: "object-[50%_18%]",
    pt: "Força e velocidade durante a temporada sem perder disponibilidade para jogar.",
    en: "Maintain strength and speed in season without losing match availability."
  }
};

const athletes = {
  pt: [
    {
      name: "Theo Ferreira",
      credential: "Newcastle United",
      description: "Da base Sub-16 ao ambiente profissional Sub-21, com trabalho individual de força e velocidade.",
      image: assets.successTheo,
      position: "object-[58%_40%]"
    },
    {
      name: "Haroune Camara",
      credential: "Seleção da Arábia Saudita",
      description: "Preparação individual no ciclo de retorno à seleção e melhor marca de gols da carreira.",
      image: assets.successHaroune,
      position: "object-[50%_28%]"
    },
    {
      name: "Jackson",
      credential: "Campeão e artilheiro",
      description: "Três temporadas seguidas sem lesão com consistência, planejamento e treino inteligente.",
      image: assets.successJackson,
      position: "object-[50%_30%]"
    },
    {
      name: "Gabriel",
      credential: "Mirassol FC",
      description: "Mais de cinco anos de trabalho contínuo acompanhando diferentes fases da carreira.",
      image: assets.successGabriel,
      position: "object-[50%_28%]"
    }
  ],
  en: [
    {
      name: "Theo Ferreira",
      credential: "Newcastle United",
      description: "From the U16 academy to the professional U21 environment, with individual strength and speed work.",
      image: assets.successTheo,
      position: "object-[58%_40%]"
    },
    {
      name: "Haroune Camara",
      credential: "Saudi Arabia national team",
      description: "Individual preparation during a national-team return cycle and his highest-scoring season.",
      image: assets.successHaroune,
      position: "object-[50%_28%]"
    },
    {
      name: "Jackson",
      credential: "Champion and top scorer",
      description: "Three straight injury-free seasons through consistency, planning and intelligent training.",
      image: assets.successJackson,
      position: "object-[50%_30%]"
    },
    {
      name: "Gabriel",
      credential: "Mirassol FC",
      description: "More than five years of continuous work across different stages of his career.",
      image: assets.successGabriel,
      position: "object-[50%_28%]"
    }
  ]
} satisfies Record<LinksLocale, Array<{ name: string; credential: string; description: string; image: string; position: string }>>;

const videos = {
  training: [
    {
      id: "FwnxY1xvskY",
      href: "https://www.youtube.com/watch?v=FwnxY1xvskY&t=209s",
      pt: "Como um jogador deve treinar na academia",
      en: "How a footballer should train in the gym"
    },
    {
      id: "emXDbXdknRk",
      href: "https://www.youtube.com/watch?v=emXDbXdknRk",
      pt: "Fiz o treino do Elanga",
      en: "I tried Elanga's training session"
    },
    {
      id: "EXUGsjGqGMs",
      href: "https://www.youtube.com/watch?v=EXUGsjGqGMs",
      pt: "Treinando até a falha",
      en: "Training to failure for football"
    },
    {
      id: "MKwR2mqVJRo",
      href: "https://www.youtube.com/watch?v=MKwR2mqVJRo&t=3s",
      pt: "Treine como Haaland e Cristiano Ronaldo",
      en: "Train like Haaland and Cristiano Ronaldo"
    }
  ],
  vlogs: [
    {
      id: "KMRIr-w8-m4",
      href: "https://www.youtube.com/watch?v=KMRIr-w8-m4&t=343s",
      pt: "Voltei a jogar futebol com 28 anos",
      en: "I returned to football at 28"
    },
    {
      id: "zdKhlQ_20SU",
      href: "https://www.youtube.com/watch?v=zdKhlQ_20SU",
      pt: "Meti um golaço e salvamos o time",
      en: "I scored a great goal and we saved the team"
    },
    {
      id: "8sYjBVUAReQ",
      href: "https://www.youtube.com/watch?v=8sYjBVUAReQ",
      pt: "Terminei meu contrato na Arábia Saudita",
      en: "My contract in Saudi Arabia came to an end"
    }
  ],
  podcasts: [
    {
      id: "sYcn0KX_nlI",
      href: "https://www.youtube.com/watch?v=sYcn0KX_nlI",
      pt: "Lucas de Paula no Estagiários Podcast #029",
      en: "Lucas de Paula on Estagiários Podcast #029"
    },
    {
      id: "Nd8wQW85gfY",
      href: "https://www.youtube.com/watch?v=Nd8wQW85gfY",
      pt: "Lucas de Paula no Chega Mais Podcast #137",
      en: "Lucas de Paula on Chega Mais Podcast #137"
    }
  ]
} satisfies Record<"training" | "vlogs" | "podcasts", Array<{ id: string; href: string; pt: string; en: string }>>;

const workLogos = [
  { name: "Lindsey Wilson", image: assets.logoLindseyWilson },
  { name: "FC Málaga City", image: assets.logoMalagaCity },
  { name: "CD Almuñécar City", image: assets.logoAlmunecar }
];

const playerLogos = [
  { name: "Colorado Rapids U23", image: assets.logoColoradoRapids },
  { name: "Desportivo Brasil", image: assets.logoDesportivoBrasil },
  { name: "Vasalunds IF", image: assets.logoVasalundsTransparent },
  { name: "CD Almuñécar City", image: assets.logoAlmunecar }
];

function getProgram(id: string, locale: LinksLocale) {
  const product = checkoutProducts.find((item) => item.id === id);
  const presentation = programPresentation[id];
  if (!product || !presentation) return null;

  const salesPage = locale === "en"
    ? englishSalesPages[id] ?? product.sales_page_path
    : id === "project_36"
      ? "/programas/projeto-36kmh"
      : product.sales_page_path;
  const reviewKey = getReviewGroupForProgramHref(salesPage);

  return {
    id,
    name: locale === "pt"
      ? presentation.ptName ?? product.name
      : presentation.enName ?? product.name,
    description: presentation[locale],
    image: presentation.image,
    imagePosition: presentation.imagePosition,
    href: salesPage,
    amount: locale === "pt" ? product.price_brl : product.price_usd,
    currency: locale === "pt" ? "BRL" : "USD",
    review: reviewKey ? reviewGroups[reviewKey] : null,
    isEnglishOnly: id === "offseason_30_days" || id === "adama_strength_power" || id === "elanga_in_season"
  };
}

export function PremiumLinksHub({ locale, preview = false }: { locale: LinksLocale; preview?: boolean }) {
  const page = copy[locale];
  const products = productIds[locale].flatMap((id) => {
    const product = getProgram(id, locale);
    return product ? [product] : [];
  });
  const languageHref = preview
    ? locale === "pt" ? "/en/links" : "/links"
    : locale === "pt" ? "/api/locale?lang=en" : "/api/locale?lang=pt";

  return (
    <main className={`${bodyFont.variable} ${displayFont.variable} min-h-screen overflow-hidden bg-[#050505] text-white [font-family:var(--font-links-body)]`}>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0">
        <div className="absolute -left-48 top-0 h-[520px] w-[520px] rounded-full bg-red-700/20 blur-[130px]" />
        <div className="absolute -right-56 top-[38rem] h-[620px] w-[620px] rounded-full bg-[#8f0012]/25 blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:42px_42px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[980px] sm:px-5 sm:py-8">
        <div className="overflow-hidden bg-[#090909] shadow-[0_30px_100px_rgba(0,0,0,.55)] sm:rounded-[32px] sm:border sm:border-white/10">
          <Hero locale={locale} languageHref={languageHref} />

          <div className="space-y-20 px-4 pb-10 pt-8 sm:px-8 sm:pb-14 lg:px-12">
            <QuickLinks locale={locale} />

            <section className="scroll-mt-8" id="programs">
              <SectionHeading eyebrow={page.programsEyebrow} title={page.programsTitle} body={page.programsBody} />
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {products.map((product) => (
                  <Link className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.045] transition duration-300 hover:-translate-y-1 hover:border-red-500/45 hover:bg-white/[0.065]" href={product.href} key={product.id}>
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#171010]">
                      <Image alt={product.name} className={`object-cover transition duration-700 group-hover:scale-[1.04] ${product.imagePosition}`} fill sizes="(max-width: 640px) 100vw, 430px" src={product.image} />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_28%,rgba(5,5,5,.9)_100%)]" />
                      {locale === "pt" && product.isEnglishOnly ? (
                        <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/65 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.13em] text-red-300 backdrop-blur-md">
                          {page.englishProgram}
                        </span>
                      ) : null}
                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                        <p className="text-xl font-extrabold leading-tight [font-family:var(--font-links-display)]">{product.name}</p>
                        <ArrowUpRight className="h-5 w-5 shrink-0 text-red-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="min-h-12 text-sm leading-6 text-white/58">{product.description}</p>
                      <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/10 pt-4">
                        <div>
                          {product.review ? (
                            <div className="flex items-center gap-2 text-[11px] font-bold text-white/58">
                              <RatingStars rating={product.review.average} />
                              <span>{product.review.average.toFixed(1)} · {product.review.count} {page.reviews}</span>
                            </div>
                          ) : null}
                          <p className="mt-2 text-lg font-extrabold">{formatMoney(product.amount, product.currency)}</p>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-red-400">{page.seeProgram}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <CoachingCard locale={locale} />

            <section className="scroll-mt-8" id="athletes">
              <SectionHeading eyebrow={page.athletesEyebrow} title={page.athletesTitle} body={page.athletesBody} />
              <div className="-mx-4 mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
                {athletes[locale].map((athlete) => (
                  <article className="w-[76vw] max-w-[280px] shrink-0 snap-start overflow-hidden rounded-[22px] border border-white/10 bg-[#111] sm:w-auto" key={athlete.name}>
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <Image alt={athlete.name} className={`object-cover ${athlete.position}`} fill sizes="(max-width: 640px) 76vw, 210px" src={athlete.image} />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_48%,rgba(5,5,5,.96)_100%)]" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <h3 className="font-bold [font-family:var(--font-links-display)]">{athlete.name}</h3>
                        <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-red-400">{athlete.credential}</p>
                      </div>
                    </div>
                    <p className="p-4 text-xs leading-5 text-white/55">{athlete.description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="scroll-mt-8" id="videos">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <SectionHeading eyebrow={page.videosEyebrow} title={page.videosTitle} />
                <a className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-red-400" href="https://www.youtube.com/@RumoAoPro" rel="noreferrer" target="_blank">
                  {page.allVideos}<ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
              <VideoCollection label={page.trainingVideos} locale={locale} videos={videos.training} />
              <VideoCollection label={page.vlogs} locale={locale} videos={videos.vlogs} />
              <VideoCollection label={page.podcasts} locale={locale} videos={videos.podcasts} />
            </section>

            <section className="scroll-mt-8" id="journey">
              <SectionHeading eyebrow={page.journeyEyebrow} title={page.journeyTitle} />
              <LogoCollection icon={<BriefcaseBusiness className="h-4 w-4" />} label={page.worked} logos={workLogos} />
              <LogoCollection icon={<Trophy className="h-4 w-4" />} label={page.played} logos={playerLogos} />
            </section>

            <section className="relative overflow-hidden rounded-[28px] border border-red-500/20 bg-[radial-gradient(circle_at_12%_0%,rgba(220,38,38,.24),transparent_40%),linear-gradient(145deg,#16090b,#090909_65%)] p-6 sm:p-9" id="contact">
              <div className="relative grid gap-8 lg:grid-cols-[1fr_280px] lg:items-end">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-red-400">{page.bioEyebrow}</p>
                  <h2 className="mt-3 text-3xl font-bold [font-family:var(--font-links-display)] sm:text-4xl">{page.bioTitle}</h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">{page.bio}</p>
                </div>
                <div className="grid gap-2">
                  <a className="flex min-h-14 items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-bold transition hover:bg-white hover:text-black" href={`mailto:${contact.email}`}><span className="flex items-center gap-3"><Mail className="h-4 w-4 text-red-400" />{page.email}</span><ArrowUpRight className="h-4 w-4" /></a>
                  <a className="flex min-h-14 items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-bold transition hover:bg-white hover:text-black" href={`https://wa.me/${contact.whatsapp}`} rel="noreferrer" target="_blank"><span className="flex items-center gap-3"><MessageCircle className="h-4 w-4 text-emerald-400" />{page.whatsapp}</span><ArrowUpRight className="h-4 w-4" /></a>
                </div>
              </div>
            </section>

            <footer className="flex flex-col gap-3 border-t border-white/10 pt-6 text-[10px] font-bold uppercase tracking-[0.13em] text-white/30 sm:flex-row sm:items-center sm:justify-between">
              <span>© {new Date().getFullYear()} RumoAoPro · Lukaz de Paula</span>
              <span>{page.rights}</span>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}

function Hero({ locale, languageHref }: { locale: LinksLocale; languageHref: string }) {
  const page = copy[locale];
  return (
    <header className="relative min-h-[690px] overflow-hidden sm:min-h-[720px]">
      <Image alt="Lukaz de Paula treinando jogadores" className="object-cover object-[54%_38%]" fill priority sizes="(max-width: 980px) 100vw, 980px" src={heroImage} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,.15)_0%,rgba(5,5,5,.12)_33%,rgba(8,3,4,.86)_78%,#090909_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,.72),transparent_55%)] opacity-75" />

      <div className="relative flex min-h-[690px] flex-col justify-between p-5 sm:min-h-[720px] sm:p-9">
        <div className="flex items-center justify-between gap-4">
          <Link aria-label="RumoAoPro" className="flex items-center gap-3 rounded-full border border-white/12 bg-black/35 px-3 py-2 backdrop-blur-xl" href={page.homeHref}>
            <img alt="" className="h-8 w-8 object-contain" height={32} src={assets.logo} width={32} />
            <span className="hidden text-xs font-extrabold uppercase tracking-[0.14em] sm:inline">RumoAoPro</span>
          </Link>
          <Link className="inline-flex h-11 items-center gap-2 rounded-full border border-white/12 bg-black/35 px-4 text-xs font-extrabold backdrop-blur-xl transition hover:bg-white hover:text-black" href={languageHref}><Globe2 className="h-4 w-4" />{page.languageLabel}</Link>
        </div>

        <div className="max-w-[720px] pb-8 sm:pb-12">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-red-300">{page.role}</p>
            <BadgeCheck className="h-4 w-4 fill-red-500 text-white" />
          </div>
          <h1 className="mt-4 text-[2.55rem] font-semibold leading-[1.02] tracking-[-0.045em] [font-family:var(--font-links-display)] sm:text-6xl lg:text-7xl">{page.heroTitle}</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/66 sm:text-base">{page.heroBody}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a className="inline-flex min-h-12 items-center gap-2 rounded-full bg-red-600 px-5 text-xs font-extrabold uppercase tracking-[0.12em] transition hover:bg-red-500" href="#programs">{page.programs}<ArrowRight className="h-4 w-4" /></a>
            <div className="flex items-center gap-1.5">
              <SocialIcon href="https://www.instagram.com/lukazdepaula/" label="Instagram"><Instagram className="h-4 w-4" /></SocialIcon>
              <SocialIcon href="https://www.youtube.com/@RumoAoPro" label="YouTube"><Youtube className="h-5 w-5" /></SocialIcon>
              <SocialIcon href={`https://wa.me/${contact.whatsapp}`} label="WhatsApp"><MessageCircle className="h-4 w-4" /></SocialIcon>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function QuickLinks({ locale }: { locale: LinksLocale }) {
  const page = copy[locale];
  const links = [
    { href: locale === "pt" ? "/assessoria" : "/en/coaching", label: page.coaching, description: page.coachingBody, icon: Dumbbell },
    { href: "#programs", label: page.programs, description: page.programsTitle, icon: Play },
    { href: locale === "pt" ? "/cursos" : "/en/courses", label: page.course, description: page.courseBody, icon: GraduationCap },
    { href: "#videos", label: "YouTube", description: page.videosTitle, icon: Youtube }
  ];
  return (
    <section aria-label={page.explore} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {links.map((item) => {
        const Icon = item.icon;
        return (
          <Link className="group flex min-h-[138px] flex-col justify-between rounded-[20px] border border-white/10 bg-white/[0.045] p-4 transition hover:-translate-y-1 hover:border-red-500/40 hover:bg-white/[0.07]" href={item.href} key={item.href}>
            <div className="flex items-start justify-between"><Icon className="h-5 w-5 text-red-400" /><ArrowUpRight className="h-4 w-4 text-white/30 transition group-hover:text-white" /></div>
            <div><p className="text-sm font-extrabold [font-family:var(--font-links-display)]">{item.label}</p><p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/42">{item.description}</p></div>
          </Link>
        );
      })}
    </section>
  );
}

function CoachingCard({ locale }: { locale: LinksLocale }) {
  const page = copy[locale];
  const review = reviewGroups.coaching;
  return (
    <section className="scroll-mt-8" id="coaching">
      <Link className="group relative block min-h-[380px] overflow-hidden rounded-[28px] border border-white/10" href={locale === "pt" ? "/assessoria" : "/en/coaching"}>
        <Image alt={page.coaching} className="object-cover object-[50%_28%] transition duration-700 group-hover:scale-[1.035]" fill sizes="(max-width: 980px) 100vw, 880px" src={assets.coachGymInstruction} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,.08)_12%,rgba(5,5,5,.95)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-2 text-[10px] font-bold text-white/70 backdrop-blur-xl"><RatingStars rating={review.average} />{review.average.toFixed(1)} · {review.count} {page.reviews}</div>
          <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.035em] [font-family:var(--font-links-display)] sm:text-4xl">{page.coaching}</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">{page.coachingBody}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-red-400">{page.coachingCta}<ArrowRight className="h-4 w-4" /></span>
        </div>
      </Link>
    </section>
  );
}

function VideoCollection({ label, locale, videos: items }: { label: string; locale: LinksLocale; videos: Array<{ id: string; href: string; pt: string; en: string }> }) {
  return (
    <div className="mt-9">
      <div className="flex items-center gap-3"><span className="h-px flex-1 bg-white/10" /><h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/55">{label}</h3><span className="h-px flex-1 bg-white/10" /></div>
      <div className="-mx-4 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0">
        {items.map((video) => (
          <a className="group w-[82vw] max-w-[380px] shrink-0 snap-start overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-red-500/40" href={video.href} key={video.id} rel="noreferrer" target="_blank">
            <div className="relative aspect-video overflow-hidden bg-[#171010]">
              <img alt={video[locale]} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" loading="lazy" src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} />
              <div className="absolute inset-0 bg-black/10 transition group-hover:bg-black/25" />
              <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-600 shadow-[0_10px_30px_rgba(0,0,0,.45)]"><Play className="ml-0.5 h-4 w-4 fill-current" /></span>
            </div>
            <div className="flex items-start justify-between gap-4 p-4"><h4 className="text-sm font-bold leading-5">{video[locale]}</h4><ArrowUpRight className="h-4 w-4 shrink-0 text-red-400" /></div>
          </a>
        ))}
      </div>
    </div>
  );
}

function LogoCollection({ icon, label, logos }: { icon: React.ReactNode; label: string; logos: Array<{ name: string; image: string }> }) {
  return (
    <div className="mt-8">
      <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-white/50">{icon}{label}</h3>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {logos.map((logo) => (
          <article className="flex min-h-[140px] flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.04] p-4 text-center" key={`${label}-${logo.name}`}>
            <div className="flex h-20 w-28 items-center justify-center"><Image alt={logo.name} className="max-h-16 w-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,.45)]" height={64} src={logo.image} width={104} /></div>
            <p className="mt-3 text-[11px] font-bold leading-4 text-white/60">{logo.name}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-red-400">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.035em] [font-family:var(--font-links-display)] sm:text-4xl">{title}</h2>
      {body ? <p className="mt-3 text-sm leading-6 text-white/52">{body}</p> : null}
    </div>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating.toFixed(1)} de 5`} className="inline-flex gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, index) => <Star aria-hidden="true" className="h-3 w-3 fill-current" key={index} />)}
    </span>
  );
}

function SocialIcon({ children, href, label }: { children: React.ReactNode; href: string; label: string }) {
  return <a aria-label={label} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-black/35 backdrop-blur-xl transition hover:bg-white hover:text-black" href={href} rel="noreferrer" target="_blank">{children}</a>;
}
