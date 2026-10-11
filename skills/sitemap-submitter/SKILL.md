---
name: sitemap-submitter
description: Automated protocol and CLI runner for generating, verifying, and submitting sitemap.xml to Google, Bing, and IndexNow for The Warden (https://thewarden.online). Use whenever deploying new public routes, modifying sitemaps, or requesting re-crawling.
---

# Sitemap Submitter & Search Engine Ping Protocol

> **Sitemap URL:** `https://thewarden.online/sitemap.xml`  
> **Robots URL:** `https://thewarden.online/robots.txt`

This skill provides the automated procedure and script runner to submit and broadcast **The Warden's** sitemap to search engine endpoints.

---

## 1. Sitemap Architecture (`src/app/sitemap.ts`)

Next.js 16 dynamically compiles `src/app/sitemap.ts` into a standards-compliant XML sitemap served at `/sitemap.xml`:

| Route | Priority | Change Frequency | Purpose |
| :--- | :---: | :---: | :--- |
| `https://thewarden.online` | `1.0` | `daily` | Root sovereign landing page & command center. |
| `https://thewarden.online/demo` | `0.8` | `weekly` | Public interactive product preview. |
| `https://thewarden.online/register` | `0.9` | `monthly` | User onboarding and signup funnel. |
| `https://thewarden.online/login` | `0.7` | `monthly` | User sign-in portal. |
| `https://thewarden.online/privacy` | `0.4` | `monthly` | Legal data sovereignty policy. |
| `https://thewarden.online/terms` | `0.4` | `monthly` | Legal terms of service. |

---

## 2. Automated Search Engine Ping Endpoints

Search engines provide ping endpoints to notify their crawlers of updated sitemaps without waiting for scheduled recrawls:

### A. Google Ping Endpoint
```http
GET https://www.google.com/ping?sitemap=https%3A%2F%2Fthewarden.online%2Fsitemap.xml
```

### B. Bing & Yahoo Ping Endpoint
```http
GET https://www.bing.com/ping?sitemap=https%3A%2F%2Fthewarden.online%2Fsitemap.xml
```

### C. IndexNow API Protocol (Bing, Yandex, Seznam, Naver)
```http
POST https://api.indexnow.org/indexnow
Content-Type: application/json

{
  "host": "thewarden.online",
  "key": "THE_WARDEN_INDEXNOW_KEY",
  "urlList": [
    "https://thewarden.online/",
    "https://thewarden.online/demo",
    "https://thewarden.online/register"
  ]
}
```

---

## 3. Automated Submitter CLI Script

Execute the submission runner:

```powershell
npx tsx scripts/submit-sitemap.ts
```

This script:
1. Pings `https://thewarden.online/sitemap.xml` to verify live HTTP 200 and XML headers.
2. Dispatches HTTP ping requests to Google and Bing ping gateways.
3. Reports HTTP response codes and confirmation timestamps.

---

## 4. Verification & Validation Checklist

Before submitting:
* Verify live response: `curl -I https://thewarden.online/sitemap.xml` returns `HTTP 200` with `Content-Type: application/xml` or `text/xml`.
* Verify `robots.txt` points to `Sitemap: https://thewarden.online/sitemap.xml`.
* Ensure zero private routes (e.g., `/dashboard`, `/habits`, `/api/*`) are exposed in `sitemap.xml`.
