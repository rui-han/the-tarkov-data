import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter } from "@/ratelimit";

// Edge-compatible, app-wide rate limiter for generic abuse protection.
// This is intentionally coarse (applies to almost every request); sensitive
// mutating endpoints (e.g. /api/feedback, /api/users/ammo/*) additionally
// enforce their own tighter, route-specific limits close to the DB write.
// Falls back to in-memory limiting without Upstash env vars, and fails open
// if Redis is unreachable.
const globalRatelimit = createRateLimiter({
  max: 120, // 120 requests / minute / IP (shared NATs and navigation add up)
  window: "60 s",
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

// <Link> prefetches fire in bursts as links scroll into view; they are not
// user-initiated traffic, so they shouldn't eat into the budget.
function isPrefetch(req: NextRequest) {
  return (
    req.headers.has("next-router-prefetch") ||
    req.headers.get("purpose") === "prefetch"
  );
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

  // App-wide rate limit (prefetches are not counted). The limiter itself
  // fails open on Redis errors, so a broken Upstash can't take the site down.
  if (!isPrefetch(req)) {
    const { success } = await globalRatelimit.limit(ip);
    if (!success) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
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
