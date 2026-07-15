import type { Metadata } from "next";
import { PortugueseProgramSalesPage } from "@/components/portuguese-program-sales-page";
import { portugueseProgramSalesPages } from "@/lib/content";

export const metadata: Metadata = {
  title: "De Volta aos Gramados",
  description:
    "Programa em português para retorno gradual aos treinos depois de dores em pubalgia, adutores ou quadril."
};

export default function DeVoltaAosGramadosPage() {
  return (
    <PortugueseProgramSalesPage
      program={portugueseProgramSalesPages.deVoltaAosGramados}
    />
  );
}
