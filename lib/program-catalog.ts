import { programs, programsEn } from "@/lib/content";
import { checkoutProducts } from "@/lib/checkout/products";

export type CatalogGoal = "gym" | "speed" | "offseason" | "inseason" | "return";
export type CatalogProgram = {
  id: CatalogGoal;
  name: string;
  body: string;
  focus: string;
  duration: string;
  language: string;
  equipment: string;
  image: string;
  imagePosition: string;
  href: string;
  priceBrl: number;
  priceUsd: number;
};

// Only public catalog fields are passed to the interactive browser. Prices are
// resolved on the server from the same configuration used by checkout.
const definitions = [
  { id: "gym", productId: "power_pro", name: ["Power Pro", "Power Pro"], paths: ["/programas/power-pro", "/programas/power-pro"], focus: ["Força, potência e hipertrofia", "Strength, power and muscle"], equipment: ["Somente academia", "Gym only"], position: "50% 35%" },
  { id: "speed", productId: "project_36", name: ["Speed Pro", "Speed Pro"], paths: ["/programas/projeto-36kmh", "/en/programs/project-36kmh"], focus: ["Aceleração e velocidade", "Acceleration and speed"], equipment: ["Campo + academia", "Pitch + gym"], position: "64% 50%" },
  { id: "offseason", productId: "offseason_30_days", name: ["Offseason 30 Days", "Offseason 30 Days"], paths: ["/programas/offseason-30-days", "/en/programs/offseason-30-days"], focus: ["Preparação antes da temporada", "Preparation before the season"], equipment: ["Campo + academia", "Pitch + gym"], position: "50% 20%" },
  { id: "inseason", productId: "elanga_in_season", name: ["In-Season Pro", "In-Season Pro"], paths: ["/programas/elanga-in-season", "/en/programs/elanga-in-season"], focus: ["Manutenção entre jogos", "Maintenance between matches"], equipment: ["Campo + academia", "Pitch + gym"], position: "50% 35%" },
  { id: "return", productId: "de_volta_aos_gramados_pt", name: ["De Volta aos Gramados", "Back to the Pitch"], paths: ["/programas/de-volta-aos-gramados", "/en/programs/de-volta-aos-gramados"], focus: ["Retorno após liberação profissional", "Return after professional clearance"], equipment: ["Academia + campo, por fase", "Gym + pitch, by phase"], position: "50% 40%" }
] as const;

export function getProgramCatalog(locale: "pt" | "en"): CatalogProgram[] {
  const languageIndex = locale === "pt" ? 0 : 1;
  const localizedPrograms = locale === "pt" ? programs : programsEn;
  return definitions.flatMap(definition => {
    const product = checkoutProducts.find(item => item.id === definition.productId);
    const copy = localizedPrograms.find(item => item.href === definition.paths[languageIndex]);
    if (!product?.active || !copy) return [];
    return [{
      id: definition.id,
      name: definition.name[languageIndex],
      body: copy.body,
      focus: definition.focus[languageIndex],
      duration: copy.duration,
      language: copy.tag,
      equipment: definition.equipment[languageIndex],
      image: definition.id === "return" ? "/assets/programs/dvg/dvg-return-to-play-cover-v3.png" : copy.image,
      imagePosition: definition.position,
      href: copy.href,
      priceBrl: product.price_brl,
      priceUsd: product.price_usd
    }];
  });
}
