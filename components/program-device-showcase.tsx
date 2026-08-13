import { ProgramCoverArt } from "@/components/program-cover-art";
import {
  RaptorPhoneMockup,
  raptorAppScreens
} from "@/components/raptor-program-experience";

type ProgramDeviceShowcaseProps = {
  coverImage: string;
  coverAlt: string;
  coverTitle: string;
  coverEyebrow: string;
  coverMeta: string;
  coverPosition?: string;
  screenImage?: string;
  screenAlt: string;
  compact?: boolean;
  accent?: "red" | "blue" | "lime" | "orange" | "emerald";
  className?: string;
};

const accentGlow = {
  red: "from-red-500/30 via-red-500/10",
  blue: "from-blue-500/32 via-red-500/10",
  lime: "from-lime-300/28 via-emerald-500/10",
  orange: "from-orange-500/30 via-amber-400/10",
  emerald: "from-emerald-400/28 via-emerald-700/10"
} as const;

export function ProgramDeviceShowcase({
  coverImage,
  coverAlt,
  coverTitle,
  coverEyebrow,
  coverMeta,
  coverPosition = "object-center",
  screenImage = raptorAppScreens.calendar,
  screenAlt,
  compact = false,
  accent = "red",
  className = ""
}: ProgramDeviceShowcaseProps) {
  return (
    <div
      className={`relative isolate mx-auto w-full overflow-hidden ${
        compact ? "min-h-[300px] sm:min-h-[360px]" : "min-h-[470px] sm:min-h-[570px]"
      } ${className}`}
    >
      <div
        className={`absolute left-1/2 top-1/2 -z-10 h-[72%] w-[84%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${accentGlow[accent]} to-transparent blur-3xl`}
      />

      <div
        className={`absolute overflow-hidden rounded-[2rem] border-[6px] border-[#15171c] bg-black shadow-[0_32px_90px_rgba(0,0,0,0.55)] ring-1 ring-white/15 ${
          compact
            ? "left-[3%] top-[5%] w-[45%] -rotate-2"
            : "left-[1%] top-[2%] w-[46%] -rotate-2 sm:left-[3%] sm:w-[43%]"
        }`}
      >
        <span className="absolute left-1/2 top-1.5 z-20 h-3.5 w-[30%] -translate-x-1/2 rounded-full bg-[#08090b]" />
        <ProgramCoverArt
          accent={accent === "red" ? "blue" : accent}
          eyebrow={coverEyebrow}
          format="portrait"
          image={coverImage}
          imageAlt={coverAlt}
          imagePosition={coverPosition}
          meta={coverMeta}
          title={coverTitle}
        />
      </div>

      <div
        className={`absolute z-20 rotate-[4deg] ${
          compact
            ? "right-[1%] top-[10%] w-[52%]"
            : "right-0 top-[8%] w-[52%] sm:right-[1%] sm:w-[50%]"
        }`}
      >
        <RaptorPhoneMockup
          alt={screenAlt}
          className="relative w-full"
          src={screenImage}
        />
      </div>
    </div>
  );
}
