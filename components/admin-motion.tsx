"use client";

import { useEffect } from "react";
import { observeAdminMotion } from "@/lib/admin-motion";

export function AdminMotion() {
  useEffect(() => {
    return observeAdminMotion();
  }, []);
  return null;
}
