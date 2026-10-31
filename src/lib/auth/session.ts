import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { getDb } from "@/lib/db";
import { requestIpHash } from "@/lib/rate-limit";

import { hashPassword, verifyPassword } from "./password";

const COOKIE_NAME = "ya_admin";
const TWO_FACTOR_COOKIE = "ya_admin_2fa";
const SESSION_DAYS = 7;
const TWO_FACTOR_MINUTES = 5;
// lastSeenAt is refreshed at most this often, so page loads do not all write to the database.
const SEEN_EVERY_MS = 5 * 60_000;

export type Admin = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  // Hash of this browser's session token, to mark "this device" in the sessions list.
  sessionHash: string;
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

export type VerifiedLogin = { id: string; totpEnabled: boolean };

// Returns the user when the email and password match an admin account, else null.
export async function verifyAdminLogin(
  email: string,
  password: string,
): Promise<VerifiedLogin | null> {
  const db = getDb();
  if (!db) return null;

  const user = await db.user.findUnique({
    where: { email: normaliseEmail(email) },
    select: { id: true, passwordHash: true, totpEnabled: true },
  });
  decoyHash ??= hashPassword(randomBytes(32).toString("base64url"));
  const passwordOk = await verifyPassword(password, user?.passwordHash ?? (await decoyHash));
  return passwordOk && user?.passwordHash ? { id: user.id, totpEnabled: user.totpEnabled } : null;
}

// Only a hash of the token is stored, so a database leak cannot be replayed as a login.
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestUserAgent(): Promise<string | null> {
  return (await headers()).get("user-agent")?.slice(0, 300) ?? null;
}

export async function createSession(userId: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("No database configured.");

  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.session.create({
    data: {
      sessionToken: hashToken(token),
      userId,
      expires,
      ipHash: await requestIpHash(),
      userAgent: await requestUserAgent(),
      lastSeenAt: new Date(),
    },
  });

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

  const sessionHash = hashToken(token);
  const session = await db.session.findUnique({
    where: { sessionToken: sessionHash },
    select: {
      expires: true,
      lastSeenAt: true,
      user: { select: { id: true, email: true, name: true, role: true, passwordHash: true } },
    },
  });
  // A session only counts while its account is still an admin, i.e. holds a password hash.
  const email = session?.user.email;
  if (!session || !email || !session.user.passwordHash || session.expires < new Date()) return null;

  if (!session.lastSeenAt || Date.now() - session.lastSeenAt.getTime() > SEEN_EVERY_MS) {
    await db.session
      .update({ where: { sessionToken: sessionHash }, data: { lastSeenAt: new Date() } })
      .catch(() => undefined);
  }
  return {
    id: session.user.id,
    email,
    name: session.user.name,
    role: session.user.role,
    sessionHash,
  };
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

// ---- Second step of a two-factor sign-in ----------------------------------------------------
// After the password is checked, a short-lived token (hash in VerificationToken) remembers who is
// halfway through signing in, until the authenticator code is entered.

export async function startTwoFactor(userId: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("No database configured.");
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + TWO_FACTOR_MINUTES * 60_000);
  await db.verificationToken.deleteMany({ where: { identifier: `2fa:${userId}` } });
  await db.verificationToken.create({
    data: { identifier: `2fa:${userId}`, token: hashToken(token), expires },
  });
  (await cookies()).set(TWO_FACTOR_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    expires,
  });
}

export async function pendingTwoFactorUser(): Promise<string | null> {
  const db = getDb();
  const token = (await cookies()).get(TWO_FACTOR_COOKIE)?.value;
  if (!db || !token) return null;
  const row = await db.verificationToken.findFirst({
    where: { token: hashToken(token), identifier: { startsWith: "2fa:" } },
  });
  if (!row || row.expires < new Date()) return null;
  return row.identifier.slice(4);
}

export async function clearTwoFactor(): Promise<void> {
  const store = await cookies();
  const token = store.get(TWO_FACTOR_COOKIE)?.value;
  if (token) {
    await getDb()
      ?.verificationToken.deleteMany({ where: { token: hashToken(token) } })
      .catch(() => undefined);
  }
  store.delete({ name: TWO_FACTOR_COOKIE, path: "/admin" });
}
