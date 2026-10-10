---
name: ui-skeleton-loading
description: Skeleton screen architecture, shimmer animation keyframes, layout shift (CLS) prevention, and accessible loading state patterns for The Warden. Use this skill whenever building skeleton placeholders, progressive loading screens, or optimizing UI perceived performance during asynchronous data fetching.
---

# Warden Skeleton Loading Architecture

A complete guide to building high-craft skeleton loading states for **The Warden** (Next.js 16, Tailwind CSS v4).

Use this skill to eliminate Cumulative Layout Shift (CLS) and provide calm, Apple-inspired loading transitions.

---

## 1. Core Principles of Skeleton Design

1. **Geometry Mirroring:** Skeleton placeholders must match the exact dimensions (height, width, border-radius, padding) of the rendered content.
2. **Subtle Shimmer Animation:** Never use harsh, bright strobe pulses. Use a calm 1.8s-2.0s horizontal gradient sweep:
   ```css
   @keyframes shimmer {
     0% { transform: translateX(-100%); }
     100% { transform: translateX(100%); }
   }
   ```
3. **Accessibility Contract:**
   - Always add `aria-hidden="true"` to visual skeleton elements.
   - The containing wrapper must have `role="status"` and `aria-busy="true"`.
   - Provide an accessible screen-reader announcement: `<span className="sr-only">Loading content...</span>`.
4. **Reduced Motion Graceful Fallback:**
   - When `@media (prefers-reduced-motion: reduce)` is active, disable the shimmer sweep and render a subtle static background `bg-neutral-800/40`.

---

## 2. Reusable Skeleton Components

### Metric Card Skeleton
```tsx
export function MetricCardSkeleton() {
  return (
    <div 
      role="status" 
      aria-busy="true" 
      className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 relative overflow-hidden"
    >
      <span className="sr-only">Loading metric data...</span>
      <div className="h-4 w-24 bg-neutral-800/70 rounded-md animate-pulse mb-3" aria-hidden="true" />
      <div className="h-8 w-36 bg-neutral-800/90 rounded-lg animate-pulse mb-2" aria-hidden="true" />
      <div className="h-3 w-48 bg-neutral-800/50 rounded-md animate-pulse" aria-hidden="true" />
    </div>
  );
}
```

### Table Row Skeleton
```tsx
export function TableRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-3.5 px-4 border-b border-neutral-800/40" aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-neutral-800/70 animate-pulse" />
        <div className="space-y-1.5">
          <div className="h-4 w-32 bg-neutral-800/70 rounded" />
          <div className="h-3 w-20 bg-neutral-800/40 rounded" />
        </div>
      </div>
      <div className="h-4 w-16 bg-neutral-800/70 rounded" />
    </div>
  );
}
```
