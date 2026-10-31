import "server-only";

import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

import { can, type Permission } from "./roles";

export class ForbiddenError extends Error {
  constructor() {
    super("Your role cannot do this.");
  }
}

// Every admin action calls this first: it re-checks the session against the database itself,
// because a hidden button in the UI protects nothing. Changes need "edit" unless stated.
export async function adminContext(permission: Permission = "edit") {
  const admin = await requireAdmin();
  if (!can(admin.role, permission)) throw new ForbiddenError();
  const db = getDb();
  if (!db) throw new Error("No database configured.");
  return { db, admin };
}

// For pages: a role without the permission is sent back to the dashboard.
export async function pageAdmin(permission: Permission = "view") {
  const admin = await requireAdmin();
  if (!can(admin.role, permission)) redirect("/admin?denied=1");
  return admin;
}
