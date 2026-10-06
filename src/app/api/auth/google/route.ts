import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/oauth";

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID;

  if (!clientId) {
    return NextResponse.redirect(
      new URL(
        "/login?error=" +
          encodeURIComponent(
            "Google OAuth is not configured yet. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your environment variables."
          ),
        req.url
      )
    );
  }

  const appUrl = getAppUrl(req);
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || `${appUrl}/api/auth/callback/google`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
