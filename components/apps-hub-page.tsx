import Link from "next/link";
import { ArrowDown, ArrowUpRight, BarChart3, CalendarDays, Check, MessageCircle, Smartphone } from "lucide-react";
import { AppsHeroDevices } from "@/components/apps-hero-devices";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { contact, nav } from "@/lib/content";
import editorial from "./home-editorial.module.css";
import styles from "./apps-hub-page.module.css";

export function AppsHubPage({ locale }: { locale: "pt" | "en" }) {
  const pt = locale === "pt";
  const prefix = pt ? "/apps" : "/en/apps";
  const supportHref = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(pt
    ? "Olá! Gostaria de ajuda para escolher entre LoadPro e Raptor Pro."
    : "Hi! I'd like help choosing between LoadPro and Raptor Pro.")}`;
  const apps = [
    {
      id: "loadpro", name: "LoadPro", Icon: BarChart3, href: `${prefix}/loadpro`,
      category: pt ? "EQUIPE & CONTROLE DE CARGA" : "TEAM & TRAINING LOAD",
      title: pt ? "Veja como a equipe responde." : "See how your team responds.",
      body: pt ? "Para o treinador que precisa organizar o microciclo, acompanhar as coletas e monitorar a carga da equipe."
        : "For coaches who need to organize the microcycle, review daily forms and monitor team training load.",
      features: pt ? ["Planejamento semanal", "Coletas pré e pós-treino", "Painéis e relatórios de carga"]
        : ["Weekly planning", "Pre and post-training forms", "Training-load dashboards and reports"],
      status: pt ? "Planos com teste de 7 dias" : "Plans with a 7-day trial"
    },
    {
      id: "raptorpro", name: "Raptor Pro", Icon: Smartphone, href: `${prefix}/raptor-pro`,
      category: pt ? "TREINO & ACOMPANHAMENTO" : "TRAINING & COACHING",
      title: pt ? "Conecte o plano ao atleta." : "Connect the plan to the player.",
      body: pt ? "Para prescrever sessões, acompanhar a execução e consultar os registros e a evolução de cada atleta."
        : "Build sessions, follow their execution and review each player's training logs and progress.",
      features: pt ? ["Calendário de treinos", "Registro de exercícios e evolução", "Atletas individuais e equipes"]
        : ["Training calendar", "Exercise logs and progression", "Individual athletes and teams"],
      status: pt ? "Assessoria, programas e piloto por convite" : "Coaching, programs and an invitation-only pilot"
    }
  ];

  return <main className={`${editorial.page} ${styles.page}`}>
    <SiteHeader navItems={nav[locale]} ctaHref="#aplicativos" ctaLabel={pt ? "Escolher aplicativo" : "Choose your app"} languageHref={pt ? "/en/apps" : "/apps"} />
    <section className={styles.hero} aria-labelledby="apps-hero-title">
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span />RUMOAOPRO / {pt ? "APLICATIVOS PARA O FUTEBOL" : "APPS FOR FOOTBALL"}</p>
          <h1 id="apps-hero-title">{pt ? "Dois apps." : "Two apps."}<span>{pt ? "Seu futebol." : "Your game."}</span></h1>
          <p className={styles.heroLead}>{pt ? "Ferramentas para momentos diferentes da sua rotina. Conheça cada aplicativo e escolha por onde começar."
            : "Tools for different parts of your workflow. Explore each app and choose where to start."}</p>
          <div className={styles.actions}><a className={`${styles.primary} focus-ring`} href="#aplicativos">{pt ? "Encontrar meu aplicativo" : "Find my app"}<ArrowDown size={18} aria-hidden="true" /></a></div>
          <p className={styles.deviceNote}><CalendarDays size={15} aria-hidden="true" />{pt ? "Da rotina da comissão ao treino de cada atleta." : "From the staff workflow to each player's training."}</p>
        </div>
        <AppsHeroDevices locale={locale} />
      </div>
    </section>
    <section className={styles.section} id="aplicativos" aria-labelledby="choose-app-title">
      <div className={styles.sectionHeading}>
        <div><p className={styles.eyebrow}>{pt ? "ESCOLHA SEU PRÓXIMO PASSO" : "CHOOSE YOUR NEXT STEP"}</p><h2 id="choose-app-title">{pt ? "Qual é a sua\nprioridade hoje?" : "What is your\npriority today?"}</h2></div>
        <p>{pt ? "Cada aplicativo tem sua própria página, com recursos, demonstração e orientações para começar."
          : "Each app has its own page with features, a demonstration and guidance to get started."}</p>
      </div>
      <div className={styles.gatewayCards}>{apps.map(({ id, name, Icon, href, category, title, body, features, status }, index) =>
        <article key={id} id={id} className={styles.gatewayCard}>
          <div className={styles.gatewayBrand}><Icon size={25} strokeWidth={1.5} aria-hidden="true" /><span>0{index + 1} / {category}</span></div>
          <p className={styles.gatewayApp}>{name}</p><h3>{title}</h3><p className={styles.gatewayBody}>{body}</p>
          <ul>{features.map(feature => <li key={feature}><Check size={15} aria-hidden="true" />{feature}</li>)}</ul>
          <small>{status}</small><Link className={`${styles.primary} focus-ring`} href={href}>{pt ? `Conhecer o ${name}` : `Explore ${name}`}<ArrowUpRight size={18} aria-hidden="true" /></Link>
        </article>)}
      </div>
      <div className={styles.gatewayHelp}><p>{pt ? "Quer ajuda para escolher? Conte como você trabalha hoje." : "Need help choosing? Tell us about your current workflow."}</p><a className={`${styles.textLink} focus-ring`} href={supportHref} target="_blank" rel="noreferrer">{pt ? "Falar com a RumoAoPro" : "Talk to RumoAoPro"}<MessageCircle size={17} aria-hidden="true" /></a></div>
    </section>
    <SiteFooter locale={locale} />
  </main>;
}
