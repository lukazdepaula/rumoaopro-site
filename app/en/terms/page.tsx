import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "Terms governing purchases, access and use of RumoAoPro products and services.",
  alternates: { canonical: "/en/terms", languages: { "pt-BR": "/termos", en: "/en/terms" } }
};

export default function EnglishTermsPage() {
  return <LegalPage document="terms" locale="en" />;
}
