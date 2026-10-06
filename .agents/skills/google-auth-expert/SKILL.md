---
name: google-auth-expert
description: >-
  Comprehensive guide and operational runbook for implementing, publishing, and automating
  Google OAuth 2.0 and Google One Tap auto-login in web applications. Use when integrating Google
  sign-in, transitioning OAuth apps from Testing to Production in Google Cloud Console, resolving
  redirect_uri_mismatch errors, or adding seamless 1-click authentication without passwords.
---

# Google Authentication & Auto-Login Expert Runbook

This skill provides the definitive, production-grade guide for building, publishing, and troubleshooting Google OAuth 2.0 and Google One Tap (Google Identity Services) in modern full-stack web applications.

---

## 1. Why Apps Start in "Testing" Mode (And How to Publish to Production)

### The Problem
When a new Google Cloud OAuth consent screen is created for an **External** audience, Google sets its publishing status to **Testing** by default.
* In **Testing** mode: Only accounts explicitly listed in **Test users** (max 100) can sign in. Everyone else sees `Error 403: access_denied` or unverified app warnings.
* In **In production** mode: **Any user on Earth** with a Google account can sign in with 1 click.

### Why the "Publish App" Button is Disabled
Google Cloud Console disables the "Publish app" button until three mandatory links are supplied in the **Branding** tab:
1. **Application Home Page Link** (e.g. `https://your-domain.com`)
2. **Application Privacy Policy Link** (e.g. `https://your-domain.com/privacy`)
3. **Application Terms of Service Link** (e.g. `https://your-domain.com/terms`)

### Does Google Require Verification / Audit?
* **NO manual audit is required** if you only request basic non-sensitive scopes (`openid`, `email`, `profile`).
* You do NOT need to submit a video demonstration or pay for a security assessment.
* The moment you add the Privacy Policy URL and click **Publish App**, the app immediately becomes public and operational for all Google users worldwide.

---

## 2. Google Cloud Console Production Setup Checklist

### Step 1: Branding Configuration
1. Navigate to: `https://console.cloud.google.com/auth/branding?project=<PROJECT_ID>`
2. Fill in:
   - **App name**: Clean user-facing name (e.g. `The Warden`).
   - **User support email**: Developer/support Gmail address.
   - **Application home page**: `https://<YOUR_CANONICAL_DOMAIN>`
   - **Application privacy policy link**: `https://<YOUR_CANONICAL_DOMAIN>/privacy`
   - **Application terms of service link**: `https://<YOUR_CANONICAL_DOMAIN>/terms`
   - **Authorised domains**: Add root domains (e.g. `vercel.app`, `the-warden.site`).
   - **Developer contact information**: Your developer email.
3. Click **Save**.

### Step 2: Publish App to Production
1. Navigate to: `https://console.cloud.google.com/auth/audience?project=<PROJECT_ID>`
2. Under **Publishing status**, click **Publish app**.
3. Confirm the modal: **Push to production**.
4. Status changes to **In production** (green checkmark).

### Step 3: Register All Client Redirect URIs
Under **Credentials** -> **OAuth 2.0 Client IDs** -> edit your Web Application client:
Add ALL active environments to **Authorised redirect URIs**:
- Localhost: `http://localhost:3000/api/auth/callback/google`
- Canonical Production Domain: `https://<YOUR_DOMAIN>/api/auth/callback/google`
- Platform Aliases (Vercel/Netlify): Add each preview or staging alias.

---

## 3. Google One Tap & Auto-Login Integration

Google One Tap uses the **Google Identity Services (GIS)** SDK to display a zero-friction floating prompt ("Continue as [User Name]") without redirecting to a login page.

### Architecture Flow
1. Load GIS script asynchronously: `https://accounts.google.com/gsi/client`.
2. Initialize with Client ID:
   ```js
   google.accounts.id.initialize({
     client_id: "YOUR_GOOGLE_CLIENT_ID",
     callback: handleCredentialResponse,
     auto_select: true // Auto-logs in returning users!
   });
   google.accounts.id.prompt();
   ```
3. Receive cryptographic JWT `credential` in `handleCredentialResponse`.
4. Send credential to backend endpoint `/api/auth/google/onetap`.
5. Backend verifies JWT using `google-auth-library` or standard JWKS:
   - Extracts email, sub (Google ID), name, picture.
   - Finds or creates user in database.
   - Sets secure HTTPOnly session cookie.
   - Returns success -> Frontend redirects to `/dashboard`.

---

## 4. Next.js App Router Backend Handlers

### Standard Authorization Code Callback (`/api/auth/callback/google`)
```ts
// 1. Exchange authorization code for tokens
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

// 2. Fetch profile from UserInfo endpoint
const profile = await (await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
  headers: { Authorization: `Bearer ${accessToken}` },
})).json();

// 3. Upsert user in database and create session cookie
const user = await handleGoogleUser({
  googleId: profile.sub,
  email: profile.email,
  name: profile.name,
  avatarUrl: profile.picture,
});
await createSession(user.id);
return NextResponse.redirect(new URL("/dashboard", req.url));
```

---

## 5. Troubleshooting & Common Errors Cheatsheet

| Error Code | Root Cause | Fix |
|---|---|---|
| `redirect_uri_mismatch` | Current browser URL + `/api/auth/callback/google` is not in Google Cloud Console's Authorized Redirect URIs list. | Copy the exact URL reported in "Error details" and add it to Google Cloud Console client settings. |
| `access_denied` (Testing mode) | User email is not on the **Test users** list while publishing status is **Testing**. | Add user to Test users list OR publish app to production. |
| `invalid_client` | `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` is missing, misspelled, or mismatched. | Verify environment variables match Google Cloud Console credentials. |
| `idpiframe_initialization_failed` | Third-party cookies disabled or origin not in **Authorised JavaScript origins**. | Add the domain (without path) to Authorised JavaScript origins in Google Cloud Console. |
