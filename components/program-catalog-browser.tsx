"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, Dumbbell, Gauge, HeartPulse, LayoutGrid, ListFilter, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { CatalogGoal, CatalogProgram } from "@/lib/program-catalog";
import styles from "./program-catalog.module.css";

const filters = [
  { id: "all", label: ["Todos", "All programs"], icon: LayoutGrid },
  { id: "gym", label: ["Academia", "Gym"], icon: Dumbbell },
  { id: "speed", label: ["Velocidade", "Speed"], icon: Gauge },
  { id: "offseason", label: ["Pré-temporada", "Preseason"], icon: CalendarDays },
  { id: "inseason", label: ["Entre jogos", "In season"], icon: ShieldCheck },
  { id: "return", label: ["Retorno ao campo", "Return to play"], icon: HeartPulse }
] as const;

export function ProgramCatalogBrowser({ locale, programs }: { locale: "pt" | "en"; programs: CatalogProgram[] }) {
  const pt = locale === "pt";
  const [goal, setGoal] = useState<CatalogGoal | "all">("all");
  const [view, setView] = useState<"cards" | "compare">("cards");
  const [currency, setCurrency] = useState<"BRL" | "USD">(pt ? "BRL" : "USD");
  const visible = goal === "all" ? programs : programs.filter(program => program.id === goal);
  const price = (program: CatalogProgram) => new Intl.NumberFormat(pt ? "pt-BR" : "en-US", { style: "currency", currency }).format(currency === "BRL" ? program.priceBrl : program.priceUsd);
  const comparisonRows: { label: string; key: "focus" | "duration" | "equipment" | "language" }[] = [
    { label: pt ? "Seu objetivo" : "Your goal", key: "focus" },
    { label: pt ? "Duração" : "Duration", key: "duration" },
    { label: pt ? "Onde treinar" : "Where to train", key: "equipment" },
    { label: pt ? "Idioma do programa" : "Program language", key: "language" }
  ];

  return (
    <section className={styles.browser} id="programas" aria-labelledby="catalog-heading">
      <div className={styles.browserHeading}>
        <div><p className={styles.eyebrow}>{pt ? "Escolha pelo seu momento" : "Choose by your moment"}</p><h2 id="catalog-heading">{pt ? "Qual é o seu próximo objetivo?" : "What is your next goal?"}</h2></div>
        <div className={styles.viewSwitch} aria-label={pt ? "Visualização dos programas" : "Program view"}>
          <button className="focus-ring" type="button" aria-pressed={view === "cards"} onClick={() => setView("cards")}><LayoutGrid size={15} aria-hidden="true" />{pt ? "Explorar" : "Explore"}</button>
          <button className="focus-ring" type="button" aria-pressed={view === "compare"} onClick={() => setView("compare")}><ListFilter size={15} aria-hidden="true" />{pt ? "Comparar" : "Compare"}</button>
        </div>
      </div>
      {view === "cards" && <div className={styles.filters} aria-label={pt ? "Filtrar por objetivo" : "Filter by goal"}>{filters.map(filter => <button className="focus-ring" type="button" key={filter.id} aria-pressed={goal === filter.id} onClick={() => setGoal(filter.id)}><filter.icon size={17} aria-hidden="true" />{filter.label[pt ? 0 : 1]}</button>)}</div>}
      <div className={styles.resultsBar}>
        <p aria-live="polite" aria-atomic="true">{view === "compare" ? (pt ? `Compare os ${programs.length} programas lado a lado.` : `Compare all ${programs.length} programs side by side.`) : `${visible.length} ${pt ? (visible.length === 1 ? "programa para este objetivo" : "programas disponíveis") : (visible.length === 1 ? "program for this goal" : "programs available")}`}</p>
        <div className={styles.currency}><span>{pt ? "Exibir preços em" : "Show prices in"}</span>{(["BRL", "USD"] as const).map(value => <button className="focus-ring" key={value} type="button" aria-label={value === "BRL" ? (pt ? "Preços em reais" : "Prices in Brazilian reais") : (pt ? "Preços em dólares" : "Prices in US dollars")} aria-pressed={value === currency} onClick={() => setCurrency(value)}>{value === "BRL" ? "R$" : "US$"}</button>)}</div>
      </div>

      {view === "cards" ? <div className={styles.programGrid}>
        {visible.map(program => <article className={styles.card} data-goal={program.id} key={program.id}>
          <Link href={program.href} className={`${styles.cardImage} focus-ring`} tabIndex={-1} aria-hidden="true"><Image src={program.image} alt="" fill sizes="(min-width: 1050px) 33vw, (min-width: 680px) 50vw, 100vw" style={{ objectPosition: program.imagePosition }} /><span>RAPTORPRO <ArrowUpRight size={16} /></span></Link>
          <div className={styles.cardBody}>
            <p className={styles.cardFocus}>{program.focus}</p><h3><Link href={program.href} className="focus-ring">{program.name}</Link></h3><p className={styles.cardDescription}>{program.body}</p>
            <dl className={styles.facts}><div><dt>{pt ? "Duração" : "Duration"}</dt><dd>{program.duration}</dd></div><div><dt>{pt ? "Estrutura" : "Training setting"}</dt><dd>{program.equipment}</dd></div><div><dt>{pt ? "Idioma" : "Language"}</dt><dd>{program.language}</dd></div></dl>
            {program.id === "return" && <p className={styles.safety}>{pt ? "Após liberação profissional. Não substitui avaliação médica ou fisioterapêutica." : "Professional clearance required. Not a substitute for medical or physiotherapy assessment."}</p>}
            <div className={styles.cardBottom}><div><small>{pt ? "Compra única" : "One-time purchase"}</small><strong>{price(program)}</strong></div><Link className={`${styles.cardCta} focus-ring`} href={program.href} aria-label={`${pt ? "Conhecer" : "Explore"} ${program.name}`}>{pt ? "Ver programa" : "View program"}<ArrowRight size={17} aria-hidden="true" /></Link></div>
          </div>
        </article>)}
      </div> : <>
        <p className={styles.compareHint}>{pt ? "No celular, deslize a tabela para ver todos os programas." : "On mobile, swipe across the table to see every program."}</p>
        <div className={`${styles.tableScroll} focus-ring`} role="region" aria-label={pt ? "Comparação dos programas, com rolagem horizontal" : "Program comparison with horizontal scrolling"} tabIndex={0}>
          <table className={styles.table}><caption className="sr-only">{pt ? "Objetivo, duração, estrutura, idioma e preço dos programas" : "Program goals, duration, training setting, language and prices"}</caption><thead><tr><th scope="col">{pt ? "Seu próximo treino" : "Your next session"}</th>{programs.map(program => <th scope="col" key={program.id}><span>{program.name}</span></th>)}</tr></thead><tbody>
            {comparisonRows.map(row => <tr key={row.key}><th scope="row">{row.label}</th>{programs.map(program => <td key={program.id}>{program[row.key]}</td>)}</tr>)}
            <tr><th scope="row">{pt ? "Compra única" : "One-time purchase"}</th>{programs.map(program => <td key={program.id}><strong>{price(program)}</strong></td>)}</tr>
            <tr><th scope="row">{pt ? "Veja os detalhes" : "See the details"}</th>{programs.map(program => <td key={program.id}><Link className="focus-ring" href={program.href} aria-label={`${pt ? "Conhecer" : "Explore"} ${program.name}`}>{pt ? "Ver programa" : "View program"}<ArrowUpRight size={15} aria-hidden="true" /></Link></td>)}</tr>
          </tbody></table>
        </div>
        <p className={styles.safety}>{pt ? "De Volta aos Gramados: use após liberação profissional. O programa não substitui avaliação médica ou fisioterapêutica." : "Back to the Pitch: professional clearance required. The program does not replace medical or physiotherapy assessment."}</p>
      </>}
      <p className={styles.priceNote}>{pt ? "A moeda de exibição não muda o idioma do programa. As condições de pagamento aparecem no checkout." : "Display currency does not change the program language. Payment terms are shown at checkout."}</p>
    </section>
  );
}
