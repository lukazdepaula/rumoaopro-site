import Image from "next/image";
import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { assets, quickLinks } from "@/lib/content";

export const metadata: Metadata = {
  title: "Links",
  description:
    "Links principais da RumoAoPro para assessoria, coaching, programas, loja, WhatsApp, Instagram e YouTube."
};

export default function LinksPage() {
  return (
    <main className="min-h-screen bg-ink px-4 py-8 text-white sm:px-6">
      <section className="mx-auto max-w-xl">
        <div className="overflow-hidden rounded-lg border border-white/10">
          <Image
            alt="Lukaz de Paula em treino com atletas"
            className="h-56 w-full object-cover"
            height={1536}
            priority
            src={assets.coachPortrait}
            width={2300}
          />
        </div>
        <div className="mt-6 text-center">
          <img
            alt="RumoAoPro"
            className="mx-auto mb-4 h-16 w-16 rounded-md bg-white object-cover"
            height={64}
            src={assets.logo}
            width={64}
          />
          <p className="font-display text-3xl uppercase">RumoAoPro</p>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Assessoria online, programas de treinamento e performance para
            atletas de futebol.
          </p>
        </div>
        <div className="mt-7 space-y-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            const isExternal = link.href.startsWith("http");
            return (
              <a
                className="focus-ring flex min-h-14 items-center justify-between rounded-md border border-white/10 bg-white px-4 text-ink transition hover:bg-steel"
                href={link.href}
                key={link.label}
                rel={isExternal ? "noreferrer" : undefined}
                target={isExternal ? "_blank" : undefined}
              >
                <span className="flex items-center gap-3 text-sm font-bold">
                  <Icon aria-hidden="true" className="h-5 w-5 text-signal" />
                  {link.label}
                </span>
                <ExternalLink aria-hidden="true" className="h-4 w-4 text-ink/50" />
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}
