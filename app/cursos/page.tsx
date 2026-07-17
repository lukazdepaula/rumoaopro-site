import type { Metadata } from "next";
import { PreparadorProPage } from "@/components/preparador-pro-page";

export const metadata: Metadata = {
  title: "Preparador PRO | Curso para preparadores de futebol",
  description:
    "Aprenda a planejar potência, velocidade, resistência, avaliações e periodização para jogadores de futebol com o Preparador PRO."
};

export default function CoursesPage() {
  return <PreparadorProPage locale="pt" />;
}
