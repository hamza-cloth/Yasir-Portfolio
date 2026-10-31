import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { getDb } from "@/lib/db";

export type PublicTestimonial = {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  quote: string;
  rating: number | null;
};

// Only approved testimonials, in the admin's order. There is no built-in fallback: with none
// approved, the home section stays hidden.
export async function getTestimonials(): Promise<PublicTestimonial[]> {
  "use cache";
  cacheTag(CACHE_TAGS.testimonials);
  cacheLife("max");

  const db = getDb();
  if (!db) return [];
  try {
    return await db.testimonial.findMany({
      where: { status: "APPROVED" },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 12,
      select: { id: true, name: true, role: true, company: true, quote: true, rating: true },
    });
  } catch {
    return [];
  }
}
