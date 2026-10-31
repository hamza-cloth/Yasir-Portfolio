"use server";

import { deliverMessage } from "@/lib/deliver-message";
import { messageSchema, type MessageInput } from "@/lib/validation/message";

export type ContactState = {
  status: "idle" | "sent" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof MessageInput, string>>;
  values?: Partial<Record<keyof MessageInput, string>>;
};

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

  const result = await deliverMessage(parsed.data);
  if (result === "rate-limited") {
    return {
      status: "error",
      message: "Too many messages from this connection. Please try again in an hour, or email me.",
      values,
    };
  }
  if (result === "failed" || result === "not-configured") {
    return {
      status: "error",
      message: "The message could not be sent right now. Please email me directly instead.",
      values,
    };
  }

  return { status: "sent" };
}
