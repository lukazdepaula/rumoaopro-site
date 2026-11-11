"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Pause, Play, ScanLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { homeProgramScenes as programs } from "@/lib/home-program-scenes";
import { HomeProgramPhone } from "./home-program-phone";
import styles from "./home-motion-hero.module.css";

const beatDurations = [2400, 2300, 650, 650, 650, 3350];

export function HomeMotionHero({ locale }: { locale: "pt" | "en" }) {
  const language = locale === "pt" ? 0 : 1;
  const pt = language === 0;
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selected, setSelected] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [allowVideo, setAllowVideo] = useState(false);
  const [beat, setBeat] = useState(0);
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
    const timer = window.setTimeout(() => {
      if (beat < beatDurations.length - 1) setBeat(value => value + 1);
      else { setDirection("forward"); setSelected(value => (value + 1) % programs.length); setBeat(0); }
    }, beatDurations[beat]);
    return () => window.clearTimeout(timer);
  }, [running, selected, beat]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (running && allowVideo) void video.play().catch(() => { /* The poster remains visible when autoplay is unavailable. */ });
    else video.pause();
  }, [running, allowVideo, selected]);

  const chooseProgram = (index: number) => {
    if (index === selected) return;
    setDirection(index > selected ? "forward" : "backward");
    setSelected(index);
    setBeat(0);
  };

  return (
    <section id="programas" ref={heroRef} className={styles.hero} data-running={running} data-program={selected} data-beat={beat} data-direction={direction} aria-labelledby="home-program-title">
      <div key={program.video} className={styles.backdrop} aria-hidden="true">
        <Image src={program.poster} alt="" fill sizes="(min-width: 900px) 65vw, 100vw" className={styles.fieldImage} />
        {program.video && <video ref={videoRef} src={allowVideo ? program.video : undefined} muted loop playsInline preload="none" poster={program.poster} className={styles.fieldVideo} onLoadedData={event=>{if(running) void event.currentTarget.play().catch(()=>{});}} />}
      </div>
      <div className={styles.shade} aria-hidden="true" />
      <div className={styles.stage}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}><span />01 / {pt ? "PROGRAMAS PARA ATLETAS" : "TRAINING PROGRAMS"}</p>
          <div key={program.name} className={styles.programCopy}><p className={styles.programName}>{program.name}</p><h2 id="home-program-title" className={styles.headline}>{program.title[language]}<span>{program.accent[language]}</span></h2><p className={styles.intro}>{program.description[language]}</p></div>
          <div className={styles.actions}>
            <Link className={`${styles.primary} focus-ring`} href={program.href[language]} onFocus={()=>setPaused(true)}>{pt ? "Conhecer " : "Explore "}{program.name}<ArrowUpRight size={19} aria-hidden="true" /></Link>
            <Link href={pt?"/programas":"/en/programs"} className={`${styles.secondary} focus-ring`}><ScanLine size={17} aria-hidden="true" />{pt ? "Todos os programas" : "All programs"}</Link>
          </div>
          <div className={styles.disciplines}><span>01 / {pt ? "CAMPO" : "PITCH"}</span><span>02 / {pt ? "ACADEMIA" : "GYM"}</span><span>03 / {pt ? "JOGO" : "MATCH"}</span></div>
        </div>

        <div className={styles.scene}>
          <div className={styles.orbit} aria-hidden="true">
            <svg viewBox="0 0 700 600" fill="none"><path className={styles.orbitBase} d="M70 410C-90 190 190 35 445 145S750 410 495 490 50 490 70 410Z" /><path className={styles.orbitLight} pathLength="100" d="M70 410C-90 190 190 35 445 145S750 410 495 490 50 490 70 410Z" /></svg>
          </div>
          <span className={styles.sceneIndex} aria-hidden="true">RAP / 0{selected + 1}</span>
          <div className={styles.phoneAnchor} key={`phone-${program.name}`}>
            <HomeProgramPhone program={program} language={language} beat={beat} onStep={step=>{setPaused(true);setBeat(step===2?5:step);}} />
          </div>
          <div className={styles.trainingLabel}><span className={styles.crosshair} aria-hidden="true" /><span>{pt ? "DO PLANO AO CAMPO" : "FROM PLAN TO PITCH"}<small>{pt ? "Preparação para o jogo real." : "Preparation for the real game."}</small></span></div>
          <div className={styles.programFloat} key={`duration-${program.name}`}>
            <span className={styles.floatLabel}>{pt ? "SEU PRÓXIMO DESAFIO" : "YOUR NEXT CHALLENGE"}</span>
            <div className={styles.duration} aria-label={`${program.number} ${program.unit[language]}`}><strong aria-hidden="true">{program.number}</strong><span aria-hidden="true">{program.unit[language]}</span></div>
            <span className={styles.floatProgram}>{program.name}<ArrowUpRight size={17} aria-hidden="true" /></span>
          </div>
        </div>
      </div>

      <div className={styles.dock}>
        <div className={styles.dockHeading}><span>{pt ? "ESCOLHA SEU MOMENTO" : "FIND YOUR MOMENT"}</span><Link href={pt?"/programas":"/en/programs"} className="focus-ring">{pt ? "Explore os programas" : "Explore programs"}<ArrowDown size={14} aria-hidden="true" /></Link></div>
        <div className={styles.programChoices} aria-label={pt ? "Programa em destaque" : "Featured program"}>
          {programs.map((item, index) => <button type="button" key={item.name} className={`${styles.choice} focus-ring`} aria-label={`0${index + 1} ${item.name}`} aria-pressed={index === selected} onClick={() => chooseProgram(index)}><span>0{index + 1}</span><strong>{item.shortName}</strong><i aria-hidden="true" /></button>)}
        </div>
        <button type="button" className={`${styles.motionToggle} focus-ring`} aria-pressed={paused || reducedMotion} disabled={reducedMotion} onClick={() => setPaused(value => !value)} aria-label={reducedMotion ? (pt ? "Animações desativadas pela preferência de movimento reduzido" : "Animation disabled by your reduced-motion preference") : paused ? (pt ? "Retomar animações" : "Resume animation") : (pt ? "Pausar animações" : "Pause animation")}>
          {paused || reducedMotion ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
        </button>
      </div>
      <div className={styles.programStrip} aria-live={paused ? "polite" : "off"}>
        <div className={styles.stripInner} key={program.name}>
          <div className={styles.miniCover}><Image src={program.image} alt="" fill sizes="64px" loading="eager" /></div>
          <span className={styles.stripTitle}>{program.name}<small>{program.focus[language]}</small></span>
          <span className={styles.stripDuration}>{program.number} {program.unit[language]} <span>· RaptorPro</span></span>
          <Link href={program.href[language]} className={`${styles.programLink} focus-ring`} onFocus={() => setPaused(true)}>{pt ? "Conhecer programa" : "Explore program"}<ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
