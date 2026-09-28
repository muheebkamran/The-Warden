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

  const isAuthRoute = pathname === "/login" || pathname === "/register";

  const sessionCookie = req.cookies.get("session")?.value;
  let session = null;

  if (sessionCookie) {
    session = await verifyToken(sessionCookie);
  }

  if (!session && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
