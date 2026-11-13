import type { Metadata } from "next";
import { AppsHubPage } from "@/components/apps-hub-page";

export const metadata: Metadata = {
  title: "RumoAoPro apps | Explore LoadPro and Raptor Pro",
  description:
    "Find the app for your workflow: LoadPro for team planning and training-load monitoring, or Raptor Pro for training plans and athlete coaching.",
  alternates: { canonical: "/en/apps", languages: { "pt-BR": "/apps", en: "/en/apps" } }
};

export default function EnglishAppsPage() {
  return <AppsHubPage locale="en" />;
}
