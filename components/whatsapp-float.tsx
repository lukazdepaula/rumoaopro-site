"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { contact } from "@/lib/content";

export function WhatsAppFloat() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  const english = pathname === "/en" || pathname.startsWith("/en/");
  const label = english ? "Chat on WhatsApp" : "Falar no WhatsApp";
  const message = english
    ? "Hi! I'm on the RumoAoPro website and need some help."
    : "Olá! Estou no site da RumoAoPro e preciso de ajuda.";
  const href = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`;

  return (
    <a
      aria-label={label}
      className="focus-ring fixed right-4 z-40 inline-flex h-14 items-center justify-center gap-2 rounded-full border-2 border-white bg-[#25d366] px-4 text-sm font-bold text-white shadow-[0_14px_42px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5 hover:bg-[#1ebc59] sm:right-6"
      href={href}
      rel="noreferrer"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      target="_blank"
      title={label}
    >
      <MessageCircle aria-hidden="true" className="h-6 w-6" />
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
}
