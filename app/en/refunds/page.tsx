import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Refund policy",
  description: "Timeframes and instructions for RumoAoPro cancellations and refunds.",
  alternates: { canonical: "/en/refunds", languages: { "pt-BR": "/reembolsos", en: "/en/refunds" } }
};

export default function EnglishRefundsPage() {
  return <LegalPage document="refunds" locale="en" />;
}
