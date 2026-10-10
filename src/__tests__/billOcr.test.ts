import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import Anthropic from "@anthropic-ai/sdk";
import { parseBillWithClaude } from "../lib/billOcr";

describe("Bill OCR Engine & Contract", () => {
  const originalKey = process.env.ANTHROPIC_API_KEY;
  const sampleClient = new Anthropic({ apiKey: "test-init-key" });
  const messagesProto = Object.getPrototypeOf(sampleClient.messages);
  const originalCreate = messagesProto.create as unknown;

  beforeEach(() => {
    messagesProto.create = originalCreate;
  });

  afterEach(() => {
    messagesProto.create = originalCreate;
    if (originalKey !== undefined) {
      process.env.ANTHROPIC_API_KEY = originalKey;
    } else {
      delete process.env.ANTHROPIC_API_KEY;
    }
  });

  test("Missing API key returns unconfigured without fake data", async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const result = await parseBillWithClaude("mock-image-base64");

    assert.strictEqual(result.status, "unconfigured");
    assert.strictEqual("data" in result, false);
    // Guarantee no fabricated values exist
    assert.strictEqual("billName" in result, false);
    assert.strictEqual("amount" in result, false);
    assert.strictEqual("date" in result, false);
  });

  test("Successful OCR returns success with extracted data", async () => {
    process.env.ANTHROPIC_API_KEY = "test-anthropic-key";

    messagesProto.create = (async () => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              billName: "City Power & Light",
              amount: 142.75,
              date: "2026-10-15",
            }),
          },
        ],
      };
    }) as unknown as typeof messagesProto.create;

    const result = await parseBillWithClaude("valid-base64-content");

    assert.strictEqual(result.status, "success");
    if (result.status === "success") {
      assert.strictEqual(result.data.billName, "City Power & Light");
      assert.strictEqual(result.data.amount, 142.75);
      assert.strictEqual(result.data.date, "2026-10-15");
      assert.strictEqual(result.data.confidence, "high");
    }
  });

  test("OCR service error returns error status without fabricating data", async () => {
    process.env.ANTHROPIC_API_KEY = "test-anthropic-key";

    messagesProto.create = (async () => {
      throw new Error("Anthropic API rate limit exceeded");
    }) as unknown as typeof messagesProto.create;

    const result = await parseBillWithClaude("valid-base64-content");

    assert.strictEqual(result.status, "error");
    if (result.status === "error") {
      assert.strictEqual(result.message, "Failed to parse bill");
    }
    // Must never return fake bill data on error
    assert.strictEqual("data" in result, false);
    assert.strictEqual("billName" in result, false);
    assert.strictEqual("amount" in result, false);
  });

  test("Unreadable response content returns error status", async () => {
    process.env.ANTHROPIC_API_KEY = "test-anthropic-key";

    messagesProto.create = (async () => {
      return {
        content: [],
      };
    }) as unknown as typeof messagesProto.create;

    const result = await parseBillWithClaude("valid-base64-content");

    assert.strictEqual(result.status, "error");
    assert.strictEqual("data" in result, false);
  });

  test("Test A — Missing bill name returns error without fabricating Unknown Bill", async () => {
    process.env.ANTHROPIC_API_KEY = "test-anthropic-key";

    messagesProto.create = (async () => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              amount: 142.75,
              date: "2026-10-15",
            }),
          },
        ],
      };
    }) as unknown as typeof messagesProto.create;

    const result = await parseBillWithClaude("valid-base64-content");

    assert.strictEqual(result.status, "error");
    assert.strictEqual("data" in result, false);
  });

  test("Test B — Missing amount returns error without converting to zero", async () => {
    process.env.ANTHROPIC_API_KEY = "test-anthropic-key";

    messagesProto.create = (async () => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              billName: "City Power & Light",
              date: "2026-10-15",
            }),
          },
        ],
      };
    }) as unknown as typeof messagesProto.create;

    const result = await parseBillWithClaude("valid-base64-content");

    assert.strictEqual(result.status, "error");
    assert.strictEqual("data" in result, false);
  });

  test("Test C — Missing date returns error without substituting today's date", async () => {
    process.env.ANTHROPIC_API_KEY = "test-anthropic-key";

    messagesProto.create = (async () => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              billName: "City Power & Light",
              amount: 142.75,
            }),
          },
        ],
      };
    }) as unknown as typeof messagesProto.create;

    const result = await parseBillWithClaude("valid-base64-content");

    assert.strictEqual(result.status, "error");
    assert.strictEqual("data" in result, false);
  });

  test("Test D — Invalid amount returns error without converting to zero", async () => {
    process.env.ANTHROPIC_API_KEY = "test-anthropic-key";

    messagesProto.create = (async () => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              billName: "City Power & Light",
              amount: "not-a-number",
              date: "2026-10-15",
            }),
          },
        ],
      };
    }) as unknown as typeof messagesProto.create;

    const result = await parseBillWithClaude("valid-base64-content");

    assert.strictEqual(result.status, "error");
    assert.strictEqual("data" in result, false);
  });

  test("Test E — Empty bill name returns error", async () => {
    process.env.ANTHROPIC_API_KEY = "test-anthropic-key";

    messagesProto.create = (async () => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              billName: "",
              amount: 142.75,
              date: "2026-10-15",
            }),
          },
        ],
      };
    }) as unknown as typeof messagesProto.create;

    const result = await parseBillWithClaude("valid-base64-content");

    assert.strictEqual(result.status, "error");
    assert.strictEqual("data" in result, false);
  });
});
