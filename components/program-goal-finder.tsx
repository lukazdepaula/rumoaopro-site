"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarRange,
  Dumbbell,
  Gauge,
  RotateCcw,
  ShieldCheck,
  Star
} from "lucide-react";
import { useState } from "react";
import { checkoutProducts, formatMoney } from "@/lib/checkout/products";
import { reviewGroups, type ReviewGroupKey } from "@/lib/reviews";

type ProgramGoalFinderProps = {
  locale: "pt" | "en";
  tone?: "light" | "dark";
};

type GoalId =
  | "speed"
  | "strength"
  | "preseason"
  | "return"
  | "inseason"
  | "offseason";

type GoalDefinition = {
  id: GoalId;
  label: string;
  prompt: string;
  displayName: string;
  productId: string;
  href: string;
  image: string;
  imagePosition: string;
  outcome: string;
  detail: string;
  reviewGroup: ReviewGroupKey;
  icon: typeof Gauge;
};

const goals: Record<"pt" | "en", GoalDefinition[]> = {
  pt: [
    {
      id: "strength",
      label: "Força e potência",
      prompt: "Quero ficar mais forte",
      displayName: "Projeto Adama: Força e Potência",
      productId: "projeto_adama_2022_pt",
      href: "/programas/projeto-adama-2022",
      image: "/assets/photos/programs/programs-adama-deadlift.jpeg",
      imagePosition: "object-[50%_42%]",
      outcome:
        "Construa força, hipertrofia e potência com uma preparação feita para as demandas do futebol.",
      detail: "Programa em português · acesso vitalício",
      reviewGroup: "adama",
      icon: Dumbbell
    },
    {
      id: "speed",
      label: "Velocidade",
      prompt: "Quero ficar mais rápido",
      displayName: "Projeto 36: Velocidade e Aceleração",
      productId: "project_36",
      href: "/programas/projeto-36kmh",
      image: "/assets/photos/programs/programs-project36-sprint.jpg",
      imagePosition: "object-[50%_44%]",
      outcome:
        "Desenvolva aceleração, velocidade máxima, re-aceleração e ações rápidas para o jogo.",
      detail: "12 semanas · português · acesso vitalício",
      reviewGroup: "project36",
      icon: Gauge
    },
    {
      id: "preseason",
      label: "Pré-temporada",
      prompt: "Preciso chegar pronto",
      displayName: "Projeto Pré Temporada",
      productId: "projeto_pre_temporada_pt",
      href: "/programas/projeto-pre-temporada",
      image: "/assets/photos/programs/programs-field-control.jpg",
      imagePosition: "object-[50%_40%]",
      outcome:
        "Organize campo, academia e condicionamento para começar a temporada preparado para competir.",
      detail: "12 semanas · português · acesso vitalício",
      reviewGroup: "preSeason",
      icon: CalendarRange
    },
    {
      id: "return",
      label: "Volta ao campo",
      prompt: "Quero voltar a jogar",
      displayName: "De Volta aos Gramados",
      productId: "de_volta_aos_gramados_pt",
      href: "/programas/de-volta-aos-gramados",
      image: "/assets/photos/programs/programs-player-ready.jpg",
      imagePosition: "object-[50%_38%]",
      outcome:
        "Retome corrida, força e confiança de forma progressiva após dores em pubalgia, adutores ou quadril.",
      detail: "Programa em português · acesso vitalício",
      reviewGroup: "deVolta",
      icon: RotateCcw
    }
  ],
  en: [
    {
      id: "inseason",
      label: "In-season",
      prompt: "Perform all season",
      displayName: "Elanga In Season",
      productId: "elanga_in_season",
      href: "/en/programs/elanga-in-season",
      image: "/assets/photos/programs/programs-pro-match.jpg",
      imagePosition: "object-[50%_40%]",
      outcome:
        "Maintain strength, speed and match availability while managing the demands of your season.",
      detail: "Program in English · lifetime access",
      reviewGroup: "inSeason",
      icon: ShieldCheck
    },
    {
      id: "strength",
      label: "Strength & power",
      prompt: "Get stronger",
      displayName: "Adama Strength & Power",
      productId: "adama_strength_power",
      href: "/en/programs/adama-strength-power",
      image: "/assets/photos/programs/programs-adama-deadlift.jpeg",
      imagePosition: "object-[50%_42%]",
      outcome:
        "Build football-specific strength, power and physical presence throughout your offseason.",
      detail: "12 weeks · English · lifetime access",
      reviewGroup: "adama",
      icon: Dumbbell
    },
    {
      id: "speed",
      label: "Speed",
      prompt: "Become faster",
      displayName: "Project 36: Speed & Acceleration",
      productId: "project_36",
      href: "/en/programs/project-36kmh",
      image: "/assets/photos/programs/programs-project36-sprint.jpg",
      imagePosition: "object-[50%_44%]",
      outcome:
        "Develop acceleration, top speed, re-acceleration and faster actions for the game.",
      detail: "12 weeks · English · lifetime access",
      reviewGroup: "project36",
      icon: Gauge
    },
    {
      id: "offseason",
      label: "Offseason",
      prompt: "Build my base",
      displayName: "Offseason 30 Days",
      productId: "offseason_30_days",
      href: "/en/programs/offseason-30-days",
      image: "/assets/photos/programs/programs-field-control.jpg",
      imagePosition: "object-[50%_40%]",
      outcome:
        "Organize field work, gym training, speed and conditioning in one focused offseason block.",
      detail: "30 days · English · lifetime access",
      reviewGroup: "preSeason",
      icon: CalendarRange
    }
  ]
};

const copy = {
  pt: {
    eyebrow: "Encontre seu programa",
    title: "Qual é o seu objetivo agora?",
    body: "Escolha o resultado que você busca. Nós mostramos o programa mais indicado para essa fase.",
    recommendation: "Recomendado para seu objetivo",
    reviews: "avaliações",
    price: "Pagamento único",
    cta: "Conhecer o programa",
    all: "Comparar todos os programas",
    allHref: "/programas",
    alternate: "Também temos programas em inglês",
    alternateHref: "/programas#programas"
  },
  en: {
    eyebrow: "Find your program",
    title: "What is your goal right now?",
    body: "Choose the result you need. We will show you the program that best fits this phase.",
    recommendation: "Recommended for your goal",
    reviews: "reviews",
    price: "One-time payment",
    cta: "Explore the program",
    all: "Compare all programs",
    allHref: "/en/programs",
    alternate: "Programs in Portuguese",
    alternateHref: "/programas#programas-portugues"
  }
} as const;

export function ProgramGoalFinder({
  locale,
  tone = "light"
}: ProgramGoalFinderProps) {
  const availableGoals = goals[locale];
  const [selectedGoalId, setSelectedGoalId] = useState<GoalId>(
    availableGoals[0].id
  );
  const selectedGoal =
    availableGoals.find((goal) => goal.id === selectedGoalId) ||
    availableGoals[0];
  const product = checkoutProducts.find(
    (item) => item.id === selectedGoal.productId
  );
  const reviewGroup = reviewGroups[selectedGoal.reviewGroup];
  const page = copy[locale];
  const isDark = tone === "dark";
  const price = product
    ? formatMoney(
        locale === "pt" ? product.price_brl : product.price_usd,
        locale === "pt" ? "BRL" : "USD"
      )
    : null;

  return (
    <div>
      <div className="max-w-3xl">
        <p
          className={`text-xs font-black uppercase tracking-[0.18em] ${
            isDark ? "text-red-300" : "text-signal"
          }`}
        >
          {page.eyebrow}
        </p>
        <h2
          className={`mt-3 text-3xl leading-[1.02] sm:text-5xl ${
            isDark
              ? "font-semibold tracking-[-0.04em] text-white [font-family:var(--font-links-display)]"
              : "font-display uppercase text-ink"
          }`}
        >
          {page.title}
        </h2>
        <p
          className={`mt-4 max-w-2xl text-sm leading-6 sm:text-base ${
            isDark ? "text-white/58" : "text-graphite/68"
          }`}
        >
          {page.body}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {availableGoals.map((goal) => {
          const Icon = goal.icon;
          const selected = selectedGoal.id === goal.id;

          return (
            <button
              aria-pressed={selected}
              className={`focus-ring min-h-[92px] rounded-2xl border p-3 text-left transition sm:min-h-[104px] sm:p-4 ${
                selected
                  ? isDark
                    ? "border-white bg-white text-black shadow-lg"
                    : "border-ink bg-ink text-white shadow-card"
                  : isDark
                    ? "border-white/10 bg-white/[0.045] text-white hover:border-white/25 hover:bg-white/[0.08]"
                    : "border-ink/10 bg-white text-ink hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-sm"
              }`}
              key={goal.id}
              onClick={() => setSelectedGoalId(goal.id)}
              type="button"
            >
              <Icon
                aria-hidden="true"
                className={`h-5 w-5 ${
                  selected
                    ? isDark
                      ? "text-red-600"
                      : "text-gold"
                    : isDark
                      ? "text-red-300"
                      : "text-signal"
                }`}
              />
              <span className="mt-3 block text-[10px] font-black uppercase tracking-[0.12em] opacity-55">
                {goal.label}
              </span>
              <span className="mt-1 block text-sm font-black leading-tight">
                {goal.prompt}
              </span>
            </button>
          );
        })}
      </div>

      <article
        className={`mt-4 overflow-hidden rounded-[22px] border ${
          isDark
            ? "border-white/10 bg-white/[0.045]"
            : "border-ink/10 bg-white shadow-card"
        }`}
      >
        <div className="grid md:grid-cols-[1.04fr_0.96fr]">
          <div className="relative min-h-[260px] overflow-hidden sm:min-h-[330px]">
            <Image
              alt={selectedGoal.displayName}
              className={`object-cover ${selectedGoal.imagePosition}`}
              fill
              key={selectedGoal.image}
              sizes="(max-width: 767px) 100vw, 620px"
              src={selectedGoal.image}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,0,0,0.68)_100%)]" />
            <span className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/55 px-3 py-2 text-[9px] font-black uppercase tracking-[0.15em] text-white backdrop-blur-md sm:bottom-5 sm:left-5">
              {selectedGoal.label}
            </span>
          </div>

          <div className="flex flex-col justify-center p-5 sm:p-7 lg:p-9">
            <p
              className={`text-[10px] font-black uppercase tracking-[0.17em] ${
                isDark ? "text-red-300" : "text-signal"
              }`}
            >
              {page.recommendation}
            </p>
            <h3
              className={`mt-3 text-2xl font-black leading-tight sm:text-3xl ${
                isDark ? "text-white" : "text-ink"
              }`}
            >
              {selectedGoal.displayName}
            </h3>
            <p
              className={`mt-3 text-sm leading-6 ${
                isDark ? "text-white/62" : "text-graphite/68"
              }`}
            >
              {selectedGoal.outcome}
            </p>
            <p
              className={`mt-4 text-[10px] font-black uppercase tracking-[0.12em] ${
                isDark ? "text-white/42" : "text-graphite/48"
              }`}
            >
              {selectedGoal.detail}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span
                aria-hidden="true"
                className={`inline-flex gap-0.5 ${
                  isDark ? "text-gold" : "text-signal"
                }`}
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star className="h-3.5 w-3.5 fill-current" key={index} />
                ))}
              </span>
              <span
                className={`text-xs font-bold ${
                  isDark ? "text-white/64" : "text-graphite/68"
                }`}
              >
                {reviewGroup.average.toFixed(1)} · {reviewGroup.count}{" "}
                {page.reviews}
              </span>
            </div>

            <div
              className={`mt-5 flex items-end justify-between gap-4 border-t pt-5 ${
                isDark ? "border-white/9" : "border-ink/10"
              }`}
            >
              <div>
                <p
                  className={`text-[10px] font-bold uppercase tracking-[0.12em] ${
                    isDark ? "text-white/42" : "text-graphite/48"
                  }`}
                >
                  {page.price}
                </p>
                {price ? (
                  <p
                    className={`mt-1 text-xl font-black ${
                      isDark ? "text-white" : "text-ink"
                    }`}
                  >
                    {price}
                  </p>
                ) : null}
              </div>
            </div>

            <Link
              className={`focus-ring mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-black transition hover:-translate-y-0.5 ${
                isDark
                  ? "bg-[#ef2d2d] text-white hover:bg-[#ff3b3b]"
                  : "bg-signal text-white hover:bg-signal/90"
              }`}
              href={selectedGoal.href}
            >
              {page.cta}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>

      <div className="mt-5 flex flex-col items-start justify-between gap-3 px-1 sm:flex-row sm:items-center">
        <Link
          className={`focus-ring inline-flex items-center gap-2 text-sm font-black ${
            isDark ? "text-white hover:text-red-300" : "text-ink hover:text-signal"
          }`}
          href={page.allHref}
        >
          {page.all}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
        <Link
          className={`focus-ring text-xs font-bold underline-offset-4 hover:underline ${
            isDark ? "text-white/48" : "text-graphite/55"
          }`}
          href={page.alternateHref}
        >
          {page.alternate}
        </Link>
      </div>
    </div>
  );
}
