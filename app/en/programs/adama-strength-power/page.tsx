import type { Metadata } from "next";
import { AdamaSalesPage } from "@/components/adama-sales-page";
import { assets } from "@/lib/content";

export const metadata: Metadata = {
  title: "Adama Offseason Strength & Power",
  description:
    "A 12-week football offseason program to build strength, power, speed exposure and physical presence.",
  alternates: {
    canonical: "/en/programs/adama-strength-power",
    languages: {
      en: "/en/programs/adama-strength-power",
      "pt-BR": "/programas/adama-strength-power"
    }
  },
  openGraph: {
    title: "Adama Offseason Strength & Power",
    description:
      "A 12-week football offseason program built around strength, power and field transfer.",
    images: [assets.adamaCover],
    locale: "en_US",
    type: "website"
  }
};

export default function AdamaStrengthPowerEnglishPage() {
  return <AdamaSalesPage locale="en" />;
}
