import type { Metadata } from "next";
import { ElangaRaptorSalesPage } from "@/components/elanga-raptor-sales-page";

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
    images: ["/assets/photos/lukaz-sprint-side.jpg"],
    locale: "en_US",
    type: "website"
  }
};

export default function ElangaInSeasonEnglishPage() {
  return <ElangaRaptorSalesPage locale="en" />;
}
