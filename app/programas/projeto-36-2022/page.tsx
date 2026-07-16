import type { Metadata } from "next";
import { PortugueseProgramSalesPage } from "@/components/portuguese-program-sales-page";
import { portugueseProgramSalesPages } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projeto 36 km/h",
  description:
    "Programa em português de 12 semanas para desenvolver força, aceleração e velocidade no futebol."
};

export default function Projeto362022Page() {
  return (
    <PortugueseProgramSalesPage
      program={portugueseProgramSalesPages.projeto362022}
    />
  );
}
