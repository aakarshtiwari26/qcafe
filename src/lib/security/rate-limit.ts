import { env } from "@/config/env";

const hits = new Map<string, { count: number; resetAt: number }>();

setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  },
  5 * 60 * 1000
).unref?.();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  identifier: string,
  { windowMs = env.RATE_LIMIT_WINDOW_MS, max = env.RATE_LIMIT_MAX_REQUESTS } = {}
): RateLimitResult {
  const now = Date.now();
  const existing = hits.get(identifier);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    hits.set(identifier, { count: 1, resetAt });
    return { success: true, remaining: max - 1, resetAt };
  }

  if (existing.count >= max) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { success: true, remaining: max - existing.count, resetAt: existing.resetAt };
}

export const RATE_LIMIT_PRESETS = {
  LOGIN: { windowMs: 15 * 60 * 1000, max: 10 },
  REGISTER: { windowMs: 60 * 60 * 1000, max: 5 },
  OTP_REQUEST: { windowMs: 60 * 1000, max: 1 },
  OTP_VERIFY: { windowMs: 15 * 60 * 1000, max: 5 },
  PASSWORD_RESET: { windowMs: 60 * 60 * 1000, max: 5 },
} as const;

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
