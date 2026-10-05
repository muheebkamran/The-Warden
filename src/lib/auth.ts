import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";
const key = new TextEncoder().encode(SECRET);

export async function signToken(payload: { userId: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as { userId: string };
  } catch (error) {
    return null;
  }
}

export async function createSession(userId: string) {
  const token = await signToken({ userId });
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  cookieStore.delete("session");
}
