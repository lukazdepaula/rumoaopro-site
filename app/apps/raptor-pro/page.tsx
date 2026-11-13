import type { Metadata } from "next";
import { AppProductPage } from "@/components/app-product-page";

export const metadata: Metadata = {
  title: "Raptor Pro | Treinos e acompanhamento de atletas",
  description: "Prescreva sessões, acompanhe a execução e consulte a evolução dos atletas no Raptor Pro. Conheça o calendário, os registros e o piloto para treinadores por convite.",
  alternates: { canonical: "/apps/raptor-pro", languages: { "pt-BR": "/apps/raptor-pro", en: "/en/apps/raptor-pro" } }
};

export default function RaptorProPage() {
  return <AppProductPage locale="pt" product="raptor-pro" />;
}
