import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db, ensureDatabase } from "@/lib/server/db";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "change-this-in-production",
);

export const authCookieName = "sayarty-admin-session";

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(authCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(authCookieName);
}

export async function getCurrentUser() {
  await ensureDatabase();

  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieName)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await jwtVerify(token, secret);
    const userId = String(payload.payload.userId ?? "");

    if (!userId) {
      return null;
    }

    const user = await db
      .selectFrom("users")
      .select(["id", "email", "name"])
      .where("id", "=", userId)
      .executeTakeFirst();

    return user ?? null;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}

export async function verifyLogin(email: string, password: string) {
  await ensureDatabase();

  const user = await db
    .selectFrom("users")
    .selectAll()
    .where("email", "=", email)
    .executeTakeFirst();

  if (!user) {
    return null;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  return valid ? user : null;
}
