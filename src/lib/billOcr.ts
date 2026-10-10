import Anthropic from "@anthropic-ai/sdk";

export interface ExtractedBillData {
  billName: string;
  amount: number;
  date: string; // YYYY-MM-DD
  confidence?: "high" | "medium" | "low";
}

export type BillOcrResult =
  | {
      status: "success";
      data: ExtractedBillData;
    }
  | {
      status: "unconfigured";
    }
  | {
      status: "error";
      message: string;
    };

/**
 * Parses an image buffer or base64 using Claude's Vision API
 * Extracts bill name/vendor, total amount, and due/invoice date.
 */
export async function parseBillWithClaude(
  imageBytesOrBase64: Buffer | string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg"
): Promise<BillOcrResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      status: "unconfigured",
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
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(cleanedJson);
      } catch {
        return {
          status: "error",
          message: "Failed to parse OCR response as JSON",
        };
      }

      // 1. Validate billName: non-empty string after trimming
      const billName = typeof parsed?.billName === "string" ? parsed.billName.trim() : "";
      if (!billName) {
        return {
          status: "error",
          message: "OCR returned incomplete bill data",
        };
      }

      // 2. Validate amount: finite, positive number
      const parsedAmount =
        typeof parsed?.amount === "number"
          ? parsed.amount
          : typeof parsed?.amount === "string"
            ? parseFloat(parsed.amount)
            : NaN;

      if (!Number.isFinite(parsedAmount) || isNaN(parsedAmount) || parsedAmount <= 0) {
        return {
          status: "error",
          message: "OCR returned incomplete bill data",
        };
      }

      // 3. Validate date: valid date string matching YYYY-MM-DD
      const date = typeof parsed?.date === "string" ? parsed.date.trim() : "";
      const isFormatValid = /^\d{4}-\d{2}-\d{2}$/.test(date);
      const isDateValid = isFormatValid && !isNaN(Date.parse(date));
      if (!isDateValid) {
        return {
          status: "error",
          message: "OCR returned incomplete bill data",
        };
      }

      return {
        status: "success",
        data: {
          billName,
          amount: parsedAmount,
          date,
          confidence: "high",
        },
      };
    }

    return {
      status: "error",
      message: "No readable content returned from OCR service",
    };
  } catch (err) {
    console.error("Claude Vision OCR error:", err);
    return {
      status: "error",
      message: "Failed to parse bill",
    };
  }
}
