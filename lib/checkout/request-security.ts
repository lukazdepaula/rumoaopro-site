export function isSameSiteRequest(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return false;

  const origin = request.headers.get("origin");
  const source =
    origin && origin.toLowerCase() !== "null"
      ? origin
      : request.headers.get("referer");
  if (!source) {
    return (
      process.env.NODE_ENV !== "production" ||
      fetchSite === "same-origin" ||
      fetchSite === "same-site"
    );
  }

  try {
    const sourceUrl = new URL(source);
    const requestUrl = new URL(request.url);
    const canonicalHostname = (hostname: string) =>
      hostname.toLowerCase().replace(/^www\./, "");
    const loopbackHosts = new Set(["localhost", "127.0.0.1", "::1"]);
    const sameDevelopmentLoopback =
      process.env.NODE_ENV !== "production" &&
      loopbackHosts.has(sourceUrl.hostname) &&
      loopbackHosts.has(requestUrl.hostname);

    return (
      sourceUrl.protocol === requestUrl.protocol &&
      (canonicalHostname(sourceUrl.hostname) ===
        canonicalHostname(requestUrl.hostname) ||
        sameDevelopmentLoopback) &&
      sourceUrl.port === requestUrl.port
    );
  } catch {
    return false;
  }
}

export function requestClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}
