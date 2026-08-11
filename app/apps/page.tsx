import type { Metadata } from "next";
import { AppsHubPage } from "@/components/apps-hub-page";

export const metadata: Metadata = {
  title: "Apps para futebol | LoadPro e RaptorPro",
  description:
    "Conheça os aplicativos da RumoAoPro: LoadPro para treinadores e RaptorPro para acompanhamento e programas de atletas."
};

export default function AppsPage() {
  return <AppsHubPage locale="pt" />;
}
