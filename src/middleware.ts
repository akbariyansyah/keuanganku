import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const enc = new TextEncoder();

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ allow login & register without auth
  if (pathname.startsWith("/api/auth/login") || pathname.startsWith("/api/auth/register")) {
    return NextResponse.next();
  }

  // 🔒 check cookie
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized - No token" }, { status: 401 });
  }

  try {
    // jose is Edge-safe; verifies HS256 tokens signed by jsonwebtoken
    const { payload } = await jwtVerify(token, enc.encode(process.env.JWT_SECRET!));
    // pass user to the route (attach to *request* headers)
    const reqHeaders = new Headers(req.headers);
    if (payload?.sub) reqHeaders.set("x-user-id", String(payload.sub));

    return NextResponse.next({ request: { headers: reqHeaders } });
  } catch (err) {
    console.error("JWT verification error:", err);
    return NextResponse.json({ error: "Unauthorized - Invalid/Expired token" }, { status: 401 });
  }
}

// Only apply to /api routes
export const config = {
  matcher: ["/api/:path*"],
};
