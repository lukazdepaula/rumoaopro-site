"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export type MarketingConsent = "granted" | "denied" | null;

export const MARKETING_CONSENT_KEY = "rap_marketing_consent_v1";
export const MARKETING_CONSENT_EVENT = "rap:marketing-consent";

export function readMarketingConsent(): MarketingConsent {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(MARKETING_CONSENT_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

function persistMarketingConsent(value: Exclude<MarketingConsent, null>) {
  window.localStorage.setItem(MARKETING_CONSENT_KEY, value);
  document.cookie = `rap_marketing_consent=${value}; Path=/; Max-Age=31536000; SameSite=Lax${
    window.location.protocol === "https:" ? "; Secure" : ""
  }`;
  window.dispatchEvent(new CustomEvent(MARKETING_CONSENT_EVENT, { detail: value }));
}

export function openPrivacySettings() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("rap:open-privacy-settings"));
}

export function PrivacySettingsButton({ locale = "pt" }: { locale?: "pt" | "en" }) {
  return (
    <button className="block hover:text-white" onClick={openPrivacySettings} type="button">
      {locale === "en" ? "Cookie settings" : "Preferências de cookies"}
    </button>
  );
}

export function PrivacyConsent() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");

  useEffect(() => {
    setVisible(readMarketingConsent() === null);
    const open = () => setVisible(true);
    window.addEventListener("rap:open-privacy-settings", open);
    return () => window.removeEventListener("rap:open-privacy-settings", open);
  }, []);

  if (!visible || pathname.startsWith("/admin")) return null;

  const choose = (value: "granted" | "denied") => {
    persistMarketingConsent(value);
    setVisible(false);
  };

  return (
    <aside
      aria-label={isEnglish ? "Privacy preferences" : "Preferências de privacidade"}
      className="fixed bottom-24 left-4 right-4 z-50 max-w-xl rounded-xl border border-white/15 bg-[#111318] p-4 text-white shadow-2xl sm:left-6 sm:right-auto"
      role="dialog"
    >
      <p className="text-sm font-bold">
        {isEnglish ? "Your privacy choices" : "Suas escolhas de privacidade"}
      </p>
      <p className="mt-2 text-xs leading-5 text-white/70">
        {isEnglish
          ? "We use optional advertising measurement to understand campaigns and improve LoadPro. Essential checkout and security features always remain active."
          : "Usamos medição publicitária opcional para entender campanhas e melhorar o LoadPro. Recursos essenciais de checkout e segurança permanecem sempre ativos."}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          className="focus-ring rounded-md border border-white/20 px-3 py-2 text-xs font-bold hover:bg-white/10"
          onClick={() => choose("denied")}
          type="button"
        >
          {isEnglish ? "Essential only" : "Somente essenciais"}
        </button>
        <button
          className="focus-ring rounded-md bg-signal px-3 py-2 text-xs font-bold text-white hover:bg-[#b90f20]"
          onClick={() => choose("granted")}
          type="button"
        >
          {isEnglish ? "Allow measurement" : "Permitir medição"}
        </button>
        <Link
          className="ml-auto text-xs text-white/65 underline hover:text-white"
          href={isEnglish ? "/en/privacy" : "/privacidade"}
        >
          {isEnglish ? "Privacy policy" : "Política de privacidade"}
        </Link>
      </div>
    </aside>
  );
}
