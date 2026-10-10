---
name: warden-qa-suite
description: Comprehensive quality assurance (QA) protocol for The Warden application. Use this skill whenever conducting QA reviews, executing automated test runs, validating TypeScript compilation and linting, auditing responsive layouts, checking accessibility and ARIA semantics, or verifying build stability before deployment.
---

# Warden QA Verification Suite

A full-spectrum Quality Assurance protocol designed for **The Warden** (Next.js 16, React 19, TypeScript, Tailwind CSS v4, Prisma).

Use this skill to execute rigorous automated and manual QA passes across test coverage, static analysis, build integrity, visual ergonomics, and accessibility.

---

## 1. QA Verification Pillars

| Pillar | Scope | Primary Tools & Commands | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| **1. Automated Tests** | Unit & integration tests | `npm test` | **100% pass rate** (96/96 tests pass, 0 fails, 0 flakiness). |
| **2. Type Integrity** | Strict TypeScript check | `npx tsc --noEmit` | **0 errors**. No unchecked `any` leaks in domain models. |
| **3. Code Standards** | ESLint validation | `npm run lint` / `npx eslint src` | **0 errors**. Unused imports and syntax issues resolved. |
| **4. Build Stability** | Production compile check | `npx next build --webpack` | Successful build with valid client & server chunk generation. |
| **5. Responsive QA** | Cross-viewport layouts | Mobile (360px), Tablet (768px), Desktop (1280px) | No horizontal overflow, touch targets >= 44x44px, bottom bar visible. |
| **6. Accessibility** | WAI-ARIA & Keyboard nav | Tab navigation, Focus traps, Screen-reader roles | Modals trap focus, Escape closes dialogs, interactive cards have labels. |
| **7. Functional Edge Cases** | Boundary data handling | Negative inputs, empty arrays, network error states | Graceful UI states; no blank screen crashes or unhandled rejections. |

---

## 2. Standard QA Execution Workflow

### Step 1: Run Full Automated Verification Suite
Execute these commands sequentially:
```powershell
npm test
npx tsc --noEmit
npm run lint
```
If any command fails, halt the QA pipeline and report the failure log with reproduction details.

### Step 2: Component & Layout QA Checklist
Inspect key UI components:
1. **Modal & Dialogs ([`src/components/ui/Modal.tsx`](file:///C:/Users/muhee/Desktop/Programs/The-Warden/src/components/ui/Modal.tsx)):**
   - Check `role="dialog"`, `aria-modal="true"`.
   - Check background backdrop click dismiss and `Escape` key handler.
   - Check max height `max-h-[90vh]` with `overflow-y-auto` to prevent off-screen modal clipping.
2. **Buttons ([`src/components/ui/Button.tsx`](file:///C:/Users/muhee/Desktop/Programs/The-Warden/src/components/ui/Button.tsx)):**
   - Check `disabled={disabled || loading}`.
   - Check spinner rendering and `aria-busy={loading}` attribute.
   - Check active tactile state (`active:scale-[0.98]`).
3. **Navigation Bar ([`src/components/layout/BottomBar.tsx`](file:///C:/Users/muhee/Desktop/Programs/The-Warden/src/components/layout/BottomBar.tsx) & [`Sidebar.tsx`](file:///C:/Users/muhee/Desktop/Programs/The-Warden/src/components/layout/Sidebar.tsx)):**
   - Ensure mobile screens display the 5 essential routes (Today, Habits, Notes, Finance, Progress).
   - Ensure active tab has clear visual distinction (`bg-amber-500/10 text-amber-500` or equivalent active token).

### Step 3: Production Build Verification
Test the Next.js production build:
```powershell
npx next build --webpack
```
Verify that all static pages and dynamic server-rendered routes compile cleanly without type or bundling errors.

---

## 3. QA Scorecard Template

Output QA findings using this scorecard:

```markdown
# Warden QA Test Scorecard

## 1. Automated Verification
- Unit & Integration Tests: [PASS: 96/96 passing]
- TypeScript Static Analysis: [PASS: 0 errors]
- ESLint Linting: [PASS: 0 errors]
- Production Build: [PASS]

## 2. Functional & Edge Case Verification
- Empty State Handling: [VERIFIED]
- Error Boundary Graceful Handling: [VERIFIED]
- Form Validations & Submit Disabled on Loading: [VERIFIED]

## 3. Accessibility & Responsive Verification
- Mobile Viewport (360px - 480px): [VERIFIED / ISSUES FOUND]
- Keyboard Navigation & Focus Trap: [VERIFIED]
- Screen-Reader ARIA Attributes: [VERIFIED]

## 4. Overall Quality Verdict
[READY FOR DEPLOYMENT / BLOCKED ON DEFECTS]
```
