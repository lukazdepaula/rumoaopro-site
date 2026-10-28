import type { Metadata } from "next";
import { HomeEditorialPage } from "@/components/home-editorial-page";

export const metadata: Metadata = {
  title: "RumoAoPro | Football performance, programs and coaching",
  description:
    "Coaching, interactive RaptorPro programs, courses and LoadPro software for football players and coaches."
};

export default function EnglishHomePage() {
  return <HomeEditorialPage locale="en" />;
}
