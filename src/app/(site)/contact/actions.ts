"use server";

import { getDb } from "@/lib/db";
import { sendContactEmail } from "@/lib/email";
import { requestIpHash, takeRateLimit } from "@/lib/rate-limit";
import { messageSchema, type MessageInput } from "@/lib/validation/message";

export type ContactState = {
  status: "idle" | "sent" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof MessageInput, string>>;
  values?: Partial<Record<keyof MessageInput, string>>;
};

const MESSAGES_PER_HOUR = 5;

export async function sendMessage(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    topic: String(formData.get("topic") ?? ""),
    body: String(formData.get("body") ?? ""),
  };

  // A hidden field people never see; bots that fill every input get a quiet "sent".
  if (String(formData.get("company") ?? "") !== "") return { status: "sent" };

  const parsed = messageSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: ContactState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof MessageInput;
      fieldErrors[field] ??= issue.message;
    }
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
      values,
    };
  }

  const db = getDb();
  const ipHash = await requestIpHash();
  if (!(await takeRateLimit(`contact:${ipHash}`, MESSAGES_PER_HOUR, 3_600_000))) {
    return {
      status: "error",
      message: "Too many messages from this connection. Please try again in an hour, or email me.",
      values,
    };
  }

  try {
    const record = db ? await db.message.create({ data: { ...parsed.data, ipHash } }) : null;
    const emailed = await sendContactEmail(parsed.data).catch(() => false);
    if (record && emailed) {
      await db?.message.update({ where: { id: record.id }, data: { emailSent: true } });
    }
    if (!record && !emailed) throw new Error("Nowhere to deliver the message.");
  } catch {
    return {
      status: "error",
      message: "The message could not be sent right now. Please email me directly instead.",
      values,
    };
  }

  return { status: "sent" };
}
