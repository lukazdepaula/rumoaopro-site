import type { Metadata } from "next";
import { AppProductPage } from "@/components/app-product-page";

export const metadata: Metadata = {
  title: "LoadPro | Planejamento e controle de carga para treinadores",
  description: "Planeje o microciclo, acompanhe coletas pré e pós-treino e monitore a carga da equipe com o LoadPro. Conheça os recursos e os planos com teste de 7 dias.",
  alternates: { canonical: "/apps/loadpro", languages: { "pt-BR": "/apps/loadpro", en: "/en/apps/loadpro" } }
};

export default function LoadProPage() {
  return <AppProductPage locale="pt" product="loadpro" />;
}
