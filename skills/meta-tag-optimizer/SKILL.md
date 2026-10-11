---
name: meta-tag-optimizer
description: Automated script and optimization protocol for crafting, auditing, and validating high-CTR meta titles and descriptions across all public pages in The Warden (https://thewarden.online). Use whenever reviewing SERP snippets, adding new pages, or auditing metadata character lengths.
---

# Meta Title & Description Optimization Skill

> **Target:** High CTR, zero SERP truncation, high-intent keyword inclusion, and sovereign brand consistency.

This skill governs the formulas, constraints, and automated verification script for page `<title>` and `<meta name="description">` tags in **The Warden**.

---

## 1. Google SERP Character & Pixel Constraints

Google truncates snippet text based on pixel width (typically ~600px for desktop titles, ~960px for descriptions):

| Metric | Ideal Range | Strict Maximum | Truncation Warning |
| :--- | :---: | :---: | :--- |
| **Meta Title** | **50 – 60 characters** | 60 characters | Truncates with `...` at >60 chars. |
| **Meta Description** | **140 – 160 characters** | 160 characters | Truncates on desktop at >160 chars. |

---

## 2. High-Converting Title Tag Formulas

### Formula A (Landing / Root):
```
[Primary Keyword] — [Key Differentiator] | [Brand Name]
```
*Example:* `Personal Accountability OS — Unbroken Daily Discipline | THE WARDEN` (59 characters)

### Formula B (Feature / Secondary Page):
```
[Feature Action] — [Core Benefit] | [Brand Name]
```
*Example:* `Interactive UI Architecture & Sovereign Demo | THE WARDEN` (56 characters)

### Formula C (Legal / Compliance):
```
[Document Title] & Data Sovereignty | [Brand Name]
```
*Example:* `Privacy Policy & Sovereign Data Security | THE WARDEN` (53 characters)

---

## 3. High-Converting Meta Description Formulas

Every description MUST contain:
1. Primary keyword in the first 80 characters.
2. Emotional hook / pain-point relief (no ads, zero distractions, mathematical accountability).
3. Clear imperative call to action (Explore live demo, Initialize The Warden, Secure your data).

*Example (Root Page):*
> "Enforce daily habits and protect financial sovereignty with The Warden. Zero advertisements, zero vanity metrics. Built for high performers. Initialize now." (156 characters)

*Example (Demo Page):*
> "Experience The Warden's sovereign command center. Test interactive discipline cards, impulse vaults, and streak telemetry before initializing your node." (152 characters)

---

## 4. Automated Metadata Audit CLI Runner

Run the metadata auditor to inspect all public pages:

```powershell
npx tsx scripts/seo-meta-audit.ts
```

The script automatically:
* Analyzes all routes (`/`, `/demo`, `/login`, `/register`, `/privacy`, `/terms`).
* Verifies character counts against 50–60 (title) and 140–160 (description) thresholds.
* Flags potential truncation risks or missing keyword tags.
* Outputs green/yellow/red status indicators with ready-to-paste optimizations.
