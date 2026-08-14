"use client";

import Image from "next/image";
import { CheckCircle2, MapPin, ShoppingBag, Star, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MARKETING_CONSENT_EVENT,
  readMarketingConsent
} from "@/components/privacy-consent";
import {
  reviewGroupByProgramHref,
  reviewGroups,
  type PublicReview,
  type ReviewLocale
} from "@/lib/reviews";

type Purchase = {
  id: string;
  firstName: string;
  country: string;
  productImage: string;
  productName: string;
  productType: "training_program" | "subscription";
  purchasedAt: string;
};

type ProofItem =
  | { kind: "purchase"; purchase: Purchase }
  | { groupLabel: string; kind: "review"; review: PublicReview };

const MAX_PER_SESSION = 3;
const SESSION_COUNT_KEY = "rap_social_proof_count_v1";
const SESSION_DISMISSED_KEY = "rap_social_proof_dismissed_v1";

const copy = {
  pt: {
    close: "Fechar prova social",
    from: "de",
    purchase: "garantiu",
    subscription: "começou a usar",
    purchaseVerified: "Compra verificada",
    reviewVerified: "Avaliação verificada",
    recently: "recentemente"
  },
  en: {
    close: "Close social proof",
    from: "from",
    purchase: "got access to",
    subscription: "started using",
    purchaseVerified: "Verified purchase",
    reviewVerified: "Verified review",
    recently: "recently"
  }
} satisfies Record<ReviewLocale, Record<string, string>>;

const groupLabels: Record<keyof typeof reviewGroups, Record<ReviewLocale, string>> = {
  preSeason: { pt: "Offseason 30 Days", en: "Offseason 30 Days" },
  adama: { pt: "Adama Strength & Power", en: "Adama Strength & Power" },
  project36: { pt: "Speed Pro", en: "Speed Pro" },
  deVolta: { pt: "De Volta aos Gramados", en: "Back to the Pitch" },
  inSeason: { pt: "In-Season Pro", en: "In-Season Pro" },
  coaching: { pt: "Assessoria Online", en: "Online Coaching" },
  preparadorPro: { pt: "Preparador PRO", en: "Preparador PRO" }
};

function flagEmoji(code: string) {
  if (!/^[A-Z]{2}$/.test(code)) return String.fromCodePoint(0x1f30d);
  return String.fromCodePoint(
    ...Array.from(code).map((letter) => letter.charCodeAt(0) + 127397)
  );
}

function countryName(code: string, locale: ReviewLocale) {
  if (!/^[A-Z]{2}$/.test(code)) {
    return locale === "en" ? "International" : "Internacional";
  }
  try {
    return new Intl.DisplayNames([locale === "en" ? "en" : "pt-BR"], {
      type: "region"
    }).of(code) || code;
  } catch {
    return code;
  }
}

function relativeTime(value: string, locale: ReviewLocale) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return copy[locale].recently;

  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000));
  if (minutes < 2) return locale === "en" ? "just now" : "agora";
  if (minutes < 60) {
    return locale === "en" ? `${minutes} min ago` : `há ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return locale === "en"
      ? `${hours} ${hours === 1 ? "hour" : "hours"} ago`
      : `há ${hours} ${hours === 1 ? "hora" : "horas"}`;
  }

  const days = Math.floor(hours / 24);
  if (days <= 30) {
    return locale === "en"
      ? `${days} ${days === 1 ? "day" : "days"} ago`
      : `há ${days} ${days === 1 ? "dia" : "dias"}`;
  }

  return copy[locale].recently;
}

function eligiblePath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/en" ||
    pathname.startsWith("/programas/") ||
    pathname.startsWith("/en/programs/")
  );
}

function reviewPool(pathname: string, locale: ReviewLocale) {
  const pageGroup = reviewGroupByProgramHref[pathname];
  const keys = pageGroup
    ? [pageGroup]
    : (["preSeason", "project36", "inSeason", "deVolta"] as const);

  return keys.flatMap((key) =>
    reviewGroups[key].reviews
      .filter((review) => review.verified)
      .map((review) => ({
        groupLabel: groupLabels[key][locale],
        kind: "review" as const,
        review
      }))
  );
}

function interleaveProof(purchases: Purchase[], reviews: ProofItem[]) {
  const items: ProofItem[] = [];
  const size = Math.max(purchases.length, reviews.length);
  for (let index = 0; index < size && items.length < 8; index += 1) {
    if (purchases[index]) {
      items.push({ kind: "purchase", purchase: purchases[index] });
    }
    if (reviews[index] && items.length < 8) items.push(reviews[index]);
  }
  return items;
}

export function SocialProofToast() {
  const pathname = usePathname();
  const locale: ReviewLocale =
    pathname === "/en" || pathname.startsWith("/en/") ? "en" : "pt";
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [privacyChoiceMade, setPrivacyChoiceMade] = useState(false);
  const [current, setCurrent] = useState<ProofItem | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const timers = useRef<number[]>([]);

  const reviews = useMemo(() => reviewPool(pathname, locale), [locale, pathname]);
  const proofItems = useMemo(
    () => interleaveProof(purchases, reviews),
    [purchases, reviews]
  );

  useEffect(() => {
    const syncPrivacy = () => setPrivacyChoiceMade(readMarketingConsent() !== null);
    syncPrivacy();
    window.addEventListener(MARKETING_CONSENT_EVENT, syncPrivacy);
    return () => window.removeEventListener(MARKETING_CONSENT_EVENT, syncPrivacy);
  }, []);

  useEffect(() => {
    if (!eligiblePath(pathname)) return;
    let active = true;
    fetch("/api/public-feed")
      .then((response) => (response.ok ? response.json() : { purchases: [] }))
      .then((data: { purchases?: Purchase[] }) => {
        if (active && Array.isArray(data.purchases)) {
          setPurchases(data.purchases.slice(0, 8));
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];

    if (
      !eligiblePath(pathname) ||
      !privacyChoiceMade ||
      dismissed ||
      !proofItems.length ||
      window.sessionStorage.getItem(SESSION_DISMISSED_KEY) === "1"
    ) {
      setVisible(false);
      return;
    }

    const storedCount = Number(
      window.sessionStorage.getItem(SESSION_COUNT_KEY) || "0"
    );
    const previousCount = Number.isFinite(storedCount)
      ? Math.max(0, Math.floor(storedCount))
      : 0;
    if (previousCount >= MAX_PER_SESSION) return;

    let shown = previousCount;
    const showNext = () => {
      if (shown >= MAX_PER_SESSION) return;
      setCurrent(proofItems[shown % proofItems.length]);
      setVisible(true);
      shown += 1;
      window.sessionStorage.setItem(SESSION_COUNT_KEY, String(shown));

      const hideTimer = window.setTimeout(() => {
        setVisible(false);
        if (shown < MAX_PER_SESSION) {
          const nextTimer = window.setTimeout(showNext, 6500);
          timers.current.push(nextTimer);
        }
      }, 6500);
      timers.current.push(hideTimer);
    };

    const firstTimer = window.setTimeout(showNext, 5000);
    timers.current.push(firstTimer);
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
    };
  }, [dismissed, pathname, privacyChoiceMade, proofItems]);

  if (!eligiblePath(pathname) || !visible || !current) return null;

  const close = () => {
    setDismissed(true);
    setVisible(false);
    window.sessionStorage.setItem(SESSION_DISMISSED_KEY, "1");
  };

  return (
    <aside
      aria-atomic="true"
      aria-live="polite"
      className="social-proof-toast fixed bottom-[5.25rem] left-3 right-3 z-40 overflow-hidden rounded-xl border border-ink/10 bg-white text-ink shadow-[0_22px_70px_rgba(0,0,0,0.26)] sm:bottom-6 sm:left-6 sm:right-auto sm:w-[350px]"
      role="status"
    >
      <div className="h-1 bg-gradient-to-r from-signal via-[#ff4357] to-gold" />
      <button
        aria-label={copy[locale].close}
        className="focus-ring absolute right-3 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-smoke text-graphite/65 transition hover:bg-steel hover:text-ink"
        onClick={close}
        type="button"
      >
        <X aria-hidden="true" className="h-4 w-4" />
      </button>

      {current.kind === "purchase" ? (
        <div className="flex gap-3 p-3 pr-11">
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-ink/10 bg-smoke">
            {current.purchase.productImage ? (
              <Image
                alt=""
                className="object-cover"
                fill
                sizes="56px"
                src={current.purchase.productImage}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-signal">
                <ShoppingBag aria-hidden="true" className="h-5 w-5" />
              </span>
            )}
          </span>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-1.5 text-sm font-bold leading-5 text-ink">
              <span
                aria-label={countryName(current.purchase.country, locale)}
                className="inline-flex h-6 min-w-7 items-center justify-center rounded-full bg-smoke px-1.5 text-base shadow-sm"
                role="img"
              >
                {flagEmoji(current.purchase.country)}
              </span>
              <span>{current.purchase.firstName}</span>
              <span className="font-normal text-graphite/50">·</span>
              <span className="text-xs font-semibold text-graphite/65">
                {countryName(current.purchase.country, locale)}
              </span>
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-graphite/75">
              {current.purchase.productType === "subscription"
                ? copy[locale].subscription
                : copy[locale].purchase}{" "}
              <strong className="text-ink">{current.purchase.productName}</strong>
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-turf">
              <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
              {copy[locale].purchaseVerified}
              <span aria-hidden="true" className="text-graphite/25">·</span>
              <span className="normal-case tracking-normal text-graphite/55">
                {relativeTime(current.purchase.purchasedAt, locale)}
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 pr-12">
          <div aria-hidden="true" className="flex gap-0.5 text-gold">
            {Array.from({ length: current.review.rating }).map((_, index) => (
              <Star className="h-4 w-4 fill-current" key={index} />
            ))}
          </div>
          <blockquote className="mt-2 line-clamp-3 text-sm font-semibold leading-5 text-graphite/80">
            “{current.review.quote[locale]}”
          </blockquote>
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <strong>{current.review.name}</strong>
            <span aria-hidden="true" className="text-graphite/25">•</span>
            <span className="inline-flex items-center gap-1 text-graphite/60">
              <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
              {current.groupLabel}
            </span>
          </div>
          <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-turf">
            <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
            {copy[locale].reviewVerified}
          </p>
        </div>
      )}
    </aside>
  );
}
