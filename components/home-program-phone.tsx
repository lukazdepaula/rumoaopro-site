import Image from "next/image";
import { Activity, ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, ChevronRight, Dumbbell, Play, Signal, Wifi, BatteryFull } from "lucide-react";
import type { HomeProgramScene } from "@/lib/home-program-scenes";
import styles from "./home-program-phone.module.css";

export function HomeProgramPhone({ program, language, beat, onStep }: {
  program: HomeProgramScene; language: 0 | 1; beat: number; onStep: (step: number) => void;
}) {
  const pt = language === 0;
  const step = beat === 0 ? 0 : beat === 1 ? 1 : 2;
  const value = beat < 3 ? "—" : beat === 3 ? program.value.slice(0, 1) : program.value;
  return <figure className={styles.figure}>
    <div className={styles.device} data-testid="program-phone">
      <div className={styles.screen}>
        <div className={styles.status} aria-hidden="true"><span>9:41</span><i/><span><Signal size={11}/><Wifi size={11}/><BatteryFull size={15}/></span></div>
        <div className={styles.appBrand}><strong>RAPTOR<span>PRO</span></strong><span>{pt ? "PRÉVIA" : "PREVIEW"}</span></div>
        <div className={styles.viewport}>
          <div className={styles.track} style={{ transform: `translateX(-${step * 100 / 3}%)` }}>
            <div className={styles.panel} aria-hidden={step !== 0}>
              <p className={styles.kicker}>{pt ? "SEU PROGRAMA" : "YOUR PROGRAM"}</p>
              <h3>{program.shortName}</h3><p className={styles.muted}>{program.shortName === "DVG" ? (pt ? "Uma fase de cada vez." : "One phase at a time.") : (pt ? "Uma semana de cada vez." : "One week at a time.")}</p>
              <div className={styles.week}>{(pt ? ["S", "T", "Q", "Q", "S", "S", "D"] : ["M", "T", "W", "T", "F", "S", "S"]).map((day,i)=><span key={i} data-current={i===1}>{day}<b>{i+9}</b>{i===1&&<i/>}</span>)}</div>
              <div className={styles.workout}><div><Dumbbell size={16}/><span>{pt ? "TREINO DO DIA" : "TODAY'S SESSION"}</span><i/></div><h4>{program.session[language]}</h4><p>{pt ? "Aquecimento · exercícios · registro" : "Warm-up · exercises · log"}</p><span className={styles.open}>{pt ? "Abrir treino" : "Open session"}<ArrowRight size={14}/></span></div>
              <div className={styles.next}><CalendarDays size={16}/><span><small>{pt ? "NA SUA SEMANA" : "THIS WEEK"}</small>{program.next[language]}</span><ChevronRight size={14}/></div>
            </div>
            <div className={styles.panel} aria-hidden={step !== 1}>
              <p className={styles.back}><ArrowLeft size={12}/>{program.name}</p>
              <h3>{pt ? "Seu treino de hoje" : "Today's training"}</h3>
              <div className={styles.exerciseImage}><Image src={program.sessionPhoto} alt="" fill sizes="240px" loading="eager"/><span><Play size={18} fill="currentColor"/></span><small>{pt ? "ORIENTAÇÃO DO EXERCÍCIO" : "EXERCISE GUIDANCE"}</small></div>
              <p className={styles.kicker}>{pt ? "EXERCÍCIO DE EXEMPLO" : "EXAMPLE EXERCISE"}</p><h4 className={styles.exerciseName}>{program.exercise[language]}</h4>
              <div className={styles.instructions}><span><Check size={13}/>{pt ? "Confira as orientações" : "Check the instructions"}</span><span><Check size={13}/>{pt ? "Siga a sessão planejada" : "Follow your planned session"}</span></div>
              <span className={styles.open}>{pt ? "Registrar meu treino" : "Log my training"}<ArrowRight size={14}/></span>
            </div>
            <div className={styles.panel} aria-hidden={step !== 2}>
              <p className={styles.back}><ArrowLeft size={12}/>{pt ? "REGISTRO DO TREINO" : "TRAINING LOG"}</p>
              <h3>{program.effort ? (pt ? "Como foi o treino?" : "How was training?") : program.exercise[language]}</h3>
              <div className={styles.logCard}><label>{program.metric[language]}</label><div className={styles.load} data-writing={beat===3 || beat===4}><strong>{value}</strong><i/><span>{program.unitLabel}</span></div><small>{pt ? "Valor ilustrativo" : "Example value"}</small></div>
              {program.effort ? <div className={styles.scale} aria-hidden="true">{Array.from({length:10},(_,i)=><i key={i} data-filled={beat>=4&&i<6}/>)}</div> : <div className={styles.sets}><span>{pt ? "Série" : "Set"}</span><span>{pt ? "Carga" : "Load"}</span>{[1,2,3].map(n=><div key={n}><b>0{n}</b><span>{beat>=4?program.value:"—"} kg {beat>=5&&<Check size={12}/>}</span></div>)}</div>}
              <div className={styles.saved} data-saved={beat>=5}>{beat>=5?<CheckCircle2 size={15}/>:<Activity size={15}/>}<span>{beat>=5?(pt?"Registro demonstrado":"Example logged"):(pt?"Registrando o treino…":"Logging training…")}</span></div>
            </div>
          </div>
        </div>
        <div className={styles.appNav} aria-hidden="true"><span><CalendarDays size={16}/>{pt ? "Semana" : "Week"}</span><span><Dumbbell size={16}/>{pt ? "Treino" : "Session"}</span><span><Activity size={16}/>{pt ? "Evolução" : "Progress"}</span></div>
        <div className={styles.homeBar} aria-hidden="true"/>
      </div>
    </div>
    <figcaption><span>{pt ? "PRÉVIA ILUSTRATIVA DO RAPTORPRO" : "ILLUSTRATIVE RAPTORPRO PREVIEW"}</span><nav aria-label={pt?"Etapas da prévia":"Preview steps"}>{(pt?["Semana","Exercício","Registro"]:["Week","Exercise","Log"]).map((name,i)=><button type="button" key={name} onClick={()=>onStep(i)} aria-pressed={step===i} className="focus-ring">{name}</button>)}</nav></figcaption>
  </figure>;
}
