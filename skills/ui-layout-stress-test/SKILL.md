---
name: ui-layout-stress-test
description: Adversarial UI testing, extreme real-world data injection, boundary viewport testing, and overflow stress-testing for The Warden components based on break-ui principles. Use this skill whenever stress-testing forms, cards, tables, or modals against long text, edge-case numbers, empty datasets, or mobile viewport constraints.
---

# Warden UI Layout Stress-Testing Guide

An adversarial testing protocol based on the `break-ui` methodology for **The Warden**.

Use this skill to feed worst-case realistic data into components to expose layout breaks, clipping bugs, or broken typography before shipping to production.

---

## 1. The Real-World Worst-Case Dataset

| UI Field | Demo Data | Stress-Test Value | Failure Vector |
| :--- | :--- | :--- | :--- |
| **User Name** | John Doe | `Aleksandra Wiśniewska-Kowalczyk` | Multi-line wrap breaking card header height. |
| **Email Address** | john@test.com | `bartholomew.fitzgerald@northwind-industries-holdings.example.com` | Horizontal table overflow, broken flex layout. |
| **Habit Name** | Read | `Complete 120 Pages of Marcus Aurelius Meditations in Original Greek` | Card height blowout, misaligned action checkbox. |
| **Financial Amount** | $50.00 | `$1,249,580,240.50` or `-$0.0001` | Number wrapping onto two lines, broken currency sign. |
| **Collection Length** | 3 items | `0 items` (empty state) and `1,420 items` (infinite scroll test) | Lack of empty state placeholder; DOM memory bloat. |
| **Singular/Plural** | 5 days | `1 days` vs `1 day` | Grammatical layout bug in streak counters. |

---

## 2. Component Stress-Testing Procedure

1. **Test on 320px viewport:**
   - Check if horizontal scrollbar appears.
   - Fix with `overflow-x-hidden`, `min-w-0`, and responsive flex-wrap.
2. **Test unbounded text fields:**
   - Ensure table cells use `truncate` accompanied by a hover title or tooltip.
   - For long titles in cards, use `line-clamp-2 break-words`.
3. **Test Modal Heights on Short Viewports (e.g. 500px landscape):**
   - Verify modal container has `max-h-[90vh]` with `overflow-y-auto`.
   - Ensure sticky footers or actions remain visible and actionable.
