---
name: ui-theme-system
description: CSS variables, design tokens, surface elevation levels, and dark/light mode palette architecture for The Warden. Use this skill whenever adjusting background tokens, borders, card elevation surfaces, focus rings, or theme switching mechanics.
---

# Warden Theme System & Surface Architecture

A guide to design tokens, surface elevation hierarchy, and color palettes for **The Warden** (Tailwind CSS v4).

Use this skill to preserve visual depth, contrast integrity, and brand cohesion across all views.

---

## 1. Surface Elevation Hierarchy

| Level | Surface Name | Background Token | Border Token | Usage Context |
| :---: | :--- | :--- | :--- | :--- |
| **0** | Canvas Base | `bg-neutral-950` (`#0a0a0a`) | None | Page background, root document layer. |
| **1** | Container Surface | `bg-neutral-900/60` | `border-neutral-800/80` | Habit cards, ledger containers, metrics blocks. |
| **2** | Floating Surface | `bg-neutral-900/95` | `border-neutral-700/80` | Modals, bottom navigation bar, dropdown menus. |
| **3** | Highlight / Tooltip | `bg-neutral-800` | `border-neutral-600/50` | Active overlays, badges, floating tooltips. |

---

## 2. Accent & Semantic Color Tokens

* **Primary Accent:** `amber-500` (`#f59e0b`) & `amber-400` (`#fbbf24`) — represents discipline, warmth, and vitality.
* **Positive / Complete:** `emerald-500` (`#10b981`) & `emerald-400` (`#34d399`) — streaks preserved, bills paid, savings targets reached.
* **Negative / Danger:** `red-500` (`#ef4444`) & `red-400` (`#f87171`) — missed habits, deleted records, overdue accounts.
* **Focus Ring Standard:** `focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950` for clear keyboard navigation.
