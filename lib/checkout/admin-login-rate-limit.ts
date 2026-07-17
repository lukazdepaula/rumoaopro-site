import crypto from "node:crypto";

type LoginAttempt = {
  failures: number;
  resetAt: number;
};

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_TRACKED_CLIENTS = 500;

const globalLoginAttempts = globalThis as typeof globalThis & {
  rapAdminLoginAttempts?: Map<string, LoginAttempt>;
};

const loginAttempts =
  globalLoginAttempts.rapAdminLoginAttempts || new Map<string, LoginAttempt>();

globalLoginAttempts.rapAdminLoginAttempts = loginAttempts;

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

function attemptKey(request: Request, email: string) {
  return crypto
    .createHash("sha256")
    .update(`${clientIp(request)}:${email.trim().toLowerCase()}`)
    .digest("hex");
}

function pruneExpiredAttempts(now: number) {
  if (loginAttempts.size < MAX_TRACKED_CLIENTS) return;

  for (const [key, attempt] of loginAttempts.entries()) {
    if (attempt.resetAt <= now) loginAttempts.delete(key);
  }
}

export function checkAdminLoginRateLimit(request: Request, email: string) {
  const now = Date.now();
  const key = attemptKey(request, email);
  const attempt = loginAttempts.get(key);

  if (!attempt || attempt.resetAt <= now) {
    if (attempt) loginAttempts.delete(key);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (attempt.failures < MAX_FAILURES) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return {
    allowed: false,
    retryAfterSeconds: Math.max(1, Math.ceil((attempt.resetAt - now) / 1000))
  };
}

export function recordAdminLoginFailure(request: Request, email: string) {
  const now = Date.now();
  pruneExpiredAttempts(now);

  const key = attemptKey(request, email);
  const attempt = loginAttempts.get(key);

  if (!attempt || attempt.resetAt <= now) {
    loginAttempts.set(key, { failures: 1, resetAt: now + WINDOW_MS });
    return;
  }

  attempt.failures += 1;
  loginAttempts.set(key, attempt);
}

export function clearAdminLoginFailures(request: Request, email: string) {
  loginAttempts.delete(attemptKey(request, email));
}
