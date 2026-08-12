import type { Metadata } from "next";
import { DvgSalesPage } from "@/components/dvg-sales-page";

export const metadata: Metadata = {
  title: "De Volta aos Gramados | Return to Play para Pubalgia",
  description:
    "Programa de return to play em sete fases para atletas em recuperação da pubalgia, após avaliação e liberação profissional. Não substitui fisioterapia."
};

export default function DeVoltaAosGramadosPage() {
  return <DvgSalesPage locale="pt" />;
}
