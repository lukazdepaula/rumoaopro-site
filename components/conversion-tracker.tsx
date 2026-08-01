"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type EventType =
  | "product_view"
  | "checkout_click"
  | "checkout_view"
  | "checkout_submit"
  | "checkout_error";

type CheckoutEventDetails = {
  country?: string;
  paymentMethod?: string;
  errorCode?: string;
};

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
  "/programas/de-volta-aos-gramados": "de-volta-aos-gramados"
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

async function sendEvent(
  type: EventType,
  productSlug: string,
  path: string,
  sourcePath?: string,
  details: CheckoutEventDetails = {}
) {
  const payload = JSON.stringify({
    type,
    productSlug,
    sessionId: getSessionId(),
    locale: localeForPath(path),
    path,
    sourcePath: sourcePath || null,
    referrerHost: referrerHost(),
    ...details
  });
  const storageKey = `rap_event:${type}:${productSlug}:${localeForPath(path)}`;

  if (window.sessionStorage.getItem(storageKey)) return;

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
    const salesProduct = productPaths[pathname];
    const checkoutProduct = checkoutSlug(pathname);

    if (salesProduct) void sendEvent("product_view", salesProduct, pathname);
    if (checkoutProduct) void sendEvent("checkout_view", checkoutProduct, pathname);
  }, [pathname]);

  useEffect(() => {
    function trackCheckoutClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!anchor) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      const productSlug = checkoutSlug(url.pathname);
      if (!productSlug) return;

      void sendEvent("checkout_click", productSlug, url.pathname, window.location.pathname);
    }

    document.addEventListener("click", trackCheckoutClick, { capture: true });
    return () => document.removeEventListener("click", trackCheckoutClick, { capture: true });
  }, []);

  return null;
}
