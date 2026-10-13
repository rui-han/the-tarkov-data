import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// This module is imported from both the Edge middleware and Node route
// handlers, so it must not use any Node-only APIs.

export interface Limiter {
  limit(key: string): Promise<{ success: boolean }>;
}

export interface LimiterOptions {
  /** max requests allowed per window */
  max: number;
  /** window size, e.g. "10 s" */
  window: `${number} s`;
  /** Redis key prefix, keeps different limiters from sharing counters */
  prefix: string;
}

const hasUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

// Fixed-window in-memory limiter. Only a fallback for local dev: on serverless
// each instance keeps its own counters, so it is NOT a real production limiter.
function createMemoryLimiter({ max, window }: LimiterOptions): Limiter {
  const windowMs = Number(window.split(" ")[0]) * 1000;
  const hits = new Map<string, { count: number; resetAt: number }>();

  return {
    async limit(key) {
      const now = Date.now();

      // cheap lazy cleanup so the map can't grow forever
      if (hits.size > 5000) {
        for (const [k, v] of hits) {
          if (v.resetAt <= now) hits.delete(k);
        }
      }

      const entry = hits.get(key);
      if (!entry || entry.resetAt <= now) {
        hits.set(key, { count: 1, resetAt: now + windowMs });
        return { success: true };
      }

      entry.count += 1;
      return { success: entry.count <= max };
    },
  };
}

function createUpstashLimiter({
  max,
  window,
  prefix,
}: LimiterOptions): Limiter {
  const limiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(max, window),
    prefix,
  });

  return {
    async limit(key) {
      try {
        return await limiter.limit(key);
      } catch (error) {
        // Redis outage / deleted database: a broken limiter must not take
        // login, favorites and feedback down with it, so fail open.
        console.error(
          `Rate limiter "${prefix}" unavailable, failing open:`,
          error,
        );
        return { success: true };
      }
    },
  };
}

export function createRateLimiter(options: LimiterOptions): Limiter {
  if (!hasUpstash) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "UPSTASH_REDIS_REST_URL / TOKEN are not set; using in-memory rate limiting, which is ineffective on serverless.",
      );
    }
    return createMemoryLimiter(options);
  }
  return createUpstashLimiter(options);
}

// Route-level limiter used by the API routes and the Auth0 callback
export const ratelimit = createRateLimiter({
  max: 10,
  window: "10 s",
  prefix: "@upstash/ratelimit",
});
