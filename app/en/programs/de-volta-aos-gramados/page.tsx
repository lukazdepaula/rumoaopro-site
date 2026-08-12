import type { Metadata } from "next";
import { DvgSalesPage } from "@/components/dvg-sales-page";

export const metadata: Metadata = {
  title: "Back to the Pitch",
  description:
    "A seven-phase gym and pitch progression for medically cleared football players returning from groin, adductor or hip pain."
};

export default function BackToThePitchPage() {
  return <DvgSalesPage locale="en" />;
}
