---
name: security-stress-check
description: Comprehensive security stress-checking and penetration audit for The Warden. Use this skill whenever testing authentication security, auditing IDOR vulnerabilities, validating crypto tokens, checking route protections, inspecting R2 upload endpoints, or auditing OCR and client bundle security against data leakage and injection attacks.
---

# Warden Security Stress-Check Suite

A specialized, comprehensive security auditing and stress-testing protocol for **The Warden** (Next.js 16 App Router, Prisma ORM, Neon PostgreSQL, JWT Auth, Cloudflare R2, Anthropic Claude Vision OCR).

Use this skill to execute rigorous security checks across all 7 critical attack surfaces.

---

## 1. Security Stress-Testing Matrix

| Surface | Threat Vector | Verification Check | Severity |
| :--- | :--- | :--- | :---: |
| **1. Auth & Session** | Token forgery, cookie tampering, session fixation | Inspect `src/lib/auth.ts`: verify JWT signed with secret, `httpOnly: true`, `secure: true`, `sameSite: 'lax'`, `maxAge: 7 days`. Reject invalid signatures and expired tokens. | **CRITICAL** |
| **2. IDOR / Authorization** | Accessing or modifying another user's financial data | Inspect `src/app/actions.ts`: verify every query and mutation (`updateBill`, `deleteBill`, `updateTransaction`, `deleteTransaction`, `toggleBillPaid`, etc.) enforces `where: { id, userId }`. | **CRITICAL** |
| **3. Token Cryptography** | Raw token leaks in DB compromise | Inspect `src/lib/auth.ts`: Password reset tokens and auth tokens must be SHA-256 hashed prior to DB persistence (`tokenHash`). Raw tokens must only be sent in email. | **CRITICAL** |
| **4. Route Guarding** | Protected route bypass, trailing slash traversal | Inspect `src/middleware.ts` & `src/__tests__/routes.test.ts`: Unauthenticated requests to `/dashboard`, `/habits`, `/progress`, `/finance`, `/settings` must redirect to `/login`. Trailing slashes must normalize cleanly. | **HIGH** |
| **5. Object Storage / S3** | Arbitrary file upload, bucket overwrites, public leaks | Inspect `src/app/api/upload/route.ts` & `src/lib/r2.ts`: Verify authenticated session, file size cap (<= 10MB), MIME type whitelist (`image/jpeg`, `image/png`, `image/webp`), and UUID-scoped nonce keys. | **HIGH** |
| **6. OCR & External API** | Data hallucination, prompt injection, credential absence | Inspect `src/lib/billOcr.ts` & `src/__tests__/ocr.test.ts`: When `ANTHROPIC_API_KEY` is missing or OCR fails, return explicit unconfigured/error state. **Never fabricate dummy amounts, dates, or vendor names**. | **HIGH** |
| **7. Secret Leaks** | Exposing API keys or database URLs to the browser | Scan all client components (`"use client"`): Confirm no `process.env.DATABASE_URL`, `process.env.JWT_SECRET`, `process.env.ANTHROPIC_API_KEY`, or `process.env.CLOUDFLARE_R2_*` are exposed. | **CRITICAL** |

---

## 2. Step-by-Step Stress-Testing Procedure

### Test 1: IDOR & Server Action Authorization
Inspect all data operations in `src/app/actions.ts`:
```typescript
// SECURE PATTERN:
const existing = await prisma.bill.findFirst({
  where: { id: billId, userId: session.userId }
});
if (!existing) throw new Error("Bill not found or unauthorized");
```
Verify that no `prisma.*.update({ where: { id } })` exists without matching `userId`.

### Test 2: Password and Reset Token Crypto
Verify in `src/lib/auth.ts` and `src/__tests__/crypto.test.ts`:
1. Password hashing uses `bcrypt.hash(password, 10)`.
2. Password comparison uses `bcrypt.compare`.
3. Password reset token stored in DB is hashed using `crypto.createHash('sha256').update(rawToken).digest('hex')`.

### Test 3: Route Protection & Middleware
Run middleware integration tests:
```powershell
npm test -- -t "Production Middleware Integration Tests"
```
Ensure all 27 route combination tests pass, verifying anonymous vs authenticated access.

### Test 4: Presigned S3/R2 Upload Safety
Inspect `src/app/api/upload/route.ts`:
1. Rejects unauthenticated requests with HTTP 401.
2. Validates `fileType` against allowed image MIME types.
3. Generates key using random UUID prefix: `receipts/${userId}/${crypto.randomUUID()}-${cleanFileName}`.
4. Generates presigned URL with short expiry (e.g., 300 seconds).

### Test 5: Client Bundle Secret Leak Audit
Run a grep search across `src/components/` and `src/app/`:
```powershell
Select-String -Path "src\**\*.tsx" -Pattern "process\.env\.(DATABASE|JWT|ANTHROPIC|CLOUDFLARE|RESEND)"
```
Expected result: **Zero occurrences** in client components.

---

## 3. Reporting Format

Output security evaluation findings using this template:

```markdown
# Warden Security Stress-Test Audit Report

## Executive Summary
- Total Attack Surfaces Audited: 7
- Vulnerabilities Identified: [0 / N]
- Security Status: [PASS / ACTION REQUIRED]

## Detailed Surface Findings
1. Auth & Session Management: [PASS / FAIL]
2. IDOR Protection in Server Actions: [PASS / FAIL]
3. Token Cryptography & Storage: [PASS / FAIL]
4. Route Guarding & Middleware Traversal: [PASS / FAIL]
5. R2 Upload Endpoint & Key Isolation: [PASS / FAIL]
6. OCR Resilience & Zero-Hallucination: [PASS / FAIL]
7. Client-Side Secrets Isolation: [PASS / FAIL]

## Remediation Plan
[If any vulnerabilities found, provide immediate surgical patch]
```
