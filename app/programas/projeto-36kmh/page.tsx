import type { Metadata } from "next";
import { Project36SalesPage } from "@/components/project-36-sales-page";
import { assets } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projeto 36km/h Speed & Acceleration",
  description:
    "Programa de 12 semanas para jogadores de futebol melhorarem aceleração, velocidade máxima, re-aceleração e ações de velocidade no jogo.",
  alternates: {
    canonical: "/programas/projeto-36kmh",
    languages: {
      en: "/en/programs/project-36kmh",
      "pt-BR": "/programas/projeto-36kmh"
    }
  },
  openGraph: {
    title: "Projeto 36km/h Speed & Acceleration",
    description:
      "Sistema de offseason em 3 fases para construir base atlética, aceleração forte e velocidade de jogo.",
    images: [assets.project36Cover],
    locale: "pt_BR",
    type: "website"
  }
};

export default function Projeto36kmhPage() {
  return <Project36SalesPage locale="pt" />;
}
