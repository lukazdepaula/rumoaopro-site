import type { Metadata } from "next";
import { AppProductPage } from "@/components/app-product-page";

export const metadata: Metadata = {
  title: "Raptor Pro | Training plans and athlete coaching",
  description: "Plan sessions, follow training execution and review athlete progression with Raptor Pro. Explore calendars, training logs and the invitation-only coach pilot.",
  alternates: { canonical: "/en/apps/raptor-pro", languages: { "pt-BR": "/apps/raptor-pro", en: "/en/apps/raptor-pro" } }
};

export default function EnglishRaptorProPage() {
  return <AppProductPage locale="en" product="raptor-pro" />;
}
