import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, Check, PlayCircle, Smartphone } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProgramCatalogBrowser } from "@/components/program-catalog-browser";
import { ProgramCatalogPreview } from "@/components/program-catalog-preview";
import { HomeScrollReveal } from "@/components/home-scroll-reveal";
import { getProgramCatalog } from "@/lib/program-catalog";
import { nav } from "@/lib/content";
import editorial from "./home-editorial.module.css";
import styles from "./program-catalog.module.css";

export function ProgramCatalogPage({ locale }: { locale: "pt" | "en" }) {
  const pt = locale === "pt";
  const programs = getProgramCatalog(locale);
  const questions = pt ? [
    ["É uma assinatura?", "Não. Os programas deste catálogo são de compra única. Confira a duração do planejamento, o idioma e os detalhes de acesso na página do programa escolhido."],
    ["Como recebo meu programa?", "Após a confirmação do pagamento, o acesso é disponibilizado na sua conta RaptorPro. Use o e-mail informado na compra e siga as orientações de acesso enviadas pela RumoAoPro."],
    ["Qual é a diferença para a assessoria?", "O programa tem uma estrutura pronta para um objetivo. A assessoria oferece acompanhamento individual e ajustes à sua rotina. Se você precisa de um plano personalizado, conheça a assessoria."],
    ["Posso usar De Volta aos Gramados durante uma lesão?", "O programa é uma progressão de retorno ao campo após liberação profissional. Não substitui avaliação médica, fisioterapia ou reabilitação individual."]
  ] : [
    ["Is this a subscription?", "No. The programs in this catalog are one-time purchases. Check the planning duration, program language and access details on your chosen program page."],
    ["How do I get my program?", "After payment confirmation, access is made available in your RaptorPro account. Use the email entered at checkout and follow the access instructions sent by RumoAoPro."],
    ["How is this different from coaching?", "A program is a ready-made structure for a specific goal. Coaching provides individual support and adjustments to your routine. Explore coaching if you need a personalized plan."],
    ["Can I use Back to the Pitch while injured?", "The program is a return-to-football progression after professional clearance. It does not replace medical assessment, physiotherapy or individual rehabilitation."]
  ];

  return <main className={`${editorial.page} ${styles.catalog}`}>
    <SiteHeader navItems={nav[locale]} ctaHref="#programas" ctaLabel={pt ? "Escolher programa" : "Choose a program"} languageHref={pt ? "/en/programs" : "/programas"} showMobileCta />
    <section className={styles.hero} aria-labelledby="catalog-title">
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <div><p className={styles.eyebrow}><span/>RUMOAOPRO / {pt ? "COLEÇÃO DE PROGRAMAS" : "TRAINING COLLECTION"}</p><h1 id="catalog-title">{pt ? "Seu objetivo." : "Your goal."}<span>{pt ? "Seu próximo programa." : "Your next program."}</span></h1></div>
          <div className={styles.heroDescription}><p>{pt ? "Força, velocidade ou uma nova temporada. Encontre o planejamento que combina com o seu momento e leve o treino com você." : "Strength, speed or a new season. Find the plan that fits your moment and take your training with you."}</p><div className={styles.heroActions}><a className={`${styles.primary} focus-ring`} href="#programas">{pt ? "Explorar programas" : "Explore programs"}<ArrowDown size={18} aria-hidden="true" /></a><a className={`${styles.textLink} focus-ring`} href="#no-aplicativo">{pt ? "Veja no aplicativo" : "See inside the app"}<ArrowUpRight size={16} aria-hidden="true" /></a></div><div className={styles.heroFacts}><span><Check size={15} aria-hidden="true" />{pt ? "Compra única" : "One-time purchase"}</span><span><Smartphone size={15} aria-hidden="true" />{pt ? "Treinos no RaptorPro" : "Training in RaptorPro"}</span></div></div>
        </div>
        <figure className={styles.heroVisual} aria-label={pt ? "Coleção de cinco programas, apresentada como livros em 3D" : "Five-program collection presented as 3D books"}>
          <div className={`${styles.bookShelf} focus-ring`} role="region" tabIndex={0} aria-label={pt ? "Coleção de programas; no celular, deslize para ver todos" : "Program collection; on mobile, swipe to see all"}>{programs.map((program,index) => <div className={styles.heroBook} key={program.id} data-goal={program.id}>
            <span className={styles.bookPages}/><div className={styles.bookFace}>
              <Image src={program.bookImage} alt="" fill priority sizes="(min-width:800px) 210px, 150px" quality={90} style={{objectPosition:program.bookPosition}}/>
              <span className={styles.bookBrand} aria-hidden="true">RUMOAOPRO <b>{String(index+1).padStart(2,"0")}</b></span>
              <div className={styles.bookTitle}><small>{pt ? "PROGRAMA DE TREINO" : "TRAINING PROGRAM"}</small><strong>{program.name}</strong><i/></div>
            </div>
          </div>)}</div>
          <figcaption><span>{String(programs.length).padStart(2,"0")} / {pt ? "PROGRAMAS. DIFERENTES OBJETIVOS." : "PROGRAMS. DIFFERENT GOALS."}</span><strong>{pt ? "Uma coleção. O seu próximo passo." : "One collection. Your next step."}</strong><small className={styles.bookHint}>{pt ? "Deslize para ver a coleção →" : "Swipe to explore the collection →"}</small></figcaption>
        </figure>
      </div>
    </section>

    <ProgramCatalogBrowser locale={locale} programs={programs} />

    <HomeScrollReveal><section className={styles.appSection} id="no-aplicativo" aria-labelledby="catalog-app-title">
      <div className={styles.appInner}><div className={styles.appCopy}><p className={styles.eyebrow}>RAPTORPRO / {pt ? "POR DENTRO DO TREINO" : "INSIDE YOUR TRAINING"}</p><h2 id="catalog-app-title">{pt ? "Do plano ao treino.\nNo seu celular." : "From plan to training.\nOn your phone."}</h2><p>{pt ? "Abra sua semana, veja a sessão e registre o trabalho feito. Experimente as três etapas na prévia ao lado." : "Open your week, follow the session and record your training. Explore the three steps in the preview."}</p><ol className={styles.appSteps}><li><CalendarDays size={21} aria-hidden="true" /><div><strong>{pt ? "Abra o calendário" : "Open your calendar"}</strong><span>{pt ? "Veja as sessões organizadas ao longo do programa." : "See the sessions organized throughout your program."}</span></div></li><li><PlayCircle size={21} aria-hidden="true" /><div><strong>{pt ? "Veja como executar" : "See how to perform"}</strong><span>{pt ? "Consulte vídeos e orientações dos exercícios." : "Follow the exercise videos and instructions."}</span></div></li><li><Check size={21} aria-hidden="true" /><div><strong>{pt ? "Registre seu treino" : "Log your training"}</strong><span>{pt ? "Acompanhe cargas, comentários e RPE." : "Keep track of loads, comments and RPE."}</span></div></li></ol><a className={`${styles.textLink} focus-ring`} href="#programas">{pt ? "Escolher meu programa" : "Choose my program"}<ArrowRight size={17} aria-hidden="true" /></a></div>
      <ProgramCatalogPreview locale={locale}/></div>
    </section></HomeScrollReveal>

    <section className={styles.faq} aria-labelledby="catalog-faq-title"><div><p className={styles.eyebrow}>{pt ? "Antes de começar" : "Before you start"}</p><h2 id="catalog-faq-title">{pt ? "Escolha com clareza." : "Choose with clarity."}</h2></div><div>{questions.map(([question,answer]) => <details key={question}><summary className="focus-ring">{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
    <aside className={styles.coaching}><div><p className={styles.eyebrow}>{pt ? "Precisa de ajustes individuais?" : "Need individual adjustments?"}</p><h2>{pt ? "Sua rotina pede um plano só seu." : "Your routine needs a plan of its own."}</h2></div><Link className={`${styles.textLink} focus-ring`} href={pt ? "/assessoria" : "/en/coaching"}>{pt ? "Conhecer a assessoria" : "Explore coaching"}<ArrowUpRight size={18} aria-hidden="true" /></Link></aside>
    <SiteFooter locale={locale} />
  </main>;
}
