import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { permanentRedirect, redirect } from "next/navigation";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { loadRedirectRules, normalisePath, type RedirectRule } from "@/lib/redirect-rules";

// The admin's redirects for pages with a slug (work, notes): paths that match no page at all are
// redirected by the proxy instead, with a real 301/307 (see src/proxy.ts).

async function cachedRules(): Promise<[string, RedirectRule][]> {
  "use cache";
  cacheTag(CACHE_TAGS.redirects);
  cacheLife("max");
  return [...(await loadRedirectRules()).entries()];
}

// Called just before notFound(): an old address moves on instead of showing the 404 page.
export async function redirectIfMoved(path: string): Promise<void> {
  const rule = new Map(await cachedRules()).get(normalisePath(path));
  if (!rule) return;
  if (rule.permanent) permanentRedirect(rule.to);
  redirect(rule.to);
}
