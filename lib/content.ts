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
  appInterface: "/assets/app/app-interface.png",
  appCalendarScreen: "/assets/app/app-calendar.png",
  logoCbf: "/assets/logos/cbf.svg",
  logoMalagaCity: "/assets/logos/malaga-city-transparent.png",
  logoLindseyWilson: "/assets/logos/lindsey-wilson-transparent.png",
  logoAlmunecar: "/assets/logos/almunecar-city.png",
  logoColoradoRapids: "/assets/logos/colorado-rapids.png",
  logoDesportivoBrasil: "/assets/logos/desportivo-brasil.png",
  logoExtratime: "/assets/logos/extratime-transparent.png",
  logoVasalunds: "/assets/logos/vasalunds.png",
  logoVasalundsTransparent: "/assets/logos/vasalunds-transparent.png",
  adamaCover: "/assets/programs/adama/adama-cover.webp",
  adamaPhase1Overview: "/assets/programs/adama/adama-phase-1-overview.jpg",
  adamaPhase2Overview: "/assets/programs/adama/adama-phase-2-overview.jpg",
  adamaPhase3Overview: "/assets/programs/adama/adama-phase-3-overview.jpg",
  adamaFieldPlay: "/assets/programs/adama/adama-field-play.jpg",
  adamaCoachField: "/assets/programs/adama/adama-coach-field.jpg",
  adamaSprintFront: "/assets/programs/adama/adama-sprint-front.jpg",
  adamaSprintSide: "/assets/programs/adama/adama-sprint-side.jpg",
  successTheo: "/assets/success/theo-ferreira-player.jpg",
  successHaroune: "/assets/success/haroune-camara-player.jpg",
  successAmar: "/assets/success/amar-player.jpg",
  successJackson: "/assets/success/jackson-player.jpg",
  successDiogo: "/assets/success/diogo-fortunato-player.jpg",
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
    { label: "Programs", href: "/en/programs" },
    { label: "Links", href: "/en/links" },
    { label: "🇧🇷 Português", href: "/assessoria" }
  ]
};

export const testimonialScreens = [
  "/assets/testimonials/testimonial-2.png",
  "/assets/testimonials/testimonial-3.png",
  "/assets/testimonials/testimonial-4.png",
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
  {
    name: "FC Málaga City",
    role: "Performance staff",
    image: assets.logoMalagaCity
  },
  {
    name: "Extratime Performance",
    role: "Director of physical training",
    image: assets.logoExtratime
  },
  {
    name: "Lindsey Wilson University",
    role: "Former S&C coach",
    image: assets.logoLindseyWilson
  },
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
    image: assets.logoVasalundsTransparent
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

export const shopifyProducts = {
  offseason30:
    "https://www.rumoaopro.com.br/collections/in-english/products/preseason-project-12-weeks",
  adama:
    "https://www.rumoaopro.com.br/collections/in-english/products/offseason-strength-and-power-the-adama-project-12-weeks",
  preTemporada:
    "https://www.rumoaopro.com.br/collections/programas-de-treinamento/products/projeto-pre-temporada",
  deVoltaAosGramados:
    "https://www.rumoaopro.com.br/collections/programas-de-treinamento/products/de-volta-aos-gramados-rehabilitacao-de-pubalgia",
  projeto36:
    "https://www.rumoaopro.com.br/collections/programas-de-treinamento/products/projeto-36-12-semanas",
  elanga:
    "https://www.rumoaopro.com.br/collections/in-english/products/elanga-project"
};

export const programs = [
  {
    title: "Offseason Program 30 Days",
    tag: "PT + EN",
    duration: "30 dias",
    level: "Offseason curta",
    body:
      "Para atletas com uma janela curta de preparação que precisam organizar força, velocidade, campo e condicionamento sem perder tempo.",
    outcomes: [
      "4 semanas com estrutura objetiva",
      "Base física para voltar mais pronto",
      "Ideal para férias curtas, peneira ou retorno aos treinos"
    ],
    image: assets.coachFieldDrillWide,
    href: shopifyProducts.offseason30,
    cta: "Comprar programa"
  },
  {
    title: "Adama Offseason Strength & Power",
    tag: "PT + EN",
    duration: "12 semanas",
    level: "Força e potência",
    body:
      "Programa de offseason com prioridade em força, potência e construção física para atletas que querem chegar mais fortes na temporada.",
    outcomes: [
      "Força útil para duelo e arrancada",
      "Potência sem perder mobilidade",
      "Progressão completa de academia com intenção de campo"
    ],
    image: assets.adamaCover,
    href: "/programas/adama-strength-power",
    cta: "Ver página"
  },
  {
    title: "Projeto Pré Temporada",
    tag: "Português",
    duration: "12 semanas",
    level: "Preparação completa",
    body:
      "Estrutura completa para chegar mais pronto ao início da temporada, combinando força, velocidade, resistência e rotina de campo.",
    outcomes: [
      "Organização física para pré-temporada",
      "Força, velocidade e condicionamento no mesmo plano",
      "Progressão para sair do improviso"
    ],
    image: assets.preSeason,
    href: shopifyProducts.preTemporada,
    cta: "Comprar programa"
  },
  {
    title: "De Volta aos Gramados",
    tag: "Português",
    duration: "Reabilitação",
    level: "Pubalgia / retorno",
    body:
      "Para atletas que precisam voltar a treinar com mais segurança após dor na região da pubalgia/adutores, respeitando progressão e controle.",
    outcomes: [
      "Progressão de retorno aos treinos",
      "Força e estabilidade para quadril e adutores",
      "Estrutura para reduzir tentativa solta"
    ],
    image: assets.dvg,
    href: shopifyProducts.deVoltaAosGramados,
    cta: "Comprar programa"
  },
  {
    title: "Projeto 36km/h",
    tag: "Português",
    duration: "12 semanas",
    level: "Velocidade",
    body:
      "Foco em aceleração, técnica de sprint, potência e exposição progressiva à velocidade para atletas que querem correr melhor.",
    outcomes: [
      "Mecânica e aceleração",
      "Sprints com progressão inteligente",
      "Velocidade aplicada ao futebol"
    ],
    image: assets.sprintFront,
    href: shopifyProducts.projeto36,
    cta: "Comprar programa"
  },
  {
    title: "Projeto Elanga In-Season",
    tag: "English",
    duration: "In-season",
    level: "Manutenção na temporada",
    body:
      "Programa em inglês para manter força, velocidade e disponibilidade durante a temporada sem competir com jogos e treinos do time.",
    outcomes: [
      "Microdoses de força e potência",
      "Velocidade no momento certo",
      "Recuperação e disponibilidade"
    ],
    image: assets.rakanPerformanceEn,
    href: shopifyProducts.elanga,
    cta: "Comprar programa"
  }
];

export const programsEn = [
  {
    title: "Offseason Program 30 Days",
    tag: "EN + PT",
    duration: "30 days",
    level: "Short offseason",
    body:
      "For players with a short preparation window who need strength, speed, field work and conditioning organized without wasting time.",
    outcomes: [
      "4 weeks with a clear structure",
      "Physical base to return sharper",
      "Ideal for short breaks, trials or return to training"
    ],
    image: assets.coachFieldDrillWide,
    href: shopifyProducts.offseason30,
    cta: "Buy program"
  },
  {
    title: "Adama Offseason Strength & Power",
    tag: "EN + PT",
    duration: "12 weeks",
    level: "Strength and power",
    body:
      "An offseason program built around strength, power and physical presence for players who want to enter the season stronger.",
    outcomes: [
      "Useful strength for duels and acceleration",
      "Power without losing mobility",
      "Gym progression connected to football demands"
    ],
    image: assets.adamaCover,
    href: "/en/programs/adama-strength-power",
    cta: "View page"
  },
  {
    title: "Projeto Elanga In-Season",
    tag: "English",
    duration: "In-season",
    level: "Season maintenance",
    body:
      "An in-season program to maintain strength, speed and availability without fighting against matches and team training.",
    outcomes: [
      "Small doses of strength and power",
      "Speed exposure at the right time",
      "Recovery and availability through the season"
    ],
    image: assets.rakanPerformanceEn,
    href: shopifyProducts.elanga,
    cta: "Buy program"
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
      "Offseason 30 Days, Adama Strength & Power, Pré Temporada, De Volta aos Gramados, 36km/h e Elanga In-Season.",
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
    situation: "Tenho pouco tempo de férias ou preciso voltar rápido à rotina.",
    path: "Offseason Program 30 Days",
    reason: "A meta é organizar 4 semanas sem complicar o calendário."
  },
  {
    situation: "Quero ganhar força, potência e presença física.",
    path: "Adama Offseason Strength & Power",
    reason: "Foco em hipertrofia e força com transferência para o futebol."
  },
  {
    situation: "Quero me preparar para o início da temporada.",
    path: "Projeto Pré Temporada",
    reason: "Foco completo em força, velocidade, resistência e ritmo."
  },
  {
    situation: "Estou voltando de pubalgia ou dor em adutor/quadril.",
    path: "De Volta aos Gramados",
    reason: "Progressão mais cuidadosa para retorno aos treinos."
  },
  {
    situation: "Quero ficar mais rápido e explosivo.",
    path: "Projeto 36km/h",
    reason: "Foco em aceleração, sprint, potência e mudança de direção."
  },
  {
    situation: "Estou em temporada e quero manter o físico sem atrapalhar jogos.",
    path: "Projeto Elanga In-Season",
    reason: "Microdoses de força, velocidade e recuperação durante o calendário."
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
