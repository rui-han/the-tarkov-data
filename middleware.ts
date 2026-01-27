import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const ip = req.ip || req.headers.get("x-forwarded-for");

  //  Block specific IP range
  if (ip?.startsWith("74.7.")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Always allow Auth0 routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Block obvious bots
  const ua = req.headers.get("user-agent")?.toLowerCase() || "";
  if (ua.includes("curl") || ua.includes("python") || ua.includes("wget")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Restrict access to /debug in production
  if (pathname.startsWith("/debug")) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.rewrite(new URL("/404", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|icons|images|logos).*)",
  ],
};
