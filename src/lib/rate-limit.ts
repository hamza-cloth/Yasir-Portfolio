import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

import { getDb } from "@/lib/db";

// Visitor IPs are never stored; only a salted hash is, which is enough to count repeat requests.
export async function requestIpHash(): Promise<string> {
  const list = await headers();
  const ip =
    list.get("x-forwarded-for")?.split(",")[0]?.trim() || list.get("x-real-ip") || "unknown";
  return createHash("sha256")
    .update(`${process.env.IP_HASH_SALT ?? ""}:${ip}`)
    .digest("hex");
}

// Records a hit and reports whether the key is still within `limit` hits per window.
export async function takeRateLimit(key: string, limit: number, windowMs: number) {
  const db = getDb();
  if (!db) return true;

  const since = new Date(Date.now() - windowMs);
  const recent = await db.rateLimitHit.count({ where: { key, createdAt: { gte: since } } });
  if (recent >= limit) return false;

  await db.rateLimitHit.create({ data: { key } });
  // Old hits are swept opportunistically so the table stays small.
  await db.rateLimitHit.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - 86_400_000) } },
  });
  return true;
}

// Forgets the hits on these keys, e.g. after a successful sign-in, so only failed attempts count.
export async function clearRateLimit(...keys: string[]): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.rateLimitHit.deleteMany({ where: { key: { in: keys } } });
}
