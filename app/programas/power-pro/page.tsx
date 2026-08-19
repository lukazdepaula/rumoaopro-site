import type { Metadata } from "next";
import { PowerProSalesPage } from "@/components/power-pro-sales-page";

export const metadata: Metadata = {
  title: "Power Pro | Força, Potência e Hipertrofia para Futebol",
  description:
    "Programa de 12 semanas, 100% academia, para jogadores desenvolverem força, potência, hipertrofia e um físico atlético com treinos no RaptorPro.",
  alternates: {
    canonical: "/programas/power-pro"
  },
  openGraph: {
    title: "Power Pro — Força, Potência e Hipertrofia",
    description:
      "12 semanas de treinamento em academia para construir força, potência, massa muscular e um físico mais atlético para o futebol.",
    images: ["/assets/programs/power-pro/power-pro-cover-v2.png"],
    locale: "pt_BR",
    type: "website"
  }
};

export default function PowerProPage() {
  return <PowerProSalesPage />;
}
