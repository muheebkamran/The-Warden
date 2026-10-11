---
name: warden-architecture
description: The master sovereign architectural design system for The Warden. Codifies obsidian token hierarchies, Snap Yellow accents, Apple/Snap tactile physics, Watermelon UI patterns, Tabler icon integration, and air-gapped telemetry components.
---

# The Warden: Sovereign Architectural Design System

> **Philosophy**: Zero vanity metrics. Zero advertisements. Mathematical telemetry, sovereign ownership, and visceral tactile feedback.

This skill governs all frontend architecture, visual aesthetics, design tokens, micro-interactions, and component contracts across **The Warden**. Every view, card, modal, and button must strictly adhere to these sovereign standards.

---

## 1. Color Token Hierarchy

The Warden operates in deep, high-contrast obsidian space inspired by high-frequency trading terminals, cybernetic cockpits, and privacy-first vaults.

| Token | Hex Value | Purpose & Context |
| :--- | :--- | :--- |
| **Obsidian Void** | `#000000` / `#0E0E10` | Root background canvases, header navigation bars, and deep recessed containers. |
| **Obsidian Elevate** | `#141416` / `#18181C` | Interactive cards, sidebars, drawer panels, and elevated stat surfaces. |
| **Snap Yellow** | `#FFFC00` | Sovereign accent, streak flames, primary call-to-actions, and active telemetry glow. |
| **Sovereign Emerald** | `#00D664` | Positive delta, ledger inflow, habit completion, and verified cryptographic states. |
| **Curfew Crimson** | `#FF2D55` | Missed disciplines, vault locks, ledger outflow, emergency sanctions, and IDOR alerts. |
| **Zinc Defense Border** | `#222227` / `#2E2E35` | Sub-pixel hairline borders (`border-[0.5px]` or `border border-[#222227]`). |
| **Data Muted** | `#71717A` / `#A1A1AA` | Monospace timestamps, telemetry metadata, breadcrumbs, and unit notations. |

---

## 2. Typography Matrix

The Warden couples clean Swiss sans-serif typography with high-density monospace readouts:

1. **Display & Headlines (`font-sans` / `font-serif`):**
   - Headings: `font-extrabold uppercase tracking-tight` or classic roman serifs (`font-serif tracking-[0.2em]`) for vault authority.
2. **Telemetry Readouts & Breadcrumbs (`font-mono`):**
   - Breadcrumbs: `font-mono text-[10px] tracking-widest uppercase text-zinc-400`
   - Numeric KPIs: `font-mono tabular-nums font-bold tracking-tight`
   - Timestamps: `font-mono text-[11px] text-zinc-300 font-medium`
3. **Body & Micro-Copy (`font-sans`):**
   - Clean, neutral, high-legibility text (`text-zinc-300` or `text-zinc-400`).

---

## 3. Apple & Snap Tactile Physics

Every interactive component MUST feel physical, responsive, and tactile under fingertip or cursor pressure:

- **Spring Compression:**
  - Standard buttons: `active:scale-[0.96] transition-all duration-150`
  - Floating pills: `active:scale-95 transition-transform duration-200`
  - Bento cards: `hover:border-[#FFFC00]/40 transition-colors duration-200`
- **Ambient Glows:**
  - Active Snap Yellow items: `shadow-[0_0_20px_rgba(255,252,0,0.25)]`
  - Critical Crimson alerts: `shadow-[0_0_20px_rgba(255,45,85,0.25)]`
- **Floating Island Geometry:**
  - Rounded pills: `rounded-full` with backdrop blur (`backdrop-blur-xl bg-[#141416]/80 border border-[#2E2E35]`)
  - Modern Bento containers: `rounded-2xl` or `rounded-3xl` with hairline borders.

---

## 4. Vector Emblem & Logo Specification

The Warden mascot is a vector ghost with sinister slanted eyes and neck cord rendered entirely via SVG:

- **Component:** `src/components/ui/WardenLogo.tsx`
- **Vector Source:** `public/logo.svg`
- **Usage Rules:**
  - Never render raster PNG logos in headers, shells, or auth forms.
  - Headers / Sidebars: `<WardenLogo size={24} />` or `<WardenLogo size={38} glow />`.
  - Auth screens / Hero: `<WardenLogo size={56} glow />` or `<WardenLogo size={96} showText glow />`.

---

## 5. Iconography Leverage: Lucide & Tabler Icons

To convey sovereign control, finance, and hardware telemetry, pair Lucide React with Tabler Icons:

```tsx
import { IconShieldCheck, IconReceiptTax, IconCpu, IconLockAccess, IconFlame } from "@tabler/icons-react";
import { Shield, Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";
```

- **Lucide:** General navigation, standard UI actions, and breadcrumb carets.
- **Tabler Icons:** Sovereign security shields, ledger accounting, cryptographic telemetry, and system controls.
- **Rule:** Stroke width must be optically balanced between `1.5` and `2.0` (`stroke={1.75}`).

---

## 6. Watermelon UI Patterns

Integrate tactile Watermelon UI patterns (`ui.watermelon.sh`) into key views:

### Pattern A: Tactile Stat Bento Card
```tsx
<div className="relative group p-5 rounded-2xl bg-[#141416] border border-[#222227] hover:border-[#FFFC00]/40 transition-all duration-200 overflow-hidden">
  <div className="flex items-center justify-between mb-3">
    <span className="font-mono text-[10px] tracking-widest uppercase text-zinc-400">
      CAPITAL EFFICIENCY
    </span>
    <span className="w-2 h-2 rounded-full bg-[#00D664] shadow-[0_0_8px_#00D664]" />
  </div>
  <div className="font-mono text-2xl font-black text-white tabular-nums tracking-tight">
    94.8%
  </div>
  <p className="text-xs text-zinc-500 mt-1 font-sans">
    Discipline verified against ledger outflow.
  </p>
</div>
```

### Pattern B: Floating Control Island (Island Pill)
```tsx
<div className="inline-flex items-center gap-2 px-4 py-2 bg-[#18181C]/90 backdrop-blur-xl border border-[#2E2E35] rounded-full shadow-2xl">
  <span className="w-2 h-2 rounded-full bg-[#FFFC00] animate-ping" />
  <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
    LIVE TELEMETRY
  </span>
</div>
```

---

## 7. QA Verification Criteria

Before any code deployment or architectural commit:
1. `npx tsc --noEmit` must return 0 errors.
2. `npm test` must maintain 100% pass rate.
3. No raster `logo.png` references in application source (`src/`).
4. Zero unhandled empty states — all charts and tables must render graceful sovereign empty states.
