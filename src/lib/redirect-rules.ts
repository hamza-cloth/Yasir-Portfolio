import { getDb } from "@/lib/db";

// Redirects the admin manages (admin → Redirects), read from the database. Kept free of the data
// cache so the proxy can import it; pages use src/lib/redirects.ts.

export type RedirectRule = { id: string; to: string; permanent: boolean };

export async function loadRedirectRules(): Promise<Map<string, RedirectRule>> {
  const db = getDb();
  if (!db) return new Map();
  try {
    const rows = await db.redirect.findMany({
      select: { id: true, from: true, to: true, permanent: true },
    });
    return new Map(
      rows.map((row) => [row.from, { id: row.id, to: row.to, permanent: row.permanent }]),
    );
  } catch {
    return new Map();
  }
}

export function normalisePath(path: string): string {
  return path.replace(/\/+$/, "") || "/";
}

// The proxy cannot use the data cache, so it keeps the rules in memory for a minute.
const PROXY_TTL_MS = 60_000;
let proxyRules: { loaded: number; rules: Promise<Map<string, RedirectRule>> } | null = null;

export async function findRedirectForProxy(path: string): Promise<RedirectRule | undefined> {
  if (!proxyRules || Date.now() - proxyRules.loaded > PROXY_TTL_MS) {
    proxyRules = { loaded: Date.now(), rules: loadRedirectRules() };
  }
  return (await proxyRules.rules).get(normalisePath(path));
}

export async function countRedirectHit(id: string): Promise<void> {
  await getDb()
    ?.redirect.update({ where: { id }, data: { hits: { increment: 1 } } })
    .catch(() => undefined);
}
