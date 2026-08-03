import type { Metadata } from "next";
import { PremiumLinksHub } from "@/components/premium-links-hub";

export const metadata: Metadata = {
  title: "Links",
  description:
    "Programas de performance, assessoria online, cursos e canais oficiais da RumoAoPro.",
  alternates: {
    canonical: "/links",
    languages: { "pt-BR": "/links", en: "/en/links" }
  }
};

export default function LinksPage() {
  return <PremiumLinksHub locale="pt" />;
}
