// Shared by the browser and the public event endpoint. Never forward account,
// authentication or signed-download URLs to advertising providers.
export function publicEventPath(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 240 || !value.startsWith("/")) return null;
  if (/[\\?#\s\u0000-\u001f]/.test(value) || value.startsWith("//")) return null;
  let decoded: string;
  try { decoded = decodeURIComponent(value); } catch { return null; }
  if (decoded !== value || value.split("/").some(part => part === "." || part === "..")) return null;
  const path = value.replace(/^\/en(?=\/|$)/, "") || "/";
  if (/^\/(?:admin|api|login|my-programs|account|auth)(?:\/|$)/.test(path)) return null;
  if (/^\/checkout\/(?:success|cancelled)(?:\/|$)/.test(path)) return null;
  return value;
}
