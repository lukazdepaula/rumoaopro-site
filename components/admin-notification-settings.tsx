"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BellOff,
  CheckCircle2,
  Download,
  Send,
  Share2,
  Smartphone
} from "lucide-react";

type DevicePlatform = "ios" | "android" | "desktop" | "unknown";
type NotificationStatus =
  | "checking"
  | "disabled"
  | "enabled"
  | "blocked"
  | "needs_install"
  | "unsupported"
  | "not_configured";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function detectPlatform(): DevicePlatform {
  const agent = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(agent)) return "ios";
  if (/android/.test(agent)) return "android";
  return "desktop";
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function vapidKeyBuffer(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) {
    bytes[index] = raw.charCodeAt(index);
  }
  return bytes.buffer;
}

function subscriptionKey(subscription: PushSubscription, key: PushEncryptionKeyName) {
  const value = subscription.getKey(key);
  if (!value) return "";
  const bytes = new Uint8Array(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window
    .btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function responseError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { error?: string }
    | null;
  return payload?.error || "Nao foi possivel concluir. Tente novamente.";
}

export function AdminNotificationSettings({
  adminEmail,
  publicKey
}: {
  adminEmail: string;
  publicKey: string;
}) {
  const [platform, setPlatform] = useState<DevicePlatform>("unknown");
  const [installed, setInstalled] = useState(false);
  const [status, setStatus] = useState<NotificationStatus>("checking");
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [busy, setBusy] = useState<"install" | "enable" | "disable" | "test" | null>(
    null
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const currentPlatform = detectPlatform();
    const currentInstalled = isStandalone();
    setPlatform(currentPlatform);
    setInstalled(currentInstalled);

    const onInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setMessage("Aplicativo instalado. Agora ative as notificacoes.");
    };
    window.addEventListener("beforeinstallprompt", onInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    async function inspectSubscription() {
      if (!publicKey) {
        setStatus("not_configured");
        return;
      }
      if (currentPlatform === "ios" && !currentInstalled) {
        setStatus("needs_install");
        return;
      }
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setStatus("blocked");
        return;
      }

      try {
        const registration = await navigator.serviceWorker.register("/admin-sw.js", {
          scope: "/admin"
        });
        const subscription = await registration.pushManager.getSubscription();
        setStatus(subscription ? "enabled" : "disabled");
      } catch {
        setStatus("unsupported");
      }
    }

    void inspectSubscription();
    return () => {
      window.removeEventListener("beforeinstallprompt", onInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [publicKey]);

  const statusCopy = useMemo(() => {
    switch (status) {
      case "enabled":
        return { label: "Ativas neste aparelho", tone: "bg-emerald-50 text-emerald-800" };
      case "blocked":
        return { label: "Bloqueadas no aparelho", tone: "bg-red-50 text-red-800" };
      case "needs_install":
        return { label: "Instale o app primeiro", tone: "bg-amber-50 text-amber-900" };
      case "unsupported":
        return { label: "Navegador sem suporte", tone: "bg-red-50 text-red-800" };
      case "not_configured":
        return { label: "Aguardando configuracao", tone: "bg-amber-50 text-amber-900" };
      case "checking":
        return { label: "Verificando aparelho...", tone: "bg-smoke text-graphite" };
      default:
        return { label: "Desativadas neste aparelho", tone: "bg-smoke text-graphite" };
    }
  }, [status]);

  async function installApp() {
    setMessage(null);
    if (!installPrompt) {
      setMessage(
        platform === "ios"
          ? "No Safari, toque em Compartilhar e depois em Adicionar a Tela de Inicio."
          : "No menu do Chrome, escolha Instalar app ou Adicionar a tela inicial."
      );
      return;
    }

    setBusy("install");
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    setMessage(
      choice.outcome === "accepted"
        ? "Instalacao iniciada. Abra o novo icone na tela inicial."
        : "Instalacao cancelada. Voce pode tentar novamente pelo menu do navegador."
    );
    setBusy(null);
  }

  async function enableNotifications() {
    setBusy("enable");
    setMessage(null);
    try {
      if (platform === "ios" && !isStandalone()) {
        setStatus("needs_install");
        throw new Error("Instale e abra o app pela Tela de Inicio antes de ativar.");
      }
      if (!publicKey) throw new Error("As chaves de notificacao ainda nao estao prontas.");
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("Este navegador nao oferece notificacoes para o app.");
      }

      const registration = await navigator.serviceWorker.register("/admin-sw.js", {
        scope: "/admin"
      });
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "blocked" : "disabled");
        throw new Error(
          permission === "denied"
            ? "A permissao foi bloqueada. Libere as notificacoes nos ajustes do aparelho."
            : "A permissao nao foi concedida."
        );
      }

      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKeyBuffer(publicKey)
        }));
      const p256dh = subscriptionKey(subscription, "p256dh");
      const auth = subscriptionKey(subscription, "auth");
      if (!p256dh || !auth) throw new Error("O aparelho nao retornou as chaves da assinatura.");

      const response = await fetch("/api/admin/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint, p256dh, auth, platform })
      });
      if (!response.ok) throw new Error(await responseError(response));

      setStatus("enabled");
      setInstalled(isStandalone());
      setMessage("Pronto. Este aparelho recebera as novas vendas aprovadas.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(null);
    }
  }

  async function disableNotifications() {
    setBusy("disable");
    setMessage(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const response = await fetch("/api/admin/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
        if (!response.ok) throw new Error(await responseError(response));
        await subscription.unsubscribe();
      }
      setStatus("disabled");
      setMessage("Notificacoes desativadas somente neste aparelho.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(null);
    }
  }

  async function testNotification() {
    setBusy("test");
    setMessage(null);
    try {
      const response = await fetch("/api/admin/push/test", { method: "POST" });
      if (!response.ok) throw new Error(await responseError(response));
      setMessage("Teste enviado. A notificacao deve aparecer em alguns segundos.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-xl border border-ink/10 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ink text-white">
            <Bell className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-xl uppercase text-ink">Alertas de venda</p>
            <p className="mt-1 text-sm leading-6 text-graphite/70">
              Cada administrador ativa o proprio celular. Nenhum dado do comprador aparece
              na tela bloqueada.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-y border-ink/10 py-4">
          <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusCopy.tone}`}>
            {statusCopy.label}
          </span>
          <span className="truncate text-xs font-semibold text-graphite/60">{adminEmail}</span>
        </div>

        {message ? (
          <p className="mt-4 rounded-lg bg-signal/10 px-4 py-3 text-sm font-semibold text-ink">
            {message}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {status === "enabled" ? (
            <>
              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-signal px-5 text-sm font-black uppercase text-white disabled:opacity-60"
                disabled={busy !== null}
                onClick={testNotification}
                type="button"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {busy === "test" ? "Enviando..." : "Enviar teste"}
              </button>
              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-ink/15 px-5 text-sm font-bold text-ink disabled:opacity-60"
                disabled={busy !== null}
                onClick={disableNotifications}
                type="button"
              >
                <BellOff className="h-4 w-4" aria-hidden="true" />
                {busy === "disable" ? "Desativando..." : "Desativar neste aparelho"}
              </button>
            </>
          ) : (
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-signal px-5 text-sm font-black uppercase text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={
                busy !== null ||
                status === "checking" ||
                status === "not_configured" ||
                status === "unsupported" ||
                status === "blocked"
              }
              onClick={enableNotifications}
              type="button"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              {busy === "enable" ? "Ativando..." : "Ativar notificacoes"}
            </button>
          )}
        </div>
      </section>

      <section className="rounded-xl bg-ink p-5 text-white sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-signal">
              Aplicativo no celular
            </p>
            <h2 className="mt-2 font-display text-2xl uppercase">
              {installed ? "App instalado" : "Instale o painel"}
            </h2>
          </div>
          {installed ? (
            <CheckCircle2 className="h-7 w-7 text-emerald-400" aria-hidden="true" />
          ) : (
            <Smartphone className="h-7 w-7 text-white/70" aria-hidden="true" />
          )}
        </div>

        <p className="mt-4 text-sm leading-6 text-white/70">
          {platform === "ios"
            ? "No iPhone, abra esta pagina no Safari, toque em Compartilhar e escolha Adicionar a Tela de Inicio. Depois abra pelo novo icone."
            : platform === "android"
              ? "No Android, use o botao abaixo. Se ele nao aparecer, abra o menu do Chrome e escolha Instalar app."
              : "Instale o painel para abri-lo como aplicativo e receber os alertas com mais facilidade."}
        </p>

        {!installed ? (
          <button
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-black uppercase text-ink disabled:opacity-60"
            disabled={busy !== null}
            onClick={installApp}
            type="button"
          >
            {platform === "ios" ? (
              <Share2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Download className="h-4 w-4" aria-hidden="true" />
            )}
            {busy === "install" ? "Abrindo..." : "Como instalar"}
          </button>
        ) : (
          <div className="mt-5 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85">
            Abra sempre pelo icone RumoAoPro Admin na tela inicial.
          </div>
        )}
      </section>
    </div>
  );
}
