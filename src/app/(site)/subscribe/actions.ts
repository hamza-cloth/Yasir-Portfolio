"use server";

import { randomBytes } from "node:crypto";

import { getDb } from "@/lib/db";
import { sendBrandedEmail } from "@/lib/email";
import { notify } from "@/lib/notify";
import { requestIpHash, takeRateLimit } from "@/lib/rate-limit";

export type SubscribeState = { status: "idle" | "sent" | "error"; message?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

// Newsletter sign-up with double opt-in: the address is stored as pending and confirmed from the
// emailed link. The answer is the same whether or not the address was already on the list.
export async function subscribe(
  _previous: SubscribeState,
  form: FormData,
): Promise<SubscribeState> {
  // A hidden field people never see; bots that fill every input get a quiet "sent".
  if (String(form.get("website") ?? "") !== "") return { status: "sent" };

  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!EMAIL.test(email) || email.length > 200) {
    return { status: "error", message: "Enter a valid email address." };
  }
  const db = getDb();
  if (!db) return { status: "error", message: "Sign-ups are not open yet." };
  if (!(await takeRateLimit(`subscribe:${await requestIpHash()}`, 5, 3_600_000))) {
    return { status: "error", message: "Too many sign-ups from this connection. Try again later." };
  }

  try {
    const existing = await db.subscriber.findUnique({ where: { email } });
    if (existing?.status === "CONFIRMED") return { status: "sent" };
    const subscriber =
      existing ??
      (await db.subscriber.create({
        data: { email, token: randomBytes(24).toString("base64url") },
      }));
    if (!existing)
      await notify("subscriber", `New subscriber: ${email}`, undefined, "/admin/subscribers");
    await sendBrandedEmail({
      to: email,
      subject: "Confirm your subscription",
      preheader: "One click and you're on the list.",
      eyebrow: "Newsletter",
      heading: "Confirm your subscription",
      body: "Thanks for signing up for new notes and projects, about once a month.\n\nConfirm with the button below. If you didn't sign up, ignore this email and nothing happens.",
      cta: {
        label: "Confirm my subscription",
        href: `${siteUrl()}/subscribe?token=${subscriber.token}`,
      },
    });
  } catch {
    return { status: "error", message: "Signing up failed. Please try again." };
  }
  return { status: "sent" };
}

export type TokenState = { status: "idle" | "confirmed" | "unsubscribed" | "error" };

// Confirm and unsubscribe are buttons (POST), so mail scanners that open links change nothing.
export async function confirmSubscription(
  _previous: TokenState,
  form: FormData,
): Promise<TokenState> {
  const db = getDb();
  const token = String(form.get("token") ?? "");
  if (!db || !token) return { status: "error" };
  const { count } = await db.subscriber.updateMany({
    where: { token },
    data: { status: "CONFIRMED", confirmedAt: new Date() },
  });
  return { status: count ? "confirmed" : "error" };
}

export async function unsubscribe(_previous: TokenState, form: FormData): Promise<TokenState> {
  const db = getDb();
  const token = String(form.get("token") ?? "");
  if (!db || !token) return { status: "error" };
  const { count } = await db.subscriber.updateMany({
    where: { token },
    data: { status: "UNSUBSCRIBED" },
  });
  return { status: count ? "unsubscribed" : "error" };
}
