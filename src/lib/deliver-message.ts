import "server-only";

import { getSiteConfig } from "@/lib/data/site-config";
import { getDb } from "@/lib/db";
import { isEmailConfigured, sendContactEmail } from "@/lib/email";
import { notify } from "@/lib/notify";
import { requestIpHash, takeRateLimit } from "@/lib/rate-limit";
import type { MessageInput } from "@/lib/validation/message";

const MESSAGES_PER_HOUR = 5;

export type DeliveryResult = "sent" | "rate-limited" | "failed" | "not-configured";

// Stores a message (when a database is configured) and emails it (when email is configured),
// shared by the contact form and the project inquiry form. It is delivered if either worked.
export async function deliverMessage(message: MessageInput): Promise<DeliveryResult> {
  const db = getDb();
  if (!db && !isEmailConfigured()) {
    // eslint-disable-next-line no-console -- the site owner must see why messages go nowhere
    console.warn(
      "Messages are not configured: set DATABASE_URL or RESEND_API_KEY + CONTACT_TO_EMAIL.",
    );
    return "not-configured";
  }
  const ipHash = await requestIpHash();
  if (!(await takeRateLimit(`contact:${ipHash}`, MESSAGES_PER_HOUR, 3_600_000))) {
    return "rate-limited";
  }

  try {
    const record = db ? await db.message.create({ data: { ...message, ipHash } }) : null;
    if (record) {
      await notify(
        "message",
        `New message from ${message.name}`,
        message.body.slice(0, 140),
        "/admin/messages",
      );
    }
    // The admin can switch the email alerts off (Users & security); without a database the
    // email is the only copy, so it always goes.
    const prefs = record ? await getSiteConfig("notifications").catch(() => null) : null;
    const wantsEmail =
      !prefs || (message.topic === "PROJECT" ? prefs.emailOnLead : prefs.emailOnMessage);
    const emailed = wantsEmail ? await sendContactEmail(message).catch(() => false) : false;
    if (record && emailed) {
      await db?.message.update({ where: { id: record.id }, data: { emailSent: true } });
    }
    return record || emailed ? "sent" : "failed";
  } catch {
    return "failed";
  }
}
