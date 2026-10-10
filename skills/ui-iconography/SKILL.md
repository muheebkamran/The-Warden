---
name: ui-iconography
description: Iconography standards, Lucide React sizing, stroke weight harmony, and optical alignment guidelines for The Warden. Use this skill whenever adding, resizing, or aligning icons across buttons, navigation rails, cards, badges, and empty states.
---

# Warden Iconography Standards

A standardized visual icon system for **The Warden** powered by [Lucide React](https://lucide.dev/).

Use this skill to maintain optical weight balance, consistent stroke geometry, and semantic clarity across all interface views.

---

## 1. Icon Size & Stroke Matrix

| UI Context | Dimension Class | Pixel Size | Stroke Width | Recommended Lucide Props |
| :--- | :--- | :---: | :---: | :--- |
| **Inline Badges & Pills** | `h-3.5 w-3.5` | 14px | `1.75` | `<Flame className="h-3.5 w-3.5 text-amber-500" strokeWidth={1.75} />` |
| **Standard Buttons & List Items** | `h-4 w-4` | 16px | `2` | `<Plus className="h-4 w-4 mr-2" strokeWidth={2} />` |
| **Sidebar & Nav Items** | `h-5 w-5` | 20px | `1.75` | `<Shield className="h-5 w-5" strokeWidth={1.75} />` |
| **Card Headers & Hero Subheads** | `h-6 w-6` | 24px | `1.75` | `<TrendingUp className="h-6 w-6 text-emerald-400" strokeWidth={1.75} />` |
| **Empty States & Feature Heroes** | `h-10 w-10` to `h-12 w-12` | 40-48px | `1.5` | `<Inbox className="h-10 w-10 text-neutral-600" strokeWidth={1.5} />` |

---

## 2. Optical Alignment & Touch Targets

1. **Optical Centering in Buttons:**
   - Buttons containing only an icon MUST have a minimum tap target of `p-2.5` or `min-h-[40px] min-w-[40px]` on mobile.
   - Vertically center icon with text using `inline-flex items-center gap-2`.
2. **Accessible Semantics:**
   - Decorative icons accompanying text: add `aria-hidden="true"`.
   - Standalone icon buttons: MUST provide an explicit `aria-label` or `<span className="sr-only">Label</span>`.

```tsx
// Correct accessible icon button
<button
  type="button"
  aria-label="Delete bill"
  className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition-colors"
>
  <Trash2 className="h-4 w-4" aria-hidden="true" />
</button>
```

---

## 3. Semantic Icon Mapping

* **Habits & Discipline:** `Flame` (streaks), `CheckCircle2` (complete), `XCircle` (missed), `Shield` (fortress).
* **Finance & Vault:** `DollarSign` (cash), `Receipt` (bills), `Lock` (impulse vault), `PiggyBank` / `Target` (goals).
* **Navigation:** `LayoutDashboard` (today), `Calendar` (progress), `Sparkles` (insights), `Settings` (preferences).
