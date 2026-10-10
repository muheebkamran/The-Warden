---
name: ui-tactile-interactions
description: Tactile interaction design, button press physics, transform-origin mechanics, and invisible micro-polish for The Warden based on Emil Kowalski's design engineering philosophy. Use this skill whenever building or refining button presses, dropdowns, modal entrances, spring curves, or conducting UI before/after reviews.
---

# Warden Tactile Interaction Architecture

A guide to tactile interface engineering for **The Warden** inspired by Emil Kowalski's craft philosophy.

Use this skill to implement micro-interactions that make software feel alive, responsive, and physically grounded.

---

## 1. Core Tactile Rules

1. **Direct Press Response:**
   - Buttons must respond on `pointerdown` (active state), not waiting for mouseup/tap release.
   - Enforce `active:scale-[0.98]` with `transition: transform 100ms ease-out`.
2. **Transform Origin Discipline:**
   - Popovers, context menus, and tooltips must expand from their trigger anchor:
     ```css
     transform-origin: var(--transform-origin, top left);
     ```
   - Modals always expand from screen center (`transform-origin: center`).
3. **Never `transition: all`:**
   - Always specify explicit animating properties to avoid unexpected layout lag or paint bottlenecks:
     ```css
     /* CORRECT */
     transition: transform 150ms cubic-bezier(0.16, 1, 0.3, 1), opacity 150ms ease-out;
     ```
4. **Nothing Appears from Zero:**
   - Elements should not scale up from `scale(0)` (which looks unnatural). Enter smoothly from `scale(0.96)` with `opacity: 0`.

---

## 2. Review Table Format

When reviewing or improving any UI interaction, format your findings using this exact markdown table:

| Before | After | Why |
| :--- | :--- | :--- |
| `transition: all 300ms` | `transition: transform 150ms ease-out, opacity 150ms ease-out` | Avoid paint recalculation on non-composited properties. |
| `transform: scale(0)` | `transform: scale(0.96); opacity: 0` | Objects in physical space don't emerge from a single point. |
| Sluggish `ease-in` menu | Snappy `ease-out` with custom bezier | `ease-in` feels like input lag; `ease-out` gives instant feedback. |
| No active press feedback | `active:scale-[0.98]` on button | Confirms touch intent instantly to the user's hand. |
