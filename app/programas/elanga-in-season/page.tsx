import type { Metadata } from "next";
import { InSeasonEditorialPage } from "@/components/in-season-editorial-page";

export const metadata: Metadata = {
  title: "Programa de Performance Durante a Temporada | In-Season Pro",
  description:
    "28 semanas de força, potência, velocidade e recuperação para manter jogadores performando durante a temporada competitiva.",
  alternates: {
    canonical: "/programas/elanga-in-season",
    languages: {
      en: "/en/programs/elanga-in-season",
      "pt-BR": "/programas/elanga-in-season"
    }
  },
  openGraph: {
    title: "Programa de Performance Durante a Temporada | In-Season Pro",
    description:
      "Sistema de temporada em 7 fases para manter força, sprint exposure, potência e disponibilidade entre treinos e jogos.",
    images: ["/assets/photos/lukaz-sprint-side.jpg"],
    locale: "pt_BR",
    type: "website"
  }
};

export default function ElangaInSeasonPage() {
  return <InSeasonEditorialPage locale="pt" />;
}
