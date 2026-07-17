import type { Metadata } from "next";
import { PreparadorProPage } from "@/components/preparador-pro-page";

export const metadata: Metadata = {
  title: "Preparador PRO | Football performance course",
  description:
    "Learn how to plan power, speed, endurance, assessments and periodization for football players with Preparador PRO. Course available in Portuguese."
};

export default function EnglishCoursesPage() {
  return <PreparadorProPage locale="en" />;
}
