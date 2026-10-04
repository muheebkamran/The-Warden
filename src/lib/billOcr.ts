import Anthropic from "@anthropic-ai/sdk";

export interface ExtractedBillData {
  billName: string;
  amount: number;
  date: string; // YYYY-MM-DD
  confidence?: "high" | "medium" | "low";
}

/**
 * Parses an image buffer or base64 using Claude's Vision API
 * Extracts bill name/vendor, total amount, and due/invoice date.
 */
export async function parseBillWithClaude(
  imageBytesOrBase64: Buffer | string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg"
): Promise<ExtractedBillData> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const todayStr = new Date().toISOString().split("T")[0];

  if (!apiKey) {
    console.warn("ANTHROPIC_API_KEY not configured. Returning fallback extraction.");
    return {
      billName: "Utility / Service Bill",
      amount: 0.0,
      date: todayStr,
      confidence: "low",
    };
  }

  const anthropic = new Anthropic({ apiKey });

  const base64Data =
    typeof imageBytesOrBase64 === "string"
      ? imageBytesOrBase64.replace(/^data:image\/\w+;base64,/, "")
      : imageBytesOrBase64.toString("base64");

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      system:
        "You are an expert OCR receipt and bill parser. Analyze the bill image and extract the vendor/bill name, the total amount due, and the date. Return ONLY valid JSON with keys: billName (string), amount (number), date (string in YYYY-MM-DD format). Do not include markdown codeblocks or explanation.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: "text",
              text: "Extract the bill name, total amount due, and date from this bill.",
            },
          ],
        },
      ],
    });

    const contentBlock = response.content[0];
    if (contentBlock && contentBlock.type === "text") {
      const text = contentBlock.text.trim();
      const cleanedJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedJson);

      return {
        billName: parsed.billName || "Unknown Bill",
        amount: typeof parsed.amount === "number" ? parsed.amount : parseFloat(parsed.amount) || 0,
        date: parsed.date || todayStr,
        confidence: "high",
      };
    }
  } catch (err) {
    console.error("Claude Vision OCR error:", err);
  }

  return {
    billName: "Utility Bill",
    amount: 0.0,
    date: todayStr,
    confidence: "low",
  };
}
