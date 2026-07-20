import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Edge-compatible, app-wide rate limiter for generic abuse protection.
// This is intentionally coarse (applies to almost every request); sensitive
// mutating endpoints (e.g. /api/feedback, /api/users/ammo/*) additionally
// enforce their own tighter, route-specific limits close to the DB write.
const redis = Redis.fromEnv();
const globalRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "60 s"), // 60 requests / minute / IP
  analytics: true,
  prefix: "middleware-ratelimit",
});

// Explicit IP blocklist, configurable via env var so it can be updated
// without a code change or redeploy.
// e.g. BLOCKED_IP_PREFIXES="74.7.,1.2.3."
const BLOCKED_IP_PREFIXES = (process.env.BLOCKED_IP_PREFIXES ?? "")
  .split(",")
  .map((prefix) => prefix.trim())
  .filter(Boolean);

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  return response;
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // req.ip is populated by Vercel's edge network and can't be spoofed by the
  // client. Only fall back to the header when running somewhere else (e.g.
  // local dev, self-hosted), where it's inherently less trustworthy since a
  // client can set it to whatever it wants.
  const ip =
    req.ip ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  // Always allow Auth0 routes; they're meant to be reachable unauthenticated
  if (pathname.startsWith("/api/auth")) {
    return withSecurityHeaders(NextResponse.next());
  }

  // Explicit IP blocklist
  if (BLOCKED_IP_PREFIXES.some((prefix) => ip.startsWith(prefix))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // App-wide rate limit. Fail open if the limiter itself is unreachable
  // (e.g. Upstash outage or local DNS issue) — a broken rate limiter
  // shouldn't take the whole site down.
  try {
    const { success } = await globalRatelimit.limit(ip);
    if (!success) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  } catch (error) {
    console.error("Middleware rate limiter unavailable:", error);
  }

  // Restrict access to /debug in production
  if (pathname.startsWith("/debug") && process.env.NODE_ENV === "production") {
    return withSecurityHeaders(NextResponse.rewrite(new URL("/404", req.url)));
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|icons|images|logos).*)",
  ],
};
