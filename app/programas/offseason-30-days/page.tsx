import type { Metadata } from "next";
import { Offseason30SalesPage } from "@/components/offseason-30-sales-page";
import { assets } from "@/lib/content";

export const metadata: Metadata = {
  title: "Offseason Program 30 Days",
  description:
    "Programa de 30 dias para jogadores de futebol organizarem velocidade, força, potência e condicionamento em uma offseason curta.",
  alternates: {
    canonical: "/programas/offseason-30-days",
    languages: {
      en: "/en/programs/offseason-30-days",
      "pt-BR": "/programas/offseason-30-days"
    }
  },
  openGraph: {
    title: "Offseason Program 30 Days",
    description:
      "Uma estrutura curta e direta para organizar campo, academia e condicionamento em 30 dias.",
    images: [assets.offseason30Cover],
    locale: "pt_BR",
    type: "website"
  }
};

export default function Offseason30DaysPage() {
  return <Offseason30SalesPage locale="pt" />;
}
