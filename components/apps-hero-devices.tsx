import Image from "next/image";
import { Activity, ArrowRight, CalendarDays, Dumbbell } from "lucide-react";
import styles from "./apps-hub-page.module.css";

type AppsHeroDevicesProps = {
  locale: "pt" | "en";
  product?: "all" | "loadpro" | "raptor-pro";
};

export function AppsHeroDevices({ locale, product = "all" }: AppsHeroDevicesProps) {
  const pt = locale === "pt";
  const load = product === "loadpro";
  const raptor = product === "raptor-pro";

  return (
    <figure className={styles.heroDevices} data-product={product}
      aria-label={load ? (pt ? "Prévia do painel LoadPro" : "LoadPro dashboard preview") : raptor
        ? (pt ? "Prévia ilustrativa do Raptor Pro" : "Illustrative Raptor Pro preview")
        : (pt ? "Prévias visuais do LoadPro e do Raptor Pro" : "Visual previews of LoadPro and Raptor Pro")}>
      <span className={styles.visualLabel}>{load ? "LOADPRO / " : raptor ? "RAPTOR PRO / " : "RUMOAOPRO / "}{pt ? "O FUTEBOL NO SEU DIA A DIA" : "FOOTBALL IN YOUR DAILY WORKFLOW"}</span>
      {!raptor && (
        <div className={styles.heroLaptop}>
          <div className={styles.laptopFrame}>
            <i className={styles.laptopCamera} />
            <div className={styles.laptopBar} aria-hidden="true"><span><i /><i /><i /></span><strong>LOAD<span>PRO</span></strong><small>{pt ? "PAINEL DO TREINADOR" : "COACH DASHBOARD"}</small></div>
            <div className={styles.laptopScreen}>
              <Image src="/assets/loadpro/product-dashboard-monitoring-v2.png"
                alt={pt ? "Tela real do LoadPro no clube de demonstração, com painel do treinador e coletas" : "Actual LoadPro demo club screen with coach dashboard and daily forms"}
                fill priority sizes="(min-width:1280px) 560px, (min-width:1000px) 42vw, (min-width:768px) 580px, 85vw" />
            </div>
          </div>
          <div className={styles.laptopBase} aria-hidden="true"><i /><span /></div>
        </div>
      )}
      {!load && (
        <div className={styles.heroPhone} aria-hidden="true">
          <div className={styles.phoneScreen}>
            <div className={styles.phoneStatus}><span>9:41</span><i /><span>···</span></div>
            <div className={styles.phoneBrand}>RAPTOR<span>PRO</span><small>{pt ? "PRÉVIA" : "PREVIEW"}</small></div>
            <div className={styles.phoneContent}>
              <p>{pt ? "SEU PLANEJAMENTO" : "YOUR PLAN"}</p><strong>{pt ? "Sua semana" : "Your week"}</strong>
              <div className={styles.phoneWeek}>{(pt ? ["S", "T", "Q", "Q", "S", "S", "D"] : ["M", "T", "W", "T", "F", "S", "S"]).map((day, i) => <span key={i} data-selected={i === 1}>{day}<b>{9 + i}</b></span>)}</div>
              <div className={styles.phoneSession}><CalendarDays size={16} /><small>{pt ? "TREINO DO DIA" : "TODAY'S SESSION"}</small><h3>{pt ? "Um treino\ncom direção." : "Training\nwith direction."}</h3><p>{pt ? "Orientações, exercícios e o seu registro." : "Guidance, exercises and your training log."}</p><span>{pt ? "Ver treino" : "View session"}<ArrowRight size={11} /></span></div>
            </div>
            <div className={styles.phoneNav}><CalendarDays size={14} /><Dumbbell size={14} /><Activity size={14} /></div><i className={styles.homeBar} />
          </div>
        </div>
      )}
      <figcaption>{load ? (pt ? "Tela real · clube de demonstração." : "Actual screen · demo club.")
        : raptor ? (pt ? "Prévia ilustrativa · dados de demonstração." : "Illustrative preview · demonstration data.")
        : (pt ? "Prévias visuais · dados de demonstração." : "Visual previews · demonstration data.")}</figcaption>
    </figure>
  );
}
