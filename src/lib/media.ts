import "server-only";

import { del, put } from "@vercel/blob";

import { getDb } from "@/lib/db";

export { isPdf, sniffImage } from "@/lib/file-signature";

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_PDF_BYTES = 4 * 1024 * 1024;

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export type StoredFile = {
  url: string;
  pathname: string;
  size: number;
  width?: number;
  height?: number;
};

async function store(
  pathname: string,
  body: Buffer,
  contentType: string,
  kind: string,
  dimensions: { width?: number; height?: number } = {},
): Promise<StoredFile> {
  const blob = await put(pathname, body, { access: "public", contentType, addRandomSuffix: true });
  const file = { url: blob.url, pathname: blob.pathname, size: body.length, ...dimensions };
  await getDb()?.mediaAsset.create({ data: { ...file, kind, contentType } });
  return file;
}

// Square variants for the profile photo (already cropped 1:1 in the browser), as WebP.
export async function storeSquareImage(bytes: Buffer, name: string, sizes: number[]) {
  const { default: sharp } = await import("sharp");
  return Promise.all(
    sizes.map(async (size) => {
      const output = await sharp(bytes)
        .rotate()
        .resize(size, size, { fit: "cover" })
        .webp({ quality: 84 })
        .toBuffer();
      return store(`${name}-${size}.webp`, output, "image/webp", "photo", {
        width: size,
        height: size,
      });
    }),
  );
}

// A cover image, kept in proportion, at most 1600px wide.
export async function storeCoverImage(bytes: Buffer, name: string) {
  const { default: sharp } = await import("sharp");
  const output = sharp(bytes).rotate().resize({ width: 1600, withoutEnlargement: true });
  const { data, info } = await output.webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  return store(`${name}.webp`, data, "image/webp", "cover", {
    width: info.width,
    height: info.height,
  });
}

export async function storePdf(bytes: Buffer, name: string) {
  return store(`${name}.pdf`, bytes, "application/pdf", "resume");
}

// Where a file is still referenced; the media library refuses to delete anything in use.
export async function mediaUsage(url: string): Promise<string[]> {
  const db = getDb();
  if (!db) return [];
  const [settings, projects, resumes] = await Promise.all([
    db.siteSettings.findFirst({
      where: { OR: [{ photoUrl: url }, { photoKey: url }, { ogImageUrl: url }] },
      select: { id: true },
    }),
    db.project.findMany({ where: { coverImageUrl: url }, select: { title: true } }),
    db.resumeVersion.findMany({ where: { url }, select: { label: true } }),
  ]);
  return [
    ...(settings ? ["Profile & settings"] : []),
    ...projects.map((project) => `Project: ${project.title}`),
    ...resumes.map((resume) => `Résumé: ${resume.label}`),
  ];
}

// Deletes files that are no longer referenced anywhere; files still in use are left alone.
export async function deleteUnusedMedia(urls: (string | null | undefined)[]): Promise<void> {
  const db = getDb();
  for (const url of urls) {
    if (!url || !url.includes(".blob.vercel-storage.com")) continue;
    if ((await mediaUsage(url)).length > 0) continue;
    try {
      await del(url);
    } catch {
      // Already gone from the store; still drop the record below.
    }
    await db?.mediaAsset.deleteMany({ where: { url } });
  }
}
