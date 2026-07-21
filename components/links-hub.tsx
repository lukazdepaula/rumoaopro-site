import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Dumbbell,
  Globe2,
  Instagram,
  MessageCircle,
  Star,
  Target,
  Youtube
} from "lucide-react";
import { assets, contact } from "@/lib/content";
import { checkoutProducts, formatMoney } from "@/lib/checkout/products";
import {
  getReviewGroupForProgramHref,
  reviewGroups
} from "@/lib/reviews";

type LinksLocale = "pt" | "en";

const copy = {
  pt: {
    profile: "Preparador físico CBF A · Ex-jogador profissional",
    intro:
      "Treinamento para futebol com a experiência de quem viveu o campo como atleta e hoje prepara jogadores em diferentes níveis.",
    coachingLabel: "Assessoria Online",
    coachingTitle: "Treinamento feito para a sua rotina",
    coachingBody:
      "Planejamento individual, controle de carga e acompanhamento direto para evoluir sem perder o timing da temporada.",
    coachingButton: "Conhecer a assessoria",
    spots: "Vagas limitadas",
    professionalsNav: "Profissionais",
    professionalsEyebrow: "Metodologia comprovada no futebol",
    professionalsTitle: "Jogadores profissionais que confiam na RumoAoPro",
    professionalsLead:
      "A mesma metodologia acompanha atletas em diferentes clubes, seleções e fases da carreira.",
    proofNav: "Avaliações",
    proofEyebrow: "Resultados reais",
    proofTitle: "Atletas que evoluíram com a RumoAoPro",
    proofLead:
      "Experiências de atletas que treinaram com a nossa metodologia.",
    proofVerified: "Atleta verificado",
    proofButton: "Conhecer a assessoria",
    programsPt: "Programas em português",
    programsPtLead: "Escolha seu objetivo e comece com um plano completo.",
    programsEn: "Programs in English",
    programsEnLead: "The complete international RumoAoPro collection.",
    reviews: "avaliações",
    seeProgram: "Ver programa",
    courses: "Cursos",
    coursesTitle: "Preparador PRO",
    coursesBody:
      "Aprenda a planejar e aplicar treinos de potência, velocidade, resistência e preparação física para jogadores de futebol.",
    coursesButton: "Conhecer o curso",
    youtubeTitle: "Treinos, bastidores e carreira no futebol",
    youtubeBody:
      "Acompanhe conteúdos práticos da RumoAoPro e a rotina de Lukaz de Paula como treinador e jogador.",
    youtubeButton: "Acessar o YouTube",
    languageHref: "/en/links",
    languageLabel: "🇧🇷 PT",
    languageTarget: "English",
    coachingHref: "/assessoria",
    coursesHref: "/cursos"
  },
  en: {
    profile: "CBF A performance coach · Former professional player",
    intro:
      "Football performance training built by someone who lived the game as a player and now prepares athletes at different levels.",
    coachingLabel: "Online Coaching",
    coachingTitle: "Training built around your real schedule",
    coachingBody:
      "Individual planning, load management and direct support to help you improve throughout the season.",
    coachingButton: "Explore online coaching",
    spots: "Limited spots",
    professionalsNav: "Pro players",
    professionalsEyebrow: "Proven in professional football",
    professionalsTitle: "Professional players who trust RumoAoPro",
    professionalsLead:
      "The same methodology supports players across different clubs, national teams and stages of their careers.",
    proofNav: "Reviews",
    proofEyebrow: "Real results",
    proofTitle: "Athletes who improved with RumoAoPro",
    proofLead:
      "Experiences from athletes who trained with our methodology.",
    proofVerified: "Verified athlete",
    proofButton: "Explore online coaching",
    programsPt: "Programas em português",
    programsPtLead: "A coleção original da RumoAoPro em português.",
    programsEn: "Programs in English",
    programsEnLead: "Choose your goal and start with a complete training plan.",
    reviews: "reviews",
    seeProgram: "View program",
    courses: "Courses",
    coursesTitle: "Preparador PRO",
    coursesBody:
      "Learn how to plan and apply power, speed, endurance and physical preparation sessions for football players. Course in Portuguese.",
    coursesButton: "Explore the course",
    youtubeTitle: "Training, football life and behind the scenes",
    youtubeBody:
      "Follow practical RumoAoPro content and Lukaz de Paula's routine as a coach and player.",
    youtubeButton: "Open YouTube",
    languageHref: "/links",
    languageLabel: "🇺🇸 EN",
    languageTarget: "Português",
    coachingHref: "/en/coaching",
    coursesHref: "/en/courses"
  }
} satisfies Record<LinksLocale, Record<string, string>>;

const productOrder = [
  "projeto_pre_temporada_pt",
  "projeto_adama_2022_pt",
  "projeto_36_2022_pt",
  "de_volta_aos_gramados_pt",
  "offseason_30_days",
  "adama_strength_power",
  "project_36",
  "elanga_in_season"
];

const englishSalesPages: Record<string, string> = {
  offseason_30_days: "/en/programs/offseason-30-days",
  adama_strength_power: "/en/programs/adama-strength-power",
  project_36: "/en/programs/project-36kmh",
  elanga_in_season: "/en/programs/elanga-in-season"
};

const socialLinks = [
  {
    label: "WhatsApp",
    href: `https://wa.me/${contact.whatsapp}`,
    icon: MessageCircle
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/lukazdepaula/",
    icon: Instagram
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@RumoAoPro",
    icon: Youtube
  }
];

const professionalAthletes = {
  pt: [
    {
      name: 'Matheos "Theo" Ferreira',
      credential: "Newcastle United",
      description:
        "Da base Sub-16 ao ambiente profissional Sub-21, com trabalho individual de força e velocidade.",
      image: assets.successTheo,
      imagePosition: "object-[58%_42%]"
    },
    {
      name: "Haroune Camara",
      credential: "Seleção da Arábia Saudita",
      description:
        "Preparação física individual em um ciclo de retorno à seleção e melhor marca de gols da carreira.",
      image: assets.successHaroune,
      imagePosition: "object-[50%_28%]"
    },
    {
      name: "Gabriel",
      credential: "Mirassol FC",
      description:
        "Mais de 5 anos de trabalho contínuo com a RumoAoPro, acompanhando diferentes fases da carreira.",
      image: assets.successGabriel,
      imagePosition: "object-[50%_28%]"
    }
  ],
  en: [
    {
      name: 'Matheos "Theo" Ferreira',
      credential: "Newcastle United",
      description:
        "From the U16 academy to the professional U21 environment, with individual strength and speed work.",
      image: assets.successTheo,
      imagePosition: "object-[58%_42%]"
    },
    {
      name: "Haroune Camara",
      credential: "Saudi Arabia national team",
      description:
        "Individual preparation during a return-to-national-team cycle and the highest-scoring season of his career.",
      image: assets.successHaroune,
      imagePosition: "object-[50%_28%]"
    },
    {
      name: "Gabriel",
      credential: "Mirassol FC",
      description:
        "More than 5 years of continuous work with RumoAoPro across different stages of his career.",
      image: assets.successGabriel,
      imagePosition: "object-[50%_28%]"
    }
  ]
} satisfies Record<
  LinksLocale,
  Array<{
    name: string;
    credential: string;
    description: string;
    image: string;
    imagePosition: string;
  }>
>;

function ProgramRail({
  language,
  locale
}: {
  language: "Portuguese" | "English";
  locale: LinksLocale;
}) {
  const page = copy[locale];
  const products = checkoutProducts
    .filter(
      (product) =>
        product.active &&
        product.type === "training_program" &&
        product.language === language
    )
    .sort(
      (left, right) =>
        productOrder.indexOf(left.id) - productOrder.indexOf(right.id)
    );

  return (
    <div className="-mx-4 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">
      {products.map((product) => {
        const reviewKey = getReviewGroupForProgramHref(product.sales_page_path);
        const review = reviewKey ? reviewGroups[reviewKey] : null;
        const salesPage =
          locale === "en" && product.language === "English"
            ? englishSalesPages[product.id] ?? product.sales_page_path
            : product.sales_page_path;
        const currency = language === "Portuguese" ? "BRL" : "USD";
        const amount =
          language === "Portuguese" ? product.price_brl : product.price_usd;

        return (
          <Link
            className="group w-[78vw] max-w-[292px] shrink-0 snap-start overflow-hidden rounded-lg border border-white/12 bg-white text-ink shadow-clean transition hover:-translate-y-1"
            href={salesPage}
            key={product.id}
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-ink">
              <Image
                alt={product.name}
                className="object-contain p-2 transition duration-500 group-hover:scale-[1.03]"
                fill
                sizes="(max-width: 640px) 78vw, 292px"
                src={product.cover_image}
              />
            </div>
            <div className="p-4">
              {review ? (
                <p className="flex items-center gap-1 text-xs font-bold text-ink/65">
                  <Star
                    aria-hidden="true"
                    className="h-3.5 w-3.5 fill-gold text-gold"
                  />
                  {review.average.toFixed(1)} · {review.count} {page.reviews}
                </p>
              ) : null}
              <h3 className="mt-2 min-h-12 text-lg font-bold leading-6">
                {product.name}
              </h3>
              <div className="mt-4 flex items-end justify-between gap-3 border-t border-ink/10 pt-3">
                <p className="text-lg font-black">
                  {formatMoney(amount, currency)}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase text-signal">
                  {page.seeProgram}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function LinksHub({ locale }: { locale: LinksLocale }) {
  const page = copy[locale];
  const coachingReview = reviewGroups.coaching;

  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,#08090b_0%,#17191d_48%,#351216_100%)] text-white">
      <div className="mx-auto max-w-[780px] px-4 py-6 sm:px-6 sm:py-10">
        <header className="flex items-center justify-between gap-4">
          <Link className="focus-ring inline-flex items-center gap-3 rounded-md" href={locale === "pt" ? "/" : "/en"}>
            <img
              alt="RumoAoPro"
              className="h-11 w-11 object-contain"
              height={44}
              src={assets.logo}
              width={44}
            />
            <span className="font-display text-lg uppercase">RumoAoPro</span>
          </Link>
          <Link
            aria-label={`${page.languageLabel}. ${page.languageTarget}`}
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 text-sm font-bold transition hover:bg-white hover:text-ink"
            href={page.languageHref}
          >
            <Globe2 aria-hidden="true" className="h-4 w-4" />
            {page.languageLabel}
            <span className="text-white/45">→</span>
            {page.languageTarget}
          </Link>
        </header>

        <section className="pt-9 text-center">
          <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border-4 border-white/90 bg-white shadow-clean sm:h-32 sm:w-32">
            <Image
              alt="Lukaz de Paula"
              className="object-cover object-[50%_28%]"
              fill
              priority
              sizes="128px"
              src={assets.coachFieldProfile}
            />
          </div>
          <h1 className="mt-5 font-display text-4xl uppercase leading-none sm:text-5xl">
            Lukaz de Paula
          </h1>
          <p className="mt-3 text-sm font-bold uppercase text-gold">
            {page.profile}
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/68 sm:text-base">
            {page.intro}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            {socialLinks.map((social) => {
              const Icon = social.icon;

              return (
                <a
                  aria-label={social.label}
                  className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white hover:text-ink"
                  href={social.href}
                  key={social.label}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </section>

        <nav
          aria-label={locale === "pt" ? "Categorias" : "Categories"}
          className="mt-8 flex gap-2 overflow-x-auto border-y border-white/10 py-3 sm:flex-wrap sm:overflow-visible"
        >
          {[
            [page.coachingLabel, "#coaching"],
            [page.professionalsNav, "#professionals"],
            [page.programsPt, "#programas-pt"],
            [page.programsEn, "#programs-en"],
            [page.proofNav, "#reviews"],
            [page.courses, "#courses"]
          ].map(([label, href]) => (
            <a
              className="focus-ring shrink-0 rounded-full bg-white px-4 py-2 text-xs font-bold text-ink transition hover:bg-gold"
              href={href}
              key={href}
            >
              {label}
            </a>
          ))}
        </nav>

        <section className="pt-9" id="coaching">
          <Link
            className="group grid overflow-hidden rounded-lg border border-white/12 bg-signal shadow-clean sm:grid-cols-[0.85fr_1.15fr]"
            href={page.coachingHref}
          >
            <div className="relative min-h-64 overflow-hidden sm:min-h-[330px]">
              <Image
                alt={page.coachingLabel}
                className="object-cover object-[50%_24%] transition duration-500 group-hover:scale-[1.03]"
                fill
                sizes="(max-width: 640px) 100vw, 320px"
                src={assets.coachGymInstruction}
              />
            </div>
            <div className="flex flex-col justify-between p-6 sm:p-7">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase">
                  <span className="rounded-md bg-white px-2.5 py-1.5 text-signal">
                    {page.spots}
                  </span>
                  <span className="inline-flex items-center gap-1 text-white/85">
                    <Star aria-hidden="true" className="h-3.5 w-3.5 fill-current" />
                    {coachingReview.average.toFixed(1)} · {coachingReview.count}
                  </span>
                </div>
                <p className="mt-6 text-sm font-bold uppercase text-white/70">
                  {page.coachingLabel}
                </p>
                <h2 className="mt-2 text-3xl font-black leading-tight">
                  {page.coachingTitle}
                </h2>
                <p className="mt-4 text-sm leading-6 text-white/82">
                  {page.coachingBody}
                </p>
              </div>
              <span className="mt-7 inline-flex items-center gap-2 font-bold">
                {page.coachingButton}
                <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </span>
            </div>
          </Link>
        </section>

        <section className="scroll-mt-8 pt-12" id="professionals">
          <p className="text-sm font-bold uppercase text-gold">
            {page.professionalsEyebrow}
          </p>
          <h2 className="mt-2 max-w-2xl text-2xl font-black leading-tight sm:text-3xl">
            {page.professionalsTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
            {page.professionalsLead}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {professionalAthletes[locale].map((athlete) => (
              <article
                className="overflow-hidden rounded-lg border border-white/12 bg-white/[0.07]"
                key={athlete.name}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-ink">
                  <Image
                    alt={`${athlete.name} · ${athlete.credential}`}
                    className={`object-cover ${athlete.imagePosition}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 244px"
                    src={athlete.image}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(8,9,11,0.92)_100%)]" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="text-xl font-black leading-tight">
                      {athlete.name}
                    </h3>
                    <p className="mt-1 text-xs font-bold uppercase text-gold">
                      {athlete.credential}
                    </p>
                  </div>
                </div>
                <p className="p-4 text-sm leading-6 text-white/68">
                  {athlete.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="scroll-mt-8 pt-12" id="programas-pt">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-sm font-bold uppercase text-gold">RumoAoPro</p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                {page.programsPt}
              </h2>
              <p className="mt-2 text-sm text-white/60">{page.programsPtLead}</p>
            </div>
            <Dumbbell aria-hidden="true" className="h-7 w-7 shrink-0 text-white/35" />
          </div>
          <ProgramRail language="Portuguese" locale={locale} />
        </section>

        <section className="scroll-mt-8 pt-8" id="programs-en">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-sm font-bold uppercase text-ice">International</p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                {page.programsEn}
              </h2>
              <p className="mt-2 text-sm text-white/60">{page.programsEnLead}</p>
            </div>
            <Globe2 aria-hidden="true" className="h-7 w-7 shrink-0 text-white/35" />
          </div>
          <ProgramRail language="English" locale={locale} />
        </section>

        <section className="scroll-mt-8 pt-12" id="reviews">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-sm font-bold uppercase text-gold">
                {page.proofEyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">
                {page.proofTitle}
              </h2>
              <p className="mt-2 text-sm text-white/60">{page.proofLead}</p>
            </div>
            <p className="shrink-0 text-right text-sm font-bold text-white/75">
              <span className="flex items-center justify-end gap-1 text-gold">
                <Star aria-hidden="true" className="h-4 w-4 fill-current" />
                {coachingReview.average.toFixed(1)}
              </span>
              <span className="mt-1 block text-xs font-medium text-white/45">
                {coachingReview.count} {page.reviews}
              </span>
            </p>
          </div>

          <div className="-mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">
            {coachingReview.reviews.map((review) => (
              <article
                className="flex w-[82vw] max-w-[300px] shrink-0 snap-start flex-col justify-between rounded-lg border border-white/12 bg-white/[0.07] p-5"
                key={`${review.name}-${review.date}`}
              >
                <div>
                  <div className="flex gap-1 text-gold">
                    {Array.from({ length: review.rating }).map((_, index) => (
                      <Star
                        aria-hidden="true"
                        className="h-4 w-4 fill-current"
                        key={index}
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-base font-medium leading-7 text-white/88">
                    {review.quote[locale]}
                  </p>
                </div>
                <div className="mt-6 border-t border-white/10 pt-4">
                  <p className="font-bold">{review.name}</p>
                  {review.verified ? (
                    <p className="mt-1 text-xs font-bold uppercase text-white/45">
                      {page.proofVerified}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          <Link
            className="focus-ring mt-2 inline-flex min-h-11 items-center gap-2 rounded-md border border-white/15 px-4 text-sm font-bold transition hover:bg-white hover:text-ink"
            href={page.coachingHref}
          >
            {page.proofButton}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </section>

        <section className="scroll-mt-8 grid gap-4 pt-10 sm:grid-cols-2" id="courses">
          <Link
            className="group overflow-hidden rounded-lg border border-white/12 bg-white text-ink shadow-clean transition hover:-translate-y-1"
            href={page.coursesHref}
          >
            <div className="relative aspect-square overflow-hidden bg-ink">
              <Image
                alt={page.coursesTitle}
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                fill
                sizes="(max-width: 640px) 100vw, 380px"
                src={assets.preparadorProCover}
              />
            </div>
            <div className="p-6">
              <p className="text-xs font-bold uppercase text-signal">{page.courses}</p>
              <h2 className="mt-2 text-2xl font-black leading-tight">
                {page.coursesTitle}
              </h2>
              <p className="mt-3 text-sm leading-6 text-ink/65">{page.coursesBody}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">
                {page.coursesButton}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </span>
            </div>
          </Link>

          <a
            className="group relative min-h-[440px] overflow-hidden rounded-lg border border-white/12 shadow-clean sm:min-h-0"
            href="https://www.youtube.com/@RumoAoPro"
            rel="noreferrer"
            target="_blank"
          >
            <Image
              alt="RumoAoPro YouTube"
              className="object-cover object-[50%_35%] transition duration-500 group-hover:scale-[1.03]"
              fill
              sizes="(max-width: 640px) 100vw, 380px"
              src={assets.coachFieldDrillWide}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,11,0.05)_20%,rgba(8,9,11,0.94)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <div className="flex items-center justify-between gap-4">
                <Youtube aria-hidden="true" className="h-8 w-8 text-signal" />
                <ArrowUpRight aria-hidden="true" className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-2xl font-black leading-tight">
                {page.youtubeTitle}
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/70">
                {page.youtubeBody}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">
                {page.youtubeButton}
              </span>
            </div>
          </a>
        </section>

        <section className="pt-10">
          <Link
            className="focus-ring flex min-h-16 items-center justify-between rounded-lg border border-white/12 bg-white/10 px-5 transition hover:bg-white hover:text-ink"
            href={locale === "pt" ? "/" : "/en"}
          >
            <span className="flex items-center gap-3 font-bold">
              <Target aria-hidden="true" className="h-5 w-5 text-gold" />
              {locale === "pt" ? "Conhecer a RumoAoPro" : "Explore RumoAoPro"}
            </span>
            <ArrowRight aria-hidden="true" className="h-5 w-5" />
          </Link>
        </section>

        <footer className="pb-4 pt-10 text-center text-xs text-white/45">
          © {new Date().getFullYear()} RumoAoPro · Lukaz de Paula
        </footer>
      </div>
    </main>
  );
}
