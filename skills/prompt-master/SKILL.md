---
name: prompt-master
description: Analyzes raw user prompts and reformulates them into structured, deterministic, zero-hallucination instructions optimized specifically for Google Antigravity. Use this skill whenever the user asks to refine, analyze, improve, optimize, or rewrite a prompt, or wants tasks structured for maximum Antigravity performance and verification.
---

# Prompt Master — Antigravity Instruction Architecture

A specialized meta-prompting skill engineered to analyze user ideas and formulate them into the exact structural dialect that **Antigravity** (Google DeepMind's agentic AI coding assistant) executes with maximum speed, precision, and zero regression.

---

## 1. How Antigravity Thinks & Operates

Antigravity is an autonomous agent operating directly inside the developer's environment (Windows PowerShell, Next.js, Prisma, Git). 

When prompts are ambiguous, informal, or unbounded, AI agents tend to:
- Over-refactor working code (breaking adjacent components).
- Edit files outside the intended phase.
- Skip verification or run broken commands.
- Duplicate existing functionality or hallucinate APIs.

**Prompt Master** converts high-level intent into deterministic **Agentic Execution Contracts** that keep Antigravity locked strictly within scope.

---

## 2. The 7-Pillar Antigravity Prompt Framework

Whenever analyzing and refactoring a user prompt, structure it using this standard architecture:

```markdown
# [PHASE / TASK TITLE]: [Precise Goal]

## 1. ROLE & IDENTITY
Act as [Specific Senior Role, e.g., Senior Frontend Motion Designer, Principal Security Auditor].

## 2. OBJECTIVE
[Single, clear, unambiguous outcome statement].

## 3. STRICT SCOPE & NON-GOALS (GUARDRAILS)
- DO NOT edit or touch [unrelated files / phases].
- DO NOT rewrite [working logic / existing schemas].
- DO NOT introduce new dependencies unless explicitly authorized.
- PRESERVE all existing comments, docstrings, and tests.

## 4. TARGET FILES
- `path/to/file1.tsx`
- `path/to/file2.ts`

## 5. STEP-BY-STEP EXECUTION PROTOCOL
1. **Audit / Inspect First:** Inspect [specific file] using view_file or read-only commands.
2. **Surgical Implementation:** Apply minimal, targeted modifications.
3. **Verify:** Check for lint errors and regressions immediately.

## 6. VERIFICATION GATE (ZERO REGRESSIONS)
Execute these exact commands:
- `npm test` (Must maintain 100% pass rate)
- `npx tsc --noEmit` (Must pass with 0 errors)
- `git diff <modified-files>` (Confirm diff is minimal)

## 7. DELEGATION & SUBAGENT DIRECTIVE (IF APPLICABLE)
Delegate or coordinate with subagent: `[e.g., security_sentinel / agent_animation_apple]`.
```

---

## 3. Antigravity System Nuances to Embed

When constructing prompts for Antigravity, always embed these runtime rules:
1. **Never use `cd` in shell commands:** Antigravity runs in PowerShell; commands execute using the `Cwd` parameter. Never tell it to `cd path && npm test`. Use direct commands or project roots.
2. **Forward-Slash File Links:** Instruct Antigravity to format all links using `file:///path/to/file` with forward slashes for clean clickable references.
3. **Reactive Wakeup:** Remind Antigravity not to poll background commands or subagents in a loop.
4. **Relevant Slash Commands:** Suggest applicable slash commands when relevant:
   - `/plan`: For multi-step complex initiatives before coding.
   - `/goal`: For long-running, autonomous execution that shouldn't stop until complete.
   - `/boost`: For deep architectural reasoning and rigorous verification.
   - `/grill-me`: To interview the user and resolve architectural decisions before execution.

---

## 4. Transformation Example (Before & After)

### Input (Raw User Prompt):
> "make the mobile menu look better and fix that bug where the background scrolls when its open"

### Output (Antigravity-Optimized Prompt):
```markdown
# PHASE 3.2: MOBILE NAVIGATION & SCROLL LOCK HARDENING

## 1. ROLE
Act as a Senior React Frontend Architect & Touch Ergonomics Specialist.

## 2. OBJECTIVE
Enhance `Sidebar.tsx` mobile drawer so it defaults to closed on viewports < 768px, includes a semi-transparent tap backdrop scrim, and locks body scrolling when expanded.

## 3. STRICT SCOPE & NON-GOALS
- DO NOT touch desktop sidebar behavior (>= 768px).
- DO NOT modify `BottomBar.tsx` or route navigation links.
- DO NOT edit backend server actions or authentication logic.
- PRESERVE all existing test suites.

## 4. TARGET FILES
- `src/components/Sidebar.tsx`

## 5. STEP-BY-STEP EXECUTION
1. Inspect `src/components/Sidebar.tsx` to identify the current mobile drawer open state and container classes.
2. Ensure mobile state defaults to `false` on initial render.
3. Add a backdrop scrim: `<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsOpen(false)} aria-hidden="true" />`.
4. Add a `useEffect` that toggles `document.body.style.overflow = 'hidden'` when the mobile drawer is open and resets it on close/unmount.

## 6. VERIFICATION GATE
Run the following checks:
- `npm test` (Confirm 96/96 tests pass)
- `npx tsc --noEmit` (Confirm 0 TypeScript errors)
- `git diff src/components/Sidebar.tsx` (Verify surgical, targeted diff)
```

---

## 5. Prompt Master Response Workflow

When this skill is activated to optimize a prompt:
1. **Analyze the Raw Prompt:** Identify implicit assumptions, missing constraints, and risk of regressions.
2. **Present the Formulated Prompt:** Output the complete 7-pillar prompt in a copy-pasteable code block.
3. **Recommend Workflow Shortcuts:** Suggest the optimal slash command (`/plan`, `/boost`, `/goal`) or subagent to run it with.
