import { NextResponse, type NextRequest } from "next/server";

import { getDb } from "@/lib/db";

const BOT = /bot|crawl|spider|slurp|preview|lighthouse|headless/i;

// Counts one view of a public page for today. Stores only the path and a daily count:
// no cookies, IP addresses or user agents.
export async function POST(request: NextRequest) {
  let path: unknown;
  try {
    path = ((await request.json()) as { path?: unknown }).path;
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }
  if (typeof path !== "string" || !/^\/[\w\-/.]{0,199}$/.test(path) || path.startsWith("/admin")) {
    return NextResponse.json({ error: "Invalid path." }, { status: 400 });
  }

  // Valid but not counted: no database, or a crawler.
  const db = getDb();
  if (!db || BOT.test(request.headers.get("user-agent") ?? "")) {
    return new NextResponse(null, { status: 204 });
  }

  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);
  try {
    await db.pageView.upsert({
      where: { day_path: { day, path } },
      update: { count: { increment: 1 } },
      create: { day, path, count: 1 },
    });
  } catch {
    // A failed count must never surface to the visitor.
    return NextResponse.json({ error: "Not recorded." }, { status: 503 });
  }
  return new NextResponse(null, { status: 204 });
}
