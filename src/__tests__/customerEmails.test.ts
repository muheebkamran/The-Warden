import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import {
  getAdminEmail,
  getFromEmail,
  getAppUrl,
  sendLoginWelcomeEmail,
  sendWelcomeEmail,
  sendAdminCustomerRosterNotification,
} from "../lib/email";

describe("Customer Emails & Admin Roster Telemetry", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.RESEND_API_KEY;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  test("getAdminEmail resolves default owner address when env unset", () => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.OWNER_EMAIL;
    assert.strictEqual(getAdminEmail(), "muheebkamran53@gmail.com");
  });

  test("getAdminEmail respects ADMIN_EMAIL and OWNER_EMAIL overrides", () => {
    process.env.ADMIN_EMAIL = "admin@thewarden.online";
    assert.strictEqual(getAdminEmail(), "admin@thewarden.online");

    delete process.env.ADMIN_EMAIL;
    process.env.OWNER_EMAIL = "founder@thewarden.online";
    assert.strictEqual(getAdminEmail(), "founder@thewarden.online");
  });

  test("getFromEmail returns formatted sovereign sender address", () => {
    delete process.env.EMAIL_FROM;
    assert.strictEqual(getFromEmail(), "The Warden <notifications@thewarden.online>");

    process.env.EMAIL_FROM = "The Warden <system@thewarden.online>";
    assert.strictEqual(getFromEmail(), "The Warden <system@thewarden.online>");
  });

  test("getAppUrl returns production or env fallback URL", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://thewarden.online/";
    assert.strictEqual(getAppUrl(), "https://thewarden.online");

    delete process.env.NEXT_PUBLIC_APP_URL;
    process.env.VERCEL_URL = "the-warden.vercel.app";
    assert.strictEqual(getAppUrl(), "https://the-warden.vercel.app");
  });

  test("sendLoginWelcomeEmail simulates delivery gracefully without RESEND_API_KEY", async () => {
    const success = await sendLoginWelcomeEmail("testuser@example.com", "Test Operative");
    assert.strictEqual(success, true);
  });

  test("sendLoginWelcomeEmail works when name is omitted or null", async () => {
    const success = await sendLoginWelcomeEmail("anonymous@example.com", null);
    assert.strictEqual(success, true);
  });

  test("sendWelcomeEmail backward-compatible alias functions correctly", async () => {
    const success = await sendWelcomeEmail("member@example.com", "Member");
    assert.strictEqual(success, true);
  });

  test("sendAdminCustomerRosterNotification simulates roster delivery and handles credentials login", async () => {
    const success = await sendAdminCustomerRosterNotification({
      userEmail: "operative@example.com",
      userName: "Active Operative",
      authMethod: "credentials",
      timestamp: new Date(),
    });
    assert.strictEqual(success, true);
  });

  test("sendAdminCustomerRosterNotification simulates roster delivery for Google OAuth", async () => {
    const success = await sendAdminCustomerRosterNotification({
      userEmail: "googleuser@gmail.com",
      userName: "Google User",
      authMethod: "google",
      timestamp: new Date(),
    });
    assert.strictEqual(success, true);
  });

  test("sendAdminCustomerRosterNotification simulates roster delivery for new signup", async () => {
    const success = await sendAdminCustomerRosterNotification({
      userEmail: "newcomer@example.com",
      userName: "New Recruit",
      authMethod: "signup",
      timestamp: new Date(),
    });
    assert.strictEqual(success, true);
  });
});
