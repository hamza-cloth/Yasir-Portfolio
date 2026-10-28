import "server-only";

import { Resend } from "resend";

import { MESSAGE_TOPICS, type MessageInput } from "@/lib/validation/message";

// Resend's shared sender works without a verified domain, but only delivers to the account owner.
const FALLBACK_FROM = "Portfolio <onboarding@resend.dev>";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL);
}

// Returns whether the email was accepted; a failure never loses the message, which is already stored.
export async function sendContactEmail(message: MessageInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) return false;

  const { error } = await new Resend(apiKey).emails.send({
    from: process.env.EMAIL_FROM || FALLBACK_FROM,
    to,
    replyTo: message.email,
    subject: `Portfolio: ${MESSAGE_TOPICS[message.topic]} from ${message.name}`,
    text: [
      `From: ${message.name} <${message.email}>`,
      `Topic: ${MESSAGE_TOPICS[message.topic]}`,
      "",
      message.body,
    ].join("\n"),
  });
  return !error;
}
