"use client";

import { useState } from "react";
import { HomeProgramPhone } from "@/components/home-program-phone";
import { homeProgramScenes } from "@/lib/home-program-scenes";
import styles from "./program-catalog.module.css";

export function ProgramCatalogPreview({ locale }: { locale: "pt" | "en" }) {
  const [beat, setBeat] = useState(0);
  return <div className={styles.appPhone}>
    <HomeProgramPhone program={homeProgramScenes[1]} language={locale === "pt" ? 0 : 1} beat={beat} onStep={step => setBeat(step === 2 ? 5 : step)} />
  </div>;
}
