import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://rumoaopro.com"),
  title: {
    default: "RumoAoPro",
    template: "%s | RumoAoPro"
  },
  description:
    "Assessoria online, programas de treinamento e performance para atletas de futebol.",
  openGraph: {
    title: "RumoAoPro",
    description:
      "Treinamento individual e programas de performance para atletas de futebol.",
    siteName: "RumoAoPro",
    locale: "pt_BR",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <WhatsAppFloat />
        <Analytics />
      </body>
    </html>
  );
}
