import type { Metadata } from "next";
import { CoachingPage } from "@/components/coaching-page";
import { coachingCopy } from "@/lib/content";

export const metadata: Metadata = {
  title: "Online Football Coaching",
  description:
    "Apply for RumoAoPro online coaching with a personalized calendar, load monitoring, direct coach contact and weekly microcycle support.",
  alternates: {
    canonical: "/en/coaching",
    languages: {
      "pt-BR": "/assessoria",
      en: "/en/coaching"
    }
  },
  openGraph: {
    title: "RumoAoPro Online Football Coaching",
    description:
      "Individual football performance coaching for serious athletes.",
    locale: "en_US"
  }
};

export default function CoachingEnglishPage() {
  return <CoachingPage copy={coachingCopy.en} />;
}
