import type { Metadata } from "next";
import { PremiumLinksHub } from "@/components/premium-links-hub";

export const metadata: Metadata = {
  title: "Links",
  description:
    "Football performance programs, online coaching, courses and official RumoAoPro channels.",
  alternates: {
    canonical: "/en/links",
    languages: { "pt-BR": "/links", en: "/en/links" }
  }
};

export default function EnglishLinksPage() {
  return <PremiumLinksHub locale="en" />;
}
