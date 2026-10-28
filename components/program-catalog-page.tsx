import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, Check, PlayCircle, Smartphone } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProgramCatalogBrowser } from "@/components/program-catalog-browser";
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
      <div className={styles.heroCopy}><p className={styles.eyebrow}>RUMOAOPRO / {pt ? "PROGRAMAS DE TREINO" : "TRAINING PROGRAMS"}</p><h1 id="catalog-title">{pt ? "Um objetivo claro." : "A clear goal."}<span>{pt ? "Um plano para jogar." : "A plan to play."}</span></h1><p>{pt ? "Da academia ao campo. Escolha a preparação que combina com o seu momento e leve o treino com você." : "From the gym to the pitch. Find the preparation that fits your moment and take your training with you."}</p><div className={styles.heroActions}><a className={`${styles.primary} focus-ring`} href="#programas">{pt ? "Encontrar meu programa" : "Find my program"}<ArrowDown size={18} aria-hidden="true" /></a><a className={`${styles.textLink} focus-ring`} href="#no-aplicativo">{pt ? "Veja por dentro" : "Take a look inside"}<ArrowUpRight size={16} aria-hidden="true" /></a></div><div className={styles.heroFacts}><span><Check size={15} aria-hidden="true" />{pt ? "Compra única" : "One-time purchase"}</span><span><Smartphone size={15} aria-hidden="true" />{pt ? "Treinos no RaptorPro" : "Training in RaptorPro"}</span></div></div>
      <figure className={styles.heroPhoto}><Image src="/assets/programs/in-season/refresh-2026-10/match-sprint.jpg" alt={pt ? "Jogadores em disputa de bola durante uma partida de futebol" : "Players competing for the ball during a football match"} fill priority sizes="(min-width: 800px) 50vw, 100vw" /><figcaption><span>01 / {pt ? "O TREINO ENCONTRA O JOGO" : "TRAINING MEETS THE GAME"}</span><strong>{pt ? "Seu trabalho.\nDentro de campo." : "Your work.\nOn the pitch."}</strong></figcaption></figure>
    </section>

    <ProgramCatalogBrowser locale={locale} programs={programs} />

    <section className={styles.appSection} id="no-aplicativo" aria-labelledby="catalog-app-title">
      <div className={styles.appInner}><div className={styles.appCopy}><p className={styles.eyebrow}>RAPTORPRO / {pt ? "POR DENTRO DO TREINO" : "INSIDE YOUR TRAINING"}</p><h2 id="catalog-app-title">{pt ? "Seu plano não fica parado.\nEle vai para o treino." : "Your plan does not sit still.\nIt goes to training."}</h2><p>{pt ? "Abra sua semana, veja a sessão e registre o trabalho feito. O programa organiza o caminho; você acompanha cada etapa no celular." : "Open your week, follow the session and record the work. Your program maps the path; you follow each step on your phone."}</p><ol className={styles.appSteps}><li><CalendarDays size={21} aria-hidden="true" /><div><strong>{pt ? "Abra o calendário" : "Open your calendar"}</strong><span>{pt ? "Veja as sessões organizadas ao longo do programa." : "See the sessions organized throughout your program."}</span></div></li><li><PlayCircle size={21} aria-hidden="true" /><div><strong>{pt ? "Veja como executar" : "See how to perform"}</strong><span>{pt ? "Consulte vídeos e orientações dos exercícios." : "Follow the exercise videos and instructions."}</span></div></li><li><Check size={21} aria-hidden="true" /><div><strong>{pt ? "Registre seu treino" : "Log your training"}</strong><span>{pt ? "Acompanhe cargas, comentários e RPE." : "Keep track of loads, comments and RPE."}</span></div></li></ol><a className={`${styles.textLink} focus-ring`} href="#programas">{pt ? "Escolher meu programa" : "Choose my program"}<ArrowRight size={17} aria-hidden="true" /></a></div>
      <figure className={styles.phone}><div className={styles.phoneLabel}>RAPTORPRO <span>{pt ? "TELA REAL" : "ACTUAL SCREEN"}</span></div><Image src="/assets/programs/in-season/refresh-2026-10/raptor-calendar-pt.png" alt={pt ? "Calendário real do In-Season Pro no RaptorPro, em português" : "Actual In-Season Pro calendar inside RaptorPro, shown in Portuguese"} width={543} height={743} sizes="(min-width: 800px) 300px, 260px" /><figcaption>{pt ? "Exemplo: In-Season Pro · tela em português" : "Example: In-Season Pro · Portuguese screen"}</figcaption></figure></div>
    </section>

    <section className={styles.faq} aria-labelledby="catalog-faq-title"><div><p className={styles.eyebrow}>{pt ? "Antes de começar" : "Before you start"}</p><h2 id="catalog-faq-title">{pt ? "Escolha com clareza." : "Choose with clarity."}</h2></div><div>{questions.map(([question,answer]) => <details key={question}><summary className="focus-ring">{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
    <aside className={styles.coaching}><div><p className={styles.eyebrow}>{pt ? "Precisa de ajustes individuais?" : "Need individual adjustments?"}</p><h2>{pt ? "Sua rotina pede um plano só seu." : "Your routine needs a plan of its own."}</h2></div><Link className={`${styles.textLink} focus-ring`} href={pt ? "/assessoria" : "/en/coaching"}>{pt ? "Conhecer a assessoria" : "Explore coaching"}<ArrowUpRight size={18} aria-hidden="true" /></Link></aside>
    <SiteFooter locale={locale} />
  </main>;
}
