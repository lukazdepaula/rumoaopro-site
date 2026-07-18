import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: "Saiba como a RumoAoPro coleta, utiliza e protege dados pessoais.",
  alternates: { canonical: "/privacidade", languages: { "pt-BR": "/privacidade", en: "/en/privacy" } }
};

export default function PrivacyPage() {
  return <LegalPage document="privacy" locale="pt" />;
}
