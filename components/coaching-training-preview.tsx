"use client";

import { useState } from "react";
import { Activity, ArrowRight, BatteryFull, CalendarDays, Check, CheckCircle2, MessageCircle, Signal, Wifi } from "lucide-react";
import phone from "./home-program-phone.module.css";
import styles from "./coaching-page.module.css";

// Public demonstration only. No athlete records, prescriptions or submissions.
export function CoachingTrainingPreview({ locale }: { locale: "pt" | "en" }) {
  const pt = locale === "pt";
  const [step, setStep] = useState(0);
  const labels = pt ? ["Sua semana", "Seu feedback", "Os ajustes"] : ["Your week", "Your feedback", "The adjustments"];
  const week = pt ? ["S", "T", "Q", "Q", "S", "S", "D"] : ["M", "T", "W", "T", "F", "S", "S"];
  const sessions = pt ? ["Força", "Clube", "Campo", "Clube", "Ativação", "Jogo", "Recuperação"] : ["Strength", "Club", "Pitch", "Club", "Activation", "Match", "Recovery"];
  const titles = pt ? ["Uma semana com direção.", "O treino continua na conversa.", "A próxima semana tem contexto."] : ["A week with direction.", "The conversation continues.", "Context for your next week."];
  const descriptions = pt ? [
    "Jogos, treinos do clube e preparação individual no mesmo planejamento.",
    "Seu esforço, suas observações e as dúvidas chegam ao acompanhamento.",
    "O treinador considera sua rotina e o feedback para ajustar o planejamento."
  ] : [
    "Matches, club sessions and individual preparation in one plan.",
    "Your effort, comments and questions inform the coaching process.",
    "Your coach considers your schedule and feedback when adjusting the plan."
  ];

  return <figure className={styles.preview}>
    <nav className={styles.previewTabs} aria-label={pt ? "Etapas da demonstração da assessoria" : "Coaching demonstration steps"}>
      {labels.map((label,index) => <button type="button" key={label} className="focus-ring" aria-pressed={step===index} aria-controls="coaching-preview-stage" onClick={()=>setStep(index)}><span aria-hidden="true">0{index+1}</span>{label}</button>)}
    </nav>
    <div className={styles.previewStage} id="coaching-preview-stage">
      <div className={styles.coachBoard} key={step}>
        <p className={styles.boardLabel}><span/>{pt ? "VISÃO DO ACOMPANHAMENTO" : "COACHING OVERVIEW"}</p>
        <h3>{titles[step]}</h3><p className={styles.boardDescription}>{descriptions[step]}</p>
        {step===0 ? <div className={styles.boardWeek}>{week.map((day,index)=><div key={index} data-match={index===5}><span>{day}</span><b>{9+index}</b><small>{sessions[index]}</small></div>)}</div>
          : step===1 ? <div className={styles.boardFeedback}><MessageCircle size={20} aria-hidden="true"/><div><small>{pt ? "EXEMPLO DE FEEDBACK" : "EXAMPLE FEEDBACK"}</small><p>{pt ? "Consegui completar a sessão. Deixei minhas observações no treino." : "I completed the session and left my comments in the training log."}</p></div></div>
          : <ul className={styles.boardChecks}>{(pt ? ["Calendário de jogos", "Treinos do clube", "Respostas do atleta"] : ["Match calendar", "Club training", "Athlete feedback"]).map(item=><li key={item}><Check size={14} aria-hidden="true"/>{item}</li>)}</ul>}
        <div className={styles.boardFoot}><CalendarDays size={14} aria-hidden="true"/><span>{pt ? "Planejar. Acompanhar. Ajustar." : "Plan. Monitor. Adjust."}</span></div>
      </div>
      <div className={styles.coachingPhone}>
        <div className={phone.device} data-testid="coaching-phone"><div className={phone.screen}>
          <div className={phone.status} aria-hidden="true"><span>9:41</span><i/><span><Signal size={11}/><Wifi size={11}/><BatteryFull size={15}/></span></div>
          <div className={phone.appBrand}><strong>RAPTOR<span>PRO</span></strong><span>{pt ? "PRÉVIA" : "PREVIEW"}</span></div>
          <div className={phone.viewport}>
            <div className={`${phone.panel} ${styles.phonePanel}`} key={step} data-step={step} aria-live="polite">
              <p className={phone.kicker}>{pt ? "SEU ACOMPANHAMENTO" : "YOUR COACHING"}</p>
              <h3>{labels[step]}</h3><p className={phone.muted}>{pt ? "Um plano que acompanha você." : "A plan that moves with you."}</p>
              {step===0 ? <>
                <div className={`${phone.week} ${styles.phoneWeek}`}>{week.map((day,index)=><span key={index} data-current={index===1}>{day}<b>{index+9}</b>{index===1&&<i/>}</span>)}</div>
                <div className={phone.workout}><div><CalendarDays size={15} aria-hidden="true"/>{pt ? "PLANEJAMENTO INDIVIDUAL" : "INDIVIDUAL PLANNING"}</div><h4>{pt ? "Seu treino do dia" : "Your session today"}</h4><p>{pt ? "Sessão, orientações e espaço para o seu registro." : "Your session, guidance and space to log your training."}</p><span className={phone.open}>{pt ? "Ver o treino" : "View session"}<ArrowRight size={13} aria-hidden="true"/></span></div>
                <div className={phone.next}><CalendarDays size={15} aria-hidden="true"/><span><small>{pt ? "NA SUA ROTINA" : "IN YOUR SCHEDULE"}</small>{pt ? "Treinos do clube e jogos" : "Club sessions and matches"}</span></div>
              </> : step===1 ? <>
                <div className={phone.logCard}><label>{pt ? "Como foi o esforço?" : "How hard was the session?"}</label><div className={phone.load}><strong>6</strong><span>/ 10</span></div><small>{pt ? "RPE · valor ilustrativo" : "RPE · illustrative value"}</small></div>
                <div className={phone.scale} aria-hidden="true">{Array.from({length:10},(_,i)=><i key={i} data-filled={i<6}/>)}</div>
                <div className={styles.phoneMessage}><MessageCircle size={14} aria-hidden="true"/><p>{pt ? "Espaço para comentar como foi a sessão e tirar dúvidas." : "Space to share how training went and ask questions."}</p></div>
                <div className={phone.saved} data-saved="true"><CheckCircle2 size={14} aria-hidden="true"/>{pt ? "Feedback demonstrado" : "Example feedback"}</div>
              </> : <>
                <div className={styles.phoneAdjustment}><CalendarDays size={21} aria-hidden="true"/><h4>{pt ? "A semana se ajusta." : "Your week adapts."}</h4><p>{pt ? "Jogos, rotina e respostas ajudam a orientar o próximo microciclo." : "Matches, your routine and feedback help shape the next microcycle."}</p></div>
                <ul className={styles.phoneChecks}>{(pt ? ["Calendário organizado", "Orientações do treinador", "Continuidade no acompanhamento"] : ["An organized calendar", "Guidance from your coach", "Ongoing individual support"]).map(item=><li key={item}><Check size={12} aria-hidden="true"/>{item}</li>)}</ul>
              </>}
            </div>
          </div>
          <div className={phone.appNav} aria-hidden="true"><span><CalendarDays size={15}/>{pt ? "Semana" : "Week"}</span><span><MessageCircle size={15}/>{pt ? "Feedback" : "Feedback"}</span><span><Activity size={15}/>{pt ? "Evolução" : "Progress"}</span></div><div className={phone.homeBar} aria-hidden="true"/>
        </div></div>
      </div>
    </div>
    <figcaption>{pt ? "Demonstração ilustrativa do fluxo. Sem dados de atletas." : "Illustrative workflow demonstration. No athlete records."}</figcaption>
  </figure>;
}
