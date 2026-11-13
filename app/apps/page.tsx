import type { Metadata } from "next";
import { AppsHubPage } from "@/components/apps-hub-page";

export const metadata: Metadata = {
  title: "Aplicativos RumoAoPro | Conheça LoadPro e Raptor Pro",
  description:
    "Encontre o aplicativo para sua rotina: LoadPro para planejamento e controle de carga da equipe, ou Raptor Pro para treinos e acompanhamento de atletas.",
  alternates: { canonical: "/apps", languages: { "pt-BR": "/apps", en: "/en/apps" } }
};

export default function AppsPage() {
  return <AppsHubPage locale="pt" />;
}
