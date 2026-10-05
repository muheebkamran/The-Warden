import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateResetToken(): { token: string; expiry: Date } {
  const token = crypto.randomBytes(32).toString("hex");
  // 1-hour expiration
  const expiry = new Date(Date.now() + 60 * 60 * 1000);
  return { token, expiry };
}

export function isTokenExpired(expiry: Date | null | undefined): boolean {
  if (!expiry) return true;
  return new Date() > new Date(expiry);
}
