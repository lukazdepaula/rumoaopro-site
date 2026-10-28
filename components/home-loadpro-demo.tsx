"use client";

import { Activity, BarChart3, CalendarDays, Check, Pause, Play, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./home-loadpro-demo.module.css";

// Illustrative snapshots only. No customer data or live account connection.
const snapshots = [
  { responses: 12, readiness: 7.6, rpe: 5.2 },
  { responses: 16, readiness: 7.9, rpe: 5.8 },
  { responses: 18, readiness: 8.1, rpe: 6.0 }
] as const;

export function HomeLoadProDemo({ locale }: { locale: "pt" | "en" }) {
  const pt = locale === "pt";
  const root = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const running = !paused && !reducedMotion && visible && pageVisible;
  const current = snapshots[step];
  const load = Math.round(current.rpe * 60);
  const bars = [160, 420, 280, load, 120, 0, 0];
  const days = pt ? ["S", "T", "Q", "Q", "S", "S", "D"] : ["M", "T", "W", "T", "F", "S", "S"];
  const fullDays = pt ? ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"] : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const decimal = (value: number) => value.toFixed(1).replace(".", pt ? "," : ".");

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(preference.matches);
    const updateVisibility = () => setPageVisible(document.visibilityState === "visible");
    updateMotion();
    updateVisibility();
    preference.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 });
    if (root.current) observer.observe(root.current);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setStep(value => (value + 1) % snapshots.length), 4800);
    return () => window.clearTimeout(timer);
  }, [running, step]);

  return (
    <figure ref={root} className={styles.demo} data-running={running} data-demo-step={step} aria-label={pt ? "Demonstração animada do LoadPro com dados ilustrativos" : "Animated LoadPro demonstration with illustrative data"}>
      <div className={styles.screen}>
        <div className={styles.toolbar}>
          <span className={styles.windowDots} aria-hidden="true"><i /><i /><i /></span>
          <span>LOADPRO <span>/ {pt ? "MONITORAMENTO" : "MONITORING"}</span></span>
          <span className={styles.demoTag}>DEMO</span>
        </div>
        <div className={styles.workspace}>
          <div className={styles.rail} aria-hidden="true"><Activity /><BarChart3 /><CalendarDays /><Users /></div>
          <div className={styles.dashboard}>
            <div className={styles.heading}><div><span>{pt ? "EQUIPE DE EXEMPLO" : "EXAMPLE TEAM"}</span><h4>{pt ? "Painel do treinador" : "Coach dashboard"}</h4></div><span className={styles.signal} aria-hidden="true"><i /><i /><i /></span></div>
            <div className={styles.metrics}>
              <div><span>{pt ? "Prontidão média" : "Average readiness"}</span><strong key={`readiness-${step}`}>{decimal(current.readiness)}<small>/ 10</small></strong><i className={styles.readinessTrack}><i style={{ width: `${current.readiness * 10}%` }} /></i></div>
              <div><span>{pt ? "RPE médio" : "Average RPE"}</span><strong key={`rpe-${step}`}>{decimal(current.rpe)}<small>/ 10</small></strong><small>{pt ? "Percepção de esforço" : "Perceived exertion"}</small></div>
              <div><span>{pt ? "Carga da sessão" : "Session load"}</span><strong key={`load-${step}`}>{load}<small>{pt ? "UA" : "AU"}</small></strong><small>{pt ? "Exemplo: RPE × 60 min" : "Example: RPE × 60 min"}</small></div>
            </div>
            <div className={styles.chartHeading}><span>{pt ? "Carga da semana" : "Weekly load"}</span><span>{pt ? "UNIDADES ARBITRÁRIAS" : "ARBITRARY UNITS"}</span></div>
            <div className={styles.chart} role="img" aria-label={bars.map((value, index) => `${fullDays[index]}: ${value} ${pt ? "UA" : "AU"}`).join(", ")}>
              {bars.map((value, index) => <div className={styles.column} data-current={index === 3} key={index} aria-hidden="true"><span>{value || "—"}</span><div className={styles.barTrack}><i style={{ height: `${value / 450 * 100}%` }} /></div><small>{days[index]}</small></div>)}
            </div>
            <div className={styles.collection}>
              <div className={styles.ring} aria-hidden="true"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" /><circle cx="20" cy="20" r="16" pathLength="100" strokeDasharray={`${current.responses / 18 * 100} 100`} /></svg><Check size={14} /></div>
              <div><strong>{pt ? "Coleta pós-treino" : "Post-training collection"}</strong><span>{pt ? "Respostas de exemplo recebidas" : "Example responses received"}</span></div>
              <strong className={styles.responseCount}>{current.responses}<span>/18</span></strong>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.controls}>
        <div className={styles.steps} aria-label={pt ? "Etapas da demonstração" : "Demo stages"}>{snapshots.map((item, index) => <button key={index} type="button" className="focus-ring" aria-pressed={step === index} onClick={() => setStep(index)}><span aria-hidden="true" />{item.responses}/18</button>)}</div>
        <button type="button" className={`${styles.pause} focus-ring`} disabled={reducedMotion} aria-pressed={paused || reducedMotion} onClick={() => setPaused(value => !value)} aria-label={reducedMotion ? (pt ? "Demonstração estática: movimento reduzido" : "Static demo: reduced motion") : paused ? (pt ? "Retomar demonstração LoadPro" : "Resume LoadPro demo") : (pt ? "Pausar demonstração LoadPro" : "Pause LoadPro demo")}>
          {paused || reducedMotion ? <Play size={13} /> : <Pause size={13} />}
        </button>
      </div>
      <figcaption>{pt ? "Demonstração visual · dados ilustrativos, não atualizados ao vivo." : "Visual demonstration · illustrative data, not a live feed."}</figcaption>
    </figure>
  );
}
