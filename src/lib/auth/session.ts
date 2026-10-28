import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getDb } from "@/lib/db";

const COOKIE_NAME = "ya_admin";
const SESSION_DAYS = 7;

export type Admin = {
  email: string;
};

function adminEmail(): string | null {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() || null;
}

// The admin area needs a database, the allowed email and a password hash.
export function isAdminConfigured(): boolean {
  return Boolean(getDb() && adminEmail() && process.env.ADMIN_PASSWORD_HASH);
}

export function isAdminEmail(email: string): boolean {
  return email.trim().toLowerCase() === adminEmail();
}

// Only a hash of the token is stored, so a database leak cannot be replayed as a login.
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(email: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("No database configured.");

  const normalized = email.trim().toLowerCase();
  const user = await db.user.upsert({
    where: { email: normalized },
    update: {},
    create: { email: normalized, name: "Admin" },
  });

  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.session.create({ data: { sessionToken: hashToken(token), userId: user.id, expires } });

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
    select: { expires: true, user: { select: { email: true } } },
  });
  const email = session?.user.email;
  if (!session || !email || session.expires < new Date() || !isAdminEmail(email)) return null;
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
