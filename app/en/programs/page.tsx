import type { Metadata } from "next";
import { ProgramCatalogPage } from "@/components/program-catalog-page";

export const metadata: Metadata = {
  title: "Football training programs",
  description:
    "Compare RumoAoPro programs by goal, duration, training setting and language. Strength, speed, offseason and in-season training inside RaptorPro."
};

export default function EnglishProgramsPage() {
  return <ProgramCatalogPage locale="en" />;
}
