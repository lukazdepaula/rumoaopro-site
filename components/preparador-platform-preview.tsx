"use client";

import Image from "next/image";
import { BookOpen, Layers3, Monitor, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import styles from "./preparador-pro-page.module.css";

export function PreparadorPlatformPreview({ locale }: { locale: "pt" | "en" }) {
  const pt = locale === "pt";
  const [active, setActive] = useState(0);
  const screens = [
    {
      label: pt ? "Biblioteca de aulas" : "Lesson library",
      title: pt ? "Escolha por onde começar." : "Choose your starting point.",
      body: pt ? "Encontre os conteúdos e volte ao tema que faz sentido para a sua rotina de trabalho." : "Explore the content and revisit the topics that matter to your coaching practice.",
      src: "/assets/courses/preparador-pro/screens/featured-lessons.webp",
      alt: pt ? "Biblioteca real do Preparador Pro com aulas de controle de carga, YoYo Test, Hill Sprints e Complexo Francês" : "Actual Preparador Pro library with load monitoring, YoYo Test, Hill Sprints and French Contrast lessons",
      icon: BookOpen
    },
    {
      label: pt ? "Dentro de uma aula" : "Inside a lesson",
      title: pt ? "Entenda. Reveja. Aplique." : "Understand. Revisit. Apply.",
      body: pt ? "Uma tela real da aula de controle de carga sem GPS, com o conteúdo e a navegação entre os módulos." : "An actual screen from the load monitoring without GPS lesson, including the lesson and module navigation.",
      src: "/assets/courses/preparador-pro/screens/lesson-player.webp",
      alt: pt ? "Tela completa da aula Controle de Carga sem GPS do Preparador Pro" : "Full Preparador Pro Load Monitoring without GPS lesson screen",
      icon: Monitor
    },
    {
      label: pt ? "Organização dos módulos" : "Module organization",
      title: pt ? "Seu próximo tema, à mão." : "Your next topic, within reach.",
      body: pt ? "Os conteúdos ficam organizados para estudar no seu ritmo. Role a lista para conhecer mais temas." : "The content is organized for self-paced study. Scroll the list to explore more topics.",
      src: "/assets/courses/preparador-pro/screens/modules-list.webp",
      alt: pt ? "Lista real de módulos do curso, de controle de carga a velocidade, potência, VBT e carreira" : "Actual course module list covering load monitoring, speed, power, VBT and career",
      icon: Layers3
    }
  ];
  const screen = screens[active];

  return (
    <div className={styles.platformPreview}>
      <div className={styles.screenButtons} aria-label={pt ? "Escolha a tela da plataforma" : "Choose a platform screen"}>
        {screens.map(({ label, icon: Icon }, index) => (
          <button aria-controls="preparador-screen" aria-pressed={active === index} className="focus-ring" key={label} onClick={() => setActive(index)} type="button">
            <Icon size={17} aria-hidden="true" /><span>{label}</span><small>0{index + 1}</small>
          </button>
        ))}
      </div>
      <div className={styles.screenFrame} id="preparador-screen">
        <div className={styles.screenToolbar} aria-hidden="true"><span><i /><i /><i /></span><strong>PREPARADOR <b>PRO</b></strong><small>{pt ? "ÁREA DO ALUNO" : "STUDENT AREA"}</small></div>
        <div className={styles.screenImage} data-view={active} key={screen.src}>
          <div className={`${styles.screenViewport} ${active === 2 ? "focus-ring" : ""}`} tabIndex={active === 2 ? 0 : undefined} role={active === 2 ? "region" : undefined} aria-label={active === 2 ? screen.label : undefined}>
            <Image alt={screen.alt} height={active === 2 ? 1023 : active === 1 ? 842 : 633} src={screen.src} width={active === 2 ? 467 : 1600} sizes={active === 2 ? "(min-width:800px) 400px, 80vw" : "(min-width:1280px) 1150px, 95vw"} />
          </div>
        </div>
        <div className={styles.screenCaption} aria-live="polite"><div><h3>{screen.title}</h3><p>{screen.body}</p></div><span><span className={styles.liveDot} />{pt ? "TELA REAL DO CURSO" : "ACTUAL COURSE SCREEN"}</span></div>
      </div>
      <p className={styles.previewNote}>{pt ? "Prévia visual da plataforma. As aulas completas ficam na área do aluno, após a compra." : "A visual preview of the platform. Full lessons are available in the student area after purchase."}<a className="focus-ring" href="#conteudo">{pt ? "Ver todos os temas" : "Explore all topics"}<ArrowUpRight size={14} aria-hidden="true" /></a></p>
    </div>
  );
}
