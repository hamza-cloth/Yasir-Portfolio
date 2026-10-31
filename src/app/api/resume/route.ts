import { NextResponse, type NextRequest } from "next/server";

import { getDb } from "@/lib/db";

const BOT = /bot|crawl|spider|slurp|preview|lighthouse|headless/i;

// The résumé's download link: counts the download for the live version (admin → Résumé), then
// sends the browser on to the PDF.
export async function GET(request: NextRequest) {
  const db = getDb();
  const version = await db?.resumeVersion
    .findFirst({ where: { active: true }, select: { id: true, url: true } })
    .catch(() => null);
  if (!version) return NextResponse.redirect(new URL("/resume", request.url));

  if (!BOT.test(request.headers.get("user-agent") ?? "")) {
    await db?.resumeVersion
      .update({ where: { id: version.id }, data: { downloads: { increment: 1 } } })
      .catch(() => undefined);
  }
  return NextResponse.redirect(version.url, { headers: { "cache-control": "no-store" } });
}
