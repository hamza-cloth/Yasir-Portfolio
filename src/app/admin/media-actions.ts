"use server";

import { refresh, updateTag } from "next/cache";

import type { FormResult } from "@/components/admin/AdminForm";
import { text } from "@/lib/admin/form-data";
import { adminContext } from "@/lib/admin/guard";
import { audit } from "@/lib/audit";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  deleteUnusedMedia,
  isBlobConfigured,
  isPdf,
  MAX_IMAGE_BYTES,
  MAX_PDF_BYTES,
  mediaUsage,
  sniffImage,
  storeCoverImage,
  storePdf,
  storeSquareImage,
} from "@/lib/media";
import { seoSchema } from "@/lib/validation/admin";

const NO_STORE = "Uploads are not configured: BLOB_READ_WRITE_TOKEN is missing.";

async function readImage(form: FormData, field: string): Promise<Buffer | string> {
  const file = form.get(field);
  if (!(file instanceof File) || file.size === 0) return "Choose an image first.";
  if (file.size > MAX_IMAGE_BYTES) return "That image is over 2 MB. Pick a smaller one.";
  const bytes = Buffer.from(await file.arrayBuffer());
  if (!sniffImage(bytes)) return "Only JPG, PNG or WebP images are accepted.";
  return bytes;
}

// ---- Profile photo -------------------------------------------------------------------------

export async function uploadPhoto(_previous: FormResult, form: FormData): Promise<FormResult> {
  const { db, admin } = await adminContext();
  if (!isBlobConfigured()) return { error: NO_STORE };
  const bytes = await readImage(form, "photo");
  if (typeof bytes === "string") return { error: bytes };

  const previous = await db.siteSettings.findUnique({
    where: { id: 1 },
    select: { photoUrl: true, photoKey: true },
  });
  const [large, small] = await storeSquareImage(bytes, "profile/photo", [800, 256]);
  await db.siteSettings.update({
    where: { id: 1 },
    data: { photoUrl: large?.url ?? null, photoKey: small?.url ?? null },
  });
  await deleteUnusedMedia([previous?.photoUrl, previous?.photoKey]);
  await audit(admin.email, "upload", "photo", "New profile photo (800 and 256 px)");
  updateTag(CACHE_TAGS.settings);
  refresh();
  return { ok: "Photo updated across the site." };
}

export async function removePhoto(): Promise<void> {
  const { db, admin } = await adminContext();
  await db.siteSettings.update({ where: { id: 1 }, data: { photoUrl: null, photoKey: null } });
  const assets = await db.mediaAsset.findMany({ where: { kind: "photo" }, select: { url: true } });
  await deleteUnusedMedia(assets.map((asset) => asset.url));
  await audit(admin.email, "delete", "photo", "Removed the profile photo");
  updateTag(CACHE_TAGS.settings);
  refresh();
}

// ---- Project covers and order --------------------------------------------------------------

export async function uploadCover(
  projectId: string,
  _previous: FormResult,
  form: FormData,
): Promise<FormResult> {
  const { db, admin } = await adminContext();
  if (!isBlobConfigured()) return { error: NO_STORE };
  const bytes = await readImage(form, "cover");
  if (typeof bytes === "string") return { error: bytes };

  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { coverImageUrl: true, slug: true, title: true },
  });
  if (!project) return { error: "That project no longer exists." };

  const cover = await storeCoverImage(bytes, `covers/${project.slug}`);
  await db.project.update({ where: { id: projectId }, data: { coverImageUrl: cover.url } });
  await deleteUnusedMedia([project.coverImageUrl]);
  await audit(admin.email, "upload", "project", `Cover for ${project.title}`, projectId);
  updateTag(CACHE_TAGS.projects);
  refresh();
  return { ok: "Cover saved." };
}

// Saves a new order from the drag-and-drop list: ids arrive top to bottom.
export async function reorderProjects(ids: string[]): Promise<FormResult> {
  const { db, admin } = await adminContext();
  const clean = ids.filter((id) => typeof id === "string" && id.length > 0).slice(0, 200);
  await db.$transaction(
    clean.map((id, order) => db.project.update({ where: { id }, data: { order } })),
  );
  await audit(admin.email, "update", "project", "Reordered projects");
  updateTag(CACHE_TAGS.projects);
  refresh();
  return { ok: "Order saved." };
}

// ---- Résumé versions -----------------------------------------------------------------------

export async function uploadResume(_previous: FormResult, form: FormData): Promise<FormResult> {
  const { db, admin } = await adminContext();
  if (!isBlobConfigured()) return { error: NO_STORE };
  const file = form.get("resume");
  const label = text(form, "label") || new Date().toISOString().slice(0, 10);
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a PDF first." };
  if (file.size > MAX_PDF_BYTES) return { error: "That PDF is over 4 MB." };
  const bytes = Buffer.from(await file.arrayBuffer());
  if (!isPdf(bytes)) return { error: "Only PDF files are accepted." };

  const stored = await storePdf(bytes, "resume/yasir-abdullah-resume");
  const makeActive = form.get("activate") === "on" || (await db.resumeVersion.count()) === 0;
  await db.$transaction([
    ...(makeActive ? [db.resumeVersion.updateMany({ data: { active: false } })] : []),
    db.resumeVersion.create({
      data: {
        label,
        url: stored.url,
        pathname: stored.pathname,
        size: stored.size,
        active: makeActive,
      },
    }),
  ]);
  await audit(admin.email, "upload", "resume", label);
  updateTag(CACHE_TAGS.settings);
  refresh();
  return { ok: makeActive ? "Uploaded and set as the live résumé." : "Uploaded." };
}

export async function activateResume(form: FormData): Promise<void> {
  const { db, admin } = await adminContext();
  const id = text(form, "id");
  const version = await db.resumeVersion.findUnique({ where: { id }, select: { label: true } });
  if (!version) return;
  await db.$transaction([
    db.resumeVersion.updateMany({ data: { active: false } }),
    db.resumeVersion.update({ where: { id }, data: { active: true } }),
  ]);
  await audit(admin.email, "update", "resume", `Live version: ${version.label}`, id);
  updateTag(CACHE_TAGS.settings);
  refresh();
}

export async function deleteResume(form: FormData): Promise<void> {
  const { db, admin } = await adminContext();
  const removed = await db.resumeVersion.delete({ where: { id: text(form, "id") } });
  await deleteUnusedMedia([removed.url]);
  await audit(admin.email, "delete", "resume", removed.label);
  updateTag(CACHE_TAGS.settings);
  refresh();
}

// ---- SEO & settings ------------------------------------------------------------------------

export async function saveSeo(_previous: FormResult, form: FormData): Promise<FormResult> {
  const { db, admin } = await adminContext();
  const pages: Record<string, { title: string; description: string }> = {};
  for (const [key, value] of form.entries()) {
    const match = /^seo\[(.+)\]\[(title|description)\]$/.exec(key);
    if (!match?.[1] || !match[2]) continue;
    const page = (pages[match[1]] ??= { title: "", description: "" });
    page[match[2] as "title" | "description"] = String(value).trim();
  }
  const parsed = seoSchema.safeParse({
    seo: pages,
    indexable: form.get("indexable") === "on",
    sitemap: form.get("sitemap") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };

  // Empty fields mean "use the page's default", so they are not stored.
  const seo = Object.fromEntries(
    Object.entries(parsed.data.seo)
      .map(([page, value]) => [
        page,
        Object.fromEntries(Object.entries(value).filter(([, text]) => text.length > 0)),
      ])
      .filter(([, value]) => Object.keys(value as object).length > 0),
  );
  await db.siteSettings.update({
    where: { id: 1 },
    data: { seo, indexable: parsed.data.indexable, sitemap: parsed.data.sitemap },
  });
  await audit(admin.email, "update", "seo", "Updated SEO settings");
  updateTag(CACHE_TAGS.settings);
  refresh();
  return { ok: "SEO saved. Pages pick it up on their next render." };
}

export async function uploadOgImage(_previous: FormResult, form: FormData): Promise<FormResult> {
  const { db, admin } = await adminContext();
  if (!isBlobConfigured()) return { error: NO_STORE };
  const bytes = await readImage(form, "og");
  if (typeof bytes === "string") return { error: bytes };
  const previous = await db.siteSettings.findUnique({
    where: { id: 1 },
    select: { ogImageUrl: true },
  });
  const stored = await storeCoverImage(bytes, "og/share");
  await db.siteSettings.update({ where: { id: 1 }, data: { ogImageUrl: stored.url } });
  await deleteUnusedMedia([previous?.ogImageUrl]);
  await audit(admin.email, "upload", "seo", "New social share image");
  updateTag(CACHE_TAGS.settings);
  refresh();
  return { ok: "Share image saved." };
}

// ---- Media library -------------------------------------------------------------------------

export async function deleteMedia(form: FormData): Promise<void> {
  const { db, admin } = await adminContext();
  const asset = await db.mediaAsset.findUnique({ where: { id: text(form, "id") } });
  if (!asset) return;
  // Safe delete: a file still referenced anywhere stays.
  if ((await mediaUsage(asset.url)).length > 0) return;
  await deleteUnusedMedia([asset.url]);
  await audit(admin.email, "delete", "media", asset.pathname, asset.id);
  refresh();
}
