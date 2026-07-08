import type { Metadata } from "next";
import { ElangaSalesPage } from "@/components/elanga-sales-page";
import { assets } from "@/lib/content";

export const metadata: Metadata = {
  title: "Elanga Project In-Season",
  description:
    "A 28-week in-season program for football players to maintain strength, speed and power during the season.",
  alternates: {
    canonical: "/en/programs/elanga-in-season",
    languages: {
      en: "/en/programs/elanga-in-season",
      "pt-BR": "/programas/elanga-in-season"
    }
  },
  openGraph: {
    title: "Elanga Project In-Season",
    description:
      "A 7-phase in-season system to maintain strength, sprint exposure, power and availability between team training and matches.",
    images: [assets.elangaCover],
    locale: "en_US",
    type: "website"
  }
};

export default function ElangaInSeasonEnglishPage() {
  return <ElangaSalesPage locale="en" />;
}
