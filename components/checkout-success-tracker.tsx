"use client";

import { useEffect } from "react";
import { trackMetaOutcome } from "@/components/conversion-tracker";

export function CheckoutSuccessTracker({
  orderId,
  event,
  productSlug,
  productName,
  value,
  currency
}: {
  orderId: string;
  event: "StartTrial" | "Purchase";
  productSlug: string;
  productName: string;
  value: number;
  currency: string;
}) {
  useEffect(() => {
    const eventId = event === "StartTrial"
      ? `start_trial:${orderId}`
      : `purchase:${orderId}`;
    trackMetaOutcome(
      event,
      eventId,
      productSlug,
      productName,
      value,
      currency
    );
  }, [currency, event, orderId, productName, productSlug, value]);

  return null;
}
