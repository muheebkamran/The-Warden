import { processGoogleCallback } from "@/lib/oauth";

export async function GET(req: Request) {
  return processGoogleCallback(req);
}
