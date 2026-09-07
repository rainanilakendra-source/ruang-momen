import { createHash } from "node:crypto";

type RateLimitEntry = { count: number; resetAt: number };
type RateLimitStore = Map<string, RateLimitEntry>;

const globalForRateLimit = globalThis as unknown as { rateLimitStore?: RateLimitStore };
const store = globalForRateLimit.rateLimitStore ?? new Map<string, RateLimitEntry>();
if (process.env.NODE_ENV !== "production") globalForRateLimit.rateLimitStore = store;

const MAX_ENTRIES = 10_000;

function cleanup(now: number): void {
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
  while (store.size >= MAX_ENTRIES) {
    const oldestKey = store.keys().next().value;
    if (typeof oldestKey !== "string") break;
    store.delete(oldestKey);
  }
}

export function requestRateLimitKey(scope: string, requestHeaders: Headers, discriminator = ""): string {
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",", 1)[0]?.trim();
  const address = forwarded || requestHeaders.get("cf-connecting-ip") || requestHeaders.get("x-real-ip") || "local";
  const userAgent = requestHeaders.get("user-agent")?.slice(0, 256) ?? "unknown";
  return createHash("sha256").update(`${scope}\0${address.slice(0, 128)}\0${userAgent}\0${discriminator.slice(0, 254)}`).digest("base64url");
}

export function consumeRateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  let entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    if (store.size >= MAX_ENTRIES) cleanup(now);
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }
  entry.count += 1;
  return { allowed: entry.count <= limit, retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
}
