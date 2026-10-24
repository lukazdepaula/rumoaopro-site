"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Pause, Play, ScanLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./home-motion-hero.module.css";

const programs = [
  { name: "In-Season Pro", number: 28, unit: ["semanas", "weeks"], focus: ["Performance entre jogos", "Performance between matches"], image: "/assets/programs/in-season/in-season-pro-cover-v2.png", href: ["/programas/elanga-in-season", "/en/programs/elanga-in-season"] },
  { name: "Power Pro", number: 12, unit: ["semanas", "weeks"], focus: ["Força. Potência. Academia.", "Strength. Power. Gym."], image: "/assets/programs/power-pro/power-pro-cover-v2.png", href: ["/programas/power-pro", "/programas/power-pro"] },
  { name: "Speed Pro", number: 12, unit: ["semanas", "weeks"], focus: ["Aceleração e velocidade", "Acceleration and speed"], image: "/assets/programs/project-36/project-36-cover.jpg", href: ["/programas/projeto-36kmh", "/en/programs/project-36kmh"] },
  { name: "Offseason 30", number: 30, unit: ["dias", "days"], focus: ["Prepare a próxima temporada", "Prepare for the next season"], image: "/assets/programs/offseason-30/offseason-30-raptorpro-cover.png", href: ["/programas/offseason-30-days", "/en/programs/offseason-30-days"] }
] as const;

export function HomeMotionHero({ locale }: { locale: "pt" | "en" }) {
  const language = locale === "pt" ? 0 : 1;
  const pt = language === 0;
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selected, setSelected] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [visible, setVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [allowVideo, setAllowVideo] = useState(false);
  const [count, setCount] = useState(programs[0].number as number);
  const program = programs[selected];
  const running = !paused && !reducedMotion && visible && pageVisible;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const updatePreference = () => {
      setReducedMotion(preference.matches);
      setAllowVideo(!preference.matches && !connection?.saveData);
    };
    const updateVisibility = () => setPageVisible(document.visibilityState === "visible");
    updatePreference();
    updateVisibility();
    preference.addEventListener("change", updatePreference);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.08 });
    if (heroRef.current) observer.observe(heroRef.current);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", updatePreference);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    // A manual selection gets a full viewing interval without pausing the scene.
    const timer = window.setTimeout(() => {
      setDirection("forward");
      setSelected(value => (value + 1) % programs.length);
    }, 6500);
    return () => window.clearTimeout(timer);
  }, [running, selected]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (running && allowVideo) void video.play().catch(() => { /* The poster remains visible when autoplay is unavailable. */ });
    else video.pause();
  }, [running, allowVideo]);

  useEffect(() => {
    if (!running) { setCount(program.number); return; }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 900, 1);
      setCount(Math.round(program.number * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [program.number, selected, running]);

  const chooseProgram = (index: number) => {
    if (index === selected) return;
    setDirection(index > selected ? "forward" : "backward");
    setSelected(index);
  };

  return (
    <section ref={heroRef} className={styles.hero} data-running={running} data-program={selected} data-direction={direction} aria-labelledby="home-hero-title">
      <div className={styles.backdrop} aria-hidden="true">
        <Image src="/assets/home/motion-2026-10/field-poster.jpg" alt="" fill priority sizes="(min-width: 900px) 65vw, 100vw" className={styles.fieldImage} />
        <video ref={videoRef} muted loop playsInline preload="none" poster="/assets/home/motion-2026-10/field-poster.jpg" className={styles.fieldVideo}>
          {allowVideo && <source src="/assets/home/motion-2026-10/field-loop.mp4" type="video/mp4" />}
        </video>
      </div>
      <div className={styles.shade} aria-hidden="true" />
      <div className={styles.stage}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}><span />RUMOAOPRO <span className={styles.divider}>/</span> {pt ? "PREPARAÇÃO FÍSICA" : "FOOTBALL PERFORMANCE"}</p>
          <h1 id="home-hero-title">{pt ? "Seu jogo." : "Your game."}<span>{pt ? "Em outro nível." : "Next level."}</span></h1>
          <p className={styles.intro}>{pt ? "O trabalho acontece no treino. A diferença aparece em campo." : "Put in the work in training. Bring the difference to the pitch."}</p>
          <p className={styles.description}>{pt ? "Programas de preparação física no seu celular. Do primeiro exercício à sua próxima temporada." : "Physical preparation programs on your phone. From your first exercise to your next season."}</p>
          <div className={styles.actions}>
            <Link className={`${styles.primary} focus-ring`} href="#programas">{pt ? "Encontrar meu programa" : "Find my program"}<ArrowUpRight size={19} aria-hidden="true" /></Link>
            <a href="#por-dentro" className={`${styles.secondary} focus-ring`}><ScanLine size={17} aria-hidden="true" />{pt ? "Veja por dentro" : "Take a look inside"}</a>
          </div>
          <div className={styles.disciplines}><span>01 / {pt ? "CAMPO" : "PITCH"}</span><span>02 / {pt ? "ACADEMIA" : "GYM"}</span><span>03 / {pt ? "JOGO" : "MATCH"}</span></div>
        </div>

        <div className={styles.scene}>
          <div className={styles.orbit} aria-hidden="true">
            <svg viewBox="0 0 700 600" fill="none"><path className={styles.orbitBase} d="M70 410C-90 190 190 35 445 145S750 410 495 490 50 490 70 410Z" /><path className={styles.orbitLight} pathLength="100" d="M70 410C-90 190 190 35 445 145S750 410 495 490 50 490 70 410Z" /></svg>
          </div>
          <span className={styles.sceneIndex} aria-hidden="true">RAP / 0{selected + 1}</span>
          <div className={styles.phoneAnchor}>
            <figure className={styles.phone}>
              <div className={styles.phoneTop} aria-hidden="true"><span>RAPTORPRO</span><i /></div>
              <div className={styles.phoneScreen}><Image src="/assets/programs/in-season/refresh-2026-10/raptor-calendar-pt.png" alt={pt ? "Tela real do In-Season Pro no RaptorPro, com calendário e sessões de treino" : "Real In-Season Pro screen inside RaptorPro, shown in Portuguese"} width={543} height={743} sizes="(min-width: 900px) 260px, 220px" priority /></div>
              <figcaption className={styles.phoneCaption}><span />{pt ? "IN-SEASON PRO · TELA REAL" : "IN-SEASON PRO · ACTUAL SCREEN"}</figcaption>
            </figure>
          </div>
          <div className={styles.trainingLabel}><span className={styles.crosshair} aria-hidden="true" /><span>{pt ? "DO PLANO AO CAMPO" : "FROM PLAN TO PITCH"}<small>{pt ? "Preparação para o jogo real." : "Preparation for the real game."}</small></span></div>
          <div className={styles.programFloat} key={program.name}>
            <span className={styles.floatLabel}>{pt ? "SEU PRÓXIMO DESAFIO" : "YOUR NEXT CHALLENGE"}</span>
            <div className={styles.duration} aria-label={`${program.number} ${program.unit[language]}`}><strong aria-hidden="true">{String(count).padStart(2, "0")}</strong><span aria-hidden="true">{program.unit[language]}</span></div>
            <span className={styles.floatProgram}>{program.name}<ArrowUpRight size={17} aria-hidden="true" /></span>
          </div>
        </div>
      </div>

      <div className={styles.dock}>
        <div className={styles.dockHeading}><span>{pt ? "ESCOLHA SEU MOMENTO" : "FIND YOUR MOMENT"}</span><a href="#programas" className="focus-ring">{pt ? "Explore os programas" : "Explore programs"}<ArrowDown size={14} aria-hidden="true" /></a></div>
        <div className={styles.programChoices} aria-label={pt ? "Programa em destaque" : "Featured program"}>
          {programs.map((item, index) => <button type="button" key={item.name} className={`${styles.choice} focus-ring`} aria-pressed={index === selected} onClick={() => chooseProgram(index)}><span>0{index + 1}</span><strong>{item.name}</strong><i aria-hidden="true" /></button>)}
        </div>
        <button type="button" className={`${styles.motionToggle} focus-ring`} aria-pressed={paused || reducedMotion} disabled={reducedMotion} onClick={() => setPaused(value => !value)} aria-label={reducedMotion ? (pt ? "Animações desativadas pela preferência de movimento reduzido" : "Animation disabled by your reduced-motion preference") : paused ? (pt ? "Retomar animações" : "Resume animation") : (pt ? "Pausar animações" : "Pause animation")}>
          {paused || reducedMotion ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
        </button>
      </div>
      <div className={styles.programStrip} aria-live={paused ? "polite" : "off"}>
        <div className={styles.stripInner} key={program.name}>
          <div className={styles.miniCover}><Image src={program.image} alt="" fill sizes="64px" /></div>
          <span className={styles.stripTitle}>{program.name}<small>{program.focus[language]}</small></span>
          <span className={styles.stripDuration}>{program.number} {program.unit[language]} <span>· RaptorPro</span></span>
          <Link href={program.href[language]} className={`${styles.programLink} focus-ring`} onFocus={() => setPaused(true)}>{pt ? "Conhecer programa" : "Explore program"}<ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
