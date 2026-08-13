import Image from "next/image";
import {
  RaptorPhoneMockup,
  raptorAppScreens
} from "@/components/raptor-program-experience";

type ProgramDeviceShowcaseProps = {
  coverImage: string;
  coverAlt: string;
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
        className={`absolute overflow-hidden rounded-[1.6rem] border border-white/20 bg-black shadow-[0_32px_90px_rgba(0,0,0,0.55)] ${
          compact
            ? "left-[6%] top-[9%] h-[82%] w-[54%] -rotate-3"
            : "left-[3%] top-[8%] h-[82%] w-[57%] -rotate-3 sm:left-[7%] sm:w-[52%]"
        }`}
      >
        <Image
          alt={coverAlt}
          className={`h-full w-full object-cover ${coverPosition}`}
          fill
          sizes={compact ? "(max-width: 767px) 58vw, 330px" : "(max-width: 1023px) 58vw, 360px"}
          src={coverImage}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),transparent_58%,rgba(0,0,0,0.38))]" />
      </div>

      <div
        className={`absolute z-20 rotate-[4deg] ${
          compact
            ? "right-[5%] top-[17%] w-[43%]"
            : "right-[2%] top-[16%] w-[43%] sm:right-[6%] sm:w-[40%]"
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
