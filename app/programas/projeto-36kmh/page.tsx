import type { Metadata } from "next";
import { Project36SalesPage } from "@/components/project-36-sales-page";

export const metadata: Metadata = {
  title: "Projeto 36: Velocidade e Aceleração",
  description:
    "Programa bilíngue de 12 semanas para jogadores de futebol desenvolverem aceleração, velocidade máxima e velocidade de jogo.",
  alternates: {
    canonical: "/programas/projeto-36kmh",
    languages: {
      en: "/en/programs/project-36kmh",
      "pt-BR": "/programas/projeto-36kmh"
    }
  },
  openGraph: {
    title: "Projeto 36: Velocidade e Aceleração",
    description:
      "Método de offseason em 3 fases, disponível em português e inglês, para correr mais rápido e transferir velocidade para o jogo.",
    images: ["/assets/programs/project-36/project-36-sprint.jpg"],
    locale: "pt_BR",
    type: "website"
  }
};

export default function Projeto36kmhPage() {
  return <Project36SalesPage locale="pt" />;
}
