import crypto from "node:crypto";
import { requestClientIp } from "@/lib/checkout/request-security";

type RateBucket = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IDENTITY = 5;
const MAX_PER_IP = 30;
const MAX_TRACKED_BUCKETS = 2_000;

const globalBuckets = globalThis as typeof globalThis & {
  rapCustomerLoginRateBuckets?: Map<string, RateBucket>;
};

const buckets =
  globalBuckets.rapCustomerLoginRateBuckets || new Map<string, RateBucket>();

globalBuckets.rapCustomerLoginRateBuckets = buckets;

function hashKey(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function consumeBucket(key: string, limit: number, now: number) {
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000))
    };
  }

  current.count += 1;
  buckets.set(key, current);
  return { allowed: true, retryAfterSeconds: 0 };
}

function pruneExpiredBuckets(now: number) {
  if (buckets.size < MAX_TRACKED_BUCKETS) return;
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }

  while (buckets.size >= MAX_TRACKED_BUCKETS) {
    const oldestKey = buckets.keys().next().value;
    if (typeof oldestKey !== "string") break;
    buckets.delete(oldestKey);
  }
}

export function checkCustomerLoginRateLimit(request: Request, email: string) {
  const now = Date.now();
  pruneExpiredBuckets(now);

  const ip = requestClientIp(request);
  const identityResult = consumeBucket(
    `identity:${hashKey(`${ip}:${email.trim().toLowerCase()}`)}`,
    MAX_PER_IDENTITY,
    now
  );
  const ipResult = consumeBucket(`ip:${hashKey(ip)}`, MAX_PER_IP, now);

  if (identityResult.allowed && ipResult.allowed) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return {
    allowed: false,
    retryAfterSeconds: Math.max(
      identityResult.retryAfterSeconds,
      ipResult.retryAfterSeconds
    )
  };
}
