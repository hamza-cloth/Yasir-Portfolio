import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { countryCode, deviceType, referrerSource } from "@/lib/analytics";
import { getDb } from "@/lib/db";
import { requestIpHash } from "@/lib/rate-limit";

const BOT = /bot|crawl|spider|slurp|preview|lighthouse|headless/i;

// Counts one view of a public page for today, and the first view of each visitor per day by
// referring site, device type and country. Visitors are told apart by a hash of the day, the
// salted IP hash and the user agent, kept two days at most: no cookies, and no IP addresses or
// user agents stored.
export async function POST(request: NextRequest) {
  let body: { path?: unknown; referrer?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }
  const { path } = body;
  if (typeof path !== "string" || !/^\/[\w\-/.]{0,199}$/.test(path) || path.startsWith("/admin")) {
    return NextResponse.json({ error: "Invalid path." }, { status: 400 });
  }

  // Valid but not counted: no database, or a crawler.
  const userAgent = request.headers.get("user-agent");
  const db = getDb();
  if (!db || BOT.test(userAgent ?? "")) {
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

    const hash = createHash("sha256")
      .update(`${day.toISOString()}:${await requestIpHash()}:${userAgent ?? ""}`)
      .digest("hex")
      .slice(0, 32);
    const { count: firstToday } = await db.visitorDay.createMany({
      data: [{ day, hash }],
      skipDuplicates: true,
    });
    if (firstToday) {
      const referrer = referrerSource(body.referrer, request.headers.get("host"));
      const stats: [string, string][] = [
        ["visitors", "all"],
        ["device", deviceType(userAgent)],
        ["country", countryCode(request.headers.get("x-vercel-ip-country"))],
        ...(referrer ? ([["referrer", referrer]] as [string, string][]) : []),
      ];
      await Promise.all(
        stats.map(([kind, value]) =>
          db.statDay.upsert({
            where: { day_kind_value: { day, kind, value } },
            update: { count: { increment: 1 } },
            create: { day, kind, value, count: 1 },
          }),
        ),
      );
      // Yesterday's hashes are no longer needed once today has begun.
      if (Math.random() < 0.02) {
        await db.visitorDay.deleteMany({
          where: { day: { lt: new Date(day.getTime() - 86_400_000) } },
        });
      }
    }
  } catch {
    // A failed count must never surface to the visitor.
    return NextResponse.json({ error: "Not recorded." }, { status: 503 });
  }
  return new NextResponse(null, { status: 204 });
}
