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

  const normalizedPath = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

  const PUBLIC_ROUTES = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/privacy",
    "/terms",
    "/demo",
  ];
  const AUTH_ROUTES = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];

  const isPublicRoute = PUBLIC_ROUTES.includes(normalizedPath);
  const isAuthRoute = AUTH_ROUTES.includes(normalizedPath);

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
