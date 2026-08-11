import type { Metadata } from "next";
import { AppsHubPage } from "@/components/apps-hub-page";

export const metadata: Metadata = {
  title: "Football apps | LoadPro and RaptorPro",
  description:
    "Explore RumoAoPro apps: LoadPro for coaches and the upcoming RaptorPro experience for player coaching and programs."
};

export default function EnglishAppsPage() {
  return <AppsHubPage locale="en" />;
}
