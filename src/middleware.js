import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// Simple in-memory rate limiter
const rateLimit = new Map();
const RATE_LIMIT = 100; // max request
const RATE_WINDOW = 60 * 1000; // per 1 menit

function isRateLimited(ip) {
  const now = Date.now();
  const record = rateLimit.get(ip);

  if (!record) {
    rateLimit.set(ip, { count: 1, start: now });
    return false;
  }

  if (now - record.start > RATE_WINDOW) {
    rateLimit.set(ip, { count: 1, start: now });
    return false;
  }

  if (record.count >= RATE_LIMIT) {
    return true;
  }

  record.count++;
  return false;
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Rate limiting untuk API routes
  if (pathname.startsWith("/api/")) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({ error: "Terlalu banyak request, coba lagi nanti." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // Auth check untuk admin routes
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isAdminRoute =
    pathname.startsWith("/monitoring") ||
    pathname.startsWith("/monitor") ||
    pathname.startsWith("/explorer") ||
    pathname.startsWith("/admin");

  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/monitoring/:path*",
    "/monitor/:path*",
    "/explorer/:path*",
    "/admin/:path*",
  ],
};