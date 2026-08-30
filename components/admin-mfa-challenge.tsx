"use client";

import {
  useRef,
  useState,
  type CSSProperties,
  type FormEvent
} from "react";

type AdminMfaError = "invalid" | "rate-limit" | "unavailable";
type ChallengeStatus = "idle" | "verifying" | "success";

type AdminMfaChallengeProps = {
  initialError?: AdminMfaError;
};

const errorMessages: Record<AdminMfaError, string> = {
  invalid: "Código inválido, expirado ou já utilizado.",
  "rate-limit":
    "Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.",
  unavailable: "Verificação temporariamente indisponível. Entre novamente."
};

const confetti = [
  { left: "9%", delay: "40ms", color: "#c8a24c", rotate: "18deg" },
  { left: "18%", delay: "180ms", color: "#77d5df", rotate: "-24deg" },
  { left: "29%", delay: "80ms", color: "#d5162a", rotate: "36deg" },
  { left: "39%", delay: "240ms", color: "#ffffff", rotate: "-12deg" },
  { left: "50%", delay: "120ms", color: "#c8a24c", rotate: "28deg" },
  { left: "61%", delay: "20ms", color: "#77d5df", rotate: "-32deg" },
  { left: "72%", delay: "210ms", color: "#d5162a", rotate: "16deg" },
  { left: "82%", delay: "100ms", color: "#ffffff", rotate: "-20deg" },
  { left: "91%", delay: "260ms", color: "#c8a24c", rotate: "34deg" }
];

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function normalizeInteractiveError(value: unknown): AdminMfaError {
  return value === "rate-limit" || value === "unavailable" ? value : "invalid";
}

export function AdminMfaChallenge({
  initialError
}: AdminMfaChallengeProps) {
  const [code, setCode] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [status, setStatus] = useState<ChallengeStatus>("idle");
  const [error, setError] = useState<AdminMfaError | undefined>(initialError);
  const [focused, setFocused] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);

  const digits = code.padEnd(6, " ").slice(0, 6).split("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status !== "idle") return;

    const submittedCode = code.trim();
    if ((!recoveryMode && !/^\d{6}$/.test(submittedCode)) || !submittedCode) {
      setError("invalid");
      codeInputRef.current?.focus();
      return;
    }

    setError(undefined);
    setStatus("verifying");
    const minimumAnimation = wait(900);

    try {
      const response = await fetch("/api/admin/mfa/verify", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "X-Admin-Mfa-Interactive": "1"
        },
        body: new URLSearchParams({ code: submittedCode }).toString()
      });
      const payload = (await response.json().catch(() => null)) as
        | {
            ok?: boolean;
            error?: unknown;
            redirectTo?: unknown;
          }
        | null;

      await minimumAnimation;

      if (
        response.ok &&
        payload?.ok === true &&
        typeof payload.redirectTo === "string" &&
        payload.redirectTo.startsWith("/admin") &&
        !payload.redirectTo.startsWith("//")
      ) {
        setStatus("success");
        await wait(1150);
        window.location.assign(payload.redirectTo);
        return;
      }

      if (
        response.status === 401 &&
        typeof payload?.redirectTo === "string" &&
        payload.redirectTo.startsWith("/admin") &&
        !payload.redirectTo.startsWith("//")
      ) {
        window.location.assign(payload.redirectTo);
        return;
      }

      setCode("");
      setError(normalizeInteractiveError(payload?.error));
      setStatus("idle");
      window.setTimeout(() => codeInputRef.current?.focus(), 0);
    } catch {
      await minimumAnimation;
      setError("unavailable");
      setStatus("idle");
    }
  }

  function changeMode() {
    setRecoveryMode((current) => !current);
    setCode("");
    setError(undefined);
    window.setTimeout(() => codeInputRef.current?.focus(), 0);
  }

  return (
    <section className="admin-mfa-card relative w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-white/[0.065] p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-8">
      <div aria-live="polite" className="sr-only" role="status">
        {status === "verifying"
          ? "Verificando código de segurança."
          : status === "success"
            ? "Acesso confirmado com sucesso."
            : error
              ? errorMessages[error]
              : ""}
      </div>

      {status === "idle" ? (
        <>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-gold">
            Segunda etapa
          </p>
          <h1 className="mt-3 font-display text-3xl uppercase">
            Confirme seu acesso
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/65">
            {recoveryMode
              ? "Digite um dos códigos de recuperação que você salvou ao ativar a segurança da conta."
              : "Digite o código de 6 dígitos do seu aplicativo autenticador."}
          </p>

          <form
            action="/api/admin/mfa/verify"
            className="mt-7 grid gap-5"
            method="post"
            onSubmit={handleSubmit}
          >
            {recoveryMode ? (
              <label className="grid gap-2 text-sm font-semibold">
                Código de recuperação
                <input
                  autoCapitalize="characters"
                  autoComplete="off"
                  autoFocus
                  className="focus-ring min-h-12 rounded-md border border-white/15 bg-white px-3 text-center font-mono text-base uppercase tracking-[0.14em] text-ink"
                  maxLength={14}
                  name="code"
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  ref={codeInputRef}
                  required
                  spellCheck={false}
                  value={code}
                />
              </label>
            ) : (
              <label className="grid gap-3 text-sm font-semibold">
                Código de segurança
                <span
                  className="relative grid grid-cols-6 gap-2"
                  onClick={() => codeInputRef.current?.focus()}
                >
                  {digits.map((digit, index) => {
                    const activeIndex = Math.min(code.length, 5);
                    const active = focused && index === activeIndex;
                    return (
                      <span
                        aria-hidden="true"
                        className={`admin-mfa-slot flex aspect-square items-center justify-center rounded-lg border bg-black/25 font-mono text-xl font-bold text-white sm:text-2xl ${
                          active
                            ? "admin-mfa-slot-active border-signal"
                            : digit.trim()
                              ? "border-white/30"
                              : "border-white/15"
                        }`}
                        key={index}
                      >
                        {digit.trim() ? digit : "·"}
                      </span>
                    );
                  })}
                  <input
                    aria-label="Código de segurança de 6 dígitos"
                    autoComplete="one-time-code"
                    autoFocus
                    className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
                    inputMode="numeric"
                    maxLength={6}
                    name="code"
                    onBlur={() => setFocused(false)}
                    onChange={(event) =>
                      setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    onFocus={() => setFocused(true)}
                    pattern="[0-9]{6}"
                    ref={codeInputRef}
                    required
                    value={code}
                  />
                </span>
              </label>
            )}

            {error ? (
              <p
                className="rounded-md border border-red-400/15 bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-100"
                role="alert"
              >
                {errorMessages[error]}
              </p>
            ) : null}

            <button
              className="focus-ring min-h-12 rounded-md bg-white px-5 text-sm font-bold uppercase text-ink transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!code.trim()}
              type="submit"
            >
              Verificar e entrar
            </button>

            <button
              className="focus-ring justify-self-center rounded-sm text-sm font-semibold text-white/65 underline decoration-white/25 underline-offset-4 transition hover:text-white"
              onClick={changeMode}
              type="button"
            >
              {recoveryMode
                ? "Usar aplicativo autenticador"
                : "Usar código de recuperação"}
            </button>
          </form>
        </>
      ) : (
        <div className="admin-mfa-stage flex min-h-[350px] flex-col items-center justify-center text-center">
          {status === "verifying" ? (
            <>
              <div className="admin-mfa-orbit relative mb-8 h-44 w-44" aria-hidden="true">
                <span className="admin-mfa-orbit-track absolute inset-4 rounded-full border border-dashed border-white/25" />
                <span className="absolute inset-[3.35rem] rounded-full border border-signal/35 bg-signal/10 shadow-[0_0_34px_rgba(213,22,42,0.22)]" />
                {digits.map((digit, index) => (
                  <span
                    className="admin-mfa-orbit-chip absolute left-1/2 top-1/2 flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-[#17191d] font-mono text-sm font-bold text-white shadow-lg"
                    key={index}
                    style={
                      {
                        "--mfa-angle": `${index * 60}deg`
                      } as CSSProperties
                    }
                  >
                    {digit}
                  </span>
                ))}
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-signal">
                Verificando
              </p>
              <h1 className="mt-3 font-display text-3xl uppercase">
                Validando seu acesso
              </h1>
              <p className="mt-3 max-w-xs text-sm leading-6 text-white/60">
                Só um instante. Estamos confirmando sua identidade com segurança.
              </p>
            </>
          ) : (
            <>
              <div className="relative mb-8 flex h-44 w-44 items-center justify-center" aria-hidden="true">
                <span className="admin-mfa-success-ring absolute inset-2 rounded-full border border-emerald-300/20" />
                <span className="admin-mfa-success-ring admin-mfa-success-ring-delay absolute inset-7 rounded-full border border-emerald-300/30" />
                <span className="admin-mfa-success-icon relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-400 text-ink shadow-[0_0_48px_rgba(52,211,153,0.38)]">
                  <svg
                    className="h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="m5 12.5 4.2 4.2L19.5 6.5"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.6"
                    />
                  </svg>
                </span>
                {confetti.map((piece, index) => (
                  <span
                    className="admin-mfa-confetti-piece absolute top-0 h-2.5 w-1 rounded-full"
                    key={index}
                    style={
                      {
                        left: piece.left,
                        backgroundColor: piece.color,
                        "--mfa-confetti-delay": piece.delay,
                        "--mfa-confetti-rotate": piece.rotate
                      } as CSSProperties
                    }
                  />
                ))}
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-300">
                Verificado com sucesso
              </p>
              <h1 className="mt-3 font-display text-3xl uppercase">
                Acesso confirmado
              </h1>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Tudo certo. Preparando seu painel administrativo.
              </p>
            </>
          )}
        </div>
      )}
    </section>
  );
}
