import type { Metadata } from "next";
import { PortugueseProgramSalesPage } from "@/components/portuguese-program-sales-page";
import { portugueseProgramSalesPages } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projeto Pré Temporada",
  description:
    "Programa em português de 12 semanas para organizar campo, academia e condicionamento antes da temporada."
};

export default function ProjetoPreTemporadaPage() {
  return (
    <PortugueseProgramSalesPage
      program={portugueseProgramSalesPages.preTemporada}
    />
  );
}
