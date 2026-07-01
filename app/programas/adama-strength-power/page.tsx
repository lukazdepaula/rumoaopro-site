import type { Metadata } from "next";
import { AdamaSalesPage } from "@/components/adama-sales-page";
import { assets } from "@/lib/content";

export const metadata: Metadata = {
  title: "Adama Offseason Strength & Power",
  description:
    "Programa de 12 semanas para atletas de futebol construirem forca, potencia, velocidade e preparacao fisica durante a offseason.",
  alternates: {
    canonical: "/programas/adama-strength-power",
    languages: {
      en: "/en/programs/adama-strength-power",
      "pt-BR": "/programas/adama-strength-power"
    }
  },
  openGraph: {
    title: "Adama Offseason Strength & Power",
    description:
      "Offseason de 12 semanas para construir forca real, potencia e transferencia para o futebol.",
    images: [assets.adamaCover],
    locale: "pt_BR",
    type: "website"
  }
};

export default function AdamaStrengthPowerPage() {
  return <AdamaSalesPage locale="pt" />;
}
