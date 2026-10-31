import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";

export type AuditAction =
  "create" | "update" | "delete" | "restore" | "login" | "logout" | "upload" | "security";

type Snapshot = { before?: unknown; after?: unknown };

// Dates and other values become plain JSON, so the activity log can show a field-by-field diff.
function asJson(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined || value === null) return undefined;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

// Records who did what, and when. A failed write must never undo the change it describes.
export async function audit(
  actor: string,
  action: AuditAction,
  entity: string,
  summary: string,
  entityId?: string,
  snapshot: Snapshot = {},
): Promise<void> {
  try {
    await getDb()?.auditLog.create({
      data: {
        actor,
        action,
        entity,
        entityId,
        summary,
        before: asJson(snapshot.before),
        after: asJson(snapshot.after),
      },
    });
  } catch {
    // The audit trail is best effort; the user's change already succeeded.
  }
}
