import { test, describe, before } from "node:test";
import assert from "node:assert";
import { NextRequest } from "next/server";
import { middleware } from "../middleware";
import { signToken } from "../lib/auth";

describe("Production Middleware Integration Tests", () => {
  let validSessionCookie: string;

  before(async () => {
    const token = await signToken({ userId: "test-user-id-phase-1" });
    validSessionCookie = `session=${token}`;
  });

  function createRequest(path: string, authenticated: boolean = false): NextRequest {
    const url = `http://localhost:3000${path}`;
    const headers: Record<string, string> = {};
    if (authenticated) {
      headers["cookie"] = validSessionCookie;
    }
    return new NextRequest(url, { headers });
  }

  describe("Anonymous Users", () => {
    const allowedPublicRoutes = [
      "/",
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/privacy",
      "/terms",
      "/demo",
    ];

    for (const path of allowedPublicRoutes) {
      test(`should allow unauthenticated access to ${path}`, async () => {
        const req = createRequest(path, false);
        const res = await middleware(req);
        const location = res.headers.get("location");
        assert.strictEqual(
          location,
          null,
          `Expected anonymous access to ${path} to be allowed, but redirected to ${location}`
        );
      });
    }

    const protectedRoutes = [
      "/dashboard",
      "/habits",
      "/progress",
      "/finance",
      "/settings",
    ];

    for (const path of protectedRoutes) {
      test(`should redirect unauthenticated access from ${path} to /login`, async () => {
        const req = createRequest(path, false);
        const res = await middleware(req);
        const location = res.headers.get("location");
        assert.ok(location, `Expected redirect for ${path}, but got none`);
        assert.ok(
          location.endsWith("/login"),
          `Expected ${path} to redirect to /login, but redirected to ${location}`
        );
      });
    }
  });

  describe("Authenticated Users", () => {
    const authRoutesRedirectingToDashboard = [
      "/",
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
    ];

    for (const path of authRoutesRedirectingToDashboard) {
      test(`should redirect authenticated user from ${path} to /dashboard`, async () => {
        const req = createRequest(path, true);
        const res = await middleware(req);
        const location = res.headers.get("location");
        assert.ok(location, `Expected redirect for authenticated on ${path}, but got none`);
        assert.ok(
          location.endsWith("/dashboard"),
          `Expected ${path} to redirect to /dashboard for authenticated user, but got ${location}`
        );
      });
    }

    const publicInformationalRoutesAllowed = [
      "/privacy",
      "/terms",
      "/demo",
    ];

    for (const path of publicInformationalRoutesAllowed) {
      test(`should allow authenticated user to view ${path} without redirect`, async () => {
        const req = createRequest(path, true);
        const res = await middleware(req);
        const location = res.headers.get("location");
        assert.strictEqual(
          location,
          null,
          `Expected authenticated user to access ${path} without redirect, but got ${location}`
        );
      });
    }

    const protectedAppRoutesAllowed = [
      "/dashboard",
      "/habits",
      "/progress",
      "/finance",
      "/settings",
    ];

    for (const path of protectedAppRoutesAllowed) {
      test(`should allow authenticated user to access protected app route ${path}`, async () => {
        const req = createRequest(path, true);
        const res = await middleware(req);
        const location = res.headers.get("location");
        assert.strictEqual(
          location,
          null,
          `Expected authenticated user to access ${path} without redirect, but got ${location}`
        );
      });
    }
  });

  describe("Trailing-Slash Normalization", () => {
    test("should allow anonymous user to access public route with trailing slash", async () => {
      const req = createRequest("/forgot-password/", false);
      const res = await middleware(req);
      assert.strictEqual(res.headers.get("location"), null);
    });

    test("should redirect anonymous user from protected route with trailing slash to /login", async () => {
      const req = createRequest("/habits/", false);
      const res = await middleware(req);
      const location = res.headers.get("location");
      assert.ok(location && location.endsWith("/login"));
    });

    test("should allow authenticated user to access protected route with trailing slash", async () => {
      const req = createRequest("/habits/", true);
      const res = await middleware(req);
      assert.strictEqual(res.headers.get("location"), null);
    });

    test("should redirect authenticated user from auth route with trailing slash to /dashboard", async () => {
      const req = createRequest("/login/", true);
      const res = await middleware(req);
      const location = res.headers.get("location");
      assert.ok(location && location.endsWith("/dashboard"));
    });
  });
});
