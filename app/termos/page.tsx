import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Termos de uso",
  description: "Termos de compra, acesso e uso dos produtos e serviços da RumoAoPro.",
  alternates: { canonical: "/termos", languages: { "pt-BR": "/termos", en: "/en/terms" } }
};

export default function TermsPage() {
  return <LegalPage document="terms" locale="pt" />;
}
