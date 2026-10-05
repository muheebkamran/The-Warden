import { test, describe } from "node:test";
import assert from "node:assert";
import { hashPassword, verifyPassword, generateResetToken, isTokenExpired } from "../lib/password";

describe("Password and Token Utilities", () => {
  test("should hash and verify passwords correctly", async () => {
    const raw = "SuperSecret123!";
    const hash = await hashPassword(raw);
    assert.notStrictEqual(hash, raw);
    assert.ok(hash.startsWith("$2"));

    const isValid = await verifyPassword(raw, hash);
    assert.strictEqual(isValid, true);

    const isInvalid = await verifyPassword("WrongPassword", hash);
    assert.strictEqual(isInvalid, false);
  });

  test("should generate valid 64-char hex reset token with 1-hour expiry", () => {
    const { token, expiry } = generateResetToken();
    assert.strictEqual(typeof token, "string");
    assert.strictEqual(token.length, 64);

    const now = Date.now();
    const expiryMs = expiry.getTime();
    // Expiry should be approx 1 hour in the future (+- 5 seconds)
    const diffMs = expiryMs - now;
    assert.ok(diffMs > 59 * 60 * 1000 && diffMs <= 60 * 60 * 1000);
  });

  test("should correctly detect expired and unexpired tokens", () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 30); // 30 mins future
    const pastDate = new Date(Date.now() - 1000 * 60); // 1 min past

    assert.strictEqual(isTokenExpired(futureDate), false);
    assert.strictEqual(isTokenExpired(pastDate), true);
    assert.strictEqual(isTokenExpired(null), true);
    assert.strictEqual(isTokenExpired(undefined), true);
  });
});
