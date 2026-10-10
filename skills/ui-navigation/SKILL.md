---
name: ui-navigation
description: Navigation shell architecture, desktop collapsible sidebar, mobile drawer with backdrop scrim, and BottomBar 5-tab alignment for The Warden. Use this skill whenever refactoring navigation components, improving mobile responsive layouts, or hardening touch targets.
---

# Warden Navigation & Shell Architecture

A specialized guide for desktop and mobile navigation layouts in **The Warden** (Next.js 16, Tailwind CSS v4).

Use this skill to guarantee seamless responsive transitions, touch accessibility, and ergonomic route switching across viewports.

---

## 1. Responsive Viewport Strategy

| Viewport | Primary Navigation UI | Secondary UI | Ergonomics |
| :--- | :--- | :--- | :--- |
| **Mobile (< 768px)** | **BottomBar (5 core tabs)** | Header Hamburger Drawer | Thumb-zone reachability, tap scrim on drawer open. |
| **Tablet (768px - 1024px)**| Collapsible Icon Sidebar | Top Header Breadcrumbs | Space-saving rail mode with tooltips. |
| **Desktop (>= 1024px)** | **Full Expanded Sidebar** | User Profile Card in Sidebar | Keyboard Tab navigation, distinct active links. |

---

## 2. Mobile Drawer & Backdrop Scrim Pattern

### Rules for `src/components/Sidebar.tsx`:
1. **Default State on Mobile:** Drawer must default to `isOpen = false` on screen sizes `< 768px`.
2. **Backdrop Scrim:** When open, render a full-screen tap backdrop behind the drawer to prevent accidental clicks on content underneath:
   ```tsx
   {isOpen && (
     <div
       className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
       onClick={() => setIsOpen(false)}
       aria-hidden="true"
     />
   )}
   ```
3. **Body Scroll Lock:** When the drawer is open, add `overflow-hidden` to `document.body` to prevent background rubber-banding.

---

## 3. BottomBar 5-Tab Balance (`src/components/BottomBar.tsx`)

Ensure equal grid balance across the 5 primary routes:
```tsx
const navItems = [
  { href: '/dashboard', label: 'Today', icon: LayoutDashboard },
  { href: '/habits', label: 'Habits', icon: CheckSquare },
  { href: '/dashboard#notes', label: 'Notes', icon: BookOpen },
  { href: '/finance', label: 'Finance', icon: DollarSign },
  { href: '/progress', label: 'Progress', icon: Calendar },
];
```

* Ensure touch targets are >= 48px height with `pb-[env(safe-area-inset-bottom)]` for modern iPhone home indicators.
* Provide active state indicator: `text-amber-400 bg-amber-500/10` with `active:scale-95` tactile tap feedback.
