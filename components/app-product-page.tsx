import Link from "next/link";
import { ArrowDown, ArrowUpRight, BarChart3, Dumbbell, MessageCircle, Plus, ShieldCheck, Smartphone } from "lucide-react";
import { AppsHeroDevices } from "@/components/apps-hero-devices";
import { appPageCopy } from "@/components/apps-page-content";
import { CoachingTrainingPreview } from "@/components/coaching-training-preview";
import { HomeLoadProDemo } from "@/components/home-loadpro-demo";
import { LoadProPricing } from "@/components/loadpro-promo";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { contact } from "@/lib/content";
import editorial from "./home-editorial.module.css";
import styles from "./apps-hub-page.module.css";

type AppProductPageProps = { locale: "pt" | "en"; product: "loadpro" | "raptor-pro" };

const loadProAccess = process.env.NEXT_PUBLIC_LOADPRO_APP_URL || "https://loadpro.rumoaopro.com.br";
const raptorAccess = "https://app.rumoaopro.com.br";

export function AppProductPage({ locale, product }: AppProductPageProps) {
  const pt = locale === "pt";
  const load = product === "loadpro";
  const name = load ? "LoadPro" : "Raptor Pro";
  const page = appPageCopy[locale];
  const features = load ? page.loadFeatures : page.raptorFeatures;
  const faq = load ? [page.faq[1]] : [page.faq[3], page.faq[2], page.faq[4], page.faq[5]];
  const access = load ? loadProAccess : raptorAccess;
  const start = load ? "#loadpro" : "#piloto-raptor";
  const languageHref = `${pt ? "/en/apps" : "/apps"}/${product}`;
  const supportHref = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(pt
    ? `Olá! Quero conhecer melhor o ${name}.` : `Hi! I'd like to learn more about ${name}.`)}`;
  const pilotHref = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(pt
    ? "Olá! Quero conhecer o piloto do Raptor Pro para treinadores."
    : "Hi! I'd like to learn about the Raptor Pro coach pilot.")}`;
  const navItems = [
    { label: pt ? "Recursos" : "Features", href: "#recursos" },
    { label: pt ? "Na prática" : "In practice", href: "#demonstracao" },
    { label: load ? (pt ? "Planos" : "Plans") : (pt ? "Piloto para treinadores" : "Coach pilot"), href: start },
    { label: pt ? "Dúvidas" : "FAQ", href: "#duvidas" },
    { label: pt ? "🇺🇸 English" : "🇧🇷 Português", href: languageHref }
  ];

  return <main className={`${editorial.page} ${styles.page}`}>
    <SiteHeader navItems={navItems} ctaLabel={load ? (pt ? "Ver planos" : "See plans") : (pt ? "Conhecer o piloto" : "Explore the pilot")} ctaHref={start} languageHref={languageHref} showMobileCta />
    <section className={styles.hero} aria-labelledby="product-hero-title">
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span />RUMOAOPRO / {load ? (pt ? "CONTROLE DE CARGA" : "TRAINING LOAD") : (pt ? "TREINO E ACOMPANHAMENTO" : "TRAINING & COACHING")}</p>
          <p className={styles.productName}>{name}</p>
          <h1 id="product-hero-title" className={styles.productTitle}>{load
            ? <>{pt ? "Planeje." : "Plan."}<br />{pt ? "Monitore." : "Monitor."}<span>{pt ? "Decida." : "Decide."}</span></>
            : <>{pt ? "Prescreva." : "Prescribe."}<br />{pt ? "Acompanhe." : "Follow up."}<span>{pt ? "Evolua." : "Progress."}</span></>}</h1>
          <p className={styles.heroLead}>{load
            ? (pt ? "Do microciclo às respostas dos atletas. Organize o trabalho e acompanhe a carga da equipe em uma rotina mais clara."
              : "From microcycles to player responses. Organize your work and follow team training load through a clearer daily workflow.")
            : (pt ? "Monte as sessões, acompanhe a execução e use os registros dos atletas para planejar a próxima semana."
              : "Build sessions, follow training execution and use player logs to plan the next week.")}</p>
          <div className={styles.actions}>
            <a className={`${styles.primary} focus-ring`} href={start}>{load ? (pt ? "Testar por 7 dias" : "Try it for 7 days") : (pt ? "Sou treinador: ver piloto" : "I'm a coach: explore the pilot")}<ArrowUpRight size={18} aria-hidden="true" /></a>
            <a className={`${styles.textLink} focus-ring`} href={access}>{pt ? "Já tenho acesso" : "I have access"}<ArrowUpRight size={16} aria-hidden="true" /></a>
          </div>
          <p className={styles.deviceNote}>{load ? <BarChart3 size={15} aria-hidden="true" /> : <Smartphone size={15} aria-hidden="true" />}{load
            ? (pt ? "Teste nos planos mensais. Veja as condições abaixo." : "Trial on monthly plans. See the terms below.")
            : (pt ? "Assessoria, programas e piloto de treinadores por convite." : "Coaching, programs and an invitation-only coach pilot.")}</p>
        </div>
        <AppsHeroDevices locale={locale} product={product} />
      </div>
    </section>

    <section className={styles.section} id="recursos" aria-labelledby="product-features-title">
      <div className={styles.sectionHeading}>
        <div><p className={styles.eyebrow}>01 / {pt ? "NA SUA ROTINA" : "IN YOUR WORKFLOW"}</p><h2 id="product-features-title">{load
          ? (pt ? "O trabalho da semana.\nCom contexto." : "Your weekly work.\nIn context.")
          : (pt ? "O treino continua\ndepois da prescrição." : "Coaching continues\nafter planning.")}</h2></div>
        <p>{load ? (pt ? "Reúna planejamento, coletas e leitura da carga para acompanhar o que foi proposto e como a equipe respondeu."
          : "Bring planning, daily forms and load monitoring together to follow what was planned and how the team responded.")
          : (pt ? "Da orientação do treinador ao feedback do atleta. Calendários e registros ajudam a dar continuidade ao acompanhamento."
            : "From coach guidance to player feedback. Calendars and training logs help keep the coaching process moving.")}</p>
      </div>
      <div className={styles.features}>{features.map(([Icon, title, body], index) => <article key={title}><div><Icon size={23} strokeWidth={1.6} aria-hidden="true" /><span>0{index + 1}</span></div><h3>{title}</h3><p>{body}</p></article>)}</div>
    </section>

    {load ? <>
      <section className={styles.loadPractice} id="demonstracao" aria-labelledby="product-demo-title">
        <div className={styles.section}><div className={styles.productGrid}>
          <div className={styles.productCopy}>
            <p className={styles.eyebrow}>02 / LOADPRO {pt ? "NA PRÁTICA" : "IN PRACTICE"}</p><h2 id="product-demo-title">{pt ? "A equipe responde.\nVocê vê o todo." : "Your team responds.\nYou see the picture."}</h2>
            <p>{pt ? "Explore uma demonstração do painel. Veja como respostas, PSE e duração ajudam a interpretar a carga — com dados ilustrativos."
              : "Explore a dashboard demonstration. See how responses, RPE and duration help interpret training load — using illustrative data."}</p>
            <div className={styles.actions}><a className={`${styles.textLink} focus-ring`} href="#loadpro">{pt ? "Escolher meu plano" : "Choose my plan"}<ArrowDown size={17} aria-hidden="true" /></a></div>
          </div><div className={styles.loadDemo}><HomeLoadProDemo locale={locale} /></div>
        </div></div>
      </section>
      <section className={styles.pricingSection} aria-labelledby="product-pricing-title"><div className={styles.pricingInner}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>03 / {pt ? "PLANOS LOADPRO" : "LOADPRO PLANS"}</p><h2 id="product-pricing-title">{pt ? "Seu espaço\nde trabalho." : "Your coaching\nworkspace."}</h2></div><p>{pt ? "Escolha a capacidade para a sua rotina. As condições de teste, cobrança e renovação aparecem em cada plano e são confirmadas no checkout."
          : "Choose the capacity for your workflow. Trial, billing and renewal terms appear in each plan and are confirmed at checkout."}</p></div>
        <div className={styles.planList} id="loadpro"><LoadProPricing locale={locale} /></div>
      </div></section>
    </> : <>
      <section className={styles.raptorSection} id="demonstracao" aria-labelledby="product-demo-title"><div className={styles.raptorInner}><div className={styles.productGrid}>
        <div className={styles.productCopy}><p className={styles.eyebrow}>02 / RAPTOR PRO {pt ? "NA PRÁTICA" : "IN PRACTICE"}</p><h2 id="product-demo-title">{pt ? "Do treinador\nao atleta." : "From the coach\nto the player."}</h2><p>{pt ? "Explore uma prévia da semana, do feedback e dos ajustes. O aplicativo já é utilizado na assessoria e nos programas compatíveis da RumoAoPro."
          : "Explore a preview of the week, feedback and adjustments. The app is already used in RumoAoPro coaching and compatible programs."}</p><div className={styles.raptorStatus}><span />{pt ? "Demonstração com dados ilustrativos" : "Demonstration with illustrative data"}</div><div className={styles.actions}><a className={`${styles.textLink} focus-ring`} href="#piloto-raptor">{pt ? "Conhecer o piloto para treinadores" : "Explore the coach pilot"}<ArrowDown size={17} aria-hidden="true" /></a></div></div>
        <div className={styles.raptorInteractive}><CoachingTrainingPreview locale={locale} /></div>
      </div></div></section>
      <section className={styles.pilotSection} id="piloto-raptor" aria-labelledby="product-pilot-title"><div className={styles.pilotInner}>
        <div><p className={styles.eyebrow}>03 / {pt ? "GRUPO INICIAL DE TREINADORES" : "INITIAL COACH GROUP"}</p><h2 id="product-pilot-title">{pt ? "Construir junto.\nTreinar melhor." : "Build together.\nTrain better."}</h2><p>{pt ? "O piloto terá 3 treinadores convidados, com 7 dias de acompanhamento para testar a rotina com o aplicativo. O acesso desses participantes continuará gratuito depois do piloto, sem cobrança automática."
          : "The pilot will include 3 invited coaches with 7 days of support to test their workflow in the app. Their access will remain free after the pilot, with no automatic charge."}</p><a className={`${styles.primary} focus-ring`} href={pilotHref} target="_blank" rel="noreferrer">{pt ? "Conversar sobre o piloto" : "Discuss the pilot"}<MessageCircle size={17} aria-hidden="true" /></a><small>{pt ? "Participação por convite, com recursos e escopo do acesso combinados antes da ativação."
          : "Participation by invitation, with features and access scope agreed before activation."}</small></div>
        <div className={styles.accessCards}>
          <article><ShieldCheck size={25} strokeWidth={1.5} aria-hidden="true" /><h3>{pt ? "Já tem acesso ao Raptor?" : "Already have Raptor access?"}</h3><p>{pt ? "Atletas da assessoria e compradores de programas compatíveis entram com a conta já vinculada."
            : "Coaching clients and buyers of compatible programs sign in with their linked account."}</p><a className={`${styles.textLink} focus-ring`} href={raptorAccess}>{pt ? "Entrar no Raptor Pro" : "Open Raptor Pro"}<ArrowUpRight size={16} aria-hidden="true" /></a></article>
          <article><Dumbbell size={25} strokeWidth={1.5} aria-hidden="true" /><h3>{pt ? "Quer um programa de treino?" : "Looking for a training program?"}</h3><p>{pt ? "Conheça os programas disponíveis e confira o acesso ao Raptor Pro na oferta do produto."
            : "Explore the available programs and check Raptor Pro access in the product offer."}</p><Link className={`${styles.textLink} focus-ring`} href={pt ? "/programas" : "/en/programs"}>{pt ? "Ver os programas" : "Explore programs"}<ArrowUpRight size={16} aria-hidden="true" /></Link></article>
        </div>
      </div></section>
    </>}

    <section className={`${styles.section} ${styles.faq}`} id="duvidas" aria-labelledby="product-faq-title">
      <div><p className={styles.eyebrow}>{pt ? "ANTES DE COMEÇAR" : "BEFORE YOU START"}</p><h2 id="product-faq-title">{pt ? "Vamos esclarecer." : "Let's make it clear."}</h2><a className={`${styles.textLink} focus-ring`} href={supportHref} target="_blank" rel="noreferrer">{pt ? `Falar sobre o ${name}` : `Talk about ${name}`}<MessageCircle size={16} aria-hidden="true" /></a></div>
      <div>{faq.map(([question, answer]) => <details key={question}><summary className="focus-ring">{question}<Plus size={18} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div>
    </section>
    <div className={styles.backToApps}><Link className={`${styles.textLink} focus-ring`} href={pt ? "/apps" : "/en/apps"}>{pt ? "Todos os aplicativos RumoAoPro" : "All RumoAoPro apps"}<ArrowUpRight size={15} aria-hidden="true" /></Link></div>
    <SiteFooter locale={locale} />
  </main>;
}
