---
name: warden-project-evaluator
description: Evaluates and tracks the completion status of The Warden project across all development phases (Phase 0 through Phase 4). Use this skill whenever the user asks how much of the project or website remains, what phases are completed, what phases must be implemented next, or requests an architectural audit of remaining milestones.
---

# Warden Project Evaluator

A specialized evaluation skill for **The Warden** (Next.js 16 App Router, React 19, Tailwind CSS v4, Prisma, PostgreSQL).

Use this skill to determine exact project completeness, audit completed vs pending phases, and output actionable execution blueprints for remaining work without making assumptions.

---

## 1. Phase Completion Matrix

The Warden roadmap spans six major lifecycle phases:

| Phase | Phase Name | Status | Weight | Delivered Scope & Verification Evidence |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 0** | Current-State Audit | **CLOSED (100%)** | 10% | Complete security, route, and finance surface-area vulnerability audit. |
| **Phase 1** | Security, Auth & Navigation Foundation | **CLOSED (100%)** | 20% | Public route accessibility, token hashing, real middleware integration test in `src/__tests__/routes.test.ts`. |
| **Phase 2** | Finance/Billing Core Re-unification | **CLOSED (100%)** | 20% | Server actions `updateBill` & `updateTransaction`, orphan components connected to `/finance`, unsafe Unsplash fallback eradicated, 87/87 tests pass. |
| **Phase 3A** | UI/UX Architecture Audit | **CLOSED (100%)** | 5% | 17-part product & frontend architectural audit and execution blueprint. |
| **Phase 3.1** | Design System & Apple-Inspired Motion | **CLOSED (100%)** | 10% | Repaired keyframes in `globals.css`, tactile `Button.tsx`, opt-in interactive `Card.tsx`, accessible `Modal.tsx`, `Skeleton.tsx`, shared `ConfirmDialog.tsx`. |
| **Phase 3.2** | Global Shell & Responsive Navigation | **PENDING (0%)** | 10% | Mobile sidebar default state, tap scrim backdrop, BottomBar 5-tab alignment, `GlobalSpotlight` CPU optimization. |
| **Phase 3.3** | Dashboard ("Today") & Habits Polish | **PENDING (0%)** | 5% | Reorder Daily Note below habits, micro-interaction feedback on habit completion. |
| **Phase 3.4** | Finance Subsystem De-duplication | **PENDING (0%)** | 10% | Consolidate 8 cards into 4 primary functional zones, merge twin transaction tables, user-facing messaging for OCR/R2 missing credentials. |
| **Phase 3.5** | Progress, Settings & Full QA | **PENDING (0%)** | 5% | Calendar heatmap responsiveness, settings tokens consistency, end-to-end regression tests. |
| **Phase 4** | Production Infrastructure & Deployment | **PENDING (0%)** | 5% | Production secrets provisioning (`ANTHROPIC_API_KEY`, Cloudflare R2 bucket credentials), DNS and Google OAuth production domain binding. |

### Summary Calculation
- **Completed Weight:** 10% + 20% + 20% + 5% + 10% = **65% Complete**
- **Remaining Weight:** 10% + 5% + 10% + 5% + 5% = **35% Remaining**

---

## 2. Evaluation Procedure

When asked to evaluate repository state or project progress, follow these exact steps:

### Step 1: Run Verification Commands
Verify baseline health without modifying application code:
```powershell
npm test
npx tsc --noEmit
git status --short
```

Expected baseline:
- All unit and integration tests must pass (87/87 tests).
- TypeScript compile check must pass with 0 errors.
- Unstaged or modified files must strictly match the current active phase.

### Step 2: Audit File Boundaries
Check which files are modified and ensure changes do not cross unauthorized phase boundaries:
- **Phase 1 Files:** `src/middleware.ts`, `src/app/actions.ts` (auth), `src/__tests__/routes.test.ts`.
- **Phase 2 Files:** `src/app/actions.ts` (`updateBill`, `updateTransaction`), `src/components/finance/*`, `src/lib/r2.ts`, `src/__tests__/finance.test.ts`.
- **Phase 3.1 Files:** `src/app/globals.css`, `src/components/ui/Button.tsx`, `src/components/ui/Card.tsx`, `src/components/ui/Modal.tsx`, `src/components/ui/Skeleton.tsx`, `src/components/ui/ConfirmDialog.tsx`.

### Step 3: Assess Next Implementation Targets
Evaluate the codebase against the blueprint of the next pending phase (Phase 3.2):
1. **Sidebar Mobile Drawer:** Check `src/components/layout/Sidebar.tsx` for initial open state on mobile viewports (<768px). Must default to closed.
2. **Backdrop Scrim:** Check for a tap backdrop scrim when sidebar drawer is open on mobile.
3. **BottomBar Navigation:** Check `src/components/layout/BottomBar.tsx` for route links. Ensure all 5 core routes (Today, Habits, Notes, Finance, Progress) are represented.
4. **Spotlight Performance:** Check `src/components/ui/GlobalSpotlight.tsx` for `requestAnimationFrame` cleanup or tab visibility pause.

---

## 3. Output Report Template

Always structure evaluations using this format:

```markdown
# The Warden — Project Status & Completeness Evaluation

## 1. Overall Completion Status
- **Current Completion:** [X]% Complete
- **Remaining Work:** [100 - X]% Remaining
- **Current Phase:** Phase [Current Phase Number] ([Phase Name])

## 2. Completed Milestones (Verified)
- [List each closed phase with brief verification notes]

## 3. Immediate Next Phase: Phase [Next Phase Number]
- **Objective:** [Brief summary]
- **Target Files:** [List of files to be touched]
- **Key Tasks:**
  1. [Task 1]
  2. [Task 2]
  3. [Task 3]

## 4. Remaining Phases Checklist
- [ ] Phase 3.2: Global Shell & Responsive Navigation Hardening
- [ ] Phase 3.3: Dashboard ("Today") & Habits Ergonomics
- [ ] Phase 3.4: Finance Subsystem De-duplication & Transparency
- [ ] Phase 3.5: Progress & Settings Polish + End-to-End QA
- [ ] Phase 4: Production Infrastructure & Deployment Hardening

## 5. Non-Negotiable Constraints & Guardrails
- 87/87 tests must continue passing at all times.
- No regressions in authentication, route security, or finance mutations.
- Keep UI changes strictly scoped to authorized phase boundaries.
```
