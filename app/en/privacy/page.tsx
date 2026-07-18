import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "Learn how RumoAoPro collects, uses and protects personal data.",
  alternates: { canonical: "/en/privacy", languages: { "pt-BR": "/privacidade", en: "/en/privacy" } }
};

export default function EnglishPrivacyPage() {
  return <LegalPage document="privacy" locale="en" />;
}
