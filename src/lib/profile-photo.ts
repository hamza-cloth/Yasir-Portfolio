import "server-only";

import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";

export type ProfilePhoto = {
  src: string;
  blurDataURL: string;
};

// A photo dropped into public/ works with no admin setup; an uploaded one (photoUrl) wins.
const STATIC_CANDIDATES = ["yasir.jpg", "yasir.jpeg", "yasir.png", "yasir.webp"];

async function blurFrom(input: Buffer): Promise<string> {
  const { default: sharp } = await import("sharp");
  const tiny = await sharp(input).resize(16, 16, { fit: "cover" }).webp({ quality: 40 }).toBuffer();
  return `data:image/webp;base64,${tiny.toString("base64")}`;
}

async function staticPhoto(): Promise<ProfilePhoto | null> {
  for (const name of STATIC_CANDIDATES) {
    const file = path.join(process.cwd(), "public", name);
    try {
      await access(file);
      return { src: `/${name}`, blurDataURL: await blurFrom(await readFile(file)) };
    } catch {
      // Not this one; try the next name.
    }
  }
  return null;
}

// Resolves the profile photo and a tiny blurred placeholder for it, or null for the initials
// avatar. Any failure (missing file, unreachable URL, bad image) also falls back to null.
export async function getProfilePhoto(photoUrl: string | null): Promise<ProfilePhoto | null> {
  "use cache";
  cacheTag(CACHE_TAGS.settings);
  cacheLife("max");

  if (photoUrl) {
    try {
      const response = await fetch(photoUrl);
      if (!response.ok) throw new Error(`Photo responded ${response.status}`);
      return {
        src: photoUrl,
        blurDataURL: await blurFrom(Buffer.from(await response.arrayBuffer())),
      };
    } catch {
      return staticPhoto();
    }
  }
  return staticPhoto();
}
