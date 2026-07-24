import "server-only";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Naive in-memory fixed-window rate limiter, keyed by caller-supplied string
 * (typically `${routeName}:${ip}`). This is a best-effort baseline only —
 * state resets per serverless instance on platforms like Vercel, so it does
 * not enforce a real ceiling across multiple concurrent instances. Swap for
 * a shared store (e.g. Upstash Redis) before relying on this at production
 * scale.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Best-effort client IP from standard proxy headers — falls back to a shared bucket if none are present. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
