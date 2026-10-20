import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, Smartphone } from "lucide-react";
import { elangaSalesCopy } from "@/components/elanga-sales-page";
import { ProgramPurchaseSummary } from "@/components/program-purchase-summary";
import { ReviewsSection } from "@/components/reviews";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { shopifyProducts } from "@/lib/content";
import { getReviewGroupForProgramHref } from "@/lib/reviews";
import styles from "./in-season-editorial.module.css";

const assets = "/assets/programs/in-season/refresh-2026-10";
const copy = {
  pt: {
    eyebrow: "In-Season Pro · Dentro do RaptorPro",
    title: "Força e velocidade.\nDurante toda a temporada.",
    lead: "28 semanas de treinos de suporte para encaixar entre os jogos e os treinos do time.",
    demo: "Conheça por dentro",
    note: "Compra única. Acesso no RaptorPro após a confirmação do pagamento.",
    photoAlt: "Disputa de bola durante a partida entre Almuñécar e VCF",
    photoCaption: "O treino faz sentido quando encontra o jogo.",
    stats: [["28", "semanas"], ["7", "fases"], ["1 ou 2", "jogos por semana"]],
    rhythmEyebrow: "O jogo vem primeiro",
    rhythmTitle: "Seu treino extra precisa caber na sua temporada.",
    rhythmBody: "Força na academia. Velocidade no campo. Trabalho de suporte organizado ao redor das partidas — sem tentar fazer uma offseason no meio do campeonato.",
    rhythmPoints: ["Força e potência", "Velocidade de campo", "Volume ajustável à semana"],
    sprintAlt: "Jogadores em uma arrancada com a bola durante a partida",
    credit: "Fotos: Federico Luis Savio Muñoz · Almuñécar x VCF",
    appEyebrow: "Assim é por dentro",
    appTitle: "Abra sua semana.\nSaiba o que fazer.",
    appBody: "O In-Season fica na sua conta RaptorPro. Você abre o dia, encontra a sessão e acompanha o treino pelo celular.",
    appSteps: [
      ["Veja o calendário", "Academia, campo, jogos e descanso organizados na semana."],
      ["Siga a sessão", "Exercícios, instruções e vídeos reunidos no app."],
      ["Acompanhe o trabalho", "Registre sua execução e consulte o que já foi feito."]
    ],
    screenAlt: "Tela atual do calendário do In-Season Pro no RaptorPro em português",
    screenCaption: "Tela real do In-Season Pro · RaptorPro",
    structureEyebrow: "O que você recebe",
    structureTitle: "Uma temporada organizada.\nNão uma lista de exercícios.",
    sessions: ["Força + potência", "Membros superiores + core", "Velocidade no campo"],
    detailsLabel: "Explore a estrutura do programa",
    phasesTitle: "28 semanas, divididas em 7 fases",
    phases: ["Fundação", "Base de força", "Força máxima", "Desenvolvimento de potência", "Força-velocidade", "Potência para o jogo", "Performance e manutenção"],
    phase: "Fase",
    weeks: "Semanas",
    rulesTitle: "Como encaixar na semana",
    rules: [
      "Organize as sessões pela distância até o próximo jogo.",
      "Em semanas com duas partidas, reduza o trabalho extra e priorize a recuperação.",
      "Ajuste o volume conforme os minutos jogados e a sensação das pernas."
    ],
    fitTitle: "É para o seu momento?",
    fitYes: "Para quem está em temporada",
    fitNo: "Não substitui acompanhamento individual",
    fitNote: "Se você está voltando de lesão sem liberação ou precisa de ajustes individuais, este não é o ponto de partida indicado.",
    accessTitle: "Da compra ao primeiro treino.",
    accessSteps: [
      ["Escolha o pagamento", "Pix ou cartão no Brasil. Cartão para compras internacionais."],
      ["Receba seu acesso", "Após a confirmação, o programa é liberado na sua conta RaptorPro."],
      ["Abra o programa", "Acesse sua semana e siga as sessões pelo celular."]
    ],
    reviewsTitle: "Quem treina também conta.",
    coachEyebrow: "Metodologia RumoAoPro",
    coachTitle: "Da rotina do futebol para a sua semana.",
    coachBody: "Um programa organizado por Lukaz de Paula, preparador físico e jogador, para conectar o trabalho de academia às exigências do campo.",
    coachAlt: "Lukaz de Paula orientando um exercício de força na academia",
    faqTitle: "Ficou alguma dúvida?",
    finalTitle: "Sua próxima semana começa com um plano.",
    finalBody: "In-Season Pro. 28 semanas organizadas dentro do RaptorPro."
  },
  en: {
    eyebrow: "In-Season Pro · Inside RaptorPro",
    title: "Strength and speed.\nAll season long.",
    lead: "28 weeks of support training to fit between matches and team sessions.",
    demo: "See inside the program",
    note: "One-time purchase. RaptorPro access after payment confirmation.",
    photoAlt: "Players competing for the ball during Almuñécar versus VCF",
    photoCaption: "Training matters when it meets the game.",
    stats: [["28", "weeks"], ["7", "phases"], ["1 or 2", "matches per week"]],
    rhythmEyebrow: "The game comes first",
    rhythmTitle: "Your extra training needs to fit your season.",
    rhythmBody: "Strength in the gym. Speed on the pitch. Support work organized around matches — without forcing an offseason into your competitive schedule.",
    rhythmPoints: ["Strength and power", "On-pitch speed", "Adaptable weekly volume"],
    sprintAlt: "Players sprinting with the ball during a match",
    credit: "Photos: Federico Luis Savio Muñoz · Almuñécar vs VCF",
    appEyebrow: "Inside the program",
    appTitle: "Open your week.\nKnow what to do.",
    appBody: "In-Season lives in your RaptorPro account. Open a day, find the session and follow your training on your phone.",
    appSteps: [
      ["See the calendar", "Gym, pitch, matches and rest organized across the week."],
      ["Follow the session", "Exercises, instructions and videos together in the app."],
      ["Track your work", "Log your training and review what you have completed."]
    ],
    screenAlt: "Current In-Season Pro calendar in RaptorPro, shown in Portuguese",
    screenCaption: "Real In-Season Pro screen · Portuguese interface shown",
    structureEyebrow: "What's included",
    structureTitle: "An organized season.\nNot just a list of exercises.",
    sessions: ["Strength + power", "Upper body + core", "On-pitch speed"],
    detailsLabel: "Explore the program structure",
    phasesTitle: "28 weeks across 7 phases",
    phases: ["Foundation", "Strength base", "Maximum strength", "Power development", "Speed-strength", "Match-ready power", "Performance and maintenance"],
    phase: "Phase",
    weeks: "Weeks",
    rulesTitle: "How to fit your week",
    rules: [
      "Place sessions according to the time left before your next match.",
      "In two-match weeks, reduce extra work and prioritize recovery.",
      "Adjust volume to your playing minutes and how your legs feel."
    ],
    fitTitle: "Is this your moment?",
    fitYes: "For players in-season",
    fitNo: "Not a replacement for individual coaching",
    fitNote: "If you are returning from injury without clearance or need individual adjustments, this is not the right starting point.",
    accessTitle: "From purchase to your first session.",
    accessSteps: [
      ["Choose your payment", "International cards. Card or Pix for purchases in Brazil."],
      ["Get your access", "After confirmation, the program is released to your RaptorPro account."],
      ["Open the program", "Find your week and follow the sessions on your phone."]
    ],
    reviewsTitle: "Hear from the players.",
    coachEyebrow: "RumoAoPro methodology",
    coachTitle: "From the football schedule to your week.",
    coachBody: "A program organized by performance coach and player Lukaz de Paula, connecting gym training to the demands of the pitch.",
    coachAlt: "Lukaz de Paula coaching a strength exercise in the gym",
    faqTitle: "A few things worth knowing.",
    finalTitle: "Your next week starts with a plan.",
    finalBody: "In-Season Pro. 28 weeks organized inside RaptorPro."
  }
} as const;

export function InSeasonEditorialPage({ locale }: { locale: "pt" | "en" }) {
  const page = elangaSalesCopy[locale];
  const text = copy[locale];
  const checkoutHref = locale === "en" ? "/en/checkout/elanga-in-season" : shopifyProducts.elanga;
  const coachingHref = locale === "en" ? "/en/coaching#application" : "/assessoria#aplicacao";
  const reviewGroupKey = getReviewGroupForProgramHref(
    locale === "pt" ? "/programas/elanga-in-season" : "/en/programs/elanga-in-season"
  );
  const buyLink = (
    <a className={`${styles.buy} focus-ring`} href={checkoutHref}>
      {page.primaryCta}<ArrowRight aria-hidden="true" size={18} />
    </a>
  );

  return (
    <main className={styles.page}>
      <SiteHeader navItems={page.nav} ctaHref={checkoutHref} ctaLabel={page.ctaLabel} languageHref={page.languageHref} showMobileCta />
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{text.eyebrow}</p>
          <h1>{text.title}</h1>
          <p className={styles.lead}>{text.lead}</p>
          <ProgramPurchaseSummary compact locale={locale} />
          <div className={styles.actions}>{buyLink}<Link className={`${styles.textLink} focus-ring`} href="#raptorpro">{text.demo}<ArrowRight aria-hidden="true" size={16} /></Link></div>
          <p className={styles.small}>{text.note}</p>
        </div>
        <figure className={styles.heroPhoto}>
          <Image alt={text.photoAlt} src={`${assets}/match-duel.jpg`} fill priority sizes="(min-width: 1024px) 52vw, 100vw" />
          <figcaption><span>IN-SEASON PRO</span>{text.photoCaption}</figcaption>
        </figure>
      </section>
      <div className={styles.stats}>{text.stats.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>

      <section className={`${styles.section} ${styles.rhythm}`}>
        <figure>
          <Image alt={text.sprintAlt} src={`${assets}/match-sprint.jpg`} width={2048} height={1356} sizes="(min-width: 1024px) 55vw, 100vw" />
          <figcaption className={styles.credit}>{text.credit}</figcaption>
        </figure>
        <div><p className={styles.eyebrow}>{text.rhythmEyebrow}</p><h2>{text.rhythmTitle}</h2><p className={styles.body}>{text.rhythmBody}</p>
          <ul className={styles.ticks}>{text.rhythmPoints.map(item => <li key={item}><Check aria-hidden="true" size={17} />{item}</li>)}</ul>
        </div>
      </section>

      <section className={styles.appSection} id="raptorpro">
        <div className={`${styles.section} ${styles.appGrid}`}>
          <div>
            <p className={styles.eyebrow}><Smartphone aria-hidden="true" size={16} />{text.appEyebrow}</p>
            <h2>{text.appTitle}</h2><p className={styles.body}>{text.appBody}</p>
            <ol className={styles.steps}>{text.appSteps.map(([title, body], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol>
          </div>
          <figure className={styles.phoneFigure}>
            <div className={styles.phone}><Image alt={text.screenAlt} src={`${assets}/raptor-calendar-pt.png`} width={558} height={764} sizes="(min-width: 768px) 390px, 80vw" /></div>
            <figcaption>{text.screenCaption}</figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.section} id="estrutura">
        <p className={styles.eyebrow}>{text.structureEyebrow}</p><h2>{text.structureTitle}</h2>
        <div className={styles.sessions}>{page.sessions.map((session, index) => {
          const Icon = session.icon;
          return <article key={session.title}><Icon aria-hidden="true" size={23} /><h3>{text.sessions[index]}</h3><p>{session.body}</p></article>;
        })}</div>
        <details className={styles.detail}>
          <summary>{text.detailsLabel}<ChevronDown aria-hidden="true" size={20} /></summary>
          <div className={styles.detailContent}>
            <div><h3>{text.phasesTitle}</h3><ol className={styles.phases}>{text.phases.map((phase, index) => <li key={phase}>
              <span>{text.phase} {index + 1} · {text.weeks} {index * 4 + 1}–{index * 4 + 4}</span><strong>{phase}</strong>
            </li>)}</ol></div>
            <div><h3>{text.rulesTitle}</h3><ul className={styles.rules}>{text.rules.map(rule => <li key={rule}>{rule}</li>)}</ul></div>
          </div>
        </details>
      </section>
      <section className={styles.fitSection}>
        <div className={styles.section}>
          <p className={styles.eyebrow}>{text.fitTitle}</p>
          <div className={styles.fitGrid}>
            <div><h2>{text.fitYes}</h2><ul className={styles.ticks}>{page.goodFit.map(item => <li key={item}><Check aria-hidden="true" size={17} />{item}</li>)}</ul></div>
            <div className={styles.fitNote}><h3>{text.fitNo}</h3><p>{text.fitNote}</p><Link className={`${styles.textLink} focus-ring`} href={coachingHref}>{page.coachingCta}<ArrowRight aria-hidden="true" size={16} /></Link></div>
          </div>
        </div>
      </section>
      <div className={styles.reviews}><ReviewsSection groupKey={reviewGroupKey} locale={locale} title={text.reviewsTitle} tone="dark" /></div>
      <section className={`${styles.section} ${styles.coach}`}>
        <Image alt={text.coachAlt} src="/assets/photos/lukaz-gym-instruction.jpg" width={800} height={900} sizes="(min-width: 768px) 320px, 100vw" />
        <div><p className={styles.eyebrow}>{text.coachEyebrow}</p><h2>{text.coachTitle}</h2><p className={styles.body}>{text.coachBody}</p></div>
      </section>
      <section className={`${styles.section} ${styles.access}`}>
        <h2>{text.accessTitle}</h2><ol>{text.accessSteps.map(([title, body], index) => <li key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol>
      </section>
      <section className={`${styles.section} ${styles.faq}`}>
        <h2>{text.faqTitle}</h2><div>{page.faqs.map(faq => <details className={styles.detail} key={faq.question}><summary>{faq.question}<ChevronDown aria-hidden="true" size={20} /></summary><p>{faq.answer}</p></details>)}</div>
      </section>
      <section className={styles.final}>
        <div><p className={styles.eyebrow}>IN-SEASON PRO</p><h2>{text.finalTitle}</h2><p>{text.finalBody}</p></div>
        <div><ProgramPurchaseSummary compact locale={locale} />{buyLink}<p className={styles.small}>{text.note}</p></div>
      </section>
      <SiteFooter />
    </main>
  );
}
