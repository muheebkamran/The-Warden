import { NextResponse } from "next/server";
import { handleGoogleUser } from "@/app/actions";
import { createSession } from "@/lib/auth";

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

export async function processGoogleCallback(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/login?error=" + encodeURIComponent("Google sign-in was cancelled or encountered an error."), req.url)
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/login?error=" + encodeURIComponent("Google OAuth credentials missing on server."), req.url)
    );
  }

  const appUrl = getAppUrl(req);
  const redirectUri = `${appUrl}${url.pathname}`;

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
      return NextResponse.redirect(
        new URL("/login?error=" + encodeURIComponent("Failed to exchange authentication code with Google."), req.url)
      );
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch user profile from Google UserInfo endpoint
    const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userinfoRes.ok) {
      return NextResponse.redirect(
        new URL("/login?error=" + encodeURIComponent("Failed to fetch profile details from Google."), req.url)
      );
    }

    const profile = await userinfoRes.json();

    if (!profile.email) {
      return NextResponse.redirect(
        new URL("/login?error=" + encodeURIComponent("Google did not provide an email address."), req.url)
      );
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

    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (err: any) {
    console.error("Google OAuth callback exception:", err);
    return NextResponse.redirect(
      new URL("/login?error=" + encodeURIComponent("An unexpected error occurred during Google sign-in."), req.url)
    );
  }
}
