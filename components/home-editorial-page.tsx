import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Smartphone } from "lucide-react";
import { ProgramGoalFinder } from "@/components/program-goal-finder";
import { ReviewsSection } from "@/components/reviews";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { assets, nav } from "@/lib/content";
import styles from "./home-editorial.module.css";

const copy = {
  pt: {
    eyebrow: "Preparação física para o futebol",
    title: "Seu próximo nível",
    titleAccent: "começa no treino.",
    intro: "Programas, acompanhamento e tecnologia para transformar sua rotina de treino. Dentro e fora de campo.",
    primary: "Encontrar meu programa",
    secondary: "Quero acompanhamento",
    caption: "Campo. Academia. Jogo.",
    captionNote: "O trabalho por trás da performance.",
    explore: "Explore a RumoAoPro",
    paths: [
      ["Para atletas", "Programas de treino", "#programas"],
      ["Acompanhamento individual", "Assessoria online", "/assessoria"],
      ["Para treinadores", "LoadPro e formação", "#treinadores"]
    ],
    appEyebrow: "Seu programa. No seu celular.",
    appTitle: "Menos improviso.\nMais direção.",
    appBody: "Os programas interativos ficam dentro do RaptorPro. Abra sua semana, siga os exercícios e registre o trabalho feito.",
    appPoints: ["Calendário de treinos organizado", "Exercícios com vídeos e orientações", "Registro de cargas, comentários e RPE"],
    appLink: "Explorar os programas",
    appCaption: "Tela real do In-Season Pro no RaptorPro",
    appAlt: "Calendário do programa In-Season Pro no aplicativo RaptorPro",
    coachingEyebrow: "Assessoria online",
    coachingTitle: "Seu calendário muda.\nSeu plano acompanha.",
    coachingBody: "Jogos, treinos do time, viagens e recuperação. Um acompanhamento individual para organizar o trabalho ao redor da sua realidade.",
    coachingCta: "Conhecer a assessoria",
    coachingAlt: "Lukaz de Paula acompanhando um treino de velocidade no campo",
    toolsEyebrow: "Do outro lado do treino",
    toolsTitle: "Você cuida dos atletas.\nNós ajudamos com o resto.",
    toolsBody: "Ferramentas e formação para quem planeja a performance.",
    loadLabel: "Gestão para treinadores",
    loadTitle: "A semana do seu time,\nem um só lugar.",
    loadBody: "Organize o microciclo, acompanhe prontidão e carga e compartilhe informações com a comissão.",
    loadCta: "Conhecer o LoadPro",
    loadCaption: "LoadPro · ambiente de demonstração",
    courseLabel: "Formação em português",
    courseTitle: "Preparador PRO",
    courseBody: "Da teoria à rotina do campo: preparação física, avaliações e planejamento para o futebol.",
    courseCta: "Explorar o curso",
    coachEyebrow: "Por trás da RumoAoPro",
    coachTitle: "Quem vive o jogo\nentende o treino.",
    coachBody: "Sou Lukaz de Paula, preparador físico com licença CBF A e jogador. A RumoAoPro conecta minha experiência no campo, na academia e na preparação de atletas.",
    credentials: ["Preparador físico · CBF A", "Experiência como treinador e jogador"],
    coachAlt: "Lukaz de Paula orientando atletas na academia",
    reviewsEyebrow: "Experiências da assessoria",
    reviewsTitle: "O trabalho, na voz de quem treina.",
    finalTitle: "Seu próximo treino\npode ter mais direção.",
    finalCta: "Ver programas",
    finalSecondary: "Conhecer a assessoria",
    programs: "/programas", coaching: "/assessoria", apps: "/apps", courses: "/cursos", language: "/en"
  },
  en: {
    eyebrow: "Physical preparation for football",
    title: "Your next level",
    titleAccent: "starts in training.",
    intro: "Programs, coaching and technology to give your training a clear direction. On and off the pitch.",
    primary: "Find my program",
    secondary: "I want coaching",
    caption: "Pitch. Gym. Match.",
    captionNote: "The work behind performance.",
    explore: "Explore RumoAoPro",
    paths: [
      ["For players", "Training programs", "#programas"],
      ["Individual support", "Online coaching", "/en/coaching"],
      ["For coaches", "LoadPro & education", "#treinadores"]
    ],
    appEyebrow: "Your program. On your phone.",
    appTitle: "Less guesswork.\nMore direction.",
    appBody: "Interactive programs live inside RaptorPro. Open your week, follow the exercises and log the work you put in.",
    appPoints: ["An organized training calendar", "Exercises with videos and guidance", "Load, comments and RPE tracking"],
    appLink: "Explore the programs",
    appCaption: "Real In-Season Pro screen · Portuguese interface shown",
    appAlt: "In-Season Pro calendar inside RaptorPro, shown in Portuguese",
    coachingEyebrow: "Online coaching",
    coachingTitle: "Your schedule changes.\nYour plan follows.",
    coachingBody: "Matches, team sessions, travel and recovery. Individual coaching to organize your training around your real life.",
    coachingCta: "Explore online coaching",
    coachingAlt: "Lukaz de Paula coaching a speed session on the pitch",
    toolsEyebrow: "On the other side of training",
    toolsTitle: "You look after the players.\nWe help with the rest.",
    toolsBody: "Tools and education for the people planning performance.",
    loadLabel: "Management for coaches",
    loadTitle: "Your team's week.\nAll in one place.",
    loadBody: "Plan the microcycle, monitor readiness and training load, and share information with your staff.",
    loadCta: "Explore LoadPro",
    loadCaption: "LoadPro · demo environment, Portuguese interface",
    courseLabel: "Course taught in Portuguese",
    courseTitle: "Preparador PRO",
    courseBody: "From theory to the pitch: physical preparation, assessments and planning for football.",
    courseCta: "Explore the course",
    coachEyebrow: "Behind RumoAoPro",
    coachTitle: "Know the game.\nUnderstand the training.",
    coachBody: "I'm Lukaz de Paula, a CBF A licensed physical coach and player. RumoAoPro brings together my experience on the pitch, in the gym and coaching athletes.",
    credentials: ["Physical coach · CBF A", "Experience as a coach and a player"],
    coachAlt: "Lukaz de Paula coaching players in the gym",
    reviewsEyebrow: "Coaching experiences",
    reviewsTitle: "The work, in the players' words.",
    finalTitle: "Give your next session\na clear direction.",
    finalCta: "Explore programs",
    finalSecondary: "Explore coaching",
    programs: "/en/programs", coaching: "/en/coaching", apps: "/en/apps", courses: "/en/courses", language: "/"
  }
} as const;

export function HomeEditorialPage({ locale }: { locale: "pt" | "en" }) {
  const page = copy[locale];
  return (
    <main className={styles.page}>
      <SiteHeader navItems={nav[locale]} ctaHref="#programas" ctaLabel={page.finalCta} languageHref={page.language} showMobileCta />
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span />{page.eyebrow}</p>
          <h1>{page.title}<span>{page.titleAccent}</span></h1>
          <p className={styles.intro}>{page.intro}</p>
          <div className={styles.actions}>
            <Link className={`${styles.primary} focus-ring`} href="#programas">{page.primary}<ArrowRight aria-hidden="true" size={19} /></Link>
            <Link className={`${styles.textLink} focus-ring`} href={page.coaching}>{page.secondary}<ArrowUpRight aria-hidden="true" size={18} /></Link>
          </div>
          <a className={`${styles.explore} focus-ring`} href="#entradas">{page.explore}<ArrowDown aria-hidden="true" size={16} /></a>
        </div>
        <figure className={styles.heroPhoto}>
          <Image src={assets.sprintSide} alt={locale === "pt" ? "Lukaz de Paula em um treino de aceleração no campo" : "Lukaz de Paula accelerating during a field training session"} fill priority sizes="(min-width: 1024px) 56vw, 100vw" />
          <figcaption><strong>{page.caption}</strong><span>{page.captionNote}</span></figcaption>
        </figure>
      </section>
      <nav aria-label={page.explore} className={styles.paths} id="entradas">
        {page.paths.map(([label, title, href], index) => <Link className="focus-ring" href={href} key={title}>
          <span className={styles.pathNumber}>0{index + 1}</span><span><small>{label}</small><strong>{title}</strong></span><ArrowUpRight aria-hidden="true" size={23} />
        </Link>)}
      </nav>

      <section className={`${styles.section} ${styles.programFinder}`} id="programas">
        <ProgramGoalFinder locale={locale} />
      </section>

      <section className={styles.appSection}>
        <div className={`${styles.section} ${styles.appGrid}`}>
          <div>
            <p className={styles.eyebrow}><Smartphone aria-hidden="true" size={16} />{page.appEyebrow}</p>
            <h2>{page.appTitle}</h2><p className={styles.body}>{page.appBody}</p>
            <ul className={styles.checks}>{page.appPoints.map(point => <li key={point}><Check aria-hidden="true" size={18} />{point}</li>)}</ul>
            <Link className={`${styles.darkButton} focus-ring`} href={page.programs}>{page.appLink}<ArrowRight aria-hidden="true" size={18} /></Link>
          </div>
          <figure className={styles.appFigure}>
            <div className={styles.phone}><Image src="/assets/programs/in-season/refresh-2026-10/raptor-calendar-pt.png" alt={page.appAlt} width={558} height={764} sizes="(min-width: 768px) 330px, 80vw" /></div>
            <figcaption>{page.appCaption}</figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.coaching}>
        <figure><Image src={assets.coachFieldDrillWide} alt={page.coachingAlt} fill sizes="(min-width: 768px) 55vw, 100vw" /></figure>
        <div><p className={styles.eyebrow}>{page.coachingEyebrow}</p><h2>{page.coachingTitle}</h2><p className={styles.body}>{page.coachingBody}</p><Link href={page.coaching} className={`${styles.primary} focus-ring`}>{page.coachingCta}<ArrowUpRight aria-hidden="true" size={18} /></Link></div>
      </section>

      <section className={`${styles.section} ${styles.tools}`} id="treinadores">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>{page.toolsEyebrow}</p><h2>{page.toolsTitle}</h2></div><p className={styles.body}>{page.toolsBody}</p></div>
        <div className={styles.toolsGrid}>
          <article className={styles.loadPro}>
            <div className={styles.toolCopy}><p className={styles.eyebrow}>{page.loadLabel}</p><Image src="/assets/loadpro/loadpro-logo-white-red-transparent.png" alt="LoadPro" width={340} height={72} className={styles.loadLogo} /><h3>{page.loadTitle}</h3><p>{page.loadBody}</p><Link className={`${styles.textLink} focus-ring`} href={page.apps}>{page.loadCta}<ArrowUpRight aria-hidden="true" size={18} /></Link></div>
            <figure><Image src="/assets/loadpro/product-dashboard-monitoring-v2.png" alt={locale === "pt" ? "Painel de demonstração do LoadPro com monitoramento de atletas" : "LoadPro demo dashboard for athlete monitoring"} width={1265} height={712} sizes="(min-width: 1024px) 65vw, 100vw" /><figcaption>{page.loadCaption}</figcaption></figure>
          </article>
          <article className={styles.course} id={locale === "pt" ? "cursos" : "courses"}>
            <div className={styles.coursePhoto}><Image src={assets.programsGymBriefing} alt={page.coachAlt} fill sizes="(min-width: 1024px) 35vw, 100vw" /></div>
            <div className={styles.toolCopy}><p className={styles.eyebrow}>{page.courseLabel}</p><h3>{page.courseTitle}</h3><p>{page.courseBody}</p><Link className={`${styles.textLink} focus-ring`} href={page.courses}>{page.courseCta}<ArrowUpRight aria-hidden="true" size={18} /></Link></div>
          </article>
        </div>
      </section>

      <section className={`${styles.section} ${styles.founder}`}>
        <Image src="/assets/photos/lukaz-trainer-hero.jpg" alt={page.coachAlt} width={600} height={800} sizes="(min-width: 768px) 350px, 100vw" />
        <div><p className={styles.eyebrow}>{page.coachEyebrow}</p><h2>{page.coachTitle}</h2><p className={styles.body}>{page.coachBody}</p><ul className={styles.credentials}>{page.credentials.map(item => <li key={item}>{item}</li>)}</ul><p className={styles.signature}>Lukaz de Paula<span>RumoAoPro</span></p></div>
      </section>
      <div className={styles.reviews}><ReviewsSection groupKey="coaching" locale={locale} eyebrow={page.reviewsEyebrow} title={page.reviewsTitle} /></div>
      <section className={styles.final}><h2>{page.finalTitle}</h2><div className={styles.actions}><Link href={page.programs} className={`${styles.primary} focus-ring`}>{page.finalCta}<ArrowRight aria-hidden="true" size={19} /></Link><Link href={page.coaching} className={`${styles.textLink} focus-ring`}>{page.finalSecondary}<ArrowUpRight aria-hidden="true" size={18} /></Link></div></section>
      <SiteFooter />
    </main>
  );
}
