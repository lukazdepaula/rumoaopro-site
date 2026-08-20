import crypto from "node:crypto";

type LoginAttempt = {
  failures: number;
  resetAt: number;
};

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_TRACKED_CLIENTS = 500;
const MAX_RESET_REQUESTS = 3;
const RESET_WINDOW_MS = 60 * 60 * 1000;

const globalLoginAttempts = globalThis as typeof globalThis & {
  rapAdminLoginAttempts?: Map<string, LoginAttempt>;
  rapAdminResetAttempts?: Map<string, LoginAttempt>;
  rapAdminMfaAttempts?: Map<string, LoginAttempt>;
};

const loginAttempts =
  globalLoginAttempts.rapAdminLoginAttempts || new Map<string, LoginAttempt>();

globalLoginAttempts.rapAdminLoginAttempts = loginAttempts;

const resetAttempts =
  globalLoginAttempts.rapAdminResetAttempts || new Map<string, LoginAttempt>();

globalLoginAttempts.rapAdminResetAttempts = resetAttempts;

const mfaAttempts =
  globalLoginAttempts.rapAdminMfaAttempts || new Map<string, LoginAttempt>();

globalLoginAttempts.rapAdminMfaAttempts = mfaAttempts;

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

function pruneExpiredAttempts(
  attempts: Map<string, LoginAttempt>,
  now: number
) {
  if (attempts.size < MAX_TRACKED_CLIENTS) return;

  for (const [key, attempt] of attempts.entries()) {
    if (attempt.resetAt <= now) attempts.delete(key);
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
  pruneExpiredAttempts(loginAttempts, now);

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

export function checkAdminResetRateLimit(request: Request, email: string) {
  const now = Date.now();
  const key = attemptKey(request, email);
  const attempt = resetAttempts.get(key);

  if (!attempt || attempt.resetAt <= now) {
    if (attempt) resetAttempts.delete(key);
    return true;
  }

  return attempt.failures < MAX_RESET_REQUESTS;
}

export function recordAdminResetRequest(request: Request, email: string) {
  const now = Date.now();
  pruneExpiredAttempts(resetAttempts, now);
  const key = attemptKey(request, email);
  const attempt = resetAttempts.get(key);

  if (!attempt || attempt.resetAt <= now) {
    resetAttempts.set(key, {
      failures: 1,
      resetAt: now + RESET_WINDOW_MS
    });
    return;
  }

  attempt.failures += 1;
  resetAttempts.set(key, attempt);
}

export function checkAdminMfaRateLimit(request: Request, email: string) {
  const now = Date.now();
  const key = attemptKey(request, email);
  const attempt = mfaAttempts.get(key);

  if (!attempt || attempt.resetAt <= now) {
    if (attempt) mfaAttempts.delete(key);
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

export function recordAdminMfaFailure(request: Request, email: string) {
  const now = Date.now();
  pruneExpiredAttempts(mfaAttempts, now);
  const key = attemptKey(request, email);
  const attempt = mfaAttempts.get(key);

  if (!attempt || attempt.resetAt <= now) {
    mfaAttempts.set(key, { failures: 1, resetAt: now + WINDOW_MS });
    return;
  }

  attempt.failures += 1;
  mfaAttempts.set(key, attempt);
}

export function clearAdminMfaFailures(request: Request, email: string) {
  mfaAttempts.delete(attemptKey(request, email));
}
