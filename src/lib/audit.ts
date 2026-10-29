import "server-only";

import { getDb } from "@/lib/db";

export type AuditAction = "create" | "update" | "delete" | "login" | "logout" | "upload";

// Records who did what, and when. A failed write must never undo the change it describes.
export async function audit(
  actor: string,
  action: AuditAction,
  entity: string,
  summary: string,
  entityId?: string,
): Promise<void> {
  try {
    await getDb()?.auditLog.create({ data: { actor, action, entity, entityId, summary } });
  } catch {
    // The audit trail is best effort; the user's change already succeeded.
  }
}
