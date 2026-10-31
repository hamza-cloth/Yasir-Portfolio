import "server-only";

import { getDb } from "@/lib/db";

export type NotificationKind =
  "message" | "lead" | "estimate" | "testimonial" | "subscriber" | "security";

// An in-app notification for the admin bell. Best effort: it never blocks the visitor's request.
export async function notify(
  kind: NotificationKind,
  title: string,
  body?: string,
  href?: string,
): Promise<void> {
  try {
    await getDb()?.notification.create({ data: { kind, title, body, href } });
  } catch {
    // A missed notification is not worth failing a form submission for.
  }
}
