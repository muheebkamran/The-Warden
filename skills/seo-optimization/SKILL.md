---
name: seo-optimization
description: Master SEO strategy, keyword targeting, technical SEO architecture, structured data (JSON-LD), Core Web Vitals, and search crawlability for The Warden (https://thewarden.online). Use whenever optimizing search rankings, adding new public pages, refining metadata, or targeting high-intent keywords.
---

# The Warden: Master SEO Strategy & Optimization Guide

> **Production Domain:** `https://thewarden.online`  
> **Niche & Category:** Sovereign Personal Accountability OS, Habit Tracking, Financial Discipline Vault

This skill establishes the complete SEO framework for **The Warden**. It ensures maximum organic search visibility across Google, Bing, and AI search engines (SearchGPT, Perplexity, Gemini) while preserving the brand's uncompromising aesthetic.

---

## 1. High-Intent Target Keyword Clusters

The Warden targets users actively seeking serious accountability, discipline tools, and sovereign lifestyle systems rather than casual gamified trackers.

### Cluster 1: Sovereign & High-Discipline OS (Primary Intent)
* `personal accountability os`
* `sovereign habit tracker`
* `discipline tracking software`
* `daily discipline command center`
* `self sovereign productivity system`

### Cluster 2: Streaks & Habit Mechanics (Feature Intent)
* `unbroken streak tracker`
* `habit tracker with grace day`
* `70 percent discipline threshold`
* `diurnal habit protocol`
* `distraction free habit app`

### Cluster 3: Capital & Financial Discipline (Convergence Intent)
* `financial accountability tracker`
* `impulse buying lock app`
* `bill ocr expense tracker`
* `capital preservation vault`
* `daily allowance burn velocity`

### Cluster 4: Comparative & Value Intent
* `ad free habit tracker`
* `private offline friendly accountability app`
* `best habit tracker for founders and builders`
* `sovereign personal operating system`

---

## 2. Technical SEO Architecture (Next.js 16 App Router)

### 2.1 Metadata Hierarchy
Every route in `src/app/` must declare explicit metadata via Next.js `Metadata`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Discipline & Consistency | THE WARDEN",
  description:
    "Enforce daily consistency and protect financial sovereignty with The Warden. Zero advertisements, zero social noise, pure mathematical telemetry.",
  alternates: {
    canonical: "https://thewarden.online/habits",
  },
  openGraph: {
    title: "Daily Discipline & Consistency | THE WARDEN",
    description: "Personal accountability operating system for high performers.",
    url: "https://thewarden.online/habits",
    siteName: "The Warden",
    images: [{ url: "https://thewarden.online/og-image.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
};
```

### 2.2 Canonical URLs & MetadataBase
`src/app/layout.tsx` must configure `metadataBase`:
```tsx
metadataBase: new URL("https://thewarden.online"),
```
This guarantees that all relative OpenGraph images, favicons, and canonical links resolve correctly across search crawlers.

### 2.3 Crawl Budget & Route Classification
* **Indexable Public Routes (`index, follow`):**
  * `/` (Landing Page)
  * `/demo` (Live UI Demonstration)
  * `/login` (User Authentication)
  * `/register` (User Onboarding)
  * `/privacy` (Privacy Policy)
  * `/terms` (Terms of Service)
* **Protected App Routes (`noindex, nofollow` via robots.ts):**
  * `/dashboard/*`, `/habits/*`, `/progress/*`, `/finance/*`, `/settings/*`, `/api/*`
  * Never waste search engine crawl budget on authenticated private routes.

---

## 3. Structured Data (JSON-LD) Standards

All landing and marketing views must embed JSON-LD schemas in `<head>` to qualify for Google rich snippets:

### 3.1 SoftwareApplication Schema
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "The Warden",
  "operatingSystem": "All (Web, iOS, Android PWA)",
  "applicationCategory": "ProductivityApplication",
  "description": "Sovereign personal accountability operating system engineered to enforce daily habits and financial discipline.",
  "url": "https://thewarden.online",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "128"
  }
}
```

---

## 4. On-Page SEO Checklist for Any New Page

1. **Title Tag:** 50–60 characters. Structure: `[Primary Keyword] — [Benefit] | THE WARDEN`.
2. **Meta Description:** 140–160 characters. Must contain primary keyword and clear call to action.
3. **Single H1:** Exactly one `<h1>` per page reflecting the main keyword cluster.
4. **Hierarchical Headings:** Strict sequential nesting (`h1` -> `h2` -> `h3`).
5. **Alt Text:** Every image or SVG must have descriptive, keyword-rich `alt` or `aria-label`.
6. **Mobile Responsiveness:** Viewport meta tag with `viewportFit=cover`.
7. **Semantic HTML:** Use `<header>`, `<main>`, `<article>`, `<section>`, `<footer>`, `<nav>`.

---

## 5. Continuous SEO Monitoring Runbook

1. Run the SEO meta audit script: `npx tsx scripts/seo-meta-audit.ts`
2. Validate sitemap response: `curl -I https://thewarden.online/sitemap.xml` (must return HTTP 200).
3. Validate robots response: `curl -I https://thewarden.online/robots.txt` (must return HTTP 200).
4. Run Google Rich Results Test on `https://thewarden.online`.
