import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

type CtaButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "dark";
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
};

export function CtaButton({
  href,
  children,
  variant = "primary",
  icon: Icon
}: CtaButtonProps) {
  const classes = {
    primary:
      "bg-signal text-white hover:bg-[#b90f20] focus-ring shadow-clean",
    secondary:
      "border border-white/30 bg-white/10 text-white hover:bg-white/20 focus-ring",
    dark: "bg-ink text-white hover:bg-graphite focus-ring"
  };

  return (
    <Link
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-bold transition ${classes[variant]}`}
      href={href}
    >
      {Icon ? <Icon aria-hidden="true" className="h-4 w-4" /> : null}
      <span>{children}</span>
    </Link>
  );
}
