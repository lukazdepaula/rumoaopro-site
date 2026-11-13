import type { Metadata } from "next";
import { AppProductPage } from "@/components/app-product-page";

export const metadata: Metadata = {
  title: "LoadPro | Planning and training-load monitoring for coaches",
  description: "Plan microcycles, review pre and post-training forms and monitor team training load with LoadPro. Explore the features and plans with a 7-day trial.",
  alternates: { canonical: "/en/apps/loadpro", languages: { "pt-BR": "/apps/loadpro", en: "/en/apps/loadpro" } }
};

export default function EnglishLoadProPage() {
  return <AppProductPage locale="en" product="loadpro" />;
}
