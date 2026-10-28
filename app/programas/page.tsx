import type { Metadata } from "next";
import { ProgramCatalogPage } from "@/components/program-catalog-page";

export const metadata: Metadata = {
  title: "Programas de treinamento para futebol",
  description:
    "Compare os programas RumoAoPro por objetivo, duração, estrutura e idioma. Treinos de força, velocidade, offseason e temporada no RaptorPro."
};

export default function ProgramasPage() {
  return <ProgramCatalogPage locale="pt" />;
}
