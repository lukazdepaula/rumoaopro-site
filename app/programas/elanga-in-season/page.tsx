import type { Metadata } from "next";
import { ElangaSalesPage } from "@/components/elanga-sales-page";
import { assets } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projeto Elanga In-Season",
  description:
    "Programa in-season de 28 semanas para jogadores manterem força, velocidade e potência durante a temporada.",
  alternates: {
    canonical: "/programas/elanga-in-season",
    languages: {
      en: "/en/programs/elanga-in-season",
      "pt-BR": "/programas/elanga-in-season"
    }
  },
  openGraph: {
    title: "Projeto Elanga In-Season",
    description:
      "Sistema de temporada em 7 fases para manter força, sprint exposure, potência e disponibilidade entre treinos e jogos.",
    images: [assets.elangaCover],
    locale: "pt_BR",
    type: "website"
  }
};

export default function ElangaInSeasonPage() {
  return <ElangaSalesPage locale="pt" />;
}
