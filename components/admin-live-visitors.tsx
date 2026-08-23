"use client";

import { useEffect, useState } from "react";
import { Activity, Eye } from "lucide-react";

export type AdminLiveData = {
  activeVisitors: number;
  pages: Array<{ path: string; count: number }>;
  updatedAt: string;
};

const pageLabels: Record<string, string> = {
  "/": "Página inicial",
  "/assessoria": "Assessoria Online",
  "/cursos": "Cursos",
  "/links": "Links",
  "/programas": "Programas",
  "/en": "Home em inglês",
  "/en/programs": "Programas em inglês"
};

function pageLabel(path: string) {
  if (pageLabels[path]) return pageLabels[path];
  if (path.startsWith("/checkout/")) return `Checkout · ${path.split("/").at(-1)}`;
  if (path.startsWith("/programas/")) return `Programa · ${path.split("/").at(-1)}`;
  if (path.startsWith("/en/programs/")) return `Program · ${path.split("/").at(-1)}`;
  if (path.startsWith("/minha-conta")) return "Área do cliente";
  return path;
}

export function AdminLiveVisitors({ initialData }: { initialData: AdminLiveData }) {
  const [data, setData] = useState(initialData);
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    let disposed = false;

    async function refresh() {
      try {
        const response = await fetch("/api/admin/live", { cache: "no-store" });
        if (!response.ok) throw new Error("Live data unavailable");
        const payload = (await response.json()) as AdminLiveData;
        if (!disposed) {
          setData(payload);
          setConnected(true);
        }
      } catch {
        if (!disposed) setConnected(false);
      }
    }

    const interval = window.setInterval(refresh, 15000);
    return () => {
      disposed = true;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <article className="flex min-h-[250px] flex-col overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {connected ? <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" /> : null}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${connected ? "bg-emerald-500" : "bg-amber-500"}`} />
          </span>
          <h2 className="text-sm font-bold text-ink">Ao vivo</h2>
        </div>
        <Activity className="h-4 w-4 text-graphite/45" />
      </div>

      <div className="px-5 py-5" aria-live="polite">
        <p className="text-5xl font-black tracking-tight text-ink">{data.activeVisitors}</p>
        <p className="mt-1 text-sm font-semibold text-graphite/60">
          visitante{data.activeVisitors === 1 ? "" : "s"} ativo{data.activeVisitors === 1 ? "" : "s"} agora
        </p>
      </div>

      <div className="mt-auto border-t border-ink/10 bg-[#fafafa] px-5 py-4">
        {data.pages.length > 0 ? (
          <div className="grid gap-2.5">
            {data.pages.slice(0, 3).map((page) => (
              <div className="flex min-w-0 items-center justify-between gap-3 text-xs" key={page.path}>
                <span className="flex min-w-0 items-center gap-2 font-semibold text-graphite/70">
                  <Eye className="h-3.5 w-3.5 shrink-0 text-graphite/40" />
                  <span className="truncate" title={page.path}>{pageLabel(page.path)}</span>
                </span>
                <span className="font-black text-ink">{page.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs leading-relaxed text-graphite/55">As páginas abertas nos últimos dois minutos aparecerão aqui.</p>
        )}
      </div>
    </article>
  );
}
