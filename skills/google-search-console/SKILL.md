---
name: google-search-console
description: End-to-end runbook and automation skill for Google Search Console (GSC) account onboarding, property verification, DNS TXT and HTML tag verification, sitemap registration, and URL inspection for The Warden (https://thewarden.online).
---

# Google Search Console Onboarding & Property Verification Runbook

> **Target Site:** `https://thewarden.online`  
> **Google Search Console Dashboard:** [search.google.com/search-console](https://search.google.com/search-console)

This skill provides step-by-step technical procedures and scripts to add, verify, and monitor **The Warden** in Google Search Console (GSC).

---

## 1. Property Setup Strategy

Google Search Console offers two property types:

| Property Type | Syntax | Recommended Use |
| :--- | :--- | :--- |
| **Domain Property** *(Recommended)* | `thewarden.online` | Covers all subdomains (`www`, `app`, root) and all protocols (`http`, `https`). Requires DNS TXT verification. |
| **URL-Prefix Property** | `https://thewarden.online` | Specific protocol and domain. Can be verified via HTML tag, DNS, or Google Analytics. |

> **Best Practice:** Always add both the **Domain Property** (`thewarden.online`) AND the **URL-Prefix Property** (`https://thewarden.online`).

---

## 2. Verification Methods

### Method A: HTML Meta Tag Verification (Instant via Codebase)

1. Navigate to [Google Search Console](https://search.google.com/search-console) and select **URL-prefix**: `https://thewarden.online`.
2. Select **HTML tag** verification. Copy the `content` code string (e.g. `google-site-verification=abc123xyz...`).
3. Set the environment variable in `.env.local` / Vercel:
   ```env
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_verification_token_here
   ```
4. `src/app/layout.tsx` automatically binds this token into the document `<head>`:
   ```tsx
   verification: {
     google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "GSC_TOKEN_PLACEHOLDER",
   }
   ```
5. Click **Verify** in the Search Console dashboard.

### Method B: DNS TXT Record Verification (Spaceship / Registrar)

1. Select **Domain** property: `thewarden.online`.
2. Copy the TXT record provided by Google (e.g., `google-site-verification=XXXXXXXXXXXXXXXXXXXX`).
3. Log in to Spaceship (or your DNS manager):
   - Go to **Domain List** -> `thewarden.online` -> **Advanced DNS**.
   - Click **Add New Record**:
     - **Type:** `TXT`
     - **Host:** `@`
     - **Value:** `google-site-verification=XXXXXXXXXXXXXXXXXXXX`
     - **TTL:** `1 min` (or Automatic)
4. Allow 2–5 minutes for DNS propagation, then click **Verify** in Search Console.
5. Verify via terminal:
   ```powershell
   nslookup -type=TXT thewarden.online
   ```

---

## 3. Submitting the XML Sitemap in GSC

Once property verification is confirmed:

1. In GSC left navigation, click **Sitemaps** (`/sitemaps`).
2. Under **Add a new sitemap**, enter:
   ```
   sitemap.xml
   ```
3. Full submitted URL: `https://thewarden.online/sitemap.xml`
4. Click **Submit**.
5. Check status: It should report **Success** with discovered URLs (e.g., `/`, `/demo`, `/login`, `/register`, `/privacy`, `/terms`).

---

## 4. Automated URL Inspection & Indexing Request Protocol

To index newly deployed or updated routes immediately:

1. Go to **URL Inspection** at the top of GSC.
2. Enter the canonical URL: `https://thewarden.online/`
3. Click **Test Live URL**.
4. If "URL is available to Google" is confirmed, click **Request Indexing**.
5. Repeat for:
   - `https://thewarden.online/demo`
   - `https://thewarden.online/register`
   - `https://thewarden.online/login`

---

## 5. Google Search Console REST API Automated Submission

For programmatic indexing without manual UI clicks, use the Google Search Console / Webmasters API:

### API Endpoint:
```http
PUT https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fthewarden.online%2F/sitemaps/https%3A%2F%2Fthewarden.online%2Fsitemap.xml
Authorization: Bearer <GSC_OAUTH_ACCESS_TOKEN>
```

### Quick cURL Submission Check:
```bash
curl -X PUT \
  -H "Authorization: Bearer $GOOGLE_ACCESS_TOKEN" \
  "https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fthewarden.online%2F/sitemaps/https%3A%2F%2Fthewarden.online%2Fsitemap.xml"
```
