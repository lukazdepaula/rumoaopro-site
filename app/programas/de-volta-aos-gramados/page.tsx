import type { Metadata } from "next";
import { DvgSalesPage } from "@/components/dvg-sales-page";

export const metadata: Metadata = {
  title: "De Volta aos Gramados",
  description:
    "Programa em português para retorno gradual aos treinos depois de dores em pubalgia, adutores ou quadril."
};

export default function DeVoltaAosGramadosPage() {
  return <DvgSalesPage locale="pt" />;
}
