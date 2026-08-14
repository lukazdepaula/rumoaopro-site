import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { ConversionTracker } from "@/components/conversion-tracker";
import { PrivacyConsent } from "@/components/privacy-consent";
import { SocialProofToast } from "@/components/social-proof-toast";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://rumoaopro.com"),
  title: {
    default: "RumoAoPro",
    template: "%s | RumoAoPro"
  },
  description:
    "Assessoria online, programas de treinamento e performance para atletas de futebol.",
  icons: {
    icon: [
      {
        url: "/assets/app/admin-icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        url: "/assets/app/admin-icon-512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    shortcut: "/assets/app/admin-icon-192.png",
    apple: {
      url: "/assets/app/admin-icon-180.png",
      sizes: "180x180",
      type: "image/png"
    }
  },
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
        <ConversionTracker />
        <PrivacyConsent />
        <WhatsAppFloat />
        <SocialProofToast />
        <Analytics />
      </body>
    </html>
  );
}
