"use client";

import { useEffect } from "react";
import { trackMetaOutcome } from "@/components/conversion-tracker";

export function CheckoutSuccessTracker({
  orderId,
  event,
  value,
  currency
}: {
  orderId: string;
  event: "StartTrial" | "Purchase";
  value: number;
  currency: string;
}) {
  useEffect(() => {
    const eventId = event === "StartTrial"
      ? `start_trial:${orderId}`
      : `purchase:browser:${orderId}`;
    trackMetaOutcome(event, eventId, value, currency);
  }, [currency, event, orderId, value]);

  return null;
}
