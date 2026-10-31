import "server-only";

import type { Prisma, PrismaClient } from "@/generated/prisma/client";

// Deleted content is kept as a full snapshot for this long, then purged.
export const TRASH_DAYS = 30;

export type TrashEntity =
  | "project"
  | "note"
  | "experience"
  | "credential"
  | "skill"
  | "message"
  | "lead"
  | "testimonial"
  | "client";

// Stores the row as it was, before the caller deletes it.
export async function moveToTrash(
  db: Prisma.TransactionClient,
  entity: TrashEntity,
  entityId: string,
  label: string,
  data: unknown,
  deletedBy: string,
): Promise<void> {
  await db.trashItem.create({
    data: {
      entity,
      entityId,
      label,
      data: JSON.parse(JSON.stringify(data)) as Prisma.InputJsonValue,
      deletedBy,
    },
  });
}

// Whole days an item has left before the purge.
export function trashDaysLeft(deletedAt: Date, now = Date.now()): number {
  return Math.max(0, TRASH_DAYS - Math.floor((now - deletedAt.getTime()) / 86_400_000));
}

export async function purgeExpiredTrash(db: PrismaClient): Promise<number> {
  const cutoff = new Date(Date.now() - TRASH_DAYS * 86_400_000);
  const { count } = await db.trashItem.deleteMany({ where: { deletedAt: { lt: cutoff } } });
  return count;
}
