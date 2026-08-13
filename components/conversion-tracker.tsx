"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  MARKETING_CONSENT_EVENT,
  readMarketingConsent
} from "@/components/privacy-consent";

export type EventType =
  | "page_view"
  | "product_view"
  | "checkout_click"
  | "checkout_view"
  | "checkout_submit"
  | "checkout_error"
  | "whatsapp_click";

type CheckoutEventDetails = {
  country?: string;
  paymentMethod?: string;
  errorCode?: string;
};

export type MarketingAttribution = {
  consent: "granted" | "denied";
  landingUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  fbclid?: string;
  fbp?: string;
  fbc?: string;
};

type MetaEventName =
  | "PageView"
  | "ViewContent"
  | "InitiateCheckout"
  | "StartTrial"
  | "Purchase"
  | "Contact";

type MetaWindow = Window & {
  fbq?: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string };
  _fbq?: unknown;
};

const ATTRIBUTION_KEY = "rap_marketing_attribution_v1";

const productPaths: Record<string, string> = {
  "/programas/offseason-30-days": "offseason-30-days",
  "/en/programs/offseason-30-days": "offseason-30-days",
  "/programas/adama-strength-power": "adama-offseason-strength-and-power",
  "/en/programs/adama-strength-power": "adama-offseason-strength-and-power",
  "/programas/projeto-36kmh": "project-36",
  "/en/programs/project-36kmh": "project-36",
  "/programas/elanga-in-season": "elanga-in-season",
  "/en/programs/elanga-in-season": "elanga-in-season",
  "/programas/projeto-pre-temporada": "projeto-pre-temporada",
  "/programas/projeto-adama-2022": "projeto-adama-2022",
  "/programas/de-volta-aos-gramados": "de-volta-aos-gramados",
  "/en/programs/de-volta-aos-gramados": "de-volta-aos-gramados"
};

function getSessionId() {
  const key = "rap_analytics_session";
  const current = window.sessionStorage.getItem(key);
  if (current) return current;

  const created = crypto.randomUUID();
  window.sessionStorage.setItem(key, created);
  return created;
}

function localeForPath(path: string) {
  return path.startsWith("/en/") || path === "/en" ? "en" : "pt";
}

function checkoutSlug(path: string) {
  const match = path.match(/^\/(?:en\/)?checkout\/([^/?#]+)/);
  return match?.[1] || null;
}

function referrerHost() {
  if (!document.referrer) return null;
  try {
    const url = new URL(document.referrer);
    return url.origin === window.location.origin ? null : url.hostname;
  } catch {
    return null;
  }
}

function readCookie(name: string) {
  const prefix = `${name}=`;
  return document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix))
    ?.slice(prefix.length);
}

function cleanParam(value: string | null, maxLength = 180) {
  return value?.trim().slice(0, maxLength) || undefined;
}

function captureAttribution(): MarketingAttribution {
  const consent = readMarketingConsent() === "granted" ? "granted" : "denied";
  if (consent !== "granted") return { consent };

  let current: Partial<MarketingAttribution> = {};
  try {
    current = JSON.parse(window.localStorage.getItem(ATTRIBUTION_KEY) || "{}") as Partial<MarketingAttribution>;
  } catch {
    current = {};
  }

  const params = new URLSearchParams(window.location.search);
  const fbclid = cleanParam(params.get("fbclid"));
  if (fbclid && !readCookie("_fbc")) {
    document.cookie = `_fbc=fb.1.${Date.now()}.${fbclid}; Path=/; Max-Age=7776000; SameSite=Lax${
      window.location.protocol === "https:" ? "; Secure" : ""
    }`;
  }

  const attribution: MarketingAttribution = {
    consent,
    landingUrl: current.landingUrl || window.location.href.slice(0, 500),
    utmSource: current.utmSource || cleanParam(params.get("utm_source")),
    utmMedium: current.utmMedium || cleanParam(params.get("utm_medium")),
    utmCampaign: current.utmCampaign || cleanParam(params.get("utm_campaign")),
    utmContent: current.utmContent || cleanParam(params.get("utm_content")),
    utmTerm: current.utmTerm || cleanParam(params.get("utm_term")),
    fbclid: current.fbclid || fbclid,
    fbp: readCookie("_fbp") || current.fbp,
    fbc: readCookie("_fbc") || current.fbc
  };
  window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  return attribution;
}

export function getMarketingCheckoutContext(): MarketingAttribution {
  if (typeof window === "undefined") return { consent: "denied" };
  return captureAttribution();
}

function metaEventFor(type: EventType): MetaEventName | null {
  if (type === "page_view") return "PageView";
  if (type === "product_view") return "ViewContent";
  if (type === "checkout_submit") return "InitiateCheckout";
  if (type === "whatsapp_click") return "Contact";
  return null;
}

function pixelIdForProduct(productSlug: string) {
  if (productSlug === "loadpro-founders") {
    return (
      process.env.NEXT_PUBLIC_LOADPRO_META_PIXEL_ID ||
      process.env.NEXT_PUBLIC_META_PIXEL_ID
    )?.trim();
  }

  return process.env.NEXT_PUBLIC_RUMOAOPRO_META_PIXEL_ID?.trim();
}

function initMetaPixel(productSlug: string) {
  const pixelId = pixelIdForProduct(productSlug);
  if (!pixelId || readMarketingConsent() !== "granted") return null;

  const metaWindow = window as MetaWindow;
  if (!metaWindow.fbq) {
    const fbq = function (...args: unknown[]) {
      const activeFbq = metaWindow.fbq;
      if (activeFbq?.callMethod) activeFbq.callMethod(...args);
      else activeFbq?.queue?.push(args);
    } as NonNullable<MetaWindow["fbq"]>;
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = "2.0";
    metaWindow.fbq = fbq;
    metaWindow._fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    script.dataset.rapMetaPixel = "true";
    document.head.appendChild(script);
  }

  const initializedPixels = new Set(
    (document.documentElement.dataset.rapMetaPixels || "")
      .split(",")
      .filter(Boolean)
  );
  if (!initializedPixels.has(pixelId)) {
    metaWindow.fbq?.("init", pixelId);
    initializedPixels.add(pixelId);
    document.documentElement.dataset.rapMetaPixels = [...initializedPixels].join(",");
  }
  captureAttribution();
  return pixelId;
}

function trackMetaBrowser(eventName: MetaEventName, eventId: string, productSlug: string) {
  const pixelId = initMetaPixel(productSlug);
  if (!pixelId) return;
  const customData = productSlug === "loadpro-founders"
    ? { content_name: "LoadPro App - Plano Treinadores Fundadores", content_ids: [productSlug], content_type: "product", currency: "BRL", value: 49.9 }
    : { content_ids: productSlug === "site" ? undefined : [productSlug], content_type: productSlug === "site" ? undefined : "product" };
  (window as MetaWindow).fbq?.("trackSingle", pixelId, eventName, customData, { eventID: eventId });
}

export function trackMetaOutcome(
  eventName: "StartTrial" | "Purchase",
  eventId: string,
  productSlug: string,
  contentName: string,
  value: number,
  currency: string
) {
  if (typeof window === "undefined") return;
  const pixelId = initMetaPixel(productSlug);
  if (!pixelId) return;
  (window as MetaWindow).fbq?.(
    "trackSingle",
    pixelId,
    eventName,
    { content_name: contentName, content_ids: [productSlug], content_type: "product", value, currency },
    { eventID: eventId }
  );
}

async function sendEvent(
  type: EventType,
  productSlug: string,
  path: string,
  sourcePath?: string,
  details: CheckoutEventDetails = {}
) {
  const locale = localeForPath(path);
  const attribution = captureAttribution();
  const eventId = `${getSessionId()}:${type}:${productSlug}:${locale}:${path}:${attribution.consent}`.slice(0, 240);
  const payload = JSON.stringify({
    type,
    eventId,
    productSlug,
    sessionId: getSessionId(),
    locale,
    path,
    sourcePath: sourcePath || null,
    referrerHost: referrerHost(),
    marketing: attribution,
    ...details
  });
  const storageKey = `rap_event:${type}:${productSlug}:${locale}:${path}:${attribution.consent}`;

  if (window.sessionStorage.getItem(storageKey)) return;

  const metaEvent = metaEventFor(type);
  if (metaEvent && attribution.consent === "granted") {
    trackMetaBrowser(metaEvent, eventId, productSlug);
  }

  try {
    const response = await fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true
    });
    if (response.ok) window.sessionStorage.setItem(storageKey, "1");
  } catch {
    // A later navigation can retry the event when the network is available.
  }
}

export function trackCheckoutEvent(
  type: "checkout_submit" | "checkout_error",
  productSlug: string,
  details: CheckoutEventDetails
) {
  return sendEvent(type, productSlug, window.location.pathname, undefined, details);
}

export function ConversionTracker() {
  const pathname = usePathname();

  useEffect(() => {
    void sendEvent("page_view", "site", pathname);
    const salesProduct = productPaths[pathname];
    const checkoutProduct = checkoutSlug(pathname);

    if (salesProduct) void sendEvent("product_view", salesProduct, pathname);
    if (checkoutProduct) void sendEvent("checkout_view", checkoutProduct, pathname);

    const loadProSection = document.getElementById("loadpro");
    if (!loadProSection) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void sendEvent("product_view", "loadpro-founders", pathname);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(loadProSection);
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const consentChanged = () => {
      if (readMarketingConsent() !== "granted") return;
      captureAttribution();
      void sendEvent("page_view", "site", window.location.pathname);

      const salesProduct = productPaths[window.location.pathname];
      const checkoutProduct = checkoutSlug(window.location.pathname);
      if (salesProduct) void sendEvent("product_view", salesProduct, window.location.pathname);
      if (checkoutProduct) void sendEvent("checkout_view", checkoutProduct, window.location.pathname);

      const loadProSection = document.getElementById("loadpro");
      if (loadProSection) {
        const rect = loadProSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          void sendEvent("product_view", "loadpro-founders", window.location.pathname);
        }
      }
    };
    window.addEventListener(MARKETING_CONSENT_EVENT, consentChanged);
    return () => window.removeEventListener(MARKETING_CONSENT_EVENT, consentChanged);
  }, []);

  useEffect(() => {
    function trackLinkClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.hostname === "wa.me" || url.hostname.endsWith("whatsapp.com")) {
        void sendEvent("whatsapp_click", "site", window.location.pathname);
        return;
      }
      if (url.origin !== window.location.origin) return;

      const productSlug = checkoutSlug(url.pathname);
      if (!productSlug) return;
      void sendEvent("checkout_click", productSlug, url.pathname, window.location.pathname);
    }

    document.addEventListener("click", trackLinkClick, { capture: true });
    return () => document.removeEventListener("click", trackLinkClick, { capture: true });
  }, []);

  return null;
}
