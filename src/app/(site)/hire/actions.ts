"use server";

import { deliverMessage } from "@/lib/deliver-message";
import { inquirySchema, type InquiryField, type InquiryInput } from "@/lib/validation/inquiry";

export type InquiryState = {
  status: "idle" | "sent" | "error";
  message?: string;
  fieldErrors?: Partial<Record<InquiryField, string>>;
  values?: Partial<Record<InquiryField, string>>;
};

const FIELDS: InquiryField[] = [
  "name",
  "email",
  "phone",
  "projectType",
  "budget",
  "timeline",
  "details",
];

// The inquiry travels as an ordinary "A project" message: the extra answers lead the body, so the
// admin inbox and the email alert show them without a new database column.
function asMessageBody(inquiry: InquiryInput): string {
  return [
    `Phone / WhatsApp: ${inquiry.phone}`,
    `Project type: ${inquiry.projectType}`,
    `Budget: ${inquiry.budget ?? "Not given"}`,
    `Timeline: ${inquiry.timeline ?? "Not given"}`,
    "",
    inquiry.details,
  ].join("\n");
}

export async function sendProjectInquiry(
  _previous: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  const values = Object.fromEntries(
    FIELDS.map((field) => [field, String(formData.get(field) ?? "")]),
  ) as Record<InquiryField, string>;

  // A hidden field people never see; bots that fill every input get a quiet "sent".
  if (String(formData.get("company") ?? "") !== "") return { status: "sent" };

  const parsed = inquirySchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: InquiryState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as InquiryField;
      fieldErrors[field] ??= issue.message;
    }
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
      values,
    };
  }

  const result = await deliverMessage({
    name: parsed.data.name,
    email: parsed.data.email,
    topic: "PROJECT",
    body: asMessageBody(parsed.data),
  });

  if (result === "rate-limited") {
    return {
      status: "error",
      message: "Too many messages from this connection. Please try again in an hour.",
      values,
    };
  }
  if (result === "not-configured") {
    return {
      status: "error",
      message: "Form not configured — please contact via WhatsApp or Email.",
      values,
    };
  }
  if (result === "failed") {
    return {
      status: "error",
      message: "The inquiry could not be sent right now.",
      values,
    };
  }
  return { status: "sent" };
}
