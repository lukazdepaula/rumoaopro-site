import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Política de reembolso",
  description: "Prazos e orientações para cancelamentos e reembolsos na RumoAoPro.",
  alternates: { canonical: "/reembolsos", languages: { "pt-BR": "/reembolsos", en: "/en/refunds" } }
};

export default function RefundsPage() {
  return <LegalPage document="refunds" locale="pt" />;
}
