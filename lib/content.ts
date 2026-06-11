import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  Globe2,
  LineChart,
  MessageCircle,
  ShieldCheck,
  Target,
  Trophy,
  Video,
  Zap
} from "lucide-react";

export const contact = {
  whatsapp:
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ||
    "5519981331996",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contato@rumoaopro.com.br",
  shopify: process.env.NEXT_PUBLIC_SHOPIFY_URL || "https://www.rumoaopro.com.br"
};

const whatsappMessage = (message: string) =>
  `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`;

export const assets = {
  coachCollage: "/assets/photos/lukaz-field-coaching.jpg",
  coachPortrait: "/assets/photos/lukaz-rain-portrait.jpg",
  coachGym: "/assets/photos/lukaz-gym-coaching-wide.jpg",
  coachGymInstruction: "/assets/photos/lukaz-gym-instruction.jpg",
  coachFieldProfile: "/assets/photos/lukaz-field-profile.jpg",
  coachFieldDrillWide: "/assets/photos/lukaz-field-drill-wide.jpg",
  coachFieldPlaying: "/assets/photos/lukaz-field-playing.jpg",
  coachFieldWalk: "/assets/photos/lukaz-field-walk.jpg",
  sprintFront: "/assets/photos/lukaz-sprint-front.jpg",
  sprintSide: "/assets/photos/lukaz-sprint-side.jpg",
  appCalendar:
    "https://cdn.shopify.com/s/files/1/0053/8175/0855/files/Dashboard-Exercise_and_Workout_1.png?v=1754204601&width=2048",
  appCommunication:
    "https://cdn.shopify.com/s/files/1/0053/8175/0855/files/CRx_Trans_0001_CRx_System-Highlights_0009_Communication.webp?v=1754421304&width=2048",
  appTraining:
    "https://cdn.shopify.com/s/files/1/0053/8175/0855/files/Dashboard-Exercise.webp?v=1754421183&width=2048",
  logo: "/assets/brand/rumoaopro-logo.svg",
  caseSuccessDewa: "/assets/proof/case-success-dewa.png",
  trainingOrganizationPt: "/assets/proof/training-organization-pt.png",
  coachingWorkflowPt: "/assets/proof/coaching-workflow-pt.png",
  howWorkWasDoneEn: "/assets/proof/how-work-was-done-en.png",
  rakanSeasonReportEn: "/assets/proof/rakan-season-report-en.png",
  rakanPerformanceEn: "/assets/proof/rakan-performance-en.png",
  theoMicrocycle: "/assets/proof/theo-microcycle.jpg",
  theoTrainingCompleted: "/assets/proof/theo-training-completed.png",
  logoAlmunecar: "/assets/logos/almunecar-city.png",
  logoColoradoRapids: "/assets/logos/colorado-rapids.png",
  logoDesportivoBrasil: "/assets/logos/desportivo-brasil.png",
  logoExtratime: "/assets/logos/extratime.png",
  logoVasalunds: "/assets/logos/vasalunds.png",
  successTheo: "/assets/success/theo-ferreira.png",
  successHaroune: "/assets/success/haroune-camara.png",
  successAmar: "/assets/success/amar.png",
  successJackson: "/assets/success/jackson.png",
  successDiogo: "/assets/success/diogo-fortunato.png",
  preSeason:
    "https://www.rumoaopro.com.br/cdn/shop/files/Capa_1_480x480.png?v=1742056677",
  adama:
    "https://www.rumoaopro.com.br/cdn/shop/files/capaadama_480x480.jpg?v=1689715757",
  dvg:
    "https://www.rumoaopro.com.br/cdn/shop/files/dvg_480x480.jpg?v=1689964355"
};

export const nav = {
  pt: [
    { label: "Assessoria", href: "/assessoria" },
    { label: "Programas", href: "/programas" },
    { label: "Links", href: "/links" },
    { label: "🇺🇸 English", href: "/en/coaching" }
  ],
  en: [
    { label: "Coaching", href: "/en/coaching" },
    { label: "Programs", href: "/programas" },
    { label: "Links", href: "/links" },
    { label: "🇧🇷 Português", href: "/assessoria" }
  ]
};

export const testimonialScreens = [
  "/assets/testimonials/testimonial-2.png",
  "/assets/testimonials/testimonial-3.png",
  "/assets/testimonials/testimonial-4.png",
  "/assets/testimonials/testimonial-5.png",
  "/assets/testimonials/testimonial-6.png",
  "/assets/testimonials/testimonial-7.png",
  "/assets/testimonials/testimonial-8.png"
];

export const countriesWorked = [
  { flag: "🇧🇷", label: "Brasil" },
  { flag: "🇺🇸", label: "Estados Unidos" },
  { flag: "🇸🇦", label: "Arábia Saudita" },
  { flag: "🇪🇸", label: "Espanha" }
];

export const performanceEnvironments = [
  { name: "FC Málaga City", role: "Performance staff" },
  {
    name: "Extratime Performance",
    role: "Director of physical training",
    image: assets.logoExtratime
  },
  { name: "Lindsey Wilson University", role: "Former S&C coach" },
  {
    name: "CD Almuñécar City",
    role: "Performance staff",
    image: assets.logoAlmunecar
  }
];

export const playerPathLogos = [
  {
    name: "Colorado Rapids U23",
    role: "United States",
    image: assets.logoColoradoRapids
  },
  {
    name: "Desportivo Brasil",
    role: "Brazil",
    image: assets.logoDesportivoBrasil
  },
  {
    name: "Vasalunds IF",
    role: "Sweden",
    image: assets.logoVasalunds
  },
  {
    name: "CD Almuñécar City",
    role: "Spain",
    image: assets.logoAlmunecar
  }
];

export const successCases = {
  pt: [
    {
      name: "Theo Ferreira",
      image: assets.successTheo,
      quote:
        "Com apenas 2 anos de trabalho focado em força, velocidade e preparação física individualizada, Theo saiu da base do Newcastle Sub-16 e hoje é jogador profissional no Sub-21. Planejamento + execução = resultado."
    },
    {
      name: "Haroune Camara",
      image: assets.successHaroune,
      quote:
        "Haroune Camara se reinventou. Voltou a ser convocado para a Seleção Saudita e fez o maior número de gols da carreira. Quando o físico volta para o topo, o futebol acompanha."
    },
    {
      name: "Amar",
      image: assets.successAmar,
      quote:
        "Destaque nas categorias de base do Al Ittihad, Amar transformou seu corpo, aumentou performance e conquistou a convocação para a Seleção Sub-20 da Arábia Saudita."
    },
    {
      name: "Jackson",
      image: assets.successJackson,
      quote:
        "Três temporadas seguidas sem lesão, campeão e artilheiro. Com planejamento, consistência e treino inteligente, Jackson provou que dá para manter alto nível sem parar por lesão."
    },
    {
      name: "Diogo Fortunato",
      image: assets.successDiogo,
      quote:
        "Melhor meio-campista da temporada. Diogo uniu talento e preparo físico de alto nível para se destacar na Europa. Treino certo, consistência e foco. O resultado veio."
    }
  ],
  en: [
    {
      name: "Theo Ferreira",
      image: assets.successTheo,
      quote:
        "After two years of focused strength, speed and individualized physical preparation, Theo moved from Newcastle U16 to the professional U21 environment. Planning plus execution creates results."
    },
    {
      name: "Haroune Camara",
      image: assets.successHaroune,
      quote:
        "Haroune Camara reinvented himself. He returned to the Saudi national team setup and produced the highest goal count of his career. When the physical level rises, football follows."
    },
    {
      name: "Amar",
      image: assets.successAmar,
      quote:
        "A standout in Al Ittihad's academy categories, Amar transformed his body, improved performance and earned a call-up to the Saudi Arabia U20 national team."
    },
    {
      name: "Jackson",
      image: assets.successJackson,
      quote:
        "Three straight seasons without injury, champion and top scorer. With planning, consistency and intelligent training, Jackson showed that players can stay at a high level without being stopped by injuries."
    },
    {
      name: "Diogo Fortunato",
      image: assets.successDiogo,
      quote:
        "Best midfielder of the season. Diogo combined talent with high-level physical preparation to stand out in Europe. The right training, consistency and focus brought the result."
    }
  ]
};

export const testimonials = {
  pt: [
    {
      name: "Matheus S.",
      quote:
        "Durante minhas férias do clube, a assessoria foi a melhor escolha que eu podia ter feito. Melhorei resistência, velocidade e voltei no melhor preparo físico da minha vida."
    },
    {
      name: "Matheus C.",
      quote:
        "Comecei a treinar como um profissional, aumentei minha velocidade, resistência e potência. Foi o melhor investimento que eu poderia ter feito."
    },
    {
      name: "Hédipo G.",
      quote:
        "Aos 32 anos estou na minha melhor forma física. Tenho jogado 90 minutos, mesmo com sequência pesada, e não tive mais lesões musculares."
    },
    {
      name: "Gilmagnum S.",
      quote:
        "Senti evolução física e técnica muito grande. Melhorei velocidade, resistência, mecânica de corrida, explosão e potência."
    }
  ],
  en: [
    {
      name: "Club player",
      quote:
        "During my club break, the coaching was the best decision I could have made. I improved my stamina, speed and returned in the best shape of my life."
    },
    {
      name: "Performance client",
      quote:
        "I started training like a professional. My speed, endurance and power improved, and the weekly support kept the plan aligned with my routine."
    },
    {
      name: "Adult footballer",
      quote:
        "At 32, I reached my best physical condition. I kept playing full matches in a heavy schedule and stopped dealing with recurring muscle injuries."
    },
    {
      name: "RumoAoPro athlete",
      quote:
        "I felt a major physical and technical evolution: speed, stamina, running mechanics, explosiveness and power all improved."
    }
  ]
};

export const coachingCopy = {
  pt: {
    locale: "pt" as const,
    nav: nav.pt,
    languageHref: "/en/coaching",
    languageLabel: "English",
    heroClass: "hero-image",
    eyebrow: "Assessoria Online RumoAoPro",
    h1: "Treinamento individual para atletas que querem performar como profissionais.",
    lead:
      "Receba um programa personalizado por Lukaz de Paula, preparador físico com licença CBF A, coordenador de performance física do FC Málaga City e CD Almuñécar City na Espanha.",
    primaryCta: "Aplicar para a assessoria",
    secondaryCta: "Ver método",
    proof: [
      "Calendário individual",
      "Controle de carga diário",
      "Suporte semanal",
      "Vagas limitadas"
    ],
    stats: [
      { value: "4", label: "países na trajetória profissional" },
      { value: "CBF A", label: "licença e experiência aplicada no campo" },
      { value: "1:1", label: "programação feita para sua rotina" }
    ],
    methodTitle: "O que muda quando o treino é individual",
    methodLead:
      "A assessoria não entrega uma planilha genérica. Ela organiza seu microciclo, controla resposta ao treino e ajusta o plano conforme sua rotina real.",
    caseTitle: "O trabalho aparece no detalhe da semana",
    caseLead:
      "O calendário, a força, a velocidade, a recuperação e o feedback semanal entram em uma mesma lógica. O objetivo não é treinar mais. É treinar melhor, no momento certo da temporada.",
    benefits: [
      {
        icon: CalendarDays,
        title: "Calendário personalizado",
        body:
          "Sua semana é montada em torno de jogos, treinos do time, academia, campo, viagem, escola ou trabalho."
      },
      {
        icon: Video,
        title: "Vídeos e instruções",
        body:
          "Cada sessão entra no app com exercícios, orientações e referências para você saber exatamente o que executar."
      },
      {
        icon: Activity,
        title: "Controle de carga",
        body:
          "Questionários pós-treino ajudam a acompanhar fadiga, dor, sono e resposta física antes de ajustar a próxima semana."
      },
      {
        icon: MessageCircle,
        title: "Contato direto",
        body:
          "Você tem canal direto com o coach para tirar dúvidas e manter o plano alinhado."
      },
      {
        icon: LineChart,
        title: "Microciclo semanal",
        body:
          "O suporte semanal evita conflito entre treino físico, campo, recuperação e calendário competitivo."
      },
      {
        icon: Trophy,
        title: "Mentalidade profissional",
        body:
          "A estrutura aproxima sua rotina do padrão usado por atletas em clubes, universidades e ambientes de performance."
      }
    ],
    coachTitle: "Treinado por quem vive performance no futebol",
    coachBody:
      "Lukaz de Paula atua hoje como coordenador de performance física do FC Málaga City e CD Almuñécar City na Espanha. Também foi preparador físico da Lindsey Wilson University nos EUA, uma das maiores campeãs nacionais da NAIA, e diretor de treinamento físico da Extratime, academia de performance para jogadores profissionais em Jeddah, na Arábia Saudita. Além de treinador, viveu o jogo como atleta: jogou futebol universitário nos Estados Unidos, passou por Colorado Rapids U23, Desportivo Brasil, Vasalunds IF na Suécia e segue jogando no CD Almuñécar City. Isso ajuda o trabalho a entender o que o atleta sente dentro da rotina real.",
    credentials: [
      "Licença CBF A em Strength & Conditioning",
      "FC Málaga City e CD Almuñécar City",
      "Ex Lindsey Wilson University",
      "Ex Extratime Performance, Jeddah",
      "Ex-atleta universitário e profissional"
    ],
    processTitle: "Como funciona",
    process: [
      {
        title: "Aplicação",
        body:
          "Você envia seus objetivos, rotina, nível atual, estrutura e histórico de lesões."
      },
      {
        title: "Triagem",
        body:
          "A equipe revisa se a assessoria é o melhor caminho e chama você para o próximo passo."
      },
      {
        title: "Plano individual",
        body:
          "Lukaz monta sua programação no app com calendário, vídeos e controle de carga."
      },
      {
        title: "Ajustes semanais",
        body:
          "O microciclo é ajustado conforme jogos, treinos do time, fadiga e evolução."
      }
    ],
    formTitle: "Aplicar para a assessoria",
    formLead:
      "Preencha com detalhes. A triagem existe para garantir que conseguimos te ajudar de verdade antes de falar de pagamento.",
    thankYouPath: "/obrigado",
    emailSubject: "Aplicação Assessoria RumoAoPro",
    form: {
      fullName: "Nome completo",
      age: "Idade",
      location: "País e cidade",
      whatsapp: "WhatsApp",
      email: "Email",
      language: "Idioma preferido",
      level: "Nível atual",
      goal: "Objetivo principal",
      timeline: "Prazo ou meta",
      access: "Acesso a academia/campo",
      injuries: "Histórico de lesões",
      challenge: "Maior dificuldade atual",
      source: "Como chegou até aqui?",
      submit: "Enviar aplicação pelo WhatsApp",
      emailFallback: "Enviar por email",
      required: "Preencha os campos obrigatórios para continuar.",
      select: "Selecionar",
      levels: [
        "Amador competitivo",
        "Base / categoria de formação",
        "Universitário",
        "Semiprofissional",
        "Profissional",
        "Voltando de lesão"
      ],
      languages: ["Português", "English", "Español"],
      sources: ["Instagram", "YouTube", "Anúncio", "Indicação", "Google", "Outro"]
    }
  },
  en: {
    locale: "en" as const,
    nav: nav.en,
    languageHref: "/assessoria",
    languageLabel: "Português",
    heroClass: "hero-image-alt",
    eyebrow: "RumoAoPro Online Coaching",
    h1: "Individual football performance coaching for serious athletes.",
    lead:
      "Get a personalized program by Lukaz de Paula, CBF A licensed strength and conditioning coach, currently leading performance for FC Málaga City and CD Almuñécar City in Spain.",
    primaryCta: "Apply for coaching",
    secondaryCta: "See the method",
    proof: [
      "Individual calendar",
      "Daily load monitoring",
      "Weekly support",
      "Limited spots"
    ],
    stats: [
      { value: "4", label: "countries across his coaching and playing path" },
      { value: "CBF A", label: "licensed football performance background" },
      { value: "1:1", label: "programming built around your schedule" }
    ],
    methodTitle: "What changes when the plan is truly individual",
    methodLead:
      "This is not a generic PDF. Your training week is planned, monitored and adjusted around your football or soccer schedule, gym access, fatigue and goals.",
    caseTitle: "The work shows up in the details of the week",
    caseLead:
      "Calendar, strength, speed exposure, recovery and weekly feedback are connected in one process. The goal is not to train more. It is to train with better timing.",
    benefits: [
      {
        icon: CalendarDays,
        title: "Personal calendar",
        body:
          "Your week is built around matches, team training, gym sessions, field work, travel, school or work."
      },
      {
        icon: Video,
        title: "Videos and instructions",
        body:
          "Each session includes exercises, guidance and references inside the app so you know exactly what to do."
      },
      {
        icon: Activity,
        title: "Load monitoring",
        body:
          "Post-training questionnaires help track fatigue, soreness, sleep and physical response before the next adjustment."
      },
      {
        icon: MessageCircle,
        title: "Direct coach contact",
        body:
          "You get a direct channel with the coach to ask questions and keep the plan aligned."
      },
      {
        icon: LineChart,
        title: "Weekly microcycle",
        body:
          "Weekly support prevents conflict between physical training, football sessions, recovery and competition."
      },
      {
        icon: Trophy,
        title: "Professional routine",
        body:
          "The structure brings your training closer to what athletes use in clubs, universities and performance environments."
      }
    ],
    coachTitle: "Coached by someone living football performance every day",
    coachBody:
      "Lukaz de Paula currently works as physical performance coordinator for FC Málaga City and CD Almuñécar City in Spain. He previously worked as a strength and conditioning coach at Lindsey Wilson University in the United States, one of the top NAIA national championship programs, and as director of physical training at Extratime, a performance facility for professional players in Jeddah, Saudi Arabia. He also lived the game as a player: college soccer in the United States, Colorado Rapids U23, Desportivo Brasil, Vasalunds IF in Sweden and currently CD Almuñécar City. That matters because he understands what the athlete feels inside the real football routine.",
    credentials: [
      "CBF A Strength & Conditioning license",
      "FC Málaga City and CD Almuñécar City",
      "Former Lindsey Wilson University S&C coach",
      "Former Extratime Performance, Jeddah",
      "Former college and professional football player"
    ],
    processTitle: "How it works",
    process: [
      {
        title: "Application",
        body:
          "You send your goals, schedule, current level, training setup and injury history."
      },
      {
        title: "Screening",
        body:
          "The team checks whether coaching is the right fit and contacts you for the next step."
      },
      {
        title: "Individual plan",
        body:
          "Lukaz builds your program inside the app with calendar, videos and load tracking."
      },
      {
        title: "Weekly adjustments",
        body:
          "Your microcycle is adjusted around matches, team sessions, fatigue and progress."
      }
    ],
    formTitle: "Apply for coaching",
    formLead:
      "Share the details. Screening helps us confirm we can actually help before discussing payment.",
    thankYouPath: "/en/thank-you",
    emailSubject: "RumoAoPro Coaching Application",
    form: {
      fullName: "Full name",
      age: "Age",
      location: "Country and city",
      whatsapp: "WhatsApp",
      email: "Email",
      language: "Preferred language",
      level: "Current level",
      goal: "Main goal",
      timeline: "Timeline or target",
      access: "Gym/field access",
      injuries: "Injury history",
      challenge: "Biggest current challenge",
      source: "How did you find us?",
      submit: "Send application on WhatsApp",
      emailFallback: "Send by email",
      required: "Fill in the required fields to continue.",
      select: "Select",
      levels: [
        "Competitive amateur",
        "Academy / youth player",
        "College player",
        "Semi-professional",
        "Professional",
        "Returning from injury"
      ],
      languages: ["English", "Português", "Español"],
      sources: ["Instagram", "YouTube", "Ad", "Referral", "Google", "Other"]
    }
  }
};

export type CoachingCopy =
  | (typeof coachingCopy)["pt"]
  | (typeof coachingCopy)["en"];

export const programs = [
  {
    title: "Offseason Strength & Power",
    tag: "Adama Project",
    duration: "8-9 semanas",
    level: "Força e potência",
    body:
      "O novo Adama Project, com prioridade em força, potência e construção física para atletas que querem chegar mais fortes na temporada.",
    outcomes: [
      "Força útil para duelo e arrancada",
      "Potência sem perder mobilidade",
      "Estrutura de academia com intenção de campo"
    ],
    image: assets.adama,
    href: `${contact.shopify}/products/projeto-adama-9-semanas`,
    cta: "Ver programa"
  },
  {
    title: "Offseason 30 Days",
    tag: "Offseason curta",
    duration: "30 dias",
    level: "Base geral",
    body:
      "Programa mais curto e direto para atletas com pouco tempo de offseason que precisam organizar força, campo e condicionamento.",
    outcomes: [
      "Estrutura simples para 4 semanas",
      "Base de força, velocidade e resistência",
      "Ideal para voltar ao ritmo sem se perder"
    ],
    image: assets.coachFieldDrillWide,
    href: whatsappMessage("Quero entrar na lista do Offseason 30 Days."),
    cta: "Entrar na lista"
  },
  {
    title: "Offseason Speed & Power",
    tag: "Velocidade",
    duration: "Em produção",
    level: "Aceleração e potência",
    body:
      "Foco em desenvolvimento de velocidade, aceleração, exposição a sprint e potência específica para ações decisivas.",
    outcomes: [
      "Mecânica e aceleração",
      "Sprints e mudança de direção",
      "Potência aplicada ao jogo"
    ],
    image: assets.sprintFront,
    href: whatsappMessage("Quero entrar na lista do Offseason Speed & Power."),
    cta: "Entrar na lista"
  },
  {
    title: "Offseason Endurance Program",
    tag: "Resistência",
    duration: "Em produção",
    level: "Capacidade de repetir ações",
    body:
      "Linha voltada para resistência específica: sustentar ritmo, repetir esforços intensos e chegar forte nos minutos finais.",
    outcomes: [
      "Condicionamento com lógica de futebol",
      "Repetição de ações intensas",
      "Controle de fadiga e progressão"
    ],
    image: assets.coachFieldPlaying,
    href: whatsappMessage("Quero entrar na lista do programa de resistência RumoAoPro."),
    cta: "Entrar na lista"
  },
  {
    title: "In-Season Program",
    tag: "Elanga Project",
    duration: "Em produção",
    level: "Manutenção na temporada",
    body:
      "Programa para manter força, velocidade e disponibilidade durante a temporada sem competir com jogos e treinos do time.",
    outcomes: [
      "Microdoses de força e potência",
      "Velocidade no momento certo",
      "Recuperação e disponibilidade"
    ],
    image: assets.rakanPerformanceEn,
    href: whatsappMessage("Quero entrar na lista do In-Season Program Elanga."),
    cta: "Entrar na lista"
  }
];

export const productLadder = [
  {
    step: "01",
    tier: "Entrada",
    title: "Diagnóstico RumoAoPro",
    icon: Target,
    audience:
      "Para o atleta que treina, mas ainda não sabe qual prioridade física destrava o próximo nível.",
    promise:
      "Mapear objetivo, rotina, estrutura, histórico de lesões e melhor caminho dentro da RumoAoPro.",
    delivery: "Questionário rápido + recomendação de rota.",
    href: whatsappMessage("Quero fazer o Diagnóstico RumoAoPro."),
    cta: "Pedir diagnóstico"
  },
  {
    step: "02",
    tier: "Acesso imediato",
    title: "Programas RumoAoPro",
    icon: Dumbbell,
    audience:
      "Para quem quer uma estrutura pronta, objetiva e específica para futebol.",
    promise:
      "Treinar com progressão clara sem depender de agenda individual ou acompanhamento semanal.",
    delivery:
      "Offseason Strength & Power, 30 Days, Speed & Power, Endurance e In-Season.",
    href: "#programas",
    cta: "Ver programas"
  },
  {
    step: "03",
    tier: "Premium guiado",
    title: "Ciclo Game Ready",
    icon: CalendarDays,
    audience:
      "Para peneira, volta de férias, início de temporada ou meta com data marcada.",
    promise:
      "Um ciclo de 8 a 10 semanas com foco em velocidade, potência, resistência e rotina de jogo.",
    delivery: "Programa premium + aulas de execução + checkpoints coletivos.",
    href: whatsappMessage("Quero entrar na lista do Ciclo Game Ready."),
    cta: "Entrar na lista"
  },
  {
    step: "04",
    tier: "Personalizado",
    title: "Assessoria Online",
    icon: LineChart,
    audience:
      "Para atleta com calendário variável, jogos, treinos do time, fadiga e necessidade de ajuste real.",
    promise:
      "Microciclo individual no app, controle de carga e suporte semanal para treinar no timing certo.",
    delivery: "Plano individual + vídeos + feedback + ajustes semanais.",
    href: "/assessoria#aplicacao",
    cta: "Aplicar"
  },
  {
    step: "05",
    tier: "Elite",
    title: "Performance Season",
    icon: Trophy,
    audience:
      "Para atletas profissionais, semiprofissionais ou projetos que precisam planejar uma temporada.",
    promise:
      "Estratégia física com leitura de calendário, fases da temporada e relatórios de evolução.",
    delivery: "Triagem, reunião estratégica, acompanhamento e relatório.",
    href: "/assessoria#aplicacao",
    cta: "Solicitar triagem"
  }
];

export const trainingPillars = [
  {
    title: "Força que transfere",
    icon: Dumbbell,
    body:
      "Construir potência, estabilidade e capacidade de vencer duelos sem virar um treino de academia desconectado do campo."
  },
  {
    title: "Velocidade com intenção",
    icon: Zap,
    body:
      "Expor o atleta a aceleração, mudança de direção, mecânica de corrida e sprints no momento certo da semana."
  },
  {
    title: "Resistência de jogo",
    icon: Activity,
    body:
      "Melhorar a capacidade de repetir ações intensas, sustentar ritmo e chegar forte aos minutos finais."
  },
  {
    title: "Disponibilidade",
    icon: ShieldCheck,
    body:
      "Controlar carga, sono, dor, recuperação e progressão para reduzir conflito entre treino físico, campo e competição."
  }
];

export const programDecisionRows = [
  {
    situation: "Quero começar com direção, mas não sei qual programa escolher.",
    path: "Diagnóstico RumoAoPro",
    reason: "Primeiro define prioridade, depois indica produto."
  },
  {
    situation: "Tenho peneira, volta de férias ou temporada chegando.",
    path: "Offseason 30 Days ou Ciclo Game Ready",
    reason: "A meta tem data e precisa de progressão curta e objetiva."
  },
  {
    situation: "Quero ganhar massa, força e presença física.",
    path: "Offseason Strength & Power",
    reason: "Foco em hipertrofia e força com transferência para o futebol."
  },
  {
    situation: "Quero ficar mais rápido e explosivo.",
    path: "Offseason Speed & Power",
    reason: "Foco em aceleração, sprint, potência e mudança de direção."
  },
  {
    situation: "Canso rápido ou perco intensidade no fim do jogo.",
    path: "Offseason Endurance Program",
    reason: "Foco em repetir ações intensas e sustentar ritmo."
  },
  {
    situation: "Meu calendário muda toda semana e preciso de ajuste.",
    path: "Assessoria Online",
    reason: "Treino individual, controle de carga e suporte semanal."
  }
];

export const quickLinks = [
  {
    label: "Aplicar para a Assessoria",
    href: "/assessoria#aplicacao",
    icon: Target
  },
  {
    label: "Apply for Coaching",
    href: "/en/coaching#application",
    icon: Globe2
  },
  {
    label: "Programas de Treinamento",
    href: "/programas",
    icon: Dumbbell
  },
  {
    label: "Site atual / loja",
    href: contact.shopify,
    icon: ShieldCheck
  },
  {
    label: "WhatsApp",
    href: `https://wa.me/${contact.whatsapp}`,
    icon: MessageCircle
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/lukazdepaula/",
    icon: Zap
  },
  {
    label: "YouTube RumoAoPro",
    href: "https://www.youtube.com/@RumoAoPro",
    icon: CheckCircle2
  }
];
