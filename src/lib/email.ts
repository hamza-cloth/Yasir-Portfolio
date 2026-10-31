import "server-only";

import nodemailer from "nodemailer";
import { Resend } from "resend";

import { EMAIL_BRAND, renderEmail, type EmailOptions } from "@/lib/email-template";
import { reportError } from "@/lib/monitoring";
import { MESSAGE_TOPICS, type MessageInput } from "@/lib/validation/message";

// Two ways to send, picked by what is configured:
// - SMTP (SMTP_HOST, SMTP_USER, SMTP_PASS), e.g. Gmail with an app password: sends from that
//   mailbox to anyone, no domain needed. Wins when set.
// - Resend (RESEND_API_KEY). Without a verified domain in EMAIL_FROM, Resend's shared sender only
//   delivers to the Resend account owner, so replies to visitors would fail.
// Either way the sender shows as "Yasir Portfolio" (EMAIL_FROM_NAME changes it).

const RESEND_SHARED_ADDRESS = "onboarding@resend.dev";

function smtpConfig() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  const port = Number(process.env.SMTP_PORT) || 465;
  return {
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  };
}

// The bare address inside EMAIL_FROM, which may be "Name <address>" or just "address".
function addressOf(value: string | undefined): string | null {
  if (!value) return null;
  const match = value.match(/<([^>]+)>/);
  return (match?.[1] ?? value).trim() || null;
}

export function emailProvider(): "smtp" | "resend" | null {
  if (smtpConfig()) return "smtp";
  if (process.env.RESEND_API_KEY) return "resend";
  return null;
}

// True when mail can reach any address, not only the site owner's.
export function canEmailVisitors(): boolean {
  const provider = emailProvider();
  if (provider === "smtp") return true;
  const address = addressOf(process.env.EMAIL_FROM);
  return provider === "resend" && Boolean(address) && address !== RESEND_SHARED_ADDRESS;
}

export function isEmailConfigured(): boolean {
  return Boolean(emailProvider() && process.env.CONTACT_TO_EMAIL);
}

export function isAdminEmailConfigured(): boolean {
  return emailProvider() !== null;
}

function fromHeader(): string {
  const name = (process.env.EMAIL_FROM_NAME || EMAIL_BRAND.sender).replace(/["<>]/g, "");
  const address =
    emailProvider() === "smtp"
      ? (addressOf(process.env.EMAIL_FROM) ?? process.env.SMTP_USER)
      : (addressOf(process.env.EMAIL_FROM) ?? RESEND_SHARED_ADDRESS);
  return `"${name}" <${address}>`;
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

// The contact line under personal emails: where replies come back to, and WhatsApp.
export function emailContact() {
  return {
    email: process.env.CONTACT_TO_EMAIL || null,
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || null,
  };
}

type Mail = { to: string; subject: string; html: string; text: string; replyTo?: string };

// Sends one email and says whether the provider accepted it. Failures are logged, never thrown.
export async function sendMail(mail: Mail): Promise<boolean> {
  const provider = emailProvider();
  if (!provider) return false;
  const message = { from: fromHeader(), ...mail };
  try {
    if (provider === "smtp") {
      await nodemailer.createTransport(smtpConfig()!).sendMail(message);
      return true;
    }
    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send(message);
    if (error) reportError(error, { where: "email", name: error.name, message: error.message });
    return !error;
  } catch (error) {
    reportError(error, { where: "email", provider });
    return false;
  }
}

// Builds the branded email and sends it.
export async function sendBrandedEmail({
  to,
  subject,
  replyTo,
  ...content
}: Omit<EmailOptions, "siteUrl"> & { to: string; subject: string; replyTo?: string }) {
  const { html, text } = renderEmail({ siteUrl: siteUrl(), ...content });
  return sendMail({ to, subject, html, text, replyTo });
}

// The admin's alert for a new contact or project message; replying goes straight to the visitor.
export async function sendContactEmail(message: MessageInput): Promise<boolean> {
  const to = process.env.CONTACT_TO_EMAIL;
  if (!to) return false;
  const topic = MESSAGE_TOPICS[message.topic];
  return sendBrandedEmail({
    to,
    replyTo: message.email,
    subject: `New ${topic.toLowerCase()} message from ${message.name}`,
    preheader: message.body.slice(0, 110),
    eyebrow: `New message · ${topic}`,
    heading: `${message.name} wrote to you`,
    body: `From: ${message.name} <${message.email}>\n\n${message.body}`,
    cta: { label: "Open in the admin", href: `${siteUrl()}/admin/messages` },
    footerNote: "Reply to this email to answer them directly, or reply from the admin.",
  });
}

// Kept for the admin's simple system emails; they now go out in the branded template too.
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
  return sendBrandedEmail({
    to,
    subject,
    replyTo,
    preheader: text.slice(0, 110),
    heading: subject,
    body: text,
  });
}
