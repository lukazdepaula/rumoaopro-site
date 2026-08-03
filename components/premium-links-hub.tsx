import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ChevronRight,
  Globe2,
  Instagram,
  MessageCircle,
  Play,
  Star,
  Youtube
} from "lucide-react";
import { assets, contact } from "@/lib/content";
import { checkoutProducts, formatMoney } from "@/lib/checkout/products";
import { reviewGroups } from "@/lib/reviews";

type LinksLocale = "pt" | "en";

const heroImage = "/assets/photos/lukaz-trainer-hero.jpg";

const copy = {
  pt: {
    languageLabel: "EN",
    languageHref: "/lab/links-premium/en",
    homeHref: "/",
    role: "Preparador físico CBF A · Ex-jogador profissional",
    bio: "Performance para jogadores que querem chegar mais fortes, rápidos e preparados ao campo.",
    preview: "Prévia",
    navPrograms: "Programas",
    navCoaching: "Assessoria",
    navCourse: "Preparador PRO",
    navContent: "Conteúdo",
    programsTitle: "Programas RumoAoPro",
    programsFeatureTitle: "Treine com um plano feito para o futebol",
    programsFeatureBody: "Velocidade, força, pré-temporada, offseason e retorno ao campo.",
    programsFeatureCta: "Encontrar meu programa",
    library: "Escolha seu programa",
    coachingTitle: "Assessoria individual",
    coachingCardTitle: "Um plano construído para a sua rotina",
    coachingBody: "Calendário, controle de carga e ajustes semanais com acompanhamento próximo.",
    coachingCta: "Conhecer a assessoria",
    reviews: "avaliações verificadas",
    proof: "Experiência do desenvolvimento ao futebol profissional",
    courseTitle: "Preparador PRO",
    courseCardTitle: "Formação prática para treinadores de futebol",
    courseBody: "Aprenda a organizar força, velocidade e condicionamento dentro da rotina do jogo.",
    courseCta: "Conhecer o curso",
    contentTitle: "Conteúdo gratuito",
    contentCardTitle: "Treinos, carreira e bastidores",
    contentBody: "Vídeos novos sobre performance e vida no futebol.",
    contentCta: "Assistir no YouTube",
    connect: "Fale comigo ou acompanhe o conteúdo",
    whatsapp: "WhatsApp",
    instagram: "Instagram"
  },
  en: {
    languageLabel: "PT",
    languageHref: "/lab/links-premium",
    homeHref: "/en",
    role: "CBF A performance coach · Former professional player",
    bio: "Performance for footballers who want to arrive stronger, faster and ready for the pitch.",
    preview: "Preview",
    navPrograms: "Programs",
    navCoaching: "Coaching",
    navCourse: "Preparador PRO",
    navContent: "Content",
    programsTitle: "RumoAoPro Programs",
    programsFeatureTitle: "Train with a plan built for football",
    programsFeatureBody: "Speed, strength, offseason, in-season performance and return to play.",
    programsFeatureCta: "Find my program",
    library: "Choose your program",
    coachingTitle: "Individual coaching",
    coachingCardTitle: "A plan built around your real schedule",
    coachingBody: "Calendar planning, load monitoring and weekly adjustments with close support.",
    coachingCta: "Explore coaching",
    reviews: "verified reviews",
    proof: "Experience from player development to professional football",
    courseTitle: "Preparador PRO",
    courseCardTitle: "Practical education for football coaches",
    courseBody: "Learn how to organize strength, speed and conditioning around the demands of the game. Course in Portuguese.",
    courseCta: "Explore the course",
    contentTitle: "Free content",
    contentCardTitle: "Training, career and behind the scenes",
    contentBody: "New videos about performance and life in football.",
    contentCta: "Watch on YouTube",
    connect: "Talk to me or follow the content",
    whatsapp: "WhatsApp",
    instagram: "Instagram"
  }
} satisfies Record<LinksLocale, Record<string, string>>;

const productIds = {
  pt: ["project_36", "projeto_pre_temporada_pt", "projeto_adama_2022_pt", "de_volta_aos_gramados_pt"],
  en: ["offseason_30_days", "project_36", "adama_strength_power", "elanga_in_season"]
} satisfies Record<LinksLocale, string[]>;

const englishSalesPages: Record<string, string> = {
  offseason_30_days: "/en/programs/offseason-30-days",
  project_36: "/en/programs/project-36kmh",
  adama_strength_power: "/en/programs/adama-strength-power",
  elanga_in_season: "/en/programs/elanga-in-season"
};

const professionalAthletes = [
  { name: "Theo Ferreira", image: assets.successTheo, position: "object-[58%_35%]" },
  { name: "Haroune Camara", image: assets.successHaroune, position: "object-[50%_25%]" },
  { name: "Gabriel", image: assets.successGabriel, position: "object-[50%_25%]" }
];

function productPresentation(id: string, locale: LinksLocale) {
  const product = checkoutProducts.find((item) => item.id === id);
  if (!product) return null;
  const project36Pt = locale === "pt" && id === "project_36";

  return {
    ...product,
    name: project36Pt ? "Projeto 36: Velocidade e Aceleração" : product.name,
    cover_image: project36Pt ? assets.project36Pt : product.cover_image,
    sales_page_path: locale === "en" ? englishSalesPages[id] ?? product.sales_page_path : product.sales_page_path,
    price: locale === "pt" ? product.price_brl : product.price_usd,
    currency: locale === "pt" ? "BRL" : "USD"
  };
}

export function PremiumLinksHub({ locale, preview = false }: { locale: LinksLocale; preview?: boolean }) {
  const page = copy[locale];
  const products = productIds[locale].flatMap((id) => {
    const product = productPresentation(id, locale);
    return product ? [product] : [];
  });
  const featured = products[0];
  const coachingReview = reviewGroups.coaching;
  const coachingHref = locale === "pt" ? "/assessoria" : "/en/coaching";
  const courseHref = locale === "pt" ? "/cursos" : "/en/courses";
  const languageHref = preview
    ? page.languageHref
    : locale === "pt"
      ? "/api/locale?lang=en"
      : "/api/locale?lang=pt";

  const navItems = [
    { label: page.navPrograms, href: "#programs", emoji: "⚡" },
    { label: page.navCoaching, href: "#coaching", emoji: "🎯" },
    { label: page.navCourse, href: "#course", emoji: "🎓" },
    { label: page.navContent, href: "#content", emoji: "🎥" }
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080908] text-white">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 hidden sm:block">
        <Image alt="" className="scale-110 object-cover opacity-20 blur-3xl" fill priority sizes="(min-width: 640px) 100vw, 1px" src={heroImage} />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(5,31,29,0.86),rgba(8,8,8,0.92)_48%,rgba(80,34,18,0.72))]" />
      </div>

      <div className="relative mx-auto min-h-screen w-full max-w-[760px] bg-[#0d0e0d] shadow-[0_0_100px_rgba(0,0,0,0.72)] sm:my-10 sm:overflow-hidden sm:rounded-[30px] sm:border sm:border-white/8">
        <header className="px-0 pt-8 sm:px-24 sm:pt-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] sm:aspect-[4/5] sm:rounded-[24px]">
            <Image alt="Lukaz de Paula treinando jogadores" className="scale-[1.16] object-cover object-[54%_43%] sm:scale-100" fill priority sizes="(max-width: 640px) 100vw, 456px" src={heroImage} />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,8,7,0.06)_45%,rgba(7,8,7,0.78)_100%)]" />

            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
              <Link aria-label="RumoAoPro" className="focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-md" href={page.homeHref}>
                <img alt="" className="h-7 w-7 object-contain" height={28} src={assets.logo} width={28} />
              </Link>
              <div className="flex items-center gap-2">
                {preview ? <span className="rounded-full bg-black/50 px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-white/65 backdrop-blur-md">{page.preview}</span> : null}
                <Link className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-full bg-black/50 px-3 text-[11px] font-black backdrop-blur-md" href={languageHref}><Globe2 className="h-3.5 w-3.5" />{page.languageLabel}</Link>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-7">
              <a aria-label="Instagram" className="focus-ring text-white drop-shadow-lg transition hover:scale-110" href="https://www.instagram.com/lukazdepaula/" rel="noreferrer" target="_blank"><Instagram className="h-6 w-6" strokeWidth={2.5} /></a>
              <a aria-label="YouTube" className="focus-ring text-white drop-shadow-lg transition hover:scale-110" href="https://www.youtube.com/@RumoAoPro" rel="noreferrer" target="_blank"><Youtube className="h-7 w-7" strokeWidth={2.5} /></a>
              <a aria-label="WhatsApp" className="focus-ring text-white drop-shadow-lg transition hover:scale-110" href={`https://wa.me/${contact.whatsapp}`} rel="noreferrer" target="_blank"><MessageCircle className="h-6 w-6" strokeWidth={2.5} /></a>
            </div>
          </div>

          <div className="px-5 pb-7 pt-5 text-center sm:px-0">
            <div className="flex items-center justify-center gap-2">
              <h1 className="font-display text-3xl uppercase leading-none">Lukaz de Paula</h1>
              <BadgeCheck className="h-5 w-5 fill-ice text-[#0d0e0d]" />
            </div>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-gold">{page.role}</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/58">{page.bio}</p>
          </div>
        </header>

        <nav aria-label={page.navPrograms} className="sticky top-0 z-30 border-y border-white/8 bg-[#0d0e0d]/95 py-3 backdrop-blur-xl">
          <div className="flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-7">
            {navItems.map((item, index) => (
              <a className={`focus-ring shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition hover:bg-white/10 ${index === 0 ? "bg-white/10 text-white" : "text-white/58"}`} href={item.href} key={item.href}>
                <span className="mr-2" aria-hidden="true">{item.emoji}</span>{item.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="space-y-12 px-4 pb-12 pt-8 sm:px-7">
          <section className="scroll-mt-20" id="programs">
            <ModuleHeading title={page.programsTitle} emoji="⚡" />

            {featured ? (
              <Link className="group relative mt-4 block min-h-[250px] overflow-hidden rounded-[18px] border border-white/10 bg-[#201313]" href={featured.sales_page_path}>
                <Image alt="Jogador treinando no campo" className="object-cover object-[50%_38%] opacity-65 transition duration-700 group-hover:scale-[1.025]" fill sizes="700px" src={assets.coachFieldPlaying} />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,9,8,0.92)_0%,rgba(8,9,8,0.58)_58%,rgba(8,9,8,0.28)_100%)]" />
                <div className="relative flex min-h-[250px] max-w-[430px] flex-col justify-end p-6 sm:p-8">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-red-300">RumoAoPro Performance</span>
                  <h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">{page.programsFeatureTitle}</h2>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">{page.programsFeatureBody}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase">{page.programsFeatureCta}<ArrowRight className="h-4 w-4 text-red-400" /></span>
                </div>
              </Link>
            ) : null}

            <div className="mt-6 flex items-center justify-between px-1">
              <p className="text-sm font-black">{page.library}</p>
              <ChevronRight className="h-5 w-5 text-white/35" />
            </div>
            <div className="-mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-7 sm:px-7">
              {products.map((product) => (
                <Link className="group w-[58vw] max-w-[218px] shrink-0 snap-start overflow-hidden rounded-[16px] border border-white/9 bg-white/[0.045]" href={product.sales_page_path} key={product.id}>
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#171817]"><Image alt={product.name} className="object-contain p-1 transition duration-500 group-hover:scale-[1.035]" fill sizes="218px" src={product.cover_image} /></div>
                  <div className="p-4"><h3 className="line-clamp-2 min-h-10 text-sm font-black leading-5">{product.name}</h3><div className="mt-3 flex items-center justify-between border-t border-white/8 pt-3"><span className="text-sm font-black">{formatMoney(product.price, product.currency)}</span><ArrowUpRight className="h-4 w-4 text-red-400" /></div></div>
                </Link>
              ))}
            </div>
          </section>

          <section className="scroll-mt-20" id="coaching">
            <ModuleHeading title={page.coachingTitle} emoji="🎯" />
            <Link className="group relative mt-4 block min-h-[300px] overflow-hidden rounded-[18px] border border-white/10" href={coachingHref}>
              <Image alt={page.coachingCardTitle} className="object-cover object-[50%_28%] transition duration-700 group-hover:scale-[1.025]" fill sizes="700px" src={assets.coachGymInstruction} />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,8,0.02)_18%,rgba(8,9,8,0.96)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-2 text-[9px] font-black uppercase tracking-[0.13em] text-gold backdrop-blur-md"><Star className="h-3.5 w-3.5 fill-current" />{coachingReview.average.toFixed(1)} · {coachingReview.count} {page.reviews}</div>
                <h2 className="max-w-lg text-2xl font-black leading-tight sm:text-3xl">{page.coachingCardTitle}</h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-white/64">{page.coachingBody}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase">{page.coachingCta}<ArrowRight className="h-4 w-4 text-gold" /></span>
              </div>
            </Link>

            <div className="mt-3 flex items-center gap-4 rounded-[16px] border border-white/8 bg-white/[0.035] p-4">
              <div className="flex -space-x-3">{professionalAthletes.map((athlete) => <div className="relative h-11 w-11 overflow-hidden rounded-full border-[3px] border-[#121312]" key={athlete.name}><Image alt={athlete.name} className={`object-cover ${athlete.position}`} fill sizes="44px" src={athlete.image} /></div>)}</div>
              <p className="text-xs font-bold leading-5 text-white/58">{page.proof}</p>
            </div>
          </section>

          <section className="scroll-mt-20" id="course">
            <ModuleHeading title={page.courseTitle} emoji="🎓" />
            <Link className="group relative mt-4 block min-h-[320px] overflow-hidden rounded-[18px] border border-white/10" href={courseHref}>
              <Image alt={page.courseCardTitle} className="object-cover transition duration-700 group-hover:scale-[1.025]" fill sizes="700px" src={assets.preparadorProCover} />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,8,0.08)_22%,rgba(8,9,8,0.96)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <h2 className="max-w-lg text-2xl font-black leading-tight sm:text-3xl">{page.courseCardTitle}</h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-white/64">{page.courseBody}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase">{page.courseCta}<ArrowRight className="h-4 w-4 text-gold" /></span>
              </div>
            </Link>
          </section>

          <section className="scroll-mt-20" id="content">
            <ModuleHeading title={page.contentTitle} emoji="🎥" />
            <a className="group relative mt-4 block min-h-[270px] overflow-hidden rounded-[18px] border border-white/10" href="https://www.youtube.com/@RumoAoPro" rel="noreferrer" target="_blank">
              <Image alt={page.contentCardTitle} className="object-cover object-[50%_34%] transition duration-700 group-hover:scale-[1.025]" fill sizes="700px" src={assets.coachFieldPlaying} />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,8,0.08)_15%,rgba(8,9,8,0.94)_100%)]" />
              <div className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-xl"><Play className="ml-0.5 h-5 w-5 fill-current" /></div>
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <h2 className="max-w-lg text-2xl font-black leading-tight sm:text-3xl">{page.contentCardTitle}</h2>
                <p className="mt-2 text-sm text-white/60">{page.contentBody}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase">{page.contentCta}<ArrowUpRight className="h-4 w-4 text-red-400" /></span>
              </div>
            </a>
          </section>

          <section>
            <p className="text-center text-[10px] font-black uppercase tracking-[0.16em] text-white/35">{page.connect}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a className="focus-ring flex min-h-14 items-center justify-center gap-2 rounded-xl border border-white/9 bg-white/[0.045] text-sm font-black transition hover:bg-white hover:text-black" href={`https://wa.me/${contact.whatsapp}`} rel="noreferrer" target="_blank"><MessageCircle className="h-5 w-5 text-emerald-400" />{page.whatsapp}</a>
              <a className="focus-ring flex min-h-14 items-center justify-center gap-2 rounded-xl border border-white/9 bg-white/[0.045] text-sm font-black transition hover:bg-white hover:text-black" href="https://www.instagram.com/lukazdepaula/" rel="noreferrer" target="_blank"><Instagram className="h-5 w-5 text-fuchsia-400" />{page.instagram}</a>
            </div>
          </section>

          <footer className="text-center text-[10px] font-bold uppercase tracking-[0.14em] text-white/25">© {new Date().getFullYear()} RumoAoPro · Lukaz de Paula</footer>
        </div>
      </div>
    </main>
  );
}

function ModuleHeading({ title, emoji }: { title: string; emoji: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-3">
      <h2 className="flex items-center gap-3 text-2xl font-black sm:text-[28px]"><span aria-hidden="true">{emoji}</span>{title}</h2>
      <ChevronRight className="h-6 w-6 shrink-0 text-white/45" />
    </div>
  );
}
