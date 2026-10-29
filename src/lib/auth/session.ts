import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getDb } from "@/lib/db";

import { hashPassword, verifyPassword } from "./password";

const COOKIE_NAME = "ya_admin";
const SESSION_DAYS = 7;

export type Admin = {
  email: string;
};

// The admin area needs a database; the admin account in it is created by the seed.
export function isAdminConfigured(): boolean {
  return Boolean(getDb());
}

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Verified when no account matches the email, so a wrong email costs the same argon2 check as a
// wrong password and the two cannot be told apart by timing.
let decoyHash: Promise<string> | null = null;

// Returns the admin's user id when the email and password match the admin account, else null.
export async function verifyAdminLogin(email: string, password: string): Promise<string | null> {
  const db = getDb();
  if (!db) return null;

  const user = await db.user.findUnique({
    where: { email: normaliseEmail(email) },
    select: { id: true, passwordHash: true },
  });
  decoyHash ??= hashPassword(randomBytes(32).toString("base64url"));
  const passwordOk = await verifyPassword(password, user?.passwordHash ?? (await decoyHash));
  return passwordOk && user?.passwordHash ? user.id : null;
}

// Only a hash of the token is stored, so a database leak cannot be replayed as a login.
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("No database configured.");

  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.session.create({ data: { sessionToken: hashToken(token), userId, expires } });

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function getAdmin(): Promise<Admin | null> {
  const db = getDb();
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!db || !token) return null;

  const session = await db.session.findUnique({
    where: { sessionToken: hashToken(token) },
    select: { expires: true, user: { select: { email: true, passwordHash: true } } },
  });
  // A session only counts while its account is still the admin, i.e. holds a password hash.
  const email = session?.user.email;
  if (!session || !email || !session.user.passwordHash || session.expires < new Date()) return null;
  return { email };
}

export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  const db = getDb();
  if (token && db) {
    await db.session.deleteMany({ where: { sessionToken: hashToken(token) } });
  }
  store.delete(COOKIE_NAME);
}
