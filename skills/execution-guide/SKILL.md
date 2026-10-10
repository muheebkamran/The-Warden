---
name: execution-guide
description: Execution supervision, boundary control, and change governance guide for The Warden. Use this skill whenever planning code modifications, supervising subagent actions, verifying git diffs, enforcing phase boundaries, preventing scope creep, or preventing regressions across engineering tasks.
---

# Warden Execution Supervision & Change Governance Guide

A strict execution supervision protocol for **The Warden** engineering team.

Use this skill to guide and monitor every code modification, ensure absolute zero-regression, prevent unauthorized scope expansion, and enforce deterministic phase transitions.

---

## 1. Core Principles of Execution Supervision

1. **Phase Boundary Sovereignty:**
   - Never edit files outside the currently authorized phase.
   - If the task is Phase 3.2, reject modifications to Phase 3.4 (Finance consolidation) or Phase 4 (Infra).
   - If fixing a bug, do not rewrite surrounding architecture.

2. **Pre-Execution Diff Verification:**
   - Always run `git status --short` before starting work to understand baseline modified files.
   - Run `git diff` incrementally after editing each file to confirm only intended lines were changed.

3. **Zero-Regression Mandate:**
   - Existing passing tests (96/96) must NEVER break.
   - If an edit causes a test failure, immediately identify whether the test needs updating or the code has a regression. Never blindly delete tests.

4. **Preserve Business Logic & Data Contracts:**
   - Server Actions in `src/app/actions.ts` must maintain their function signatures, return types, and validation contracts.
   - Database schema in `prisma/schema.prisma` must not be altered without explicit migration authorization.

---

## 2. Standard Supervision Workflow

### Phase 1: Pre-Execution Checklist
Before writing or replacing any file:
```powershell
# 1. Confirm clean baseline
git status --short
# 2. Confirm tests pass
npm test
# 3. Confirm TypeScript passes
npx tsc --noEmit
```

### Phase 2: In-Flight Execution Supervision
While modifying code:
1. Make surgical edits using targeted replacement or atomic file writes.
2. Verify lint errors in real time.
3. Keep changes minimal and maintain all existing comments and docstrings.

### Phase 3: Post-Execution Verification
After modifying code:
```powershell
# 1. Review exact diff
git diff <modified-file>
# 2. Re-run tests
npm test
# 3. Re-verify types
npx tsc --noEmit
```

---

## 3. Intervention Rules

The Execution Supervisor must immediately **HALT** execution if:
* A tool call attempts to delete or rewrite entire components without authorization.
* A change breaks an existing authentication check or IDOR verification.
* A change imports packages not present in `package.json`.
* An unapproved file is edited outside the active phase boundary.
