import type { Metadata } from "next";
import { Offseason30SalesPage } from "@/components/offseason-30-sales-page";
import { assets } from "@/lib/content";

export const metadata: Metadata = {
  title: "Offseason Program 30 Days",
  description:
    "A 30-day football program for players who need speed, strength, power and conditioning organized inside a short offseason.",
  alternates: {
    canonical: "/en/programs/offseason-30-days",
    languages: {
      en: "/en/programs/offseason-30-days",
      "pt-BR": "/programas/offseason-30-days"
    }
  },
  openGraph: {
    title: "Offseason Program 30 Days",
    description:
      "A short and direct structure to organize field work, gym sessions and conditioning in 30 days.",
    images: [assets.offseason30Cover],
    locale: "en_US",
    type: "website"
  }
};

export default function Offseason30DaysEnglishPage() {
  return <Offseason30SalesPage locale="en" />;
}
