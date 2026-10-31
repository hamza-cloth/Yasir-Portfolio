"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import type { FormResult } from "@/components/admin/AdminForm";
import {
  bool,
  lines,
  list,
  optionalDate,
  optionalInt,
  optionalText,
  pairs,
  text,
} from "@/lib/admin/form-data";
import { adminContext } from "@/lib/admin/guard";
import { moveToTrash } from "@/lib/admin/trash";
import { audit } from "@/lib/audit";
import {
  clearTwoFactor,
  createSession,
  destroySession,
  isAdminConfigured,
  normaliseEmail,
  pendingTwoFactorUser,
  requestUserAgent,
  requireAdmin,
  startTwoFactor,
  verifyAdminLogin,
} from "@/lib/auth/session";
import { decryptSecret, hashBackupCode, verifyTotp } from "@/lib/auth/totp";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { getDb } from "@/lib/db";
import { isLook, isLookMode, LOOKS, type Look } from "@/lib/look";
import { reportError } from "@/lib/monitoring";
import { clearRateLimit, requestIpHash, takeRateLimit } from "@/lib/rate-limit";
import {
  credentialSchema,
  experienceSchema,
  firstIssue,
  noteSchema,
  projectSchema,
  settingsSchema,
  skillSchema,
} from "@/lib/validation/admin";

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

function saveFailed(error: unknown): FormResult {
  if (isUniqueViolation(error)) return { error: "That slug is already used. Pick another." };
  return { error: "Saving failed. Please try again." };
}

// ---- Session -------------------------------------------------------------------------------

export async function login(_previous: FormResult, form: FormData): Promise<FormResult> {
  if (!isAdminConfigured()) return { error: "The admin area is not configured yet." };

  const email = normaliseEmail(text(form, "email"));
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };
  let needsCode = false;

  // A database failure stays on the form as a message instead of the admin error page.
  try {
    // 5 failed attempts per 15 minutes, counted per connection and per account.
    const window = 15 * 60_000;
    const ipKey = `login:${await requestIpHash()}`;
    const accountKey = `login-account:${email}`;
    const ipOk = await takeRateLimit(ipKey, 5, window);
    const accountOk = await takeRateLimit(accountKey, 5, window);
    if (!ipOk || !accountOk) return { error: "Too many attempts. Wait 15 minutes and try again." };

    const user = await verifyAdminLogin(email, password);
    // One message for a wrong email and a wrong password, so neither is confirmed.
    if (!user) {
      await recordLogin(email, false, "Wrong email or password");
      return { error: "Wrong email or password." };
    }

    // A successful sign-in clears both counters, so signing in often never locks the admin out.
    await clearRateLimit(ipKey, accountKey);
    if (user.totpEnabled) {
      await startTwoFactor(user.id);
      needsCode = true;
    } else {
      await createSession(user.id);
      await recordLogin(email, true);
      await audit(email, "login", "session", "Signed in");
    }
  } catch (error) {
    reportError(error, { action: "login" });
    return { error: "The sign-in service is not reachable right now. Try again in a minute." };
  }
  // Outside the try: redirect() works by throwing, and must not be caught above.
  redirect(needsCode ? "/admin/login/verify" : "/admin");
}

// Every sign-in attempt, for the login history on the security page.
async function recordLogin(email: string, success: boolean, reason?: string): Promise<void> {
  try {
    await getDb()?.loginEvent.create({
      data: {
        email,
        success,
        reason,
        ipHash: await requestIpHash(),
        userAgent: await requestUserAgent(),
      },
    });
  } catch {
    // History is best effort.
  }
}

// Second step of a two-factor sign-in: a 6-digit authenticator code or one backup code.
export async function verifyTwoFactor(_previous: FormResult, form: FormData): Promise<FormResult> {
  const code = text(form, "code").replace(/\s/g, "");
  if (!code) return { error: "Enter the 6-digit code from your authenticator app." };

  let email = "";
  try {
    const db = getDb();
    const userId = await pendingTwoFactorUser();
    if (!db || !userId) return { error: "This sign-in expired. Start again with your password." };

    const ipKey = `2fa:${await requestIpHash()}`;
    if (!(await takeRateLimit(ipKey, 5, 15 * 60_000))) {
      return { error: "Too many codes tried. Wait 15 minutes and try again." };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, totpSecret: true, backupCodes: true },
    });
    const secret = user?.totpSecret ? decryptSecret(user.totpSecret) : null;
    if (!user?.email || !secret) return { error: "Two-factor is not set up for this account." };
    email = user.email;

    let ok = verifyTotp(secret, code);
    if (!ok) {
      const hashed = hashBackupCode(code);
      if (user.backupCodes.includes(hashed)) {
        ok = true;
        // A backup code works once.
        await db.user.update({
          where: { id: userId },
          data: { backupCodes: user.backupCodes.filter((stored) => stored !== hashed) },
        });
        await audit(email, "security", "user", "Signed in with a backup code", userId);
      }
    }
    if (!ok) {
      await recordLogin(email, false, "Wrong two-factor code");
      return { error: "That code is not right. Check the time on your phone and try again." };
    }

    await clearRateLimit(ipKey);
    await clearTwoFactor();
    await createSession(userId);
    await recordLogin(email, true);
    await audit(email, "login", "session", "Signed in (two-factor)");
  } catch (error) {
    reportError(error, { action: "verify-2fa" });
    return { error: "The sign-in service is not reachable right now. Try again in a minute." };
  }
  redirect("/admin");
}

export async function logout(): Promise<void> {
  const admin = await requireAdmin();
  await audit(admin.email, "logout", "session", "Signed out");
  await destroySession();
  redirect("/admin/login");
}

// ---- Settings ------------------------------------------------------------------------------

export async function saveSettings(_previous: FormResult, form: FormData): Promise<FormResult> {
  const { db, admin } = await adminContext();
  const parsed = settingsSchema.safeParse({
    name: text(form, "name"),
    roleLine: text(form, "roleLine"),
    email: text(form, "email"),
    location: text(form, "location"),
    availability: text(form, "availability"),
    linkedinUrl: optionalText(form, "linkedinUrl"),
    githubUrl: optionalText(form, "githubUrl"),
    aboutStory: text(form, "aboutStory").replace(/\r\n/g, "\n"),
    principles: pairs(form, "principles"),
    nowItems: lines(form, "nowItems"),
    openToWork: bool(form, "openToWork"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const data = { ...parsed.data, nowUpdatedAt: new Date() };
  await db.siteSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  await audit(admin.email, "update", "settings", "Updated profile & settings");
  updateTag(CACHE_TAGS.settings);
  refresh();
  return { ok: "Settings saved. The site is updated." };
}

// ---- Projects ------------------------------------------------------------------------------

export async function saveProject(
  id: string | null,
  _previous: FormResult,
  form: FormData,
): Promise<FormResult> {
  const { db, admin } = await adminContext();
  const parsed = projectSchema.safeParse({
    slug: text(form, "slug"),
    title: text(form, "title"),
    tagline: text(form, "tagline"),
    summary: text(form, "summary"),
    statusLabel: text(form, "statusLabel"),
    categories: form.getAll("categories").map(String),
    role: optionalText(form, "role"),
    type: optionalText(form, "type"),
    stack: list(form, "stack"),
    visual: text(form, "visual"),
    overview: text(form, "overview").replace(/\r\n/g, "\n"),
    decisions: pairs(form, "decisions"),
    published: bool(form, "published"),
    order: optionalInt(form, "order") ?? 0,
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  try {
    if (id) {
      const current = await db.project.findUnique({ where: { id }, select: { publishedAt: true } });
      await db.project.update({
        where: { id },
        data: {
          ...parsed.data,
          publishedAt: parsed.data.published ? (current?.publishedAt ?? new Date()) : null,
        },
      });
    } else {
      await db.project.create({
        data: { ...parsed.data, publishedAt: parsed.data.published ? new Date() : null },
      });
    }
  } catch (error) {
    return saveFailed(error);
  }

  await audit(admin.email, id ? "update" : "create", "project", parsed.data.title, id ?? undefined);
  updateTag(CACHE_TAGS.projects);
  if (!id) redirect("/admin/projects");
  refresh();
  return { ok: "Project saved." };
}

export async function deleteProject(form: FormData): Promise<void> {
  const { db, admin } = await adminContext();
  // Kept in the trash for 30 days (with its cover image), so it can be restored.
  const removed = await db.$transaction(async (tx) => {
    const row = await tx.project.delete({ where: { id: text(form, "id") } });
    await moveToTrash(tx, "project", row.id, row.title, row, admin.email);
    return row;
  });
  await audit(admin.email, "delete", "project", removed.title, removed.id, { before: removed });
  updateTag(CACHE_TAGS.projects);
  redirect("/admin/projects");
}

// ---- Notes ---------------------------------------------------------------------------------

export async function saveNote(
  id: string | null,
  _previous: FormResult,
  form: FormData,
): Promise<FormResult> {
  const { db, admin } = await adminContext();
  const parsed = noteSchema.safeParse({
    slug: text(form, "slug"),
    title: text(form, "title"),
    excerpt: text(form, "excerpt"),
    body: text(form, "body").replace(/\r\n/g, "\n"),
    tags: list(form, "tags"),
    featured: bool(form, "featured"),
    published: bool(form, "published"),
    order: optionalInt(form, "order") ?? 0,
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  try {
    if (id) {
      const current = await db.note.findUnique({ where: { id }, select: { publishedAt: true } });
      await db.note.update({
        where: { id },
        data: {
          ...parsed.data,
          publishedAt: parsed.data.published ? (current?.publishedAt ?? new Date()) : null,
        },
      });
    } else {
      await db.note.create({
        data: { ...parsed.data, publishedAt: parsed.data.published ? new Date() : null },
      });
    }
  } catch (error) {
    return saveFailed(error);
  }

  await audit(admin.email, id ? "update" : "create", "note", parsed.data.title, id ?? undefined);
  updateTag(CACHE_TAGS.notes);
  if (!id) redirect("/admin/notes");
  refresh();
  return { ok: "Note saved." };
}

export async function deleteNote(form: FormData): Promise<void> {
  const { db, admin } = await adminContext();
  const removed = await db.$transaction(async (tx) => {
    const row = await tx.note.delete({ where: { id: text(form, "id") } });
    await moveToTrash(tx, "note", row.id, row.title, row, admin.email);
    return row;
  });
  await audit(admin.email, "delete", "note", removed.title, removed.id, { before: removed });
  updateTag(CACHE_TAGS.notes);
  redirect("/admin/notes");
}

// ---- Experience ----------------------------------------------------------------------------

export async function saveExperience(
  id: string | null,
  _previous: FormResult,
  form: FormData,
): Promise<FormResult> {
  const { db, admin } = await adminContext();
  const parsed = experienceSchema.safeParse({
    role: text(form, "role"),
    company: text(form, "company"),
    location: optionalText(form, "location"),
    summary: text(form, "summary"),
    highlights: lines(form, "highlights"),
    startDate: optionalDate(form, "startDate"),
    endDate: optionalDate(form, "endDate"),
    isCurrent: bool(form, "isCurrent"),
    published: bool(form, "published"),
    order: optionalInt(form, "order") ?? 0,
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const data = { ...parsed.data, publishedAt: parsed.data.published ? new Date() : null };
  try {
    if (id) await db.experience.update({ where: { id }, data });
    else await db.experience.create({ data });
  } catch (error) {
    return saveFailed(error);
  }

  await audit(
    admin.email,
    id ? "update" : "create",
    "experience",
    `${parsed.data.role} at ${parsed.data.company}`,
    id ?? undefined,
  );
  updateTag(CACHE_TAGS.experience);
  if (!id) redirect("/admin/experience");
  refresh();
  return { ok: "Experience saved." };
}

export async function deleteExperience(form: FormData): Promise<void> {
  const { db, admin } = await adminContext();
  const removed = await db.$transaction(async (tx) => {
    const row = await tx.experience.delete({ where: { id: text(form, "id") } });
    await moveToTrash(tx, "experience", row.id, `${row.role} at ${row.company}`, row, admin.email);
    return row;
  });
  await audit(
    admin.email,
    "delete",
    "experience",
    `${removed.role} at ${removed.company}`,
    removed.id,
    { before: removed },
  );
  updateTag(CACHE_TAGS.experience);
  redirect("/admin/experience");
}

// ---- Credentials ---------------------------------------------------------------------------

export async function saveCredential(
  id: string | null,
  _previous: FormResult,
  form: FormData,
): Promise<FormResult> {
  const { db, admin } = await adminContext();
  const parsed = credentialSchema.safeParse({
    title: text(form, "title"),
    issuer: text(form, "issuer"),
    kind: text(form, "kind"),
    status: text(form, "status"),
    location: optionalText(form, "location"),
    startYear: optionalInt(form, "startYear"),
    endYear: optionalInt(form, "endYear"),
    credentialUrl: optionalText(form, "credentialUrl"),
    published: bool(form, "published"),
    order: optionalInt(form, "order") ?? 0,
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const data = { ...parsed.data, publishedAt: parsed.data.published ? new Date() : null };
  try {
    if (id) await db.certification.update({ where: { id }, data });
    else await db.certification.create({ data });
  } catch (error) {
    return saveFailed(error);
  }

  await audit(
    admin.email,
    id ? "update" : "create",
    "credential",
    parsed.data.title,
    id ?? undefined,
  );
  updateTag(CACHE_TAGS.credentials);
  if (!id) redirect("/admin/credentials");
  refresh();
  return { ok: "Credential saved." };
}

export async function deleteCredential(form: FormData): Promise<void> {
  const { db, admin } = await adminContext();
  const removed = await db.$transaction(async (tx) => {
    const row = await tx.certification.delete({ where: { id: text(form, "id") } });
    await moveToTrash(tx, "credential", row.id, row.title, row, admin.email);
    return row;
  });
  await audit(admin.email, "delete", "credential", removed.title, removed.id, { before: removed });
  updateTag(CACHE_TAGS.credentials);
  redirect("/admin/credentials");
}

// ---- Skills --------------------------------------------------------------------------------

function readSkill(form: FormData) {
  return skillSchema.safeParse({
    name: text(form, "name"),
    layer: optionalInt(form, "layer"),
    domain: optionalText(form, "domain"),
    published: form.has("published") ? bool(form, "published") : true,
  });
}

export async function addSkill(_previous: FormResult, form: FormData): Promise<FormResult> {
  const { db, admin } = await adminContext();
  const parsed = readSkill(form);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const order = await db.skill.count({ where: { layer: parsed.data.layer } });
  await db.skill.create({ data: { ...parsed.data, order } });
  await audit(admin.email, "create", "skill", parsed.data.name);
  updateTag(CACHE_TAGS.skills);
  refresh();
  return { ok: `Added ${parsed.data.name}.` };
}

export async function updateSkill(
  id: string,
  _previous: FormResult,
  form: FormData,
): Promise<FormResult> {
  const { db, admin } = await adminContext();
  const parsed = readSkill(form);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  await db.skill.update({ where: { id }, data: parsed.data });
  await audit(admin.email, "update", "skill", parsed.data.name, id);
  updateTag(CACHE_TAGS.skills);
  refresh();
  return { ok: "Saved." };
}

export async function deleteSkill(form: FormData): Promise<void> {
  const { db, admin } = await adminContext();
  const removed = await db.$transaction(async (tx) => {
    const row = await tx.skill.delete({ where: { id: text(form, "id") } });
    await moveToTrash(tx, "skill", row.id, row.name, row, admin.email);
    return row;
  });
  await audit(admin.email, "delete", "skill", removed.name, removed.id, { before: removed });
  updateTag(CACHE_TAGS.skills);
  refresh();
}

// ---- Messages ------------------------------------------------------------------------------

const MESSAGE_FLAGS = ["read", "starred", "archived", "spam"] as const;
type MessageFlag = (typeof MESSAGE_FLAGS)[number];

function isMessageFlag(value: string): value is MessageFlag {
  return (MESSAGE_FLAGS as readonly string[]).includes(value);
}

// One action for the read / star / archive / spam toggles.
export async function setMessageFlag(form: FormData): Promise<void> {
  const { db, admin } = await adminContext();
  const flag = text(form, "flag");
  if (!isMessageFlag(flag)) return;
  const value = text(form, "value") === "true";
  const message = await db.message.update({
    where: { id: text(form, "id") },
    data: { [flag]: value },
    select: { id: true, name: true },
  });
  await audit(admin.email, "update", "message", `${flag}=${value} · ${message.name}`, message.id);
  refresh();
}

export async function deleteMessage(form: FormData): Promise<void> {
  const { db, admin } = await adminContext();
  const removed = await db.$transaction(async (tx) => {
    const row = await tx.message.delete({ where: { id: text(form, "id") } });
    await moveToTrash(tx, "message", row.id, `From ${row.name}`, row, admin.email);
    return row;
  });
  await audit(admin.email, "delete", "message", `From ${removed.name}`, removed.id);
  refresh();
}

// ---- Looks ---------------------------------------------------------------------------------

export async function saveLooks(_previous: FormResult, form: FormData): Promise<FormResult> {
  const { db, admin } = await adminContext();
  const enabled = form.getAll("enabled").map(String).filter(isLook);
  const mode = text(form, "mode");
  const fixed = text(form, "fixed");
  if (enabled.length === 0) return { error: "Keep at least one look switched on." };
  if (!isLookMode(mode)) return { error: "Pick how the next look is chosen." };
  if (!isLook(fixed)) return { error: "Pick a valid fixed look." };
  if (mode === "fixed" && !enabled.includes(fixed)) {
    return { error: "The fixed look must also be switched on." };
  }

  // Stored in the canonical order, so sequential mode walks the looks predictably.
  const ordered = LOOKS.filter((look: Look) => enabled.includes(look));
  await db.siteSettings.update({
    where: { id: 1 },
    data: { looksEnabled: ordered, looksMode: mode, looksFixed: fixed },
  });
  await audit(admin.email, "update", "looks", `${mode}: ${ordered.join(", ")}`);
  updateTag(CACHE_TAGS.settings);
  refresh();
  return { ok: "Looks saved. New visitors get them on their next page load." };
}
