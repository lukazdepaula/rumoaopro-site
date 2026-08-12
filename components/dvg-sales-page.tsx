import Image from "next/image";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  HeartPulse,
  PlayCircle,
  ShieldCheck,
  Smartphone,
  Target
} from "lucide-react";
import { ProgramPurchaseSummary } from "@/components/program-purchase-summary";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { assets, nav } from "@/lib/content";

type DvgSalesPageProps = {
  locale: "pt" | "en";
};

const copy = {
  pt: {
    nav: nav.pt,
    cta: "Comprar programa",
    languageHref: "/en/programs/de-volta-aos-gramados",
    eyebrow: "Pubalgia · Return to play · 7 fases",
    title: "Return to play especializado para atletas em recuperação da pubalgia.",
    lead:
      "Uma progressão de preparação física, organizada por Lukaz de Paula e Thiago Vegette, para atletas já avaliados e liberados que precisam reconstruir tolerância, força, corrida e confiança antes de voltar às demandas completas do futebol.",
    primary: "Comprar e acessar no app",
    secondary: "Entender as fases",
    chips: ["7 fases progressivas", "Academia + campo", "Vídeos no app", "Sem prazo fixo"],
    warningTitle: "Este programa é return to play. Não é fisioterapia.",
    warning:
      "O DVG não diagnostica nem trata a pubalgia e não substitui fisioterapia, atendimento médico ou acompanhamento individual. Ele organiza a preparação física pós-reabilitação e deve ser iniciado somente após avaliação e liberação do profissional que acompanha o seu caso.",
    pathEyebrow: "Progressão por critérios",
    pathTitle: "Você não avança pelo calendário. Avança quando o corpo está pronto.",
    pathBody:
      "As sete fases aumentam gradualmente a exigência: controle e tolerância, força, corrida, aceleração, mudança de direção e retorno às ações do futebol.",
    phases: [
      ["01", "Controle e tolerância", "Recuperar movimento e capacidade de treinar com sintomas controlados."],
      ["02", "Força de adutores e quadril", "Construir uma base que suporte as próximas exposições."],
      ["03", "Força integrada", "Conectar tronco, quadril e membros inferiores em ações mais completas."],
      ["04", "Retorno à corrida", "Reintroduzir corrida de forma progressiva e monitorada."],
      ["05", "Aceleração e desaceleração", "Aumentar velocidade e controle sem saltar etapas."],
      ["06", "Mudança de direção", "Preparar o corpo para ações multidirecionais do futebol."],
      ["07", "Retorno ao campo", "Integrar movimentos e demandas específicas antes da volta completa."]
    ],
    appEyebrow: "Do controle de carga ao retorno ao campo",
    appTitle: "Sete fases para reconstruir as demandas do futebol sem pular etapas.",
    appBody:
      "A progressão conecta academia e campo com critérios claros. Os exercícios, vídeos e registros de cada sessão ficam organizados dentro do RaptorPro, sem depender de PDFs durante o treino.",
    appPoints: [
      "Fases e sessões organizadas por objetivo",
      "Força, corrida e retorno progressivo ao campo",
      "Vídeos demonstrativos dentro da sessão",
      "Registro de readiness, RPE, duração e carga"
    ],
    videoEyebrow: "Antes de começar",
    videoTitle: "Entenda a lógica do programa com Lukaz de Paula.",
    includedEyebrow: "O que você recebe",
    includedTitle: "Estrutura para voltar com critério — sem pular direto para o jogo.",
    included: [
      ["Sete fases", "Uma sequência progressiva com objetivos e critérios claros."],
      ["Academia e campo", "Sessões de força, corrida e preparação para ações do futebol."],
      ["Vídeos demonstrativos", "Referências visuais para reduzir dúvidas durante a execução."],
      ["Registro no app", "Acompanhe sessões, respostas e evolução dentro do RaptorPro."],
      ["Sem prazo artificial", "Você progride conforme tolerância e orientação profissional."],
      ["Acesso pessoal", "O programa fica vinculado à conta criada após a compra."]
    ],
    teamEyebrow: "Desenvolvido por profissionais do futebol",
    teamTitle: "Experiência de campo aplicada ao retorno do atleta.",
    lukazRole: "Preparador físico e fundador da RumoAoPro",
    lukazBody:
      "Lukaz de Paula organiza a progressão física e transforma o conteúdo em uma experiência simples de executar dentro do RaptorPro.",
    vegetteRole: "Preparador físico da Ponte Preta",
    vegetteBody:
      "Thiago Vegette contribui com experiência prática na preparação física e no processo de retorno de atletas ao ambiente do futebol.",
    fitEyebrow: "Antes de comprar",
    fitTitle: "Esse programa faz sentido para você?",
    yesTitle: "Pode ser uma boa escolha se",
    noTitle: "Procure atendimento individual se",
    yes: [
      "Você já foi avaliado e está liberado para progredir",
      "Você precisa de uma estrutura entre academia e campo",
      "Você aceita avançar conforme critérios, não pela pressa"
    ],
    no: [
      "Você ainda não tem diagnóstico ou liberação",
      "A dor está aumentando ou altera seus movimentos",
      "Seu caso exige adaptação clínica individual"
    ],
    faqEyebrow: "Perguntas rápidas",
    faqTitle: "O que você precisa saber",
    faqs: [
      ["Existe prazo para terminar?", "Não. O DVG é organizado em fases. A progressão depende da sua resposta e da orientação do profissional que acompanha você."],
      ["Substitui fisioterapia?", "Não. O programa é uma ferramenta de treinamento e progressão após avaliação e liberação. Ele não realiza diagnóstico nem substitui tratamento."],
      ["Como recebo o acesso?", "Após a confirmação da compra, você recebe um e-mail para criar sua senha e abrir o programa no RaptorPro."],
      ["Consigo acessar no celular?", "Sim. Use a mesma conta no celular e no computador para acompanhar as fases e sessões."]
    ],
    finalTitle: "Volte a treinar com uma progressão clara.",
    finalBody: "Sete fases, academia e campo organizados dentro do RaptorPro.",
    finalCta: "Comprar De Volta aos Gramados"
  },
  en: {
    nav: nav.en,
    cta: "Buy program",
    languageHref: "/programas/de-volta-aos-gramados",
    eyebrow: "Pubalgia · Return to play · 7 phases",
    title: "A specialized return-to-play pathway for footballers recovering from pubalgia.",
    lead:
      "A physical preparation progression organized by Lukaz de Paula and Thiago Vegette for assessed and medically cleared athletes who need to rebuild tolerance, strength, running and confidence before returning to full football demands.",
    primary: "Buy and access in the app",
    secondary: "Explore the phases",
    chips: ["7 progressive phases", "Gym + pitch", "In-app videos", "No fixed deadline"],
    warningTitle: "This is a return-to-play program. It is not physiotherapy.",
    warning:
      "DVG does not diagnose or treat pubalgia and does not replace physiotherapy, medical care or individual clinical support. It structures post-rehabilitation physical preparation and must only begin after assessment and clearance by the professional managing your case.",
    pathEyebrow: "Criteria-based progression",
    pathTitle: "You do not progress because the calendar says so. You progress when your body is ready.",
    pathBody:
      "Seven phases gradually increase the demand: control and tolerance, strength, running, acceleration, change of direction and return to football actions.",
    phases: [
      ["01", "Control and tolerance", "Restore movement and the ability to train with controlled symptoms."],
      ["02", "Adductor and hip strength", "Build the base needed to tolerate the next exposures."],
      ["03", "Integrated strength", "Connect trunk, hip and lower-body strength in fuller actions."],
      ["04", "Return to running", "Reintroduce running through a progressive, monitored process."],
      ["05", "Acceleration and deceleration", "Increase speed and control without skipping steps."],
      ["06", "Change of direction", "Prepare for the multidirectional demands of football."],
      ["07", "Return to the pitch", "Integrate football-specific movement before a full return."]
    ],
    appEyebrow: "From load control back to the pitch",
    appTitle: "Seven phases that rebuild football demands without skipping steps.",
    appBody:
      "The progression connects gym and pitch through clear criteria. Exercises, videos and session tracking stay organized inside RaptorPro, without relying on PDFs during training.",
    appPoints: [
      "Phases and sessions organized by objective",
      "Strength, running and progressive return to the pitch",
      "Exercise demonstrations inside each session",
      "Readiness, RPE, duration and load tracking"
    ],
    videoEyebrow: "Before you begin",
    videoTitle: "Understand the program with Lukaz de Paula.",
    includedEyebrow: "What you get",
    includedTitle: "A criteria-led route back — without jumping straight into matches.",
    included: [
      ["Seven phases", "A progressive sequence with clear objectives and criteria."],
      ["Gym and pitch", "Strength, running and football return sessions."],
      ["Video demonstrations", "Visual references to make execution easier."],
      ["In-app tracking", "Follow sessions, responses and progress in RaptorPro."],
      ["No artificial deadline", "Progress according to tolerance and professional guidance."],
      ["Personal access", "The program is linked to the account created after purchase."]
    ],
    teamEyebrow: "Built by football professionals",
    teamTitle: "Real football experience applied to return-to-play training.",
    lukazRole: "Strength & conditioning coach and RumoAoPro founder",
    lukazBody:
      "Lukaz de Paula organizes the physical progression and turns it into a clear training experience inside RaptorPro.",
    vegetteRole: "Strength & conditioning coach at Ponte Preta",
    vegetteBody:
      "Thiago Vegette contributes practical experience in physical preparation and athletes' return to the football environment.",
    fitEyebrow: "Before you buy",
    fitTitle: "Is this program right for you?",
    yesTitle: "It may be a good fit if",
    noTitle: "Choose individual care if",
    yes: [
      "You have been assessed and cleared to progress",
      "You need structure between gym and pitch work",
      "You will progress by criteria rather than by rushing"
    ],
    no: [
      "You do not yet have a diagnosis or clearance",
      "Pain is increasing or changing how you move",
      "Your case requires individual clinical adjustments"
    ],
    faqEyebrow: "Quick questions",
    faqTitle: "What you need to know",
    faqs: [
      ["Is there a deadline?", "No. DVG is organized in phases. Progress depends on your response and the guidance of the professional managing your case."],
      ["Does it replace physiotherapy?", "No. This is a training progression tool after assessment and clearance. It does not diagnose or replace treatment."],
      ["How do I get access?", "After payment confirmation, you receive an email to create your password and open the program in RaptorPro."],
      ["Can I use it on mobile?", "Yes. Use the same account on mobile and desktop to follow phases and sessions."]
    ],
    finalTitle: "Return to training through a clear progression.",
    finalBody: "Seven phases, gym and pitch work organized inside RaptorPro.",
    finalCta: "Buy Back to the Pitch"
  }
} as const;

const checkoutHref = (locale: "pt" | "en") =>
  locale === "pt"
    ? "/checkout/de-volta-aos-gramados"
    : "/en/checkout/de-volta-aos-gramados";

export function DvgSalesPage({ locale }: DvgSalesPageProps) {
  const page = copy[locale];

  return (
    <main className="min-h-screen bg-[#07100e]">
      <SiteHeader
        navItems={page.nav}
        ctaHref={checkoutHref(locale)}
        ctaLabel={page.cta}
        languageHref={page.languageHref}
      />

      <section className="relative isolate overflow-hidden text-white">
        <Image
          alt="Lukaz de Paula and Thiago Vegette leading a football return-to-play program"
          className="absolute inset-0 -z-30 h-full w-full object-cover object-[54%_center]"
          fill
          priority
          sizes="100vw"
          src="/assets/programs/dvg/dvg-return-to-play-cover-v2.png"
        />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(3,10,8,.97)_0%,rgba(3,10,8,.88)_42%,rgba(3,10,8,.35)_70%,rgba(3,10,8,.12)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_36%,rgba(22,163,74,.25),transparent_30%),linear-gradient(0deg,rgba(3,10,8,.9),transparent_44%)]" />
        <div className="mx-auto grid min-h-[calc(86svh-var(--header-height))] max-w-7xl items-center px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex rounded-full border border-emerald-300/25 bg-emerald-400/10 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-emerald-300">
              {page.eyebrow}
            </p>
            <h1 className="mt-5 font-display text-4xl uppercase leading-[.98] sm:text-6xl lg:text-7xl">
              {page.title}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
              {page.lead}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {page.chips.map((chip) => (
                <span className="rounded-md border border-white/12 bg-black/30 px-3 py-2 text-xs font-bold text-white/78" key={chip}>{chip}</span>
              ))}
            </div>
            <ProgramPurchaseSummary locale={locale} />
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <a className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-500 px-6 text-sm font-black text-[#04100c] transition hover:bg-emerald-400" href={checkoutHref(locale)}>
                {page.primary}<ArrowRight className="h-4 w-4" />
              </a>
              <a className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-white/22 bg-black/25 px-6 text-sm font-bold text-white transition hover:bg-white/10" href="#fases">
                {page.secondary}
              </a>
            </div>
          </div>

        </div>
      </section>

      <section className="border-y border-amber-300/15 bg-amber-300/[.07] py-5 text-white">
        <div className="mx-auto flex max-w-7xl gap-3 px-4 sm:px-6 lg:px-8">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-amber-300" />
          <div><p className="text-sm font-black text-amber-200">{page.warningTitle}</p><p className="mt-1 max-w-5xl text-sm leading-6 text-white/72">{page.warning}</p></div>
        </div>
      </section>

      <section className="bg-[#07100e] py-16 text-white" id="fases">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase tracking-[.16em] text-emerald-400">{page.pathEyebrow}</p>
          <div className="mt-3 grid gap-5 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
            <h2 className="font-display text-3xl uppercase leading-tight sm:text-5xl">{page.pathTitle}</h2>
            <p className="text-base leading-8 text-white/65">{page.pathBody}</p>
          </div>
          <div className="mt-9 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {page.phases.map(([number, title, body], index) => (
              <article className={`rounded-2xl border p-5 ${index === 6 ? "border-emerald-300/35 bg-emerald-400/12 lg:col-span-2" : "border-white/10 bg-white/[.05]"}`} key={number}>
                <p className="font-display text-3xl text-emerald-400">{number}</p>
                <h3 className="mt-4 text-lg font-black text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0b1713] py-16 text-white">
        <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-emerald-500/12 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[.16em] text-emerald-400"><Smartphone className="mr-2 inline h-4 w-4" />{page.appEyebrow}</p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-5xl">{page.appTitle}</h2>
            <p className="mt-5 text-base leading-8 text-white/66">{page.appBody}</p>
            <ul className="mt-6 space-y-3">
              {page.appPoints.map((point) => <li className="flex gap-3 text-sm font-semibold text-white/76" key={point}><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />{point}</li>)}
            </ul>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-white/12 bg-black/35 shadow-2xl">
            <div className="relative aspect-[16/10]">
              <Image alt="Lukaz de Paula coaching a football athlete through physical preparation" className="object-cover object-[center_34%]" fill sizes="(min-width: 1024px) 58vw, 100vw" src={assets.coachGymInstruction} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06100d] via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
                {page.appPoints.map((point, index) => <div className="rounded-xl border border-white/12 bg-black/72 p-3 backdrop-blur" key={point}><p className="font-display text-2xl text-emerald-400">0{index + 1}</p><p className="mt-2 text-xs font-bold leading-5 text-white/82">{point}</p></div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#06100d] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[.72fr_1.28fr] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[.16em] text-emerald-400"><PlayCircle className="mr-2 inline h-4 w-4" />{page.videoEyebrow}</p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">{page.videoTitle}</h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/12 bg-black shadow-2xl">
            <iframe className="aspect-video w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen src="https://www.youtube-nocookie.com/embed/ttzRYsoSIlo" title="De Volta aos Gramados" />
          </div>
        </div>
      </section>

      <section className="bg-[#e9f2ee] py-16 text-[#07100e]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase tracking-[.16em] text-emerald-700"><BadgeCheck className="mr-2 inline h-4 w-4" />{page.includedEyebrow}</p>
          <h2 className="mt-3 max-w-4xl font-display text-3xl uppercase leading-tight sm:text-5xl">{page.includedTitle}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {page.included.map(([title, body], index) => {
              const icons = [Target, Activity, PlayCircle, ClipboardCheck, HeartPulse, Smartphone];
              const Icon = icons[index];
              return <article className="rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-sm" key={title}><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-white"><Icon className="h-5 w-5" /></div><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-[#315047]">{body}</p></article>;
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#07100e] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase tracking-[.16em] text-emerald-400">{page.teamEyebrow}</p>
          <h2 className="mt-3 max-w-4xl font-display text-3xl uppercase leading-tight sm:text-5xl">{page.teamTitle}</h2>
          <div className="mt-9 grid gap-5 lg:grid-cols-2">
            {[
              { name: "Lukaz de Paula", role: page.lukazRole, body: page.lukazBody, image: assets.coachGymInstruction, position: "object-[center_18%]" },
              { name: "Thiago Vegette", role: page.vegetteRole, body: page.vegetteBody, image: "/assets/programs/dvg/thiago-vegette.webp", position: "object-center" }
            ].map((person) => <article className="group relative min-h-[480px] overflow-hidden rounded-2xl border border-white/10" key={person.name}><Image alt={person.name} className={`absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105 ${person.position}`} fill sizes="(min-width: 1024px) 50vw, 100vw" src={person.image} /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6"><h3 className="font-display text-3xl uppercase">{person.name}</h3><p className="mt-1 text-sm font-black uppercase text-emerald-300">{person.role}</p><p className="mt-3 max-w-xl text-sm leading-6 text-white/72">{person.body}</p></div></article>)}
          </div>
        </div>
      </section>

      <section className="bg-[#0b1713] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[.72fr_1.28fr] lg:px-8">
          <div><p className="text-sm font-black uppercase tracking-[.16em] text-emerald-400">{page.fitEyebrow}</p><h2 className="mt-3 font-display text-3xl uppercase sm:text-5xl">{page.fitTitle}</h2></div>
          <div className="grid gap-4 md:grid-cols-2">
            {[[page.yesTitle, page.yes, true], [page.noTitle, page.no, false]] .map(([title, items, positive]) => <article className={`rounded-2xl border p-5 ${positive ? "border-emerald-400/25 bg-emerald-400/10" : "border-amber-300/20 bg-amber-300/[.06]"}`} key={String(title)}><h3 className={`text-lg font-black ${positive ? "text-emerald-300" : "text-amber-300"}`}>{String(title)}</h3><ul className="mt-4 space-y-3">{(items as readonly string[]).map(item => <li className="flex gap-3 text-sm leading-6 text-white/70" key={item}><CheckCircle2 className={`mt-1 h-4 w-4 shrink-0 ${positive ? "text-emerald-400" : "text-amber-300"}`} />{item}</li>)}</ul></article>)}
          </div>
        </div>
      </section>

      <section className="bg-[#06100d] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[.65fr_1.35fr] lg:px-8">
          <div><p className="text-sm font-black uppercase tracking-[.16em] text-emerald-400">{page.faqEyebrow}</p><h2 className="mt-3 font-display text-3xl uppercase sm:text-5xl">{page.faqTitle}</h2></div>
          <div className="grid gap-3">{page.faqs.map(([question, answer]) => <details className="rounded-xl border border-white/10 bg-white/[.05] p-5" key={question}><summary className="cursor-pointer list-none text-lg font-black">{question}</summary><p className="mt-3 text-sm leading-6 text-white/65">{answer}</p></details>)}</div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden py-16 text-white">
        <Image alt="Football training on the pitch" className="absolute inset-0 -z-20 h-full w-full object-cover object-[center_32%]" fill sizes="100vw" src={assets.coachFieldDrillWide} />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,10,8,.98),rgba(3,10,8,.78),rgba(5,110,69,.45))]" />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
          <div><p className="text-sm font-black uppercase tracking-[.16em] text-emerald-300">De Volta aos Gramados</p><h2 className="mt-3 font-display text-3xl uppercase sm:text-5xl">{page.finalTitle}</h2><p className="mt-4 text-base text-white/75">{page.finalBody}</p></div>
          <a className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-400 px-6 text-sm font-black text-[#04100c] transition hover:bg-emerald-300" href={checkoutHref(locale)}>{page.finalCta}<ArrowRight className="h-4 w-4" /></a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
