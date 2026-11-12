import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, Check, Medal, MessageCircle, Plus, ShieldCheck } from "lucide-react";
import { ApplicationForm } from "@/components/application-form";
import { CoachingTrainingPreview } from "@/components/coaching-training-preview";
import { HomeAthleteStory } from "@/components/home-services-entry";
import { HomeScrollReveal } from "@/components/home-scroll-reveal";
import { ReviewBadge, ReviewsSection } from "@/components/reviews";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { assets, countriesWorked, performanceEnvironments, playerPathLogos, successCases, testimonialScreens } from "@/lib/content";
import type { CoachingCopy } from "@/lib/content";
import editorial from "./home-editorial.module.css";
import styles from "./coaching-page.module.css";

function credentialLogos(credential: string) {
  const value = credential.toLowerCase();
  if (value.includes("cbf")) return [assets.logoCbf];
  if (value.includes("málaga") || value.includes("malaga")) return [assets.logoMalagaCity,assets.logoAlmunecar];
  if (value.includes("lindsey")) return [assets.logoLindseyWilson];
  if (value.includes("extratime")) return [assets.logoExtratime];
  return [];
}

export function CoachingPage({ copy }: { copy: CoachingCopy }) {
  const pt = copy.locale === "pt";
  const formId = pt ? "aplicacao" : "application";
  const methodId = pt ? "metodo" : "method";
  const currentSuccessCases = pt ? successCases.pt : successCases.en;
  const methodImage = pt ? assets.trainingOrganizationPt : assets.howWorkWasDoneEn;
  const proofImages = [
    { src: assets.theoMicrocycle, caption: pt ? "Organização do microciclo" : "Microcycle organization" },
    { src: methodImage, caption: pt ? "Planejamento individual" : "Individual planning" },
    { src: assets.theoTrainingCompleted, caption: pt ? "Registro do treino" : "Training log" }
  ];
  const questions = pt ? [
    ["Como começo a assessoria?", "Preencha a aplicação com seus objetivos, rotina e estrutura disponível. A equipe analisa as informações e conversa com você sobre os próximos passos antes de falar de pagamento."],
    ["Como o treino se adapta aos jogos do clube?", "O planejamento considera jogos, treinos do time, viagens e recuperação. O acompanhamento e o feedback ajudam a orientar os ajustes do microciclo semanal."],
    ["Preciso ter acesso a academia e campo?", "Informe na aplicação a estrutura que você tem disponível. Isso entra na triagem e na montagem do seu planejamento individual."],
    ["Qual é a diferença para os programas de treino?", "Os programas têm uma estrutura pronta para um objetivo. Na assessoria, o planejamento é individual e recebe acompanhamento e ajustes à sua rotina."]
  ] : [
    ["How do I get started?", "Complete the application with your goals, schedule and available facilities. The team reviews your information and discusses the next steps with you before talking about payment."],
    ["How does the plan fit around club matches?", "Planning considers matches, team training, travel and recovery. Ongoing support and your feedback help guide adjustments to the weekly microcycle."],
    ["Do I need access to a gym and a pitch?", "Tell us which facilities you can use in the application. This is considered during screening and individual planning."],
    ["How is coaching different from a training program?", "Programs follow a ready-made structure for a specific goal. Coaching provides individual planning, ongoing support and adjustments to your routine."]
  ];
  const appFeatures = [
    { icon: CalendarDays, title: pt ? "Uma semana organizada" : "An organized week", body: pt ? "Treinos, clube, recuperação e jogos." : "Training, club sessions, recovery and matches." },
    { icon: MessageCircle, title: pt ? "Seu feedback tem espaço" : "Room for your feedback", body: pt ? "Registros de esforço, cargas e observações." : "Effort, load and training comments." },
    { icon: ArrowRight, title: pt ? "Continuidade no plano" : "Continuity in your plan", body: pt ? "Ajustes a partir da rotina e do acompanhamento." : "Adjustments informed by your routine and coaching." }
  ];

  return <main className={`${editorial.page} ${styles.page}`} lang={pt ? "pt-BR" : "en"}>
    <SiteHeader navItems={copy.nav} ctaHref={`#${formId}`} ctaLabel={pt ? "Aplicar" : "Apply"} languageHref={copy.languageHref} showMobileCta/>

    <section className={styles.hero} aria-labelledby="coaching-title">
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span/>RUMOAOPRO / {pt ? "ASSESSORIA ONLINE" : "ONLINE COACHING"}</p>
          <h1 id="coaching-title">{pt ? "Seu jogo." : "Your game."}<span>{pt ? "Um plano só seu." : "Your own plan."}</span></h1>
          <p className={styles.heroLead}>{pt ? "Jogos, treinos do clube, viagens e recuperação. Um planejamento individual que acompanha sua rotina, com Lukaz de Paula." : "Matches, club training, travel and recovery. Individual planning that moves with your schedule, with Lukaz de Paula."}</p>
          <div className={styles.actions}><a href={`#${formId}`} className={`${styles.primary} focus-ring`}>{copy.primaryCta}<ArrowUpRight size={18} aria-hidden="true"/></a><a href={`#${methodId}`} className={`${styles.textLink} focus-ring`}>{copy.secondaryCta}<ArrowDown size={16} aria-hidden="true"/></a></div>
        </div>
        <figure className={styles.heroPhoto}>
          <Image src={assets.coachFieldDrillWide} alt={pt ? "Lukaz de Paula orientando duas atletas em um treino de campo" : "Lukaz de Paula coaching two athletes during a pitch session"} fill priority sizes="(min-width: 1280px) 650px, (min-width: 800px) 52vw, 100vw" quality={90}/>
          <span className={styles.photoLabel}>01 / {pt ? "ACOMPANHAMENTO INDIVIDUAL" : "INDIVIDUAL COACHING"}</span>
          <figcaption><span>{pt ? "O PLANO ENCONTRA A SUA ROTINA" : "PLANNING MEETS YOUR REAL LIFE"}</span><strong>{pt ? "Perto do treino.\nPerto de você." : "Close to your training.\nClose to you."}</strong></figcaption>
        </figure>
        <div className={styles.heroDetails}><ul className={styles.heroFacts}>{copy.proof.slice(0,3).map(item=><li key={item}><Check size={14} aria-hidden="true"/>{item}</li>)}</ul><div className={styles.heroReview}><ReviewBadge groupKey="coaching" locale={copy.locale} tone="dark"/></div></div>
      </div>
      <div className={styles.trustBar}><div><span className={styles.trustFaces}>{[assets.successTheo,assets.successHaroune,assets.successGabriel].map(src=><Image key={src} src={src} alt="" width={38} height={38}/>)}</span><p>{pt ? "Histórias construídas no treino." : "Journeys built through training."}<small>{pt ? "Conheça atletas que fazem parte da RumoAoPro." : "Meet players who are part of the RumoAoPro story."}</small></p></div><a href="#atletas-assessoria" className={`${styles.textLink} focus-ring`}>{pt ? "Conhecer as histórias" : "Explore their stories"}<ArrowDown size={15} aria-hidden="true"/></a></div>
    </section>

    <HomeScrollReveal><section className={styles.section} id={methodId} aria-labelledby="coaching-method-title">
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>01 / {pt ? "O ACOMPANHAMENTO" : "THE COACHING PROCESS"}</p><h2 id="coaching-method-title">{pt ? "Seu calendário muda.\nO plano acompanha." : "Your schedule changes.\nYour plan follows."}</h2></div><p>{pt ? "Sua rotina, seu momento e sua resposta ao treino orientam o trabalho. Cada parte da semana conversa com a próxima." : "Your schedule, current needs and response to training guide the process. Each part of your week connects with the next."}</p></div>
      <div className={styles.benefits}>{copy.benefits.map((benefit,index)=>{ const Icon=benefit.icon; return <article key={benefit.title}><div className={styles.benefitTop}><Icon size={23} strokeWidth={1.6} aria-hidden="true"/><span>0{index+1}</span></div><h3>{benefit.title}</h3><p>{benefit.body}</p></article>; })}</div>
    </section></HomeScrollReveal>

    <HomeScrollReveal><section className={styles.appSection} id="no-aplicativo" aria-labelledby="coaching-app-title">
      <div className={styles.appInner}><div className={styles.appCopy}><p className={styles.eyebrow}>02 / {pt ? "POR DENTRO DO RAPTORPRO" : "INSIDE RAPTORPRO"}</p><h2 id="coaching-app-title">{pt ? "Você treina.\nA gente acompanha." : "You train.\nWe stay with you."}</h2><p>{pt ? "Abra a semana, siga as orientações e conte como foi o treino. O calendário e o seu feedback ajudam a manter o planejamento conectado à sua realidade." : "Open your week, follow the guidance and share how training went. Your calendar and feedback help keep planning connected to your real life."}</p><ul>{appFeatures.map(({icon:Icon,title,body})=><li key={title}><Icon size={20} aria-hidden="true"/><div><strong>{title}</strong><span>{body}</span></div></li>)}</ul><a href={`#${formId}`} className={`${styles.textLink} focus-ring`}>{pt ? "Quero esse acompanhamento" : "I want individual coaching"}<ArrowUpRight size={16} aria-hidden="true"/></a></div><CoachingTrainingPreview locale={copy.locale}/></div>
      <details className={styles.proofDetails}><summary className="focus-ring">{pt ? "Veja exemplos reais do acompanhamento" : "See real coaching examples"}<Plus size={18} aria-hidden="true"/></summary><div className={styles.proofImages}>{proofImages.map(image=><figure key={image.src}><Image src={image.src} alt={image.caption} width={1254} height={1254} sizes="(min-width:800px) 33vw, 100vw"/><figcaption>{image.caption}</figcaption></figure>)}</div></details>
    </section></HomeScrollReveal>

    <HomeScrollReveal><section className={`${styles.section} ${styles.process}`} aria-labelledby="coaching-process-title"><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>03 / {pt ? "SEU PONTO DE PARTIDA" : "YOUR STARTING POINT"}</p><h2 id="coaching-process-title">{pt ? "Da primeira conversa\nà sua próxima semana." : "From the first conversation\nto your next training week."}</h2></div><a href={`#${formId}`} className={`${styles.textLink} focus-ring`}>{pt ? "Começar minha aplicação" : "Start my application"}<ArrowUpRight size={16} aria-hidden="true"/></a></div><ol>{copy.process.map((step,index)=><li key={step.title}><span className={styles.stepNumber}>0{index+1}</span><h3>{step.title}</h3><p>{step.body}</p></li>)}</ol></section></HomeScrollReveal>

    <div id="atletas-assessoria" className={styles.athletesAnchor}>
      <HomeScrollReveal><div className={styles.theoStory}><HomeAthleteStory locale={copy.locale}/></div></HomeScrollReveal>
      <HomeScrollReveal><section className={`${styles.section} ${styles.athletes}`} aria-labelledby="coaching-athletes-title"><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>{pt ? "ATLETAS. ROTINAS. TRAJETÓRIAS." : "PLAYERS. ROUTINES. JOURNEYS."}</p><h2 id="coaching-athletes-title">{pt ? "Cada história tem\no seu caminho." : "Every journey has\nits own path."}</h2></div><p>{pt ? "Experiências de atletas acompanhados no campo e na academia. Cada trajetória acontece dentro do seu próprio contexto." : "Experiences from players supported on the pitch and in the gym. Each journey happens within its own context."}</p></div><div className={styles.athleteGrid}>{currentSuccessCases.map(item=><article key={item.name}><div className={styles.athletePhoto}><Image src={item.image} alt={item.name} fill sizes="(min-width:1100px) 20vw, (min-width:600px) 33vw, 50vw"/><h3>{item.name}</h3></div><details><summary className="focus-ring">{pt ? "Conheça a trajetória" : "Explore the journey"}<Plus size={14} aria-hidden="true"/></summary><p>{item.quote}</p></details></article>)}</div></section></HomeScrollReveal>
    </div>

    <HomeScrollReveal><section className={styles.coachSection} aria-labelledby="coaching-coach-title"><div className={styles.coachInner}><figure className={styles.coachPhoto}><Image src={assets.coachPortrait} alt={pt ? "Lukaz de Paula no campo" : "Lukaz de Paula on the pitch"} fill sizes="(min-width:800px) 40vw, 100vw"/><figcaption>LUKAZ DE PAULA<span>{pt ? "PREPARAÇÃO FÍSICA PARA O FUTEBOL" : "PHYSICAL PREPARATION FOR FOOTBALL"}</span></figcaption></figure><div className={styles.coachCopy}><p className={styles.eyebrow}>04 / {pt ? "SEU TREINADOR" : "YOUR COACH"}</p><h2 id="coaching-coach-title">{pt ? "Quem vive o jogo\nentende a rotina." : "Know the game.\nUnderstand the routine."}</h2><p>{pt ? "Sou Lukaz de Paula, preparador físico com licença CBF A. Minha experiência como treinador e jogador conecta o trabalho no campo, na academia e na preparação individual de atletas." : "I'm Lukaz de Paula, a physical performance coach with a CBF A qualification. My experience as a coach and player connects work on the pitch, in the gym and in individual athlete preparation."}</p><ul className={styles.credentials}>{copy.credentials.map(credential=>{const logos=credentialLogos(credential); return <li key={credential}>{logos.length ? <span className={styles.credentialLogos}>{logos.map(src=><Image src={src} alt="" width={32} height={32} key={src} className={src===assets.logoMalagaCity ? styles.malagaLogo : undefined}/>)}</span> : <Medal size={23} aria-hidden="true"/>}<span>{credential}</span></li>;})}</ul><div className={styles.countries}>{countriesWorked.map((country,index)=><span key={country.label}><i aria-hidden="true">{country.flag}</i>{pt ? country.label : ["Brazil","United States","Saudi Arabia","Spain"][index]}</span>)}</div><details className={styles.career}><summary className="focus-ring">{pt ? "Conheça minha trajetória" : "Explore my journey"}<Plus size={16} aria-hidden="true"/></summary><p>{copy.coachBody}</p>{[[pt ? "Como treinador" : "As a coach",performanceEnvironments],[pt ? "Como jogador" : "As a player",playerPathLogos]].map(([label,items])=><div className={styles.careerGroup} key={String(label)}><h3>{String(label)}</h3><ul>{(items as typeof performanceEnvironments).map(item=><li key={item.name}><Image src={item.image} alt="" width={32} height={32} className={item.image===assets.logoMalagaCity ? styles.malagaLogo : undefined}/><span>{item.name}<small>{item.role}</small></span></li>)}</ul></div>)}</details></div></div></section></HomeScrollReveal>

    <div className={styles.reviews}><ReviewsSection groupKey="coaching" locale={copy.locale} eyebrow={pt ? "EXPERIÊNCIAS DA ASSESSORIA" : "COACHING EXPERIENCES"} title={pt ? "O trabalho, na voz\nde quem treina." : "The work, in\nthe players' words."}/><details className={styles.testimonials}><summary className="focus-ring">{pt ? "Mais relatos dos atletas" : "More player feedback"}<Plus size={18} aria-hidden="true"/></summary><div>{testimonialScreens.map((src,index)=><Image src={src} alt={pt ? `Depoimento de atleta ${index+1}` : `Athlete feedback ${index+1}`} width={1080} height={1080} key={src} sizes="(min-width:800px) 25vw, 100vw"/>)}</div></details></div>

    <section className={`${styles.section} ${styles.faq}`} aria-labelledby="coaching-faq-title"><div><p className={styles.eyebrow}>{pt ? "ANTES DA PRIMEIRA CONVERSA" : "BEFORE OUR FIRST CONVERSATION"}</p><h2 id="coaching-faq-title">{pt ? "Vamos deixar\ntudo claro." : "Let's make\nthings clear."}</h2><Link href={pt ? "/programas" : "/en/programs"} className={`${styles.textLink} focus-ring`}>{pt ? "Prefiro explorar os programas" : "I'd like to explore the programs"}<ArrowUpRight size={16} aria-hidden="true"/></Link></div><div>{questions.map(([question,answer])=><details key={question}><summary className="focus-ring">{question}<Plus size={17} aria-hidden="true"/></summary><p>{answer}</p></details>)}</div></section>

    <section className={styles.application} id={formId} aria-labelledby="coaching-application-title"><div className={styles.applicationInner}><div className={styles.applicationCopy}><p className={styles.eyebrow}>05 / {pt ? "VAMOS CONVERSAR" : "LET'S TALK"}</p><h2 id="coaching-application-title">{pt ? "Conte sua história.\nVamos planejar\no próximo passo." : "Tell us your story.\nLet's plan\nyour next step."}</h2><p>{copy.formLead}</p><ul><li><Check size={16} aria-hidden="true"/>{pt ? "Seus objetivos e seu momento" : "Your goals and current situation"}</li><li><Check size={16} aria-hidden="true"/>{pt ? "Sua rotina e estrutura de treino" : "Your schedule and training setup"}</li><li><Check size={16} aria-hidden="true"/>{pt ? "Uma conversa sobre o caminho" : "A conversation about the path forward"}</li></ul><div className={styles.applicationNote}><ShieldCheck size={20} aria-hidden="true"/><span>{pt ? "A aplicação é a primeira etapa da triagem. Sem cobrança nesta etapa." : "The application is the first step in screening. No charge at this stage."}</span></div><figure className={styles.applicationPhoto}><Image src={assets.coachGymInstruction} alt={pt ? "Lukaz de Paula orientando um atleta na academia" : "Lukaz de Paula guiding an athlete in the gym"} width={2100} height={2800} sizes="(min-width:800px) 35vw, 100vw"/></figure></div><div className={styles.applicationForm}><div className={styles.formHeading}><MessageCircle size={20} aria-hidden="true"/><span>{pt ? "SUA APLICAÇÃO" : "YOUR APPLICATION"}<small>{pt ? "Preencha e continue pelo WhatsApp." : "Complete the form and continue on WhatsApp."}</small></span></div><ApplicationForm copy={{emailSubject:copy.emailSubject,form:copy.form,locale:copy.locale,thankYouPath:copy.thankYouPath}} id={`${formId}-form`}/></div></div></section>
    <SiteFooter locale={copy.locale}/>
  </main>;
}
