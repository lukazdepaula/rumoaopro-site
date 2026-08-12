import type { Metadata } from "next";
import { DvgSalesPage } from "@/components/dvg-sales-page";

export const metadata: Metadata = {
  title: "Back to the Pitch | Pubalgia Return to Play",
  description:
    "A seven-phase return-to-play program for assessed and medically cleared footballers recovering from pubalgia. It does not replace physiotherapy."
};

export default function BackToThePitchPage() {
  return <DvgSalesPage locale="en" />;
}
