// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const enc = new TextEncoder();

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // allow auth endpoints
  if (pathname.startsWith("/api/auth/")) return NextResponse.next();

  const token = req.cookies.get("token")?.value;

  // Helper: detect API vs Page
  const isApi =
    pathname.startsWith("/api") ||
    req.headers.get("accept")?.includes("application/json");

  if (!token) {
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("next", pathname); // optional: remember where to return
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(token, enc.encode(process.env.JWT_SECRET!));
    const reqHeaders = new Headers(req.headers);
    if (payload?.sub) reqHeaders.set("x-user-id", String(payload.sub));
    return NextResponse.next({ request: { headers: reqHeaders } });
  } catch {
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
}

// Protect both API and your protected pages (adjust as needed)
export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/settings/:path*"],
};
