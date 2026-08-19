import type { Metadata } from "next";
import { PowerProSalesPage } from "@/components/power-pro-sales-page";

export const metadata: Metadata = {
  title: "Power Pro | Força e Potência para Futebol",
  description:
    "Programa de 12 semanas, 100% academia, para jogadores desenvolverem força, potência e um físico atlético com treinos no RaptorPro.",
  alternates: {
    canonical: "/programas/power-pro"
  },
  openGraph: {
    title: "Power Pro — Força & Potência",
    description:
      "12 semanas de treinamento em academia para construir força, potência e um físico mais atlético para o futebol.",
    images: ["/assets/photos/programs/programs-gym-briefing.jpg"],
    locale: "pt_BR",
    type: "website"
  }
};

export default function PowerProPage() {
  return <PowerProSalesPage />;
}
