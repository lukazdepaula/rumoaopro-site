import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  CalendarRange,
  Check,
  GraduationCap,
  HeartPulse,
  Infinity,
  MessageCircle,
  Plus,
  RefreshCw,
  ShieldCheck,
  Target,
  Zap
} from "lucide-react";
import { ReviewBadge, ReviewsSection } from "@/components/reviews";
import { HomeCourseLaptop } from "@/components/home-course-laptop";
import { PreparadorPlatformPreview } from "@/components/preparador-platform-preview";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { assets, nav } from "@/lib/content";
import editorial from "./home-editorial.module.css";
import styles from "./preparador-pro-page.module.css";

type PreparadorProPageProps = {
  locale: "pt" | "en";
};

const checkoutBaseUrl = "https://pay.kiwify.com.br/ANEoMiE";

const checkoutUrl = (placement: string) =>
  `${checkoutBaseUrl}?utm_source=rumoaopro&utm_medium=site&utm_campaign=preparador_pro&utm_content=${placement}`;

const copy = {
  pt: {
    cta: "Entrar no Preparador PRO",
    eyebrow: "Formação prática para treinadores de futebol",
    heroTitle: "Prepare atletas com método. Não no improviso.",
    heroBody:
      "Aprenda a avaliar jogadores, planejar o microciclo, desenvolver capacidades físicas e controlar a carga com decisões que fazem sentido para o futebol.",
    explore: "Ver aulas e módulos",
    heroTags: ["Acesso vitalício", "Aulas novas", "Suporte no WhatsApp", "7 dias de garantia"],
    platformBadge: "Plataforma atualizada",
    platformNote: "Assista no seu ritmo, reveja quando quiser e receba as próximas aulas sem pagar novamente.",
    heroLessons: [
      ["Módulo prático", "Controle de carga"],
      ["Testar para treinar", "Testes físicos"],
      ["Aplicação no campo", "Velocidade e potência"]
    ],
    problemEyebrow: "Da teoria para o campo",
    problemTitle: "Você não precisa de mais exercícios soltos. Precisa saber quando e por que usar cada estímulo.",
    problemBody:
      "O Preparador PRO organiza a preparação física como um sistema: avaliar, interpretar, planejar, aplicar e ajustar. A proposta é dar clareza para quem trabalha — ou quer trabalhar — com jogadores de futebol.",
    outcomesEyebrow: "O que você vai dominar",
    outcomesTitle: "Decisões melhores em cada etapa da preparação física.",
    outcomes: [
      ["Avaliar antes de prescrever", "Use testes de potência, velocidade, mudança de direção e resistência para entender o atleta."],
      ["Planejar o microciclo", "Organize offseason e temporada sem criar conflito com treinos, jogos e recuperação."],
      ["Treinar velocidade e potência", "Aplique sprints, pliometria, VBT, contrastes e complexos com mais intenção."],
      ["Controlar a carga", "Monitore PSE, carga em AU, monotonia e strain mesmo sem depender de GPS."],
      ["Condicionar para o futebol", "Estruture resistência aeróbia e anaeróbia de acordo com a demanda do jogo."],
      ["Transformar conhecimento em trabalho", "Amplie seu repertório para atuar com atletas, base, clubes e projetos internacionais."]
    ],
    insideEyebrow: "Por dentro da plataforma",
    insideTitle: "Aulas reais, exemplos reais e aplicação direta.",
    insideBody:
      "Nada de vender uma promessa abstrata. Estas são telas atuais do curso e alguns dos conteúdos que já estão disponíveis para os alunos.",
    screenLabels: ["Biblioteca de aulas", "Aula: controle de carga", "Módulos organizados"],
    lessonsEyebrow: "Conteúdo em expansão",
    lessonsTitle: "Uma formação que continua crescendo com você.",
    lessonsBody:
      "O curso recebe novas aulas e estudos práticos continuamente. Você entra uma vez e mantém acesso às próximas atualizações.",
    lessonPill: "Novas aulas sem custo adicional",
    curriculumEyebrow: "Currículo atual",
    curriculumTitle: "Do fundamento à aplicação avançada.",
    curriculumBody:
      "Os módulos são independentes para você estudar conforme a necessidade, mas juntos formam uma base completa para preparar jogadores.",
    curriculum: [
      {
        title: "Avaliação e tomada de decisão",
        count: "5 temas",
        lessons: ["Fundamentos da preparação física", "Testar para treinar", "Como avaliar um atleta com o MyJump", "Testes de velocidade e mudança de direção", "Testes de potência: CMJ, SJ e Drop Jump"]
      },
      {
        title: "Planejamento e periodização",
        count: "3 temas",
        lessons: ["Periodização: offseason e in-season", "Exemplo de microciclo em temporada", "Aplicativo para montagem de programas"]
      },
      {
        title: "Resistência e controle de carga",
        count: "4 temas",
        lessons: ["Resistência aeróbia e anaeróbia", "Controle de carga sem GPS", "Como fazer o YoYo Test", "PSE, AU, monotonia e strain no futebol"]
      },
      {
        title: "Força, potência e velocidade",
        count: "8 temas",
        lessons: ["Como treinar Hill Sprints", "Como implementar o Complexo Francês", "Treino de contraste x complexos", "Pliometria", "Como programar sprints resistidos", "Treinamento de potência", "Velocidade", "Método VBT: como utilizar"]
      },
      {
        title: "Aplicações especiais e carreira",
        count: "2 temas",
        lessons: ["Como treinar crianças", "Empregos em outros países"]
      }
    ],
    audienceEyebrow: "Para quem é",
    audienceTitle: "Para quem quer preparar jogadores com mais segurança.",
    audience: ["Preparadores físicos que querem ampliar o repertório", "Treinadores que precisam organizar melhor a parte física", "Estudantes de Educação Física que querem entrar no futebol", "Profissionais de categorias de base e projetos de formação"],
    authorityEyebrow: "Quem conduz as aulas",
    authorityTitle: "Conteúdo construído por quem vive o campo e a academia.",
    authorityBody:
      "Lukaz de Paula reúne experiência como atleta, treinador e preparador físico em ambientes do Brasil, Estados Unidos, Espanha e outros mercados do futebol.",
    authorityPoints: ["Experiência prática com atletas e equipes", "Vivência internacional no futebol", "Método aplicado em campo, academia e monitoramento"],
    offerEyebrow: "Sua entrada no Preparador PRO",
    offerTitle: "Uma compra. Acesso para sempre.",
    priceLabel: "Acesso vitalício",
    price: "R$ 349,90",
    installments: "ou em até 3x de R$ 116,63",
    included: ["Acesso vitalício à plataforma", "Novas aulas e atualizações futuras", "Suporte direto via WhatsApp", "Garantia de 7 dias", "Conteúdo 100% em português"],
    externalNote: "Pagamento e liberação de acesso processados com segurança pela Kiwify.",
    guaranteeTitle: "Teste por 7 dias",
    guaranteeBody:
      "Entre, conheça a plataforma e assista às aulas. Se o conteúdo não fizer sentido para você, solicite o reembolso dentro do prazo de garantia.",
    reviewsEyebrow: "Quem já entrou",
    reviewsTitle: "Treinadores estão levando o conteúdo para a prática.",
    faqEyebrow: "Antes de entrar",
    faqTitle: "Perguntas frequentes",
    faq: [
      ["Por quanto tempo tenho acesso?", "O acesso é vitalício. Você pode rever as aulas sempre que precisar."],
      ["As novas aulas estão incluídas?", "Sim. O curso continua recebendo novos conteúdos e quem já é aluno acessa as atualizações sem uma nova compra."],
      ["O curso oferece certificado?", "Não. O Preparador PRO é uma formação prática e atualmente não emite certificado."],
      ["Como funciona o suporte?", "O suporte aos alunos acontece pelo WhatsApp para dúvidas sobre acesso e orientação relacionada ao conteúdo."],
      ["Posso pedir reembolso?", "Sim. A compra possui garantia de 7 dias, seguindo o processo da Kiwify e a política de reembolso do RumoAoPro."],
      ["Preciso já trabalhar no futebol?", "Não. O curso atende profissionais e estudantes, mas pressupõe interesse real em preparação física aplicada ao futebol."]
    ],
    finalEyebrow: "Preparador PRO",
    finalTitle: "Pare de depender do improviso para preparar jogadores.",
    finalBody: "Construa uma base prática para avaliar, planejar e aplicar a preparação física no futebol.",
    mobilePrice: "Vitalício · R$ 349,90",
    back: "Voltar para a Home"
  },
  en: {
    cta: "Join Preparador PRO",
    eyebrow: "Practical education for football coaches",
    heroTitle: "Prepare players with a method. Not guesswork.",
    heroBody:
      "Learn how to assess players, plan the microcycle, develop physical qualities and monitor training load through decisions that make sense for football.",
    explore: "Explore lessons and modules",
    heroTags: ["Lifetime access", "New lessons", "WhatsApp support", "7-day guarantee"],
    platformBadge: "Updated platform",
    platformNote: "Study at your own pace, revisit lessons and receive future classes without paying again.",
    heroLessons: [
      ["Practical module", "Load monitoring"],
      ["Test to train", "Physical testing"],
      ["On-field application", "Speed and power"]
    ],
    problemEyebrow: "From theory to the pitch",
    problemTitle: "You do not need more random exercises. You need to know when and why to use each stimulus.",
    problemBody:
      "Preparador PRO organizes physical preparation as a system: assess, interpret, plan, apply and adjust. It is designed to give clarity to people who work — or want to work — with football players.",
    outcomesEyebrow: "What you will master",
    outcomesTitle: "Better decisions at every stage of physical preparation.",
    outcomes: [
      ["Assess before prescribing", "Use power, speed, change-of-direction and endurance tests to understand the player."],
      ["Plan the microcycle", "Organize offseason and in-season work around football sessions, matches and recovery."],
      ["Train speed and power", "Apply sprints, plyometrics, VBT, contrasts and complexes with greater intent."],
      ["Monitor training load", "Track RPE, AU, monotony and strain without depending on GPS."],
      ["Condition for football", "Build aerobic and anaerobic endurance around the demands of the game."],
      ["Turn knowledge into work", "Expand your toolkit for athletes, academies, clubs and international opportunities."]
    ],
    insideEyebrow: "Inside the platform",
    insideTitle: "Real lessons, real examples and direct application.",
    insideBody: "These are current screens from the course and examples of content already available to students.",
    screenLabels: ["Lesson library", "Lesson: load monitoring", "Organized modules"],
    lessonsEyebrow: "Growing content library",
    lessonsTitle: "Education that keeps growing with you.",
    lessonsBody: "The course receives new lessons and practical studies over time. Purchase once and retain access to future updates.",
    lessonPill: "Future lessons included",
    curriculumEyebrow: "Current curriculum",
    curriculumTitle: "From foundations to advanced application.",
    curriculumBody: "Modules can be studied independently, but together they build a complete foundation. All lessons are taught in Portuguese.",
    curriculum: [
      { title: "Assessment and decisions", count: "5 topics", lessons: ["Physical preparation foundations", "Test to train", "Assessing a player with MyJump", "Speed and change-of-direction tests", "Power tests: CMJ, SJ and Drop Jump"] },
      { title: "Planning and periodization", count: "3 topics", lessons: ["Offseason and in-season periodization", "In-season microcycle example", "Program-building application"] },
      { title: "Endurance and load monitoring", count: "4 topics", lessons: ["Aerobic and anaerobic endurance", "Load monitoring without GPS", "How to conduct the YoYo Test", "RPE, AU, monotony and strain in football"] },
      { title: "Strength, power and speed", count: "8 topics", lessons: ["Hill Sprints", "French Contrast", "Contrast training and complexes", "Plyometrics", "Programming resisted sprints", "Power training", "Speed", "Using the VBT method"] },
      { title: "Special applications and career", count: "2 topics", lessons: ["Training children", "Jobs in other countries"] }
    ],
    audienceEyebrow: "Who it is for",
    audienceTitle: "For people who want to prepare players with greater confidence.",
    audience: ["Physical coaches expanding their toolkit", "Football coaches organizing physical preparation", "Physical Education students entering football", "Academy and youth development professionals"],
    authorityEyebrow: "Your instructor",
    authorityTitle: "Content built by someone who lives the pitch and the gym.",
    authorityBody: "Lukaz de Paula brings together experience as a player, coach and physical coach in Brazil, the United States, Spain and other football environments.",
    authorityPoints: ["Practical work with players and teams", "International football experience", "A method applied on the pitch, in the gym and through monitoring"],
    offerEyebrow: "Join Preparador PRO",
    offerTitle: "One purchase. Access for life.",
    priceLabel: "Lifetime access",
    price: "R$ 349.90",
    installments: "or up to 3 installments of R$ 116.63",
    included: ["Lifetime platform access", "Future lessons and updates", "Direct WhatsApp support", "7-day guarantee", "Course taught in Portuguese"],
    externalNote: "Payment and course access are securely processed by Kiwify.",
    guaranteeTitle: "Try it for 7 days",
    guaranteeBody: "Enter the platform and explore the lessons. If the content is not right for you, request a refund within the guarantee period.",
    reviewsEyebrow: "Student reviews",
    reviewsTitle: "Coaches are taking the content into practice.",
    faqEyebrow: "Before you join",
    faqTitle: "Frequently asked questions",
    faq: [
      ["How long do I have access?", "Access is lifetime. You can revisit the lessons whenever needed."],
      ["Are future lessons included?", "Yes. Existing students receive future course updates without another purchase."],
      ["Does the course include a certificate?", "No. Preparador PRO is a practical education product and does not currently issue a certificate."],
      ["How does support work?", "Students receive WhatsApp support for access questions and course-related guidance."],
      ["Can I request a refund?", "Yes. The purchase includes a 7-day guarantee through Kiwify and the RumoAoPro refund policy."],
      ["Is the course available in English?", "Not yet. The platform and lessons are currently taught in Portuguese."]
    ],
    finalEyebrow: "Preparador PRO",
    finalTitle: "Stop relying on guesswork to prepare players.",
    finalBody: "Build a practical foundation to assess, plan and apply football physical preparation.",
    mobilePrice: "Lifetime · R$ 349.90",
    back: "Back to Home"
  }
} as const;

const outcomeIcons = [Target, CalendarRange, Zap, BarChart3, HeartPulse, GraduationCap];

const partnerLogos = [
  { alt: "CBF Academy", src: assets.logoCbf },
  { alt: "FC Málaga City", src: assets.logoMalagaCity },
  { alt: "Lindsey Wilson College", src: assets.logoLindseyWilson },
  { alt: "Almuñécar City", src: assets.logoAlmunecar }
];

function CheckoutLink({ children, className, placement }: { children: ReactNode; className: string; placement: string }) {
  return <a className={`${className} focus-ring`} data-checkout-product="preparador-pro" href={checkoutUrl(placement)} rel="noreferrer" target="_blank">{children}</a>;
}

export function PreparadorProPage({ locale }: PreparadorProPageProps) {
  const page = copy[locale];
  const pt = locale === "pt";

  return <main className={`${editorial.page} ${styles.page}`}>
    <SiteHeader ctaHref="#oferta" ctaLabel={pt ? "Conhecer o curso" : "Explore the course"} languageHref={pt ? "/en/courses" : "/cursos"} navItems={nav[locale]} />

    <section className={styles.hero} aria-labelledby="preparador-hero-title">
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span />PREPARADOR PRO / {pt ? "FORMAÇÃO PARA TREINADORES" : "EDUCATION FOR COACHES"}</p>
          <h1 id="preparador-hero-title">{pt ? "Conhecimento" : "Knowledge"}<span>{pt ? "em campo." : "on the pitch."}</span></h1>
          <p className={styles.heroLead}>{page.heroBody}</p>
          <div className={styles.heroActions}><CheckoutLink className={styles.primary} placement="hero">{page.cta}<ArrowUpRight size={18} aria-hidden="true" /></CheckoutLink><a className={`${styles.textLink} focus-ring`} href="#conteudo">{page.explore}<ArrowDown size={17} aria-hidden="true" /></a></div>
          <p className={styles.languageNote}><BookOpen size={14} aria-hidden="true" />{pt ? "Curso em português · Estude no seu ritmo" : "Course taught in Portuguese · Study at your own pace"}</p>
        </div>
        <div className={styles.heroVisual}><span className={styles.visualLabel}>01 / {pt ? "SUA PRÓXIMA SALA DE AULA" : "YOUR NEXT CLASSROOM"}</span><HomeCourseLaptop locale={locale} /></div>
        <div className={styles.heroProof}><ReviewBadge groupKey="preparadorPro" locale={locale} tone="dark" /><span>{pt ? "Avaliações de quem já estuda com a gente." : "Feedback from coaches already learning with us."}</span></div>
      </div>
      <div className={styles.facts}>{page.heroTags.map((tag,index) => {const Icon = [Infinity, RefreshCw, MessageCircle, ShieldCheck][index];return <div key={tag}><Icon size={19} strokeWidth={1.5} aria-hidden="true" /><span>{tag}</span></div>;})}</div>
    </section>

    <section className={styles.section} aria-labelledby="preparador-method-title">
      <div className={styles.methodIntro}><div><p className={styles.eyebrow}>01 / {page.problemEyebrow}</p><h2 id="preparador-method-title">{pt ? "Entender o atleta.\nDar sentido ao treino." : "Understand the player.\nGive training a purpose."}</h2></div><p>{page.problemBody}</p></div>
      <div className={styles.outcomes}>{page.outcomes.map(([title,body],index)=>{const Icon=outcomeIcons[index];return <article key={title}><div><Icon size={23} strokeWidth={1.6} aria-hidden="true" /><span>0{index+1}</span></div><h3>{title}</h3><p>{body}</p></article>;})}</div>
    </section>

    <section className={styles.platform} id="plataforma" aria-labelledby="preparador-platform-title">
      <div className={styles.platformInner}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>02 / {page.insideEyebrow}</p><h2 id="preparador-platform-title">{pt ? "Abra a plataforma.\nConheça o conteúdo." : "Explore the platform.\nGet to know the content."}</h2></div><p>{pt ? "Telas reais do Preparador Pro, com aulas e exemplos para conectar estudo e prática. Explore a biblioteca, uma aula e a organização dos temas." : "Actual Preparador Pro screens, with lessons and examples connecting learning to coaching practice. Explore the library, a lesson and the topic organization."}</p></div><PreparadorPlatformPreview locale={locale} /></div>
    </section>

    <section className={`${styles.section} ${styles.curriculum}`} id="conteudo" aria-labelledby="preparador-curriculum-title">
      <div className={styles.curriculumIntro}><p className={styles.eyebrow}>03 / {page.curriculumEyebrow}</p><h2 id="preparador-curriculum-title">{pt ? "Uma base sólida.\nVárias formas\nde aplicar." : "A strong foundation.\nMany ways\nto apply it."}</h2><p>{page.curriculumBody}</p><div className={styles.updateNote}><RefreshCw size={20} aria-hidden="true" /><span>{page.lessonPill}<small>{page.lessonsBody}</small></span></div><a href="#oferta" className={`${styles.textLink} focus-ring`}>{pt ? "Conhecer o investimento" : "See the investment"}<ArrowUpRight size={16} aria-hidden="true" /></a></div>
      <div className={styles.moduleList}>{page.curriculum.map((module,index)=><details className={styles.module} key={module.title} open={index===0}><summary className="focus-ring"><span className={styles.moduleNumber}>0{index+1}</span><span><strong>{module.title}</strong><small>{module.count}</small></span><Plus size={19} strokeWidth={1.6} aria-hidden="true" /></summary><ul>{module.lessons.map(lesson=><li key={lesson}><Check size={15} aria-hidden="true" />{lesson}</li>)}</ul></details>)}</div>
    </section>

    <section className={styles.instructor} aria-labelledby="preparador-instructor-title"><div className={styles.instructorInner}>
      <figure className={styles.coachPhoto}><Image alt={pt ? "Lukaz de Paula orientando um atleta na academia" : "Lukaz de Paula guiding an athlete in the gym"} src={assets.coachGymInstruction} fill sizes="(min-width:800px) 42vw, 100vw" /><figcaption>LUKAZ DE PAULA<small>{pt ? "PREPARADOR FÍSICO · TREINADOR · EX-ATLETA" : "PHYSICAL COACH · COACH · FORMER PLAYER"}</small></figcaption></figure>
      <div className={styles.instructorCopy}><p className={styles.eyebrow}>04 / {page.authorityEyebrow}</p><h2 id="preparador-instructor-title">{pt ? "A experiência\nvira aula." : "Experience becomes\na lesson."}</h2><p>{page.authorityBody}</p><ul>{page.authorityPoints.map(point=><li key={point}><BadgeCheck size={18} aria-hidden="true" />{point}</li>)}</ul><div className={styles.credentials}>{partnerLogos.map(logo=><div key={logo.alt}><Image alt="" src={logo.src} width={40} height={40} className={logo.src===assets.logoMalagaCity ? styles.malagaLogo : undefined}/><span>{logo.alt}</span></div>)}</div><details className={styles.audience}><summary className="focus-ring">{page.audienceEyebrow}<Plus size={17} aria-hidden="true" /></summary><ul>{page.audience.map(item=><li key={item}><Check size={15} aria-hidden="true" />{item}</li>)}</ul></details></div>
    </div></section>

    <div className={styles.reviews}><ReviewsSection groupKey="preparadorPro" locale={locale} eyebrow={page.reviewsEyebrow} title={pt ? "Quem estuda.\nQuem aplica." : "Those who learn.\nThose who apply."} /></div>

    <section className={styles.offerSection} id="oferta" aria-labelledby="preparador-offer-title"><div className={styles.offerInner}>
      <div className={styles.offerCopy}><p className={styles.eyebrow}>05 / {page.offerEyebrow}</p><h2 id="preparador-offer-title">{pt ? "Um próximo passo.\nAcesso para sempre." : "Your next step.\nAccess for life."}</h2><p>{page.finalBody}</p><ul>{page.included.map(item=><li key={item}><Check size={17} aria-hidden="true" />{item}</li>)}</ul><div className={styles.guarantee}><ShieldCheck size={29} strokeWidth={1.5} aria-hidden="true" /><div><strong>{page.guaranteeTitle}</strong><p>{page.guaranteeBody}</p></div></div></div>
      <div className={styles.priceCard}><div className={styles.priceBrand}>RUMO<span>AO</span>PRO <span>/</span> PREPARADOR PRO</div><p className={styles.priceLabel}>{page.priceLabel}</p><p className={styles.price}>{page.price}</p><p className={styles.installments}>{page.installments}</p><span className={styles.priceRule}/><p className={styles.priceDescription}>{pt ? "Sua formação para avaliar, planejar e treinar com mais intenção." : "Your education to assess, plan and train with greater intent."}</p><CheckoutLink className={styles.primary} placement="offer">{page.cta}<ArrowUpRight size={18} aria-hidden="true" /></CheckoutLink><p className={styles.checkoutNote}><ShieldCheck size={14} aria-hidden="true" />{page.externalNote}</p><div className={styles.priceFoot}><span><Infinity size={15} aria-hidden="true" />{pt ? "Uma única compra" : "One-time purchase"}</span><span>{pt ? "Sem mensalidade" : "No monthly fee"}</span></div></div>
    </div></section>

    <section className={`${styles.section} ${styles.faq}`} aria-labelledby="preparador-faq-title"><div><p className={styles.eyebrow}>{page.faqEyebrow}</p><h2 id="preparador-faq-title">{pt ? "Antes de\ncomeçar." : "Before\nyou start."}</h2><p>{pt ? "Acesso, suporte e os detalhes da sua formação." : "Access, support and the details of your education."}</p></div><div>{page.faq.map(([question,answer])=><details key={question}><summary className="focus-ring">{question}<Plus size={18} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div></section>

    <section className={styles.closing}><div><p className={styles.eyebrow}>PREPARADOR PRO</p><h2>{pt ? "Leve o conhecimento\npara o próximo treino." : "Bring your learning\nto the next session."}</h2><p>{page.finalBody}</p><div><CheckoutLink className={styles.primary} placement="final">{page.cta}<ArrowUpRight size={18} aria-hidden="true" /></CheckoutLink><Link className={`${styles.textLink} focus-ring`} href={pt ? "/" : "/en"}>{page.back}<ArrowUpRight size={16} aria-hidden="true" /></Link></div></div></section>
    <SiteFooter locale={locale} />
    <div className={styles.mobileOffer}><div><small>PREPARADOR PRO</small><strong>{page.mobilePrice}</strong></div><CheckoutLink className={styles.primary} placement="sticky_mobile">{pt ? "Entrar no curso" : "Join the course"}<ArrowUpRight size={16} aria-hidden="true" /></CheckoutLink></div>
  </main>;
}
