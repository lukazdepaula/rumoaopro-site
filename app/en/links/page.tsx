import type { Metadata } from "next";
import { LinksHub } from "@/components/links-hub";

export const metadata: Metadata = {
  title: "Links",
  description:
    "Online coaching, football training programs, courses and official RumoAoPro channels."
};

export default function EnglishLinksPage() {
  return <LinksHub locale="en" />;
}
