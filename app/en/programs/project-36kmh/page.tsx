import type { Metadata } from "next";
import { Project36SalesPage } from "@/components/project-36-sales-page";

export const metadata: Metadata = {
  title: "Project 36: Speed & Acceleration",
  description:
    "A 12-week football speed program for acceleration, max velocity, re-acceleration and game-speed actions.",
  alternates: {
    canonical: "/en/programs/project-36kmh",
    languages: {
      en: "/en/programs/project-36kmh",
      "pt-BR": "/programas/projeto-36kmh"
    }
  },
  openGraph: {
    title: "Project 36: Speed & Acceleration",
    description:
      "A 3-phase offseason speed system to build athletic foundation, acceleration power and game speed.",
    images: ["/assets/programs/project-36/project-36-sprint.jpg"],
    locale: "en_US",
    type: "website"
  }
};

export default function Project36kmhEnglishPage() {
  return <Project36SalesPage locale="en" />;
}
