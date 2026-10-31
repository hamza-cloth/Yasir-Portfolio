import "server-only";

import { Resend } from "resend";

import { reportError } from "@/lib/monitoring";
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
  // Logged so a rejected key or sender shows up in the Vercel logs instead of failing silently.
  if (error)
    reportError(error, { where: "contact-email", name: error.name, message: error.message });
  return !error;
}

export function isAdminEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

// Replies, invitations and password resets from the admin. Returns whether Resend accepted it.
export async function sendAdminEmail({
  to,
  subject,
  text,
  replyTo,
}: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: process.env.EMAIL_FROM || FALLBACK_FROM,
      to,
      replyTo,
      subject,
      text,
    });
    if (error)
      reportError(error, { where: "admin-email", name: error.name, message: error.message });
    return !error;
  } catch (error) {
    reportError(error, { where: "admin-email" });
    return false;
  }
}
