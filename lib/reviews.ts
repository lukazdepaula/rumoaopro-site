export type ReviewLocale = "pt" | "en";

export type ReviewGroupKey =
  | "preSeason"
  | "adama"
  | "project36"
  | "deVolta"
  | "inSeason"
  | "coaching"
  | "preparadorPro";

type LocalizedText = Record<ReviewLocale, string>;

export type PublicReview = {
  date: string;
  name: string;
  quote: LocalizedText;
  rating: 4 | 5;
  verified: boolean;
};

export type ReviewGroup = {
  average: number;
  count: number;
  reviews: PublicReview[];
  sourceNote: LocalizedText;
};

export const reviewGroups: Record<ReviewGroupKey, ReviewGroup> = {
  preparadorPro: {
    average: 4.5,
    count: 6,
    sourceNote: {
      pt:
        "Avaliações importadas do Loox da loja anterior, referentes à Plataforma Preparador PRO.",
      en:
        "Reviews imported from the previous Loox store for the Preparador PRO platform."
    },
    reviews: [
      {
        date: "loox-import-tiago",
        name: "Tiago T.",
        quote: {
          pt:
            "Mini curso raiz, direto ao ponto. O conteúdo é fácil de aprender e aplicar já no dia seguinte.",
          en:
            "A direct, practical course. The content is easy to learn and apply the very next day."
        },
        rating: 5,
        verified: true
      },
      {
        date: "loox-import-antonio",
        name: "António D.",
        quote: {
          pt:
            "Bem estruturado e de fácil aplicação. Uma boa ajuda no meu trabalho como preparador físico.",
          en:
            "Well structured and easy to apply. A valuable resource for my work as a physical coach."
        },
        rating: 5,
        verified: true
      },
      {
        date: "loox-import-davi",
        name: "Davi P.",
        quote: {
          pt:
            "O programa me deu exatamente a visão que eu esperava para a profissão que quero exercer.",
          en:
            "The program gave me exactly the perspective I wanted for the profession I plan to pursue."
        },
        rating: 5,
        verified: false
      }
    ]
  },
  preSeason: {
    average: 4.74,
    count: 116,
    sourceNote: {
      pt:
        "Avaliações importadas do Loox da loja anterior, agrupando versões do Projeto Pré Temporada.",
      en:
        "Reviews imported from the previous Loox store, grouped from Portuguese Pre-Season editions."
    },
    reviews: [
      {
        date: "2025-03-30",
        name: "Carlos K.",
        quote: {
          pt:
            "Estou na semana 3 e estou gostando bastante. Muito bem organizado.",
          en:
            "I am on week 3 and I am really enjoying it. Very well organized."
        },
        rating: 5,
        verified: true
      },
      {
        date: "2025-03-05",
        name: "Eduardo R.",
        quote: {
          pt:
            "Muito bom os treinos, tento adaptar para quadra, pois sou atleta de futsal e tenho conseguido colocar em prática.",
          en:
            "The sessions are very good. I adapt them to futsal and I have been able to put them into practice."
        },
        rating: 5,
        verified: true
      },
      {
        date: "2025-01-20",
        name: "Ricardo N.",
        quote: {
          pt:
            "Simplesmente sensacional. É muito gratificante terminar cada dia de treino sabendo que você deu seu máximo.",
          en:
            "Simply sensational. It feels great to finish each training day knowing you gave your maximum."
        },
        rating: 5,
        verified: true
      }
    ]
  },
  adama: {
    average: 4.76,
    count: 46,
    sourceNote: {
      pt:
        "Avaliações importadas do Loox da loja anterior, agrupando Projeto Adama e Adama II.",
      en:
        "Reviews imported from the previous Loox store, grouped from Portuguese Adama editions."
    },
    reviews: [
      {
        date: "2025-08-07",
        name: "Sophia S.",
        quote: {
          pt:
            "Conteúdo muito bom, me deu um norte de como ter uma resistência impecável e ainda ter força para jogar os 90 minutos.",
          en:
            "Very good content. It gave me direction to build great endurance and still have strength to play the full 90 minutes."
        },
        rating: 5,
        verified: true
      },
      {
        date: "2024-10-28",
        name: "Gustavo A.",
        quote: {
          pt:
            "Diferente de todos os treinos que já fiz. Estou vendo bastante resultado e ganhando mais divididas em campo.",
          en:
            "Different from every training program I have done. I am seeing results and winning more duels on the field."
        },
        rating: 5,
        verified: true
      },
      {
        date: "2024-05-13",
        name: "Felipe F.",
        quote: {
          pt:
            "Programa excelente. Precisava aumentar minha força e massa muscular e venho obtendo grandes resultados.",
          en:
            "Excellent program. I needed to increase strength and muscle mass and I have been getting great results."
        },
        rating: 5,
        verified: true
      }
    ]
  },
  project36: {
    average: 4.83,
    count: 12,
    sourceNote: {
      pt:
        "Avaliações importadas do Loox da loja anterior, referentes ao Projeto 36 em português.",
      en:
        "Reviews imported from the previous Loox store, from the Portuguese Project 36 edition."
    },
    reviews: [
      {
        date: "2025-08-06",
        name: "Adriel A.",
        quote: {
          pt:
            "Troquei o meu celular recentemente e perdi minhas fotos e dados, porém o programa tem me ajudado bastante.",
          en:
            "I recently changed phones and lost my photos and data, but the program has been helping me a lot."
        },
        rating: 5,
        verified: true
      },
      {
        date: "2023-10-28",
        name: "Antonio C.",
        quote: {
          pt: "Programa incrível, evolui muito. Só tenho a agradecer.",
          en: "Incredible program. I improved a lot and I am very thankful."
        },
        rating: 5,
        verified: true
      },
      {
        date: "2023-02-12",
        name: "Wesley B.",
        quote: {
          pt:
            "Muito satisfeito com a compra. Sequência bem organizada de vídeos e plano de treinos.",
          en:
            "Very happy with the purchase. A well-organized sequence of videos and training plan."
        },
        rating: 5,
        verified: true
      }
    ]
  },
  deVolta: {
    average: 5,
    count: 9,
    sourceNote: {
      pt:
        "Avaliações importadas do Loox da loja anterior, referentes ao De Volta aos Gramados.",
      en:
        "Reviews imported from the previous Loox store, from the De Volta aos Gramados program."
    },
    reviews: [
      {
        date: "2026-05-08",
        name: "Herimar S.",
        quote: {
          pt:
            "Muito bom. Estou na terceira semana e tem me ajudado muito. Não vou precisar das 7 semanas para voltar a fazer o que quero.",
          en:
            "Very good. I am on the third week and it has helped me a lot. I may not need all 7 weeks to return to what I want to do."
        },
        rating: 5,
        verified: true
      },
      {
        date: "2025-05-24",
        name: "Rogerio G.",
        quote: {
          pt: "Adorei. Não conseguia correr e agora já corro.",
          en: "I loved it. I could not run before and now I can."
        },
        rating: 5,
        verified: true
      },
      {
        date: "2024-11-22",
        name: "Marcos A.",
        quote: {
          pt:
            "Voltando de pubalgia. Os exercícios da primeira fase já me deram segurança para voltar a jogar.",
          en:
            "Returning from groin pain. The first phase exercises already gave me more confidence to play again."
        },
        rating: 5,
        verified: true
      }
    ]
  },
  inSeason: {
    average: 4.96,
    count: 26,
    sourceNote: {
      pt:
        "Avaliações importadas do Loox da loja anterior, agrupando programas de temporada/in-season.",
      en:
        "Reviews imported from the previous Loox store, grouped from in-season training programs."
    },
    reviews: [
      {
        date: "2025-11-19",
        name: "Victor F.",
        quote: {
          pt:
            "Estou ficando mais ágil, com muito mais velocidade e mais forte nas divididas corpo a corpo.",
          en:
            "I am getting more agile, much faster and stronger in physical duels."
        },
        rating: 5,
        verified: true
      },
      {
        date: "2025-11-09",
        name: "João Victor N.",
        quote: {
          pt: "Programa completo, melhor investimento.",
          en: "Complete program, best investment."
        },
        rating: 5,
        verified: true
      },
      {
        date: "2022-05-30",
        name: "Antônio C.",
        quote: {
          pt:
            "Já estou na terceira semana e estou tendo uma evolução gigantesca. Recomendo, ótimo produto.",
          en:
            "I am already on the third week and seeing a huge evolution. I recommend it, great product."
        },
        rating: 5,
        verified: true
      }
    ]
  },
  coaching: {
    average: 4.69,
    count: 13,
    sourceNote: {
      pt:
        "Avaliações importadas do Loox da loja anterior, referentes à assessoria e sessões individuais.",
      en:
        "Reviews imported from the previous Loox store, from coaching and individual sessions."
    },
    reviews: [
      {
        date: "2026-07-13",
        name: "Rogerio G.",
        quote: {
          pt: "Adorei os treinos, sinto uma grande evolução em apenas um mês.",
          en: "I loved the sessions. I feel a big improvement in just one month."
        },
        rating: 5,
        verified: true
      },
      {
        date: "2023-01-30",
        name: "Matheus S.",
        quote: {
          pt:
            "Melhorei muito minha resistência e minha velocidade. Voltei no melhor preparo físico da minha vida.",
          en:
            "I improved my endurance and speed a lot. I returned in the best physical shape of my life."
        },
        rating: 5,
        verified: true
      },
      {
        date: "2020-11-06",
        name: "Matheus C.",
        quote: {
          pt:
            "Comecei a treinar como um profissional, aumentar minha velocidade, resistência e me tornei mais potente.",
          en:
            "I started training like a professional, increased my speed and endurance, and became more powerful."
        },
        rating: 5,
        verified: true
      }
    ]
  }
};

export const reviewGroupByProgramHref: Record<string, ReviewGroupKey> = {
  "/programas/offseason-30-days": "preSeason",
  "/en/programs/offseason-30-days": "preSeason",
  "/programas/projeto-pre-temporada": "preSeason",
  "/programas/adama-strength-power": "adama",
  "/en/programs/adama-strength-power": "adama",
  "/programas/projeto-adama-2022": "adama",
  "/programas/projeto-36kmh": "project36",
  "/en/programs/project-36kmh": "project36",
  "/programas/projeto-36-2022": "project36",
  "/programas/de-volta-aos-gramados": "deVolta",
  "/programas/elanga-in-season": "inSeason",
  "/en/programs/elanga-in-season": "inSeason"
};

export function getReviewGroupForProgramHref(href: string) {
  return reviewGroupByProgramHref[href];
}
