---
name: brand-serp-dominance
description: Strategic playbook and automated diagnostic protocol to rank #1 on Google for the exact brand name "The-Warden" (thewarden.online). Covers entity disambiguation against Minecraft/dictionary results, Knowledge Graph anchoring, indexing acceleration, and live SERP rank checking.
---

# The-Warden: Brand SERP Dominance & Rank Verification Skill

> **Target Brand Keyword:** `The-Warden` / `The Warden`  
> **Target Canonical URL:** `https://thewarden.online`  
> **Objective:** Secure the #1 organic position and Knowledge Panel / Rich Snippets when a user searches just `"The-Warden"`.

---

## 1. The Brand Entity Challenge

Searching for `"The-Warden"` on a blank index pits your site against:
1. **Minecraft "The Warden" Mob** (High domain authority: Mojang, Minecraft Wiki, YouTube).
2. **Generic dictionary definitions** (Merriam-Webster, Cambridge).
3. **Batman Arkham / Pop Culture characters**.

To overcome high-authority generic keywords, Google relies on **Entity Disambiguation Signals**:

```
[Searcher: "The-Warden"] ──> Google Entity Disambiguation Engine
                                 │
                                 ├──> 1. Exact Match Title: "The-Warden — Sovereign..."
                                 ├──> 2. Knowledge Graph Schema: @type "WebSite", "Organization", "SoftwareApplication"
                                 ├──> 3. Canonical Identity: sameAs -> "https://github.com/muheebkamran/The-Warden"
                                 ├──> 4. Rich FAQ Snippets: FAQPage schema on "What is The-Warden?"
                                 └──> 5. AI Discovery Manifest: /llms.txt
```

---

## 2. Automated Brand Rank Diagnostic Runner

Execute the live rank and indexation checker:

```powershell
npx tsx scripts/check-brand-rank.ts
```

This diagnostic script evaluates:
1. **Google Indexation Gate (`site:thewarden.online`):** Verifies if Googlebot has crawled and added the domain to the public index.
2. **Brand Query Matching (`"The-Warden"`):** Tests search engine visibility for the exact brand keyword.
3. **SERP Snippet Assets:** Validates live HTTP 200 on `sitemap.xml`, `robots.txt`, `llms.txt`, and `opengraph-image`.
4. **Structured Data Rich Results:** Validates the presence of `WebSite`, `Organization`, `SoftwareApplication`, and `FAQPage` schema graphs.

---

## 3. Brand Entity Optimization Requirements

Every public page must adhere to these entity guidelines:

### A. Title Tag First Position Rule
Never bury the brand at the end of the title tag. The exact query `The-Warden` must appear in the first 15 characters of the root page:
```tsx
// Correct
title: "The-Warden — Sovereign Personal Accountability OS & Habit Vault"

// Incorrect (Brand buried)
title: "Personal Accountability OS Built for Daily Habits | The Warden"
```

### B. Knowledge Graph Disambiguation
Ensure `src/app/layout.tsx` contains the multi-entity `@graph`:
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "name": "The-Warden",
      "alternateName": ["The Warden", "The Warden OS", "TheWarden"]
    },
    {
      "@type": "Organization",
      "name": "The-Warden",
      "sameAs": ["https://github.com/muheebkamran/The-Warden"]
    }
  ]
}
```

### C. Rich FAQ Accordions
Google awards high SERP real-estate to FAQ schema. The landing page must feature `<FAQPage>` structured data answering `"What is The-Warden?"`.

---

## 4. Indexing Acceleration Protocol

If `check-brand-rank.ts` reports that the domain is not yet indexed:

1. **Google Search Console Instant URL Inspection:**
   - Go to [Google Search Console](https://search.google.com/search-console).
   - Enter `https://thewarden.online/` in the top search bar.
   - Click **Request Indexing**. (This prioritizes Googlebot crawl within 24–48 hours).
2. **Ping Gateways:**
   - Run `npx tsx scripts/submit-sitemap.ts` to ping search engine indexing endpoints.
3. **External Entity Citations:**
   - Link `https://thewarden.online` in your GitHub profile and repository website field (`https://github.com/muheebkamran/The-Warden`). Google indexes GitHub repositories rapidly, transferring entity authority to your domain.
