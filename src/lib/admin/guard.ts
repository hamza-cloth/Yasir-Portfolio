import "server-only";

import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

// Every admin action calls this first: it re-checks the session against the database itself,
// because a hidden button in the UI protects nothing.
export async function adminContext() {
  const admin = await requireAdmin();
  const db = getDb();
  if (!db) throw new Error("No database configured.");
  return { db, admin };
}
