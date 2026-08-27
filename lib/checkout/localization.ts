import type { CheckoutProduct } from "@/lib/checkout/types";

const englishProductCopy: Record<
  string,
  { description: string; name?: string; salesPagePath: string }
> = {
  "assessoria-online": {
    name: "RumoAoPro Online Coaching · 30 days",
    description:
      "Individual coaching with personalized training, calendar-based adjustments and direct support from the RumoAoPro team.",
    salesPagePath: "/en/coaching"
  },
  "loadpro-founders": {
    name: "LoadPro · Founders 30",
    description:
      "Monthly LoadPro subscription for planning microcycles, collecting readiness and RPE, and reporting across up to two teams.",
    salesPagePath: "https://loadpro.rumoaopro.com.br/"
  },
  "loadpro-founders-50": {
    name: "LoadPro · Founders 50",
    description:
      "Monthly LoadPro subscription for planning microcycles, collecting readiness and RPE, and reporting across up to two larger squads.",
    salesPagePath: "https://loadpro.rumoaopro.com.br/"
  },
  "offseason-30-days": {
    description:
      "30-day program combining field work, gym sessions, speed and conditioning for a short offseason.",
    salesPagePath: "/en/programs/offseason-30-days"
  },
  "adama-offseason-strength-and-power": {
    description:
      "12-week offseason program to build strength, power and physical presence for football.",
    salesPagePath: "/en/programs/adama-strength-power"
  },
  "project-36": {
    name: "Speed Pro",
    description:
      "12 weeks to develop acceleration, maximum velocity, power and football-specific sprint mechanics.",
    salesPagePath: "/en/programs/project-36kmh"
  },
  "elanga-in-season": {
    description:
      "In-season program to maintain strength, speed and availability throughout the competitive season.",
    salesPagePath: "/en/programs/elanga-in-season"
  },
  "de-volta-aos-gramados": {
    name: "Back to the Pitch",
    description:
      "A seven-phase gym and pitch progression for medically cleared football players returning after groin, adductor or hip pain.",
    salesPagePath: "/en/programs/de-volta-aos-gramados"
  }
};

export function getLocalizedProductCopy(
  product: CheckoutProduct,
  locale: "pt" | "en"
) {
  const english = englishProductCopy[product.slug];

  if (locale === "en" && english) {
    return {
      name: english.name ?? product.name,
      description: english.description,
      salesPagePath: english.salesPagePath
    };
  }

  return {
    name: product.name,
    description: product.description,
    salesPagePath: product.sales_page_path
  };
}
