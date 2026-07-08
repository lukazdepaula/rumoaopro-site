"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

type LoginResponse = {
  ok?: boolean;
  magicLink?: string;
  error?: string;
};

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [magicLink, setMagicLink] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setMagicLink("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/request-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, name })
      });
      const payload = (await response.json()) as LoginResponse;

      if (!response.ok) {
        setError(payload.error || "Não foi possível criar o link de acesso.");
        return;
      }

      setMessage("Enviamos um link de acesso para o seu e-mail.");
      if (payload.magicLink) {
        setMagicLink(payload.magicLink);
      }
    } catch {
      setError("Erro de conexão ao solicitar login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={submit}>
      <label className="grid gap-2 text-sm font-semibold text-ink">
        Nome
        <input
          className="min-h-12 rounded-md border border-ink/15 px-3 text-sm text-ink"
          onChange={(event) => setName(event.target.value)}
          type="text"
          value={name}
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-ink">
        E-mail da compra
        <input
          className="min-h-12 rounded-md border border-ink/15 px-3 text-sm text-ink"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>
      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <div className="rounded-md bg-turf/10 px-3 py-2 text-sm font-semibold text-ink">
          <p>{message}</p>
          {magicLink ? (
            <a className="mt-2 inline-flex text-signal underline" href={magicLink}>
              Abrir link de teste
            </a>
          ) : null}
        </div>
      ) : null}
      <button
        className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-signal px-5 text-sm font-bold uppercase text-white transition hover:bg-[#b90f20] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        {loading ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
        Receber link de acesso
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </button>
    </form>
  );
}
