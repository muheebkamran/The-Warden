---
name: ui-typography
description: Typography and font hierarchy guidelines for The Warden. Use this skill whenever styling text, formatting headings, configuring editorial serif fonts (Cormorant Garamond), clean sans-serif UI fonts (Inter), or monospaced tabular numbers (JetBrains Mono) for financial metrics and timers.
---

# Warden Typography Architecture

A specialized typography guide for **The Warden** (Next.js 16, Tailwind CSS v4).

Use this skill to implement editorial elegance, optical hierarchy, and tabular alignment across the entire interface.

---

## 1. The Three-Tier Font Family System

| Role | Font Family | CSS Variable / Utility | Primary Usage |
| :--- | :--- | :--- | :--- |
| **Editorial Serif** | Cormorant Garamond | `font-serif` / `var(--font-serif)` | Hero headlines, page titles, daily reflection headers, philosophical milestone titles. |
| **Modern UI Sans** | Inter | `font-sans` / `var(--font-sans)` | Body text, interactive buttons, form inputs, modal dialogs, navigation links, and descriptions. |
| **Monospaced Tabular** | JetBrains Mono | `font-mono tabular-nums` / `var(--font-mono)` | Currency values, percentages, timer countdowns, streak numbers, and date timestamps. |

---

## 2. Type Scale & Optical Hierarchy

```html
<!-- Page Title: Editorial Elegance -->
<h1 class="text-3xl md:text-4xl font-serif font-normal text-neutral-100 tracking-tight leading-tight">
  Daily Fortress
</h1>

<!-- Section Subtitle: Clear UI Sans -->
<p class="text-sm font-sans text-neutral-400 mt-1">
  Review your commitments and preserve momentum.
</p>

<!-- Financial / Numerical Display: Monospaced Tabular Numbers -->
<span class="text-2xl font-mono tabular-nums font-semibold text-emerald-400 tracking-tight">
  $2,450.00
</span>

<!-- Micro-Badge / Category Pill: Uppercase Tracking -->
<span class="text-[11px] font-mono uppercase tracking-widest text-neutral-500 font-medium">
  HABIT #04 • DAILY
</span>
```

---

## 3. Mandatory Typography Rules

1. **Tabular Numerics Rule:** Every currency amount, counter, percentage, and countdown MUST include `tabular-nums` (or `font-mono`) to prevent layout jitter as numbers change.
2. **Contrast Standards:** Ensure all text passes WCAG AA minimum contrast:
   - Primary text: `text-neutral-100` or `text-neutral-200` on dark backgrounds (>= 9:1 ratio).
   - Secondary text: `text-neutral-400` on dark backgrounds (>= 4.5:1 ratio).
   - Never use `text-neutral-600` or darker for readable content on black cards.
3. **Leading & Line-Length:**
   - Long-form daily notes: apply `max-w-prose leading-relaxed`.
   - Card headers: apply `leading-snug tracking-tight`.
