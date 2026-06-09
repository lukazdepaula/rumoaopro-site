import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { contact } from "@/lib/content";

export const metadata: Metadata = {
  title: "Application sent",
  description: "Thank you for applying to RumoAoPro online coaching."
};

export default function ThankYouPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4 text-white">
      <section className="max-w-xl text-center">
        <CheckCircle2 aria-hidden="true" className="mx-auto h-12 w-12 text-gold" />
        <h1 className="mt-6 font-display text-4xl uppercase">
          Application sent
        </h1>
        <p className="mt-5 text-base leading-7 text-white/70">
          If WhatsApp did not open automatically, send the message manually.
          The team will review your answers and contact you for the next step.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-signal px-5 text-sm font-bold text-white"
            href={`https://wa.me/${contact.whatsapp}`}
          >
            <MessageCircle aria-hidden="true" className="h-4 w-4" />
            Open WhatsApp
          </a>
          <Link
            className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-white/20 px-5 text-sm font-bold text-white"
            href="/"
          >
            Back to site
          </Link>
        </div>
      </section>
    </main>
  );
}
