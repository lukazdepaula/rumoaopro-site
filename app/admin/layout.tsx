import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  manifest: "/admin-manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RumoAoPro Admin"
  },
  icons: {
    apple: "/assets/app/admin-icon-180.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c"
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
