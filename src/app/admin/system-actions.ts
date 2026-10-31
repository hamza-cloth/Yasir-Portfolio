"use server";

import { randomBytes } from "node:crypto";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import QRCode from "qrcode";

import type { FormResult } from "@/components/admin/AdminForm";
import type { Prisma } from "@/generated/prisma/client";
import { bool, optionalInt, optionalText, text } from "@/lib/admin/form-data";
import { adminContext } from "@/lib/admin/guard";
import { isRole } from "@/lib/admin/roles";
import { moveToTrash, purgeExpiredTrash, type TrashEntity } from "@/lib/admin/trash";
import { audit } from "@/lib/audit";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { hashToken, normaliseEmail } from "@/lib/auth/session";
import {
  decryptSecret,
  encryptSecret,
  generateBackupCodes,
  generateTotpSecret,
  hashBackupCode,
  isTwoFactorAvailable,
  otpauthUri,
  verifyTotp,
} from "@/lib/auth/totp";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { getDb } from "@/lib/db";
import { sendAdminEmail } from "@/lib/email";
import { reportError } from "@/lib/monitoring";
import { requestIpHash, takeRateLimit } from "@/lib/rate-limit";
import { HOME_SECTIONS, SITE_CONFIG, type SiteConfigKey } from "@/lib/site-config";
import { firstIssue } from "@/lib/validation/admin";
import { redirectSchema, testimonialSchema } from "@/lib/validation/business";

const json = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;

// ---- Trash ---------------------------------------------------------------------------------

const TRASH_TAGS: Partial<Record<TrashEntity, string>> = {
  project: CACHE_TAGS.projects,
  note: CACHE_TAGS.notes,
  experience: CACHE_TAGS.experience,
  credential: CACHE_TAGS.credentials,
  skill: CACHE_TAGS.skills,
  testimonial: CACHE_TAGS.testimonials,
};

export async function restoreFromTrash(form: FormData): Promise<void> {
  const { db, admin } = await adminContext();
  const item = await db.trashItem.findUnique({ where: { id: text(form, "id") } });
  if (!item) return;
  // The row exactly as it was (ids and dates included); Prisma reads the ISO date strings.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- one snapshot shape per model
  const data = item.data as any;
  const entity = item.entity as TrashEntity;

  try {
    await db.$transaction(async (tx) => {
      if (entity === "project") await tx.project.create({ data });
      else if (entity === "note") await tx.note.create({ data });
      else if (entity === "experience") await tx.experience.create({ data });
      else if (entity === "credential") await tx.certification.create({ data });
      else if (entity === "skill") await tx.skill.create({ data });
      else if (entity === "message") await tx.message.create({ data });
      else if (entity === "lead") await tx.lead.create({ data });
      else if (entity === "testimonial") await tx.testimonial.create({ data });
      else if (entity === "client") await tx.client.create({ data });
      else throw new Error(`Unknown entity ${entity}`);
      await tx.trashItem.delete({ where: { id: item.id } });
    });
  } catch (error) {
    reportError(error, { action: "restore", entity });
    redirect("/admin/trash?error=conflict");
  }

  await audit(admin.email, "restore", entity, item.label, item.entityId);
  const tag = TRASH_TAGS[entity];
  if (tag) updateTag(tag);
  refresh();
}

export async function deleteForever(form: FormData): Promise<void> {
  const { db, admin } = await adminContext("manage");
  const item = await db.trashItem.delete({ where: { id: text(form, "id") } });
  await audit(admin.email, "delete", "trash", `Deleted forever: ${item.label}`, item.entityId);
  refresh();
}

export async function emptyTrash(): Promise<void> {
  const { db, admin } = await adminContext("manage");
  const { count } = await db.trashItem.deleteMany({});
  await purgeExpiredTrash(db);
  await audit(admin.email, "delete", "trash", `Emptied the trash (${count} items)`);
  refresh();
}

// ---- Notifications -------------------------------------------------------------------------

export type NotificationItem = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  href: string | null;
  read: boolean;
  createdAt: string;
};

export type ShellCounts = { messages: number; leads: number; notifications: number };

// The shell's badges and bell, fetched from the browser (the shell itself is cached).
export async function getShellData(): Promise<{
  role: string;
  email: string;
  counts: ShellCounts;
  notifications: NotificationItem[];
}> {
  const { db, admin } = await adminContext("view");
  const [messages, leads, unreadNotifications, notifications] = await Promise.all([
    db.message.count({ where: { read: false, archived: false, spam: false } }),
    db.lead.count({ where: { stage: "NEW" } }),
    db.notification.count({ where: { read: false } }),
    db.notification.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
  ]);
  return {
    role: admin.role,
    email: admin.email,
    counts: { messages, leads, notifications: unreadNotifications },
    notifications: notifications.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
  };
}

export async function markNotificationsRead(): Promise<void> {
  const { db } = await adminContext("view");
  await db.notification.updateMany({ where: { read: false }, data: { read: true } });
  // Keep the bell's list short: anything read and older than 60 days goes.
  await db.notification.deleteMany({
    where: { read: true, createdAt: { lt: new Date(Date.now() - 60 * 86_400_000) } },
  });
}

// ---- Site config (appearance, announcement, maintenance, sections, notifications) -----------

async function saveConfig(key: SiteConfigKey, value: unknown): Promise<FormResult> {
  const { db, admin } = await adminContext("manage");
  const parsed = SITE_CONFIG[key].schema.safeParse(value);
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const before = await db.setting.findUnique({ where: { key } });
  await db.setting.upsert({
    where: { key },
    update: { value: json(parsed.data) },
    create: { key, value: json(parsed.data) },
  });
  await audit(admin.email, "update", "config", `Updated ${key}`, key, {
    before: before?.value,
    after: parsed.data,
  });
  updateTag(CACHE_TAGS.config);
  refresh();
  return { ok: "Saved. The live site is updated." };
}

export async function saveAppearance(_previous: FormResult, form: FormData): Promise<FormResult> {
  return saveConfig("appearance", {
    watermark: bool(form, "watermark"),
    watermarkOpacity: optionalInt(form, "watermarkOpacity") ?? 50,
    motion: text(form, "motion") || "full",
  });
}

export async function saveAnnouncement(_previous: FormResult, form: FormData): Promise<FormResult> {
  return saveConfig("announcement", {
    enabled: bool(form, "enabled"),
    text: text(form, "text"),
    href: text(form, "href"),
  });
}

export async function saveMaintenance(_previous: FormResult, form: FormData): Promise<FormResult> {
  return saveConfig("maintenance", {
    enabled: bool(form, "enabled"),
    message: text(form, "message"),
  });
}

export async function saveSections(_previous: FormResult, form: FormData): Promise<FormResult> {
  // Each section has an order field and a visible checkbox.
  const ordered = HOME_SECTIONS.map((section, index) => ({
    id: section.id,
    order: optionalInt(form, `order-${section.id}`) ?? index,
    visible: bool(form, `visible-${section.id}`),
  }))
    .filter((section) => section.visible)
    .sort((a, b) => a.order - b.order)
    .map((section) => section.id);
  return saveConfig("sections", { home: ordered });
}

export async function saveNotificationPrefs(
  _previous: FormResult,
  form: FormData,
): Promise<FormResult> {
  return saveConfig("notifications", {
    emailOnLead: bool(form, "emailOnLead"),
    emailOnMessage: bool(form, "emailOnMessage"),
  });
}

// ---- Testimonials --------------------------------------------------------------------------

export async function saveTestimonial(
  id: string | null,
  _previous: FormResult,
  form: FormData,
): Promise<FormResult> {
  const { db, admin } = await adminContext();
  const parsed = testimonialSchema.safeParse({
    name: text(form, "name"),
    role: optionalText(form, "role"),
    company: optionalText(form, "company"),
    quote: text(form, "quote").replace(/\r\n/g, "\n"),
    rating: optionalInt(form, "rating"),
    status: text(form, "status") || "PENDING",
    order: optionalInt(form, "order") ?? 0,
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  if (id) {
    const before = await db.testimonial.findUnique({ where: { id } });
    const after = await db.testimonial.update({ where: { id }, data: parsed.data });
    await audit(admin.email, "update", "testimonial", after.name, id, { before, after });
  } else {
    const created = await db.testimonial.create({ data: parsed.data });
    await audit(admin.email, "create", "testimonial", created.name, created.id);
  }
  updateTag(CACHE_TAGS.testimonials);
  if (!id) redirect("/admin/testimonials");
  refresh();
  return { ok: "Testimonial saved." };
}

export async function setTestimonialStatus(form: FormData): Promise<void> {
  const { db, admin } = await adminContext();
  const status = text(form, "status");
  if (!["PENDING", "APPROVED", "HIDDEN"].includes(status)) return;
  const row = await db.testimonial.update({ where: { id: text(form, "id") }, data: { status } });
  await audit(admin.email, "update", "testimonial", `${row.name} → ${status}`, row.id);
  updateTag(CACHE_TAGS.testimonials);
  refresh();
}

export async function deleteTestimonial(form: FormData): Promise<void> {
  const { db, admin } = await adminContext();
  const removed = await db.$transaction(async (tx) => {
    const row = await tx.testimonial.delete({ where: { id: text(form, "id") } });
    await moveToTrash(tx, "testimonial", row.id, row.name, row, admin.email);
    return row;
  });
  await audit(admin.email, "delete", "testimonial", removed.name, removed.id, { before: removed });
  updateTag(CACHE_TAGS.testimonials);
  redirect("/admin/testimonials");
}

// ---- Redirects -----------------------------------------------------------------------------

export async function addRedirect(_previous: FormResult, form: FormData): Promise<FormResult> {
  const { db, admin } = await adminContext("manage");
  const parsed = redirectSchema.safeParse({
    from: text(form, "from").replace(/\/+$/, "") || "/",
    to: text(form, "to"),
    permanent: bool(form, "permanent"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  if (parsed.data.from === parsed.data.to) return { error: "A redirect cannot point to itself." };
  try {
    await db.redirect.create({ data: parsed.data });
  } catch {
    return { error: "That path already redirects somewhere. Delete it first." };
  }
  await audit(admin.email, "create", "redirect", `${parsed.data.from} → ${parsed.data.to}`);
  updateTag(CACHE_TAGS.redirects);
  refresh();
  return { ok: "Redirect added." };
}

export async function deleteRedirect(form: FormData): Promise<void> {
  const { db, admin } = await adminContext("manage");
  const removed = await db.redirect.delete({ where: { id: text(form, "id") } });
  await audit(admin.email, "delete", "redirect", `${removed.from} → ${removed.to}`);
  updateTag(CACHE_TAGS.redirects);
  refresh();
}

// ---- Subscribers ---------------------------------------------------------------------------

export async function deleteSubscriber(form: FormData): Promise<void> {
  const { db, admin } = await adminContext();
  const removed = await db.subscriber.delete({ where: { id: text(form, "id") } });
  await audit(admin.email, "delete", "subscriber", removed.email);
  refresh();
}

// ---- Messages: labels and replies -----------------------------------------------------------

export async function setMessageLabels(form: FormData): Promise<void> {
  const { db, admin } = await adminContext();
  const labels = [
    ...new Set(
      text(form, "labels")
        .split(",")
        .map((label) => label.trim().toLowerCase().slice(0, 24))
        .filter(Boolean),
    ),
  ].slice(0, 8);
  const message = await db.message.update({
    where: { id: text(form, "id") },
    data: { labels },
    select: { id: true, name: true },
  });
  await audit(
    admin.email,
    "update",
    "message",
    `Labels for ${message.name}: ${labels.join(", ") || "none"}`,
    message.id,
  );
  refresh();
}

export async function replyToMessage(
  id: string,
  _previous: FormResult,
  form: FormData,
): Promise<FormResult> {
  const { db, admin } = await adminContext();
  const message = await db.message.findUnique({ where: { id } });
  if (!message) return { error: "That message no longer exists." };
  const subject = text(form, "subject").slice(0, 160) || "Re: your message";
  const body = text(form, "body").replace(/\r\n/g, "\n");
  if (body.length < 2) return { error: "Write a reply first." };
  if (body.length > 8000) return { error: "Keep the reply under 8,000 characters." };

  const sent = await sendAdminEmail({
    to: message.email,
    subject,
    text: body,
    replyTo: admin.email,
  });
  if (!sent) {
    return {
      error: "Email is not configured (RESEND_API_KEY), or the send failed. Nothing was sent.",
    };
  }
  await db.message.update({ where: { id }, data: { read: true } });
  await audit(admin.email, "update", "message", `Replied to ${message.name}`, id);
  refresh();
  return { ok: `Reply sent to ${message.email}.` };
}

// ---- Security: password, two-factor, sessions ------------------------------------------------

export async function changePassword(_previous: FormResult, form: FormData): Promise<FormResult> {
  const { db, admin } = await adminContext("view");
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  if (next.length < 12) return { error: "Use at least 12 characters for the new password." };
  if (next !== String(form.get("confirm") ?? ""))
    return { error: "The new passwords do not match." };

  const user = await db.user.findUnique({
    where: { id: admin.id },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash || !(await verifyPassword(current, user.passwordHash))) {
    return { error: "The current password is not right." };
  }
  await db.user.update({
    where: { id: admin.id },
    data: { passwordHash: await hashPassword(next) },
  });
  // Every other device has to sign in again with the new password.
  await db.session.deleteMany({
    where: { userId: admin.id, sessionToken: { not: admin.sessionHash } },
  });
  await audit(admin.email, "security", "user", "Changed the password", admin.id);
  refresh();
  return { ok: "Password changed. Other devices were signed out." };
}

export type TwoFactorSetup = FormResult & { secret?: string; qr?: string };

// Step 1: a new secret, stored encrypted but not yet switched on.
export async function startTwoFactorSetup(): Promise<TwoFactorSetup> {
  const { db, admin } = await adminContext("view");
  if (!isTwoFactorAvailable())
    return { error: "Add ADMIN_ENCRYPTION_KEY to the environment first." };
  const secret = generateTotpSecret();
  await db.user.update({
    where: { id: admin.id },
    data: { totpSecret: encryptSecret(secret), totpEnabled: false },
  });
  // The QR code is drawn here, so the browser never loads a QR library.
  const qr = await QRCode.toDataURL(otpauthUri(secret, admin.email), { margin: 1, width: 220 });
  return { secret, qr };
}

export type BackupCodesResult = FormResult & { codes?: string[] };

// Step 2: the first code from the app proves it is set up; backup codes are shown once.
export async function confirmTwoFactor(
  _previous: BackupCodesResult,
  form: FormData,
): Promise<BackupCodesResult> {
  const { db, admin } = await adminContext("view");
  const user = await db.user.findUnique({ where: { id: admin.id }, select: { totpSecret: true } });
  const secret = user?.totpSecret ? decryptSecret(user.totpSecret) : null;
  if (!secret) return { error: "Start the setup again." };
  if (!verifyTotp(secret, text(form, "code"))) {
    return { error: "That code is not right. Check the time on your phone and try again." };
  }
  const codes = generateBackupCodes();
  await db.user.update({
    where: { id: admin.id },
    data: { totpEnabled: true, backupCodes: codes.map(hashBackupCode) },
  });
  await audit(admin.email, "security", "user", "Turned on two-factor sign-in", admin.id);
  return { ok: "Two-factor is on.", codes };
}

export async function regenerateBackupCodes(
  _previous: BackupCodesResult,
  form: FormData,
): Promise<BackupCodesResult> {
  const { db, admin } = await adminContext("view");
  const user = await db.user.findUnique({
    where: { id: admin.id },
    select: { totpSecret: true, totpEnabled: true },
  });
  const secret = user?.totpSecret ? decryptSecret(user.totpSecret) : null;
  if (!user?.totpEnabled || !secret) return { error: "Two-factor is not on." };
  if (!verifyTotp(secret, text(form, "code"))) return { error: "That code is not right." };
  const codes = generateBackupCodes();
  await db.user.update({
    where: { id: admin.id },
    data: { backupCodes: codes.map(hashBackupCode) },
  });
  await audit(admin.email, "security", "user", "New backup codes", admin.id);
  return { ok: "New backup codes. The old ones no longer work.", codes };
}

export async function disableTwoFactor(_previous: FormResult, form: FormData): Promise<FormResult> {
  const { db, admin } = await adminContext("view");
  const user = await db.user.findUnique({ where: { id: admin.id }, select: { totpSecret: true } });
  const secret = user?.totpSecret ? decryptSecret(user.totpSecret) : null;
  if (!secret || !verifyTotp(secret, text(form, "code"))) {
    return { error: "Enter a current code from your authenticator app to turn it off." };
  }
  await db.user.update({
    where: { id: admin.id },
    data: { totpEnabled: false, totpSecret: null, backupCodes: [] },
  });
  await audit(admin.email, "security", "user", "Turned off two-factor sign-in", admin.id);
  refresh();
  return { ok: "Two-factor is off." };
}

export async function revokeSession(form: FormData): Promise<void> {
  const { db, admin } = await adminContext("view");
  const token = text(form, "token");
  if (token === admin.sessionHash) return;
  // Only the admin's own sessions, unless an owner signs out someone else's.
  await db.session.deleteMany({
    where: { sessionToken: token, ...(admin.role === "OWNER" ? {} : { userId: admin.id }) },
  });
  await audit(admin.email, "security", "session", "Signed out a device");
  refresh();
}

export async function revokeOtherSessions(): Promise<void> {
  const { db, admin } = await adminContext("view");
  const { count } = await db.session.deleteMany({
    where: { userId: admin.id, sessionToken: { not: admin.sessionHash } },
  });
  await audit(admin.email, "security", "session", `Signed out everywhere else (${count})`);
  refresh();
}

// ---- Users and invitations -------------------------------------------------------------------

const INVITE_DAYS = 7;

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export type InviteResult = FormResult & { link?: string };

export async function inviteUser(_previous: InviteResult, form: FormData): Promise<InviteResult> {
  const { db, admin } = await adminContext("manage");
  const email = normaliseEmail(text(form, "email"));
  const role = text(form, "role");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email." };
  if (!isRole(role) || role === "OWNER") return { error: "Invite as an Editor or a Viewer." };
  if (await db.user.findFirst({ where: { email, passwordHash: { not: null } } })) {
    return { error: "That person already has an admin account." };
  }

  const token = randomBytes(32).toString("base64url");
  await db.invite.deleteMany({ where: { email, acceptedAt: null } });
  await db.invite.create({
    data: {
      email,
      role,
      tokenHash: hashToken(token),
      expires: new Date(Date.now() + INVITE_DAYS * 86_400_000),
      createdBy: admin.email,
    },
  });
  const link = `${siteUrl()}/admin/login/invite?token=${token}`;
  const emailed = await sendAdminEmail({
    to: email,
    subject: "You're invited to the portfolio admin",
    text: `${admin.email} invited you as ${role.toLowerCase()}.\n\nSet your password here (valid ${INVITE_DAYS} days):\n${link}`,
  });
  await audit(admin.email, "security", "user", `Invited ${email} as ${role}`);
  refresh();
  return {
    ok: emailed
      ? `Invitation emailed to ${email}.`
      : "Invitation created. Email is off, so send this link yourself:",
    link: emailed ? undefined : link,
  };
}

export async function setUserRole(form: FormData): Promise<void> {
  const { db, admin } = await adminContext("manage");
  const id = text(form, "id");
  const role = text(form, "role");
  if (!isRole(role) || id === admin.id) return;
  const user = await db.user.update({ where: { id }, data: { role }, select: { email: true } });
  await audit(admin.email, "security", "user", `${user.email} is now ${role}`, id);
  refresh();
}

export async function removeUser(form: FormData): Promise<void> {
  const { db, admin } = await adminContext("manage");
  const id = text(form, "id");
  if (id === admin.id) return;
  const owners = await db.user.count({ where: { role: "OWNER", passwordHash: { not: null } } });
  const user = await db.user.findUnique({ where: { id }, select: { email: true, role: true } });
  if (!user || (user.role === "OWNER" && owners <= 1)) return;
  // Taking the password away ends admin access; sessions go too.
  await db.user.update({ where: { id }, data: { passwordHash: null, role: "VIEWER" } });
  await db.session.deleteMany({ where: { userId: id } });
  await audit(admin.email, "security", "user", `Removed ${user.email}`, id);
  refresh();
}

export async function revokeInvite(form: FormData): Promise<void> {
  const { db, admin } = await adminContext("manage");
  const invite = await db.invite.delete({ where: { id: text(form, "id") } });
  await audit(admin.email, "security", "user", `Cancelled the invite for ${invite.email}`);
  refresh();
}

// ---- Public: accept an invite, reset a forgotten password -----------------------------------

async function setPasswordFromForm(form: FormData): Promise<string | { error: string }> {
  const password = String(form.get("password") ?? "");
  if (password.length < 12) return { error: "Use at least 12 characters." };
  if (password !== String(form.get("confirm") ?? ""))
    return { error: "The passwords do not match." };
  return hashPassword(password);
}

export async function acceptInvite(_previous: FormResult, form: FormData): Promise<FormResult> {
  const db = getDb();
  if (!db) return { error: "The admin area is not configured." };
  const invite = await db.invite.findUnique({
    where: { tokenHash: hashToken(text(form, "token")) },
  });
  if (!invite || invite.acceptedAt || invite.expires < new Date()) {
    return { error: "This invitation has expired or was already used. Ask for a new one." };
  }
  const hashed = await setPasswordFromForm(form);
  if (typeof hashed !== "string") return hashed;
  const name = text(form, "name").slice(0, 80) || null;

  await db.user.upsert({
    where: { email: invite.email },
    update: { passwordHash: hashed, role: invite.role, name },
    create: { email: invite.email, passwordHash: hashed, role: invite.role, name },
  });
  await db.invite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });
  await audit(invite.email, "security", "user", `Accepted the invite (${invite.role})`);
  redirect("/admin/login?welcome=1");
}

const RESET_MINUTES = 30;

// Always answers the same, so the form never reveals which emails have accounts.
export async function requestPasswordReset(
  _previous: FormResult,
  form: FormData,
): Promise<FormResult> {
  const done = { ok: "If that email has an admin account, a reset link is on its way." };
  const db = getDb();
  if (!db) return done;
  const email = normaliseEmail(text(form, "email"));
  if (!(await takeRateLimit(`reset:${await requestIpHash()}`, 3, 60 * 60_000))) {
    return { error: "Too many requests. Try again in an hour." };
  }
  const user = await db.user.findFirst({ where: { email, passwordHash: { not: null } } });
  if (!user) return done;

  const token = randomBytes(32).toString("base64url");
  await db.verificationToken.deleteMany({ where: { identifier: `reset:${user.id}` } });
  await db.verificationToken.create({
    data: {
      identifier: `reset:${user.id}`,
      token: hashToken(token),
      expires: new Date(Date.now() + RESET_MINUTES * 60_000),
    },
  });
  await sendAdminEmail({
    to: email,
    subject: "Reset your portfolio admin password",
    text: `Someone asked to reset the admin password for ${email}.\n\nChoose a new one here (valid ${RESET_MINUTES} minutes):\n${siteUrl()}/admin/login/reset?token=${token}\n\nIf it wasn't you, ignore this email.`,
  });
  await audit(email, "security", "user", "Asked for a password reset", user.id);
  return done;
}

export async function resetPassword(_previous: FormResult, form: FormData): Promise<FormResult> {
  const db = getDb();
  if (!db) return { error: "The admin area is not configured." };
  const row = await db.verificationToken.findFirst({
    where: { token: hashToken(text(form, "token")), identifier: { startsWith: "reset:" } },
  });
  if (!row || row.expires < new Date())
    return { error: "This link has expired. Ask for a new one." };
  const hashed = await setPasswordFromForm(form);
  if (typeof hashed !== "string") return hashed;

  const userId = row.identifier.slice("reset:".length);
  const user = await db.user.update({ where: { id: userId }, data: { passwordHash: hashed } });
  await db.verificationToken.deleteMany({ where: { identifier: row.identifier } });
  await db.session.deleteMany({ where: { userId } });
  await audit(user.email ?? userId, "security", "user", "Reset the password", userId);
  redirect("/admin/login?reset=1");
}
