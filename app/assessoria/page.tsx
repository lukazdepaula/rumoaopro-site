import type { Metadata } from "next";
import { CoachingPage } from "@/components/coaching-page";
import { coachingCopy } from "@/lib/content";

export const metadata: Metadata = {
  title: "Assessoria Online",
  description:
    "Aplicação para assessoria online RumoAoPro com programa personalizado, calendário, controle de carga e suporte semanal.",
  alternates: {
    canonical: "/assessoria",
    languages: {
      "pt-BR": "/assessoria",
      en: "/en/coaching"
    }
  },
  openGraph: {
    title: "Assessoria Online RumoAoPro",
    description:
      "Treinamento individual para atletas que querem performar como profissionais.",
    locale: "pt_BR"
  }
};

export default function AssessoriaPage() {
  return <CoachingPage copy={coachingCopy.pt} />;
}
