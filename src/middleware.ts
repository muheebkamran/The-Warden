import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = pathname === "/" || pathname === "/login" || pathname === "/register";
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  const sessionCookie = req.cookies.get("session")?.value;
  let session = null;

  if (sessionCookie) {
    session = await verifyToken(sessionCookie);
  }

  // If authenticated and visiting landing page or auth routes, redirect to dashboard
  if (session && (pathname === "/" || isAuthRoute)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If unauthenticated and visiting a protected route, redirect to login
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
