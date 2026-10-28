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
import { verifyPassword } from "@/lib/auth/password";
import {
  createSession,
  destroySession,
  isAdminConfigured,
  isAdminEmail,
  requireAdmin,
} from "@/lib/auth/session";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { getDb } from "@/lib/db";
import { requestIpHash, takeRateLimit } from "@/lib/rate-limit";
import {
  credentialSchema,
  experienceSchema,
  firstIssue,
  noteSchema,
  projectSchema,
  settingsSchema,
  skillSchema,
} from "@/lib/validation/admin";

// Every action re-checks the session itself; the admin UI hiding a button protects nothing.
async function adminDb() {
  await requireAdmin();
  const db = getDb();
  if (!db) throw new Error("No database configured.");
  return db;
}

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

  if (!(await takeRateLimit(`login:${await requestIpHash()}`, 8, 15 * 60_000))) {
    return { error: "Too many attempts. Wait 15 minutes and try again." };
  }

  const email = text(form, "email");
  const password = String(form.get("password") ?? "");
  const hash = process.env.ADMIN_PASSWORD_HASH ?? "";
  // The password is checked even for a wrong email, so both failures take the same time.
  const passwordOk = await verifyPassword(password, hash);
  if (!isAdminEmail(email) || !passwordOk) return { error: "Wrong email or password." };

  await createSession(email);
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

// ---- Settings ------------------------------------------------------------------------------

export async function saveSettings(_previous: FormResult, form: FormData): Promise<FormResult> {
  const db = await adminDb();
  const parsed = settingsSchema.safeParse({
    name: text(form, "name"),
    roleLine: text(form, "roleLine"),
    email: text(form, "email"),
    location: text(form, "location"),
    availability: text(form, "availability"),
    linkedinUrl: optionalText(form, "linkedinUrl"),
    githubUrl: optionalText(form, "githubUrl"),
    photoUrl: optionalText(form, "photoUrl"),
    aboutStory: text(form, "aboutStory").replace(/\r\n/g, "\n"),
    principles: pairs(form, "principles"),
    nowItems: lines(form, "nowItems"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const data = { ...parsed.data, nowUpdatedAt: new Date() };
  await db.siteSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
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
  const db = await adminDb();
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

  updateTag(CACHE_TAGS.projects);
  if (!id) redirect("/admin/projects");
  refresh();
  return { ok: "Project saved." };
}

export async function deleteProject(form: FormData): Promise<void> {
  const db = await adminDb();
  await db.project.delete({ where: { id: text(form, "id") } });
  updateTag(CACHE_TAGS.projects);
  redirect("/admin/projects");
}

// ---- Notes ---------------------------------------------------------------------------------

export async function saveNote(
  id: string | null,
  _previous: FormResult,
  form: FormData,
): Promise<FormResult> {
  const db = await adminDb();
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

  updateTag(CACHE_TAGS.notes);
  if (!id) redirect("/admin/notes");
  refresh();
  return { ok: "Note saved." };
}

export async function deleteNote(form: FormData): Promise<void> {
  const db = await adminDb();
  await db.note.delete({ where: { id: text(form, "id") } });
  updateTag(CACHE_TAGS.notes);
  redirect("/admin/notes");
}

// ---- Experience ----------------------------------------------------------------------------

export async function saveExperience(
  id: string | null,
  _previous: FormResult,
  form: FormData,
): Promise<FormResult> {
  const db = await adminDb();
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

  updateTag(CACHE_TAGS.experience);
  if (!id) redirect("/admin/experience");
  refresh();
  return { ok: "Experience saved." };
}

export async function deleteExperience(form: FormData): Promise<void> {
  const db = await adminDb();
  await db.experience.delete({ where: { id: text(form, "id") } });
  updateTag(CACHE_TAGS.experience);
  redirect("/admin/experience");
}

// ---- Credentials ---------------------------------------------------------------------------

export async function saveCredential(
  id: string | null,
  _previous: FormResult,
  form: FormData,
): Promise<FormResult> {
  const db = await adminDb();
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

  updateTag(CACHE_TAGS.credentials);
  if (!id) redirect("/admin/credentials");
  refresh();
  return { ok: "Credential saved." };
}

export async function deleteCredential(form: FormData): Promise<void> {
  const db = await adminDb();
  await db.certification.delete({ where: { id: text(form, "id") } });
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
  const db = await adminDb();
  const parsed = readSkill(form);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const order = await db.skill.count({ where: { layer: parsed.data.layer } });
  await db.skill.create({ data: { ...parsed.data, order } });
  updateTag(CACHE_TAGS.skills);
  refresh();
  return { ok: `Added ${parsed.data.name}.` };
}

export async function updateSkill(
  id: string,
  _previous: FormResult,
  form: FormData,
): Promise<FormResult> {
  const db = await adminDb();
  const parsed = readSkill(form);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  await db.skill.update({ where: { id }, data: parsed.data });
  updateTag(CACHE_TAGS.skills);
  refresh();
  return { ok: "Saved." };
}

export async function deleteSkill(form: FormData): Promise<void> {
  const db = await adminDb();
  await db.skill.delete({ where: { id: text(form, "id") } });
  updateTag(CACHE_TAGS.skills);
  refresh();
}

// ---- Messages ------------------------------------------------------------------------------

export async function setMessageRead(form: FormData): Promise<void> {
  const db = await adminDb();
  await db.message.update({
    where: { id: text(form, "id") },
    data: { read: text(form, "read") === "true" },
  });
  refresh();
}

export async function deleteMessage(form: FormData): Promise<void> {
  const db = await adminDb();
  await db.message.delete({ where: { id: text(form, "id") } });
  refresh();
}
