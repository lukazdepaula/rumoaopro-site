import type { CheckoutProduct, ProgramMaterial } from "@/lib/checkout/types";
import { usdToBrl } from "@/lib/checkout/pricing";

const now = "2026-07-07T00:00:00.000Z";

const envPrice = (key: string, fallback: number) => {
  const value = process.env[key];
  if (!value) return fallback;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const englishProgramUsd = 40;

const productPrice = () => {
  const basePriceUsd = envPrice("RAP_PROGRAM_BASE_PRICE_USD", englishProgramUsd);
  const brlEstimate = usdToBrl(basePriceUsd);

  return {
    base_price_usd: basePriceUsd,
    price_usd: basePriceUsd,
    price_brl_estimated: brlEstimate,
    price_brl: brlEstimate
  };
};

const fixedBrlProductPrice = (basePriceUsd: number, brlPrice: number) => ({
  base_price_usd: basePriceUsd,
  price_usd: basePriceUsd,
  price_brl_estimated: brlPrice,
  price_brl: brlPrice
});

export const checkoutLinks = {
  offseason30: "/checkout/offseason-30-days",
  adama: "/checkout/adama-offseason-strength-and-power",
  preTemporada: "/checkout/projeto-pre-temporada",
  adama2022: "/checkout/projeto-adama-2022",
  deVoltaAosGramados: "/checkout/de-volta-aos-gramados",
  projeto36: "/checkout/project-36",
  projeto362022: "/checkout/projeto-36-2022",
  elanga: "/checkout/elanga-in-season"
};

export const checkoutProducts: CheckoutProduct[] = [
  {
    id: "offseason_30_days",
    name: "Offseason 30 Days",
    slug: "offseason-30-days",
    description:
      "Programa de 30 dias para organizar campo, academia, velocidade e condicionamento em uma offseason curta.",
    language: "English",
    type: "training_program",
    ...productPrice(),
    active: true,
    sales_page_path: "/programas/offseason-30-days",
    cover_image: "/assets/programs/offseason-30/offseason-30-preview-01.jpg",
    delivery_type: "member_area",
    file_id: "offseason-30-days.pdf",
    created_at: now,
    updated_at: now
  },
  {
    id: "adama_strength_power",
    name: "Adama Offseason Strength and Power",
    slug: "adama-offseason-strength-and-power",
    description:
      "Programa de 12 semanas para construir força, potência e presença física na offseason.",
    language: "English",
    type: "training_program",
    ...productPrice(),
    active: true,
    sales_page_path: "/programas/adama-strength-power",
    cover_image: "/assets/programs/adama/adama-cover.webp",
    delivery_type: "member_area",
    file_id: "adama-strength-power.pdf",
    aliases: ["adama-strength-power"],
    created_at: now,
    updated_at: now
  },
  {
    id: "project_36",
    name: "Project 36",
    slug: "project-36",
    description:
      "Sistema de 12 semanas para aceleração, top speed, re-aceleração e velocidade de jogo.",
    language: "English",
    type: "training_program",
    ...productPrice(),
    active: true,
    sales_page_path: "/programas/projeto-36kmh",
    cover_image: "/assets/programs/project-36/project-36-cover.jpg",
    delivery_type: "member_area",
    file_id: "projeto-36kmh-speed-acceleration.zip",
    aliases: ["projeto-36kmh", "project-36kmh"],
    created_at: now,
    updated_at: now
  },
  {
    id: "elanga_in_season",
    name: "Elanga In Season",
    slug: "elanga-in-season",
    description:
      "Programa in-season para manter força, velocidade e disponibilidade durante a temporada.",
    language: "English",
    type: "training_program",
    ...productPrice(),
    active: true,
    sales_page_path: "/programas/elanga-in-season",
    cover_image: "/assets/programs/elanga/elanga-cover.jpg",
    delivery_type: "member_area",
    file_id: "elanga-in-season.zip",
    created_at: now,
    updated_at: now
  },
  {
    id: "projeto_pre_temporada_pt",
    name: "Projeto Pré Temporada",
    slug: "projeto-pre-temporada",
    description:
      "Programa em português de 12 semanas para organizar campo, academia e condicionamento antes da temporada.",
    language: "Portuguese",
    type: "training_program",
    ...productPrice(),
    active: true,
    sales_page_path: "/programas/projeto-pre-temporada",
    cover_image: "/assets/programs/pt/projeto-pre-temporada-cover.jpg",
    delivery_type: "member_area",
    file_id: null,
    aliases: ["pre-temporada", "projeto-pretemporada"],
    created_at: now,
    updated_at: now
  },
  {
    id: "projeto_adama_2022_pt",
    name: "Projeto Adama 2022",
    slug: "projeto-adama-2022",
    description:
      "Programa em português para construir força, hipertrofia e presença física no futebol.",
    language: "Portuguese",
    type: "training_program",
    ...productPrice(),
    active: true,
    sales_page_path: "/programas/projeto-adama-2022",
    cover_image: "/assets/programs/pt/projeto-adama-2022-cover.jpg",
    delivery_type: "member_area",
    file_id: null,
    aliases: ["projeto-adama", "projeto-adama-9-semanas"],
    created_at: now,
    updated_at: now
  },
  {
    id: "projeto_36_2022_pt",
    name: "Projeto 36 km/h",
    slug: "projeto-36-2022",
    description:
      "Programa em português de 12 semanas para desenvolver força, aceleração e velocidade no futebol.",
    language: "Portuguese",
    type: "training_program",
    ...productPrice(),
    active: true,
    sales_page_path: "/programas/projeto-36-2022",
    cover_image: "/assets/programs/pt/projeto-36-2022-cover.jpg",
    delivery_type: "member_area",
    file_id: null,
    aliases: ["projeto-36", "projeto-36-12-semanas"],
    created_at: now,
    updated_at: now
  },
  {
    id: "de_volta_aos_gramados_pt",
    name: "De Volta aos Gramados",
    slug: "de-volta-aos-gramados",
    description:
      "Programa em português para retorno gradual aos treinos após dores em pubalgia, adutores ou quadril.",
    language: "Portuguese",
    type: "training_program",
    ...productPrice(),
    active: true,
    sales_page_path: "/programas/de-volta-aos-gramados",
    cover_image: "/assets/programs/pt/de-volta-aos-gramados-cover.jpg",
    delivery_type: "member_area",
    file_id: null,
    aliases: ["de-volta-aos-gramados-rehabilitacao-de-pubalgia"],
    created_at: now,
    updated_at: now
  },
  {
    id: "pix_webhook_test",
    name: "Teste Pix R$ 1",
    slug: "pix-webhook-test",
    description:
      "Produto interno para validar Mercado Pago, Pix, webhook e status paid.",
    language: "Portuguese",
    type: "other",
    ...fixedBrlProductPrice(1, 1),
    active: true,
    sales_page_path: "/admin/products",
    cover_image: "/assets/brand/rumoaopro-logo.svg",
    delivery_type: "manual",
    file_id: null,
    created_at: now,
    updated_at: now
  }
];

export const programMaterials: ProgramMaterial[] = checkoutProducts.flatMap(
  (product) => [
    {
      id: `${product.id}_overview`,
      product_id: product.id,
      title: "Program overview",
      description:
        "Start here. This section explains the goal, structure and how to follow the program.",
      type: "text",
      sort_order: 1,
      is_active: true,
      file_path_private: null,
      external_url: null,
      created_at: now,
      updated_at: now
    },
    {
      id: `${product.id}_main_material`,
      product_id: product.id,
      title: "Training material",
      description:
        "Private program file placeholder. The real PDF or file will be connected through private storage.",
      type: "pdf",
      sort_order: 2,
      is_active: true,
      file_path_private: product.file_id,
      external_url: null,
      created_at: now,
      updated_at: now
    },
    {
      id: `${product.id}_support`,
      product_id: product.id,
      title: "Support notes",
      description:
        "Coach notes, progression reminders and future video links for this program.",
      type: "text",
      sort_order: 3,
      is_active: true,
      file_path_private: null,
      external_url: null,
      created_at: now,
      updated_at: now
    }
  ]
);

export function getActiveProducts() {
  return checkoutProducts.filter((product) => product.active);
}

export function getProductBySlug(slug: string) {
  return checkoutProducts.find(
    (product) =>
      product.active &&
      (product.slug === slug || product.aliases?.includes(slug))
  );
}

export function getProductById(id: string) {
  return checkoutProducts.find((product) => product.id === id);
}

export function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat(currency === "BRL" ? "pt-BR" : "en-US", {
    style: "currency",
    currency
  }).format(amount);
}
