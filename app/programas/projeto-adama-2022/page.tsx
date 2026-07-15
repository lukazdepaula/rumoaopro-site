import type { Metadata } from "next";
import { PortugueseProgramSalesPage } from "@/components/portuguese-program-sales-page";
import { portugueseProgramSalesPages } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projeto Adama 2022",
  description:
    "Programa em português para construir força, hipertrofia e presença física no futebol."
};

export default function ProjetoAdama2022Page() {
  return (
    <PortugueseProgramSalesPage program={portugueseProgramSalesPages.adama2022} />
  );
}
