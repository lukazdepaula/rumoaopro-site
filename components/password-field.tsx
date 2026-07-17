"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordFieldProps = {
  autoComplete: "current-password" | "new-password";
  hint?: string;
  label: string;
  minLength?: number;
  name: string;
  theme?: "dark" | "light";
};

export function PasswordField({
  autoComplete,
  hint,
  label,
  minLength,
  name,
  theme = "dark"
}: PasswordFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const dark = theme === "dark";

  return (
    <div className="grid gap-2">
      <label
        className={`text-sm font-semibold ${dark ? "text-white" : "text-ink"}`}
        htmlFor={id}
      >
        {label}
      </label>
      <span className="relative block">
        <input
          autoComplete={autoComplete}
          className={`min-h-12 w-full rounded-md border px-3 pr-12 text-sm text-ink ${
            dark ? "border-white/15 bg-white" : "border-ink/15 bg-white"
          }`}
          id={id}
          minLength={minLength}
          name={name}
          required
          type={visible ? "text" : "password"}
        />
        <button
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          className="focus-ring absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-graphite hover:bg-ink/5"
          onClick={() => setVisible((current) => !current)}
          title={visible ? "Ocultar senha" : "Mostrar senha"}
          type="button"
        >
          {visible ? (
            <EyeOff aria-hidden="true" size={19} />
          ) : (
            <Eye aria-hidden="true" size={19} />
          )}
        </button>
      </span>
      {hint ? (
        <span
          className={`text-xs font-medium ${dark ? "text-white/60" : "text-graphite/60"}`}
        >
          {hint}
        </span>
      ) : null}
    </div>
  );
}
