---
name: customer-emails
description: Sovereign customer email lifecycle, welcome-on-login notifications, and administrative real-time roster delivery for The Warden.
---

# Customer Emails & Administrative Roster Telemetry

> **Core Mandate**: Every time a customer authenticates into The Warden, they immediately receive a high-aesthetic sovereign welcome email, and the system instantly dispatches the complete, real-time database roster of all registered customers to the site owner.

---

## 1. Architectural Architecture

The email subsystem operates on a **Dual-Dispatch Protocol** tied directly to authentication lifecycles:

```
[Customer Authentication]
   ├── 1. Credentials Login (login action)
   ├── 2. Google OAuth Callback (processGoogleCallback)
   ├── 3. Account Registration (register action)
   └── 4. Password Reset Re-auth (resetPassword action)
             │
             ├──▶ Dispatches [Customer Welcome Email]
             │      • Recipient: User's authenticated email
             │      • Tone: Sovereign, disciplined, personal accountability
             │      • Action: Direct terminal link (Dashboard)
             │
             └──▶ Dispatches [Admin Customer Roster Notification]
                    • Recipient: ADMIN_EMAIL / OWNER_EMAIL / muheebkamran53@gmail.com
                    • Real-time Query: Live db.user.findMany roster
                    • Metric: Total registered user headcount
                    • Telemetry Table: All customer emails, names, auth providers & dates
                    • Active Badge: Highlights the user who just logged in
```

---

## 2. Non-Blocking & Resilience Guarantee

Authentication is zero-latency critical. User logins must **never** be delayed or disrupted by outbound email network latency or third-party rate limits.

### Golden Rules:
1. **Network Timeout Ceiling**: All outbound HTTP calls to Resend use an `AbortController` timeout capped at `3000ms`.
2. **Settled Concurrency**: Email promises are grouped with `Promise.allSettled()`.
3. **Fail-Safe Fallback**: Any exception in database querying or email transmission is caught and logged to `console.error` without bubbling up.
4. **Local Simulation Mode**: If `RESEND_API_KEY` is not present (local dev / staging / CI), the system outputs clean visual simulation logs to the console and succeeds with `{ success: true }`.

---

## 3. Email Specifications & Sovereign Design System

Emails strictly mirror The Warden's design tokens codified in `skills/warden-architecture/SKILL.md`:

| Token | Hex | Email Usage |
| :--- | :--- | :--- |
| **Obsidian Void** | `#090A0C` | Root outer container background |
| **Obsidian Surface** | `#121316` | Card container background with hairline border `#222227` |
| **Sovereign Gold** | `#C8A96B` | Brand logotype, prominent CTAs, section subtitles |
| **Snap Yellow** | `#FFFC00` | Accent highlights and telemetry tags |
| **Sovereign Emerald** | `#00D664` | `[ACTIVE NOW]` status badges and verified auth checkmarks |
| **Monospace Data** | `#A1A1AA` | Timestamps, provider indicators, and user IDs |

### 3.1 Customer Welcome Email (`sendLoginWelcomeEmail`)
- **Recipient**: Authenticating user (`user.email`).
- **Subject**: `Welcome to The Warden // Session Authenticated`
- **Header**: `THE WARDEN • PERSONAL ACCOUNTABILITY OS`
- **Greeting**: Personalized with display name if present (`Hi Muheeb,` or `Hi Operative,`).
- **Content**:
  - Reassurance that their terminal session is active.
  - The 70% rule reminder: Maintain habits, protect streaks, zero excuses.
  - Telemetry Pill: Session status, login timestamp (UTC), email identifier.
  - Prominent CTA Button: `[ OPEN YOUR TERMINAL ]` linking to `${appUrl}/dashboard`.
  - Security Disclaimer: Instructions to reset password if they did not initiate the session.

### 3.2 Admin Customer Roster Email (`sendAdminCustomerRosterNotification`)
- **Recipient**: `process.env.ADMIN_EMAIL || process.env.OWNER_EMAIL || "muheebkamran53@gmail.com"`.
- **Subject**: `[The Warden Alert] Customer Login: {email} ({count} Total Customers)`
- **Header**: `ADMIN TELEMETRY DISPATCH // LIVE CUSTOMER ROSTER`
- **Executive Summary Card**:
  - **Active Operative**: Email & Name of user who just authenticated.
  - **Auth Provider**: `GOOGLE OAUTH` or `CREDENTIALS`.
  - **Timestamp**: Exact UTC ISO timestamp.
  - **Total Customer Count**: Live database count of all registered users.
- **Complete Customer Roster Table**:
  - `#`: Sequential ranking (newest first).
  - `Customer Email`: Full email address.
  - `Name`: Display name or `—`.
  - `Provider`: `Google` or `Password`.
  - `Joined`: Format `YYYY-MM-DD`.
  - `Status`: Emerald `[JUST LOGGED IN]` badge for the active user.

---

## 4. Environment Configuration

```env
# Resend API Key for production delivery (leave empty for local simulation)
RESEND_API_KEY="re_..."

# Email Sender Address (defaults to notifications@thewarden.online)
EMAIL_FROM="The Warden <notifications@thewarden.online>"

# Admin Notification Recipient (defaults to muheebkamran53@gmail.com)
ADMIN_EMAIL="muheebkamran53@gmail.com"
OWNER_EMAIL="muheebkamran53@gmail.com"

# Public App URL for deep links in email templates
NEXT_PUBLIC_APP_URL="https://thewarden.online"
```

---

## 5. Integration Entrypoints

1. **Credentials Login**:
   - File: `src/app/actions.ts` -> `login(formData)`
   - Trigger: Directly after password verification, before `createSession()` & `redirect("/dashboard")`.

2. **Google OAuth Login**:
   - File: `src/lib/oauth.ts` -> `processGoogleCallback(req)`
   - Trigger: Directly after `handleGoogleUser()` and `createSession()`, before `NextResponse.redirect()`.

3. **User Registration**:
   - File: `src/app/actions.ts` -> `register(formData)`
   - Trigger: Directly after `db.user.create()`, before `createSession()` & `redirect("/dashboard")`.

---

## 6. Verification & Quality Gates

Run the following checks whenever modifying the email engine:
- `npm test`: Verify that all unit tests and simulation assertions pass.
- `npx tsc --noEmit`: Ensure strict TypeScript compliance with zero type errors.
- `npm run lint`: Verify zero ESLint issues.
- `npm run build`: Confirm Next.js production build succeeds.
