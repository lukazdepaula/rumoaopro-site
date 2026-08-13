import Image from "next/image";

type ProgramCoverArtProps = {
  title: string;
  eyebrow: string;
  meta: string;
  image: string;
  imageAlt: string;
  imagePosition?: string;
  accent?: "blue" | "lime" | "orange" | "emerald";
  format?: "landscape" | "portrait";
  className?: string;
};

const accents = {
  blue: {
    glow: "bg-[#126eff]/55",
    line: "bg-[#4f8dff]",
    text: "text-[#7eb0ff]",
    wash: "from-[#126eff]/68 via-[#07152d]/24"
  },
  lime: {
    glow: "bg-lime-300/45",
    line: "bg-lime-300",
    text: "text-lime-300",
    wash: "from-lime-300/38 via-[#0c1c11]/28"
  },
  orange: {
    glow: "bg-orange-500/50",
    line: "bg-orange-400",
    text: "text-orange-300",
    wash: "from-orange-500/55 via-[#251006]/28"
  },
  emerald: {
    glow: "bg-emerald-400/45",
    line: "bg-emerald-400",
    text: "text-emerald-300",
    wash: "from-emerald-500/48 via-[#061b16]/28"
  }
} as const;

export function ProgramCoverArt({
  title,
  eyebrow,
  meta,
  image,
  imageAlt,
  imagePosition = "object-center",
  accent = "blue",
  format = "landscape",
  className = ""
}: ProgramCoverArtProps) {
  const palette = accents[accent];
  const isPortrait = format === "portrait";

  return (
    <div
      className={`relative isolate overflow-hidden bg-[#07090d] text-white ${
        isPortrait ? "aspect-[390/844]" : "h-full min-h-[300px]"
      } ${className}`}
    >
      <Image
        alt={imageAlt}
        className={`absolute inset-0 -z-30 h-full w-full object-cover ${imagePosition}`}
        fill
        sizes={
          isPortrait
            ? "(max-width: 767px) 48vw, 300px"
            : "(max-width: 767px) 100vw, 680px"
        }
        src={image}
      />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(4,6,10,0.16)_0%,rgba(4,6,10,0.05)_34%,rgba(4,6,10,0.92)_100%)]" />
      <div
        className={`absolute inset-0 -z-20 bg-gradient-to-br ${palette.wash} to-transparent mix-blend-screen`}
      />
      <div
        className={`absolute -right-[18%] top-[9%] -z-10 h-[44%] w-[68%] rounded-full ${palette.glow} blur-[70px]`}
      />
      <div className="absolute inset-0 -z-10 opacity-[0.11] [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:38px_38px]" />

      <div
        className={`absolute inset-x-0 top-0 flex items-center justify-between ${
          isPortrait ? "px-[7%] pt-[9%]" : "px-5 pt-5 sm:px-7 sm:pt-7"
        }`}
      >
        <p
          className={`font-black uppercase tracking-[0.18em] ${
            isPortrait ? "text-[7px] sm:text-[9px]" : "text-[9px] sm:text-[10px]"
          }`}
        >
          RumoAoPro
        </p>
        <p
          className={`${palette.text} font-black uppercase tracking-[0.16em] ${
            isPortrait ? "text-[6px] sm:text-[8px]" : "text-[8px] sm:text-[9px]"
          }`}
        >
          No RaptorPro
        </p>
      </div>

      <div
        className={`absolute inset-x-0 bottom-0 ${
          isPortrait ? "px-[7%] pb-[9%]" : "px-5 pb-5 sm:px-7 sm:pb-7"
        }`}
      >
        <div className={`mb-3 h-1 w-12 ${palette.line}`} />
        <p
          className={`${palette.text} font-black uppercase tracking-[0.18em] ${
            isPortrait ? "text-[7px] sm:text-[9px]" : "text-[9px] sm:text-[10px]"
          }`}
        >
          {eyebrow}
        </p>
        <h3
          className={`mt-2 max-w-[95%] font-display uppercase leading-[0.88] tracking-[-0.02em] text-white [text-wrap:balance] ${
            isPortrait
              ? "text-[clamp(1.4rem,5vw,3rem)]"
              : "text-[clamp(2.1rem,6vw,4.8rem)]"
          }`}
        >
          {title}
        </h3>
        <p
          className={`mt-3 font-bold uppercase tracking-[0.12em] text-white/62 ${
            isPortrait ? "text-[6px] sm:text-[8px]" : "text-[8px] sm:text-[10px]"
          }`}
        >
          {meta}
        </p>
      </div>
    </div>
  );
}
