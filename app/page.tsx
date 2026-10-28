import type { Metadata } from "next";
import { HomeEditorialPage } from "@/components/home-editorial-page";

export const metadata: Metadata = {
  title: "RumoAoPro | Treinamento, programas e assessoria para futebol",
  description:
    "Assessoria, programas interativos no RaptorPro, cursos e LoadPro para atletas e treinadores de futebol."
};

export default function HomePage() {
  return <HomeEditorialPage locale="pt" />;
}
