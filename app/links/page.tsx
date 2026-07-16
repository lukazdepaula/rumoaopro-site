import type { Metadata } from "next";
import { LinksHub } from "@/components/links-hub";

export const metadata: Metadata = {
  title: "Links",
  description:
    "Assessoria online, programas de treinamento, cursos e canais oficiais da RumoAoPro."
};

export default function LinksPage() {
  return <LinksHub locale="pt" />;
}
