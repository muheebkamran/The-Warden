import { NextResponse } from "next/server";
import { handleGoogleUser } from "@/app/actions";
import { createSession, signToken } from "@/lib/auth";
import { sendLoginWelcomeEmail, sendAdminCustomerRosterNotification } from "@/lib/email";

export function getAppUrl(req: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = forwardedHost || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  if (host) {
    return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}

function getCookieFromRequest(req: Request, cookieName: string): string | null {
  if ("cookies" in req && typeof (req as { cookies?: { get: (k: string) => { value?: string } | undefined } }).cookies?.get === "function") {
    const val = (req as { cookies: { get: (k: string) => { value?: string } | undefined } }).cookies.get(cookieName)?.value;
    if (val) return val;
  }
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function processGoogleCallback(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const clearStateCookie = (res: NextResponse) => {
    res.cookies.set("oauth_state", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  };

  if (error || !code) {
    const res = NextResponse.redirect(
      new URL("/login?error=" + encodeURIComponent("Google sign-in was cancelled or encountered an error."), req.url)
    );
    clearStateCookie(res);
    return res;
  }

  // Cryptographic CSRF state validation against HTTP-only cookie
  const cookieState = getCookieFromRequest(req, "oauth_state");
  if (!state || !cookieState || state !== cookieState) {
    const res = NextResponse.redirect(
      new URL(
        "/login?error=" +
          encodeURIComponent("Authentication state mismatch or session expired. Please sign in again."),
        req.url
      )
    );
    clearStateCookie(res);
    return res;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET;

  if (!clientId || !clientSecret) {
    const res = NextResponse.redirect(
      new URL("/login?error=" + encodeURIComponent("Google OAuth credentials missing on server."), req.url)
    );
    clearStateCookie(res);
    return res;
  }

  const appUrl = getAppUrl(req);
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${appUrl}${url.pathname}`;

  try {
    // 1. Exchange code for access & ID tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error("Google token exchange error:", errBody);
      const res = NextResponse.redirect(
        new URL("/login?error=" + encodeURIComponent("Failed to exchange authentication code with Google."), req.url)
      );
      clearStateCookie(res);
      return res;
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch user profile from Google UserInfo endpoint
    const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userinfoRes.ok) {
      const res = NextResponse.redirect(
        new URL("/login?error=" + encodeURIComponent("Failed to fetch profile details from Google."), req.url)
      );
      clearStateCookie(res);
      return res;
    }

    const profile = await userinfoRes.json();

    if (!profile.email) {
      const res = NextResponse.redirect(
        new URL("/login?error=" + encodeURIComponent("Google did not provide an email address."), req.url)
      );
      clearStateCookie(res);
      return res;
    }

    // 3. Find or create user in Neon DB
    const user = await handleGoogleUser({
      googleId: profile.sub,
      email: profile.email,
      name: profile.name || null,
      avatarUrl: profile.picture || null,
    });

    // 4. Create session and redirect to dashboard
    await createSession(user.id);
    const token = await signToken({ userId: user.id });

    // Dual-dispatch: Sovereign welcome email to customer + Live customer roster alert to admin
    await Promise.allSettled([
      sendLoginWelcomeEmail(user.email, user.name),
      sendAdminCustomerRosterNotification({
        userEmail: user.email,
        userName: user.name,
        authMethod: "google",
      }),
    ]);

    const response = NextResponse.redirect(new URL("/dashboard", req.url));
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Invalidate state cookie immediately post-authentication
    clearStateCookie(response);

    return response;
  } catch (err: unknown) {
    console.error("Google OAuth callback exception:", err);
    const res = NextResponse.redirect(
      new URL("/login?error=" + encodeURIComponent("An unexpected error occurred during Google sign-in."), req.url)
    );
    clearStateCookie(res);
    return res;
  }
}
