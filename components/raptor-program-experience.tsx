import Image from "next/image";
import { Activity, CalendarDays, CheckCircle2, Smartphone } from "lucide-react";

type RaptorProgramExperienceProps = {
  locale: "pt" | "en";
  variant: "project36" | "elanga";
};

export const raptorAppScreens = {
  calendar:
    "/assets/programs/offseason-30/raptor-athlete-calendar-mobile.png",
  readiness:
    "/assets/programs/offseason-30/raptor-athlete-readiness-mobile.png",
  workout:
    "/assets/programs/offseason-30/raptor-athlete-workout-mobile.png"
};

const copy = {
  project36: {
    pt: {
      eyebrow: "Speed Pro no RaptorPro",
      title: "Abra o app. Veja o treino. Execute.",
      lead:
        "O programa inteiro fica organizado no celular com calendário, instruções, vídeos e registro de cada sessão.",
      badge: "Telas reais do RaptorPro",
      steps: [
        ["Veja sua semana", "Encontre campo, academia, condicionamento e recuperação na ordem certa."],
        ["Siga cada sessão", "Abra o dia e acompanhe blocos, séries, repetições, notas e demonstrações."],
        ["Registre o resultado", "Salve exercícios concluídos, comentários, prontidão, duração e RPE."]
      ]
    },
    en: {
      eyebrow: "Speed Pro in RaptorPro",
      title: "Open the app. See the session. Execute.",
      lead:
        "The full program stays organized on your phone with a calendar, instructions, videos and session tracking.",
      badge: "Real RaptorPro screens",
      steps: [
        ["See your week", "Find field, gym, conditioning and recovery days in the right order."],
        ["Follow each session", "Open the day and follow blocks, sets, reps, notes and demonstrations."],
        ["Track the result", "Save completed exercises, comments, readiness, duration and RPE."]
      ]
    }
  },
  elanga: {
    pt: {
      eyebrow: "In-Season Pro durante a temporada",
      title: "Organize seus treinos entre jogos.",
      lead:
        "Use o RaptorPro para enxergar a semana, chegar melhor para cada sessão e controlar o trabalho feito sem competir com a agenda do clube.",
      badge: "Telas reais do RaptorPro",
      steps: [
        ["Enxergue o microciclo", "Veja onde encaixar força, potência e velocidade ao redor dos jogos."],
        ["Cheque sua prontidão", "Registre como você chega para treinar e ajuste sua execução com mais consciência."],
        ["Controle a sessão", "Acompanhe exercícios, vídeos, comentários, duração e RPE dentro do app."]
      ]
    },
    en: {
      eyebrow: "In-Season Pro during the season",
      title: "Organize training between matches.",
      lead:
        "Use RaptorPro to see the week, arrive better for each session and control the work without fighting the club schedule.",
      badge: "Real RaptorPro screens",
      steps: [
        ["See the microcycle", "Place strength, power and speed work around matches with more clarity."],
        ["Check readiness", "Record how you arrive and approach each session with better awareness."],
        ["Control the session", "Follow exercises, videos, comments, duration and RPE inside the app."]
      ]
    }
  }
} as const;

export function RaptorPhoneMockup({
  src,
  alt,
  className
}: {
  src: string;
  alt: string;
  className: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border-[6px] border-[#15171c] bg-white shadow-[0_34px_90px_rgba(0,0,0,0.62)] ring-1 ring-white/15 ${className}`}
    >
      <span className="absolute left-1/2 top-1.5 z-20 h-3.5 w-[30%] -translate-x-1/2 rounded-full bg-[#08090b]" />
      <div className="relative aspect-[390/844] w-full overflow-hidden bg-white">
        <Image
          alt={alt}
          className="h-full w-full object-cover object-top"
          fill
          sizes="(min-width: 1024px) 290px, 40vw"
          src={src}
        />
      </div>
    </div>
  );
}

export function RaptorProgramExperience({
  locale,
  variant
}: RaptorProgramExperienceProps) {
  const page = copy[variant][locale];
  const isProject36 = variant === "project36";
  const accentText = isProject36 ? "text-lime-300" : "text-orange-300";
  const accentSurface = isProject36
    ? "bg-lime-300 text-[#07100b]"
    : "bg-orange-500 text-white";

  return (
    <section className="relative isolate overflow-hidden bg-[#07080c] py-16 text-white sm:py-20">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_82%_42%,rgba(220,38,38,0.18),transparent_38%),radial-gradient(circle_at_18%_80%,rgba(255,255,255,0.06),transparent_30%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.1] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:px-8">
        <div>
          <p
            className={`flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] ${accentText}`}
          >
            <Smartphone aria-hidden="true" className="h-4 w-4" />
            {page.eyebrow}
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl uppercase leading-[0.96] text-white sm:text-5xl">
            {page.title}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/65">
            {page.lead}
          </p>

          <div className="mt-8 grid gap-3">
            {page.steps.map(([title, body], index) => {
              const Icon = index === 0 ? CalendarDays : index === 1 ? Activity : CheckCircle2;

              return (
                <article
                  className="grid grid-cols-[auto_1fr] gap-4 rounded-xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur"
                  key={title}
                >
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-lg ${accentSurface}`}
                  >
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-white">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-white/55">{body}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="relative mx-auto min-h-[470px] w-full max-w-[720px] sm:min-h-[640px]">
          <div className="absolute left-1/2 top-1/2 h-[68%] w-[76%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(239,35,60,0.24),rgba(18,110,255,0.08)_48%,transparent_72%)] blur-3xl" />
          <div className="absolute left-[1%] top-[17%] z-10 w-[38%] -rotate-6 opacity-75 sm:left-[5%]">
            <RaptorPhoneMockup
              alt={locale === "pt" ? "Calendário real do atleta no RaptorPro" : "Real athlete calendar in RaptorPro"}
              className="w-full"
              src={raptorAppScreens.calendar}
            />
          </div>
          <div className="absolute left-1/2 top-[1%] z-30 w-[42%] -translate-x-1/2">
            <RaptorPhoneMockup
              alt={locale === "pt" ? "Tela real de prontidão no RaptorPro" : "Real readiness screen in RaptorPro"}
              className="w-full"
              src={raptorAppScreens.readiness}
            />
          </div>
          <div className="absolute right-[1%] top-[17%] z-20 w-[38%] rotate-6 opacity-85 sm:right-[5%]">
            <RaptorPhoneMockup
              alt={locale === "pt" ? "Treino real dentro do RaptorPro" : "Real workout inside RaptorPro"}
              className="w-full"
              src={raptorAppScreens.workout}
            />
          </div>
          <div className="absolute bottom-[2%] left-1/2 z-40 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-black/75 px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-2xl backdrop-blur sm:text-xs">
            {page.badge}
          </div>
        </div>
      </div>
    </section>
  );
}
