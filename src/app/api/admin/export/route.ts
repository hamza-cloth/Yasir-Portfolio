import { NextResponse, type NextRequest } from "next/server";

import { can } from "@/lib/admin/roles";
import { audit } from "@/lib/audit";
import { getAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

// CSV exports (leads, messages, subscribers) and a full JSON backup of the content.
// Checked against the session here too: the proxy only looks for the cookie.

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = value instanceof Date ? value.toISOString() : String(value);
  // Quote everything; a leading = + - @ would run as a formula in a spreadsheet.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  return [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(",")),
  ].join("\r\n");
}

export async function GET(request: NextRequest) {
  const admin = await getAdmin();
  const db = getDb();
  if (!admin || !db) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const type = request.nextUrl.searchParams.get("type");
  const day = new Date().toISOString().slice(0, 10);

  if (type === "backup") {
    if (!can(admin.role, "manage")) {
      return NextResponse.json({ error: "Owners only." }, { status: 403 });
    }
    const [
      settings,
      projects,
      notes,
      labs,
      certifications,
      experience,
      skills,
      messages,
      leads,
      estimates,
      testimonials,
      clients,
      invoices,
      subscribers,
      redirects,
      config,
    ] = await Promise.all([
      db.siteSettings.findMany(),
      db.project.findMany(),
      db.note.findMany(),
      db.lab.findMany(),
      db.certification.findMany(),
      db.experience.findMany(),
      db.skill.findMany(),
      db.message.findMany(),
      db.lead.findMany(),
      db.estimate.findMany(),
      db.testimonial.findMany(),
      db.client.findMany(),
      db.invoice.findMany(),
      db.subscriber.findMany({ select: { email: true, status: true, createdAt: true } }),
      db.redirect.findMany(),
      db.setting.findMany(),
    ]);
    await audit(admin.email, "create", "backup", "Downloaded a full backup");
    const body = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        version: 1,
        // Passwords, sessions, two-factor secrets and IP hashes are never included.
        data: {
          settings,
          projects,
          notes,
          labs,
          certifications,
          experience,
          skills,
          messages: messages.map(({ ipHash: _ipHash, ...message }) => message),
          leads,
          estimates,
          testimonials,
          clients,
          invoices,
          subscribers,
          redirects,
          config,
        },
      },
      null,
      2,
    );
    return new NextResponse(body, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="portfolio-backup-${day}.json"`,
        "cache-control": "no-store",
      },
    });
  }

  let csv: string;
  if (type === "leads") {
    const rows = await db.lead.findMany({ orderBy: { createdAt: "desc" } });
    csv = toCsv(rows, [
      "createdAt",
      "name",
      "email",
      "phone",
      "source",
      "stage",
      "value",
      "projectType",
      "budget",
      "timeline",
      "followUpAt",
      "details",
      "notes",
    ]);
  } else if (type === "messages") {
    const rows = await db.message.findMany({
      where: { spam: false },
      orderBy: { createdAt: "desc" },
    });
    csv = toCsv(
      rows.map((row) => ({ ...row, labels: row.labels.join("; ") })),
      ["createdAt", "name", "email", "topic", "read", "starred", "archived", "labels", "body"],
    );
  } else if (type === "subscribers") {
    const rows = await db.subscriber.findMany({ orderBy: { createdAt: "desc" } });
    csv = toCsv(rows, ["createdAt", "email", "status", "confirmedAt"]);
  } else {
    return NextResponse.json({ error: "Unknown export." }, { status: 400 });
  }

  await audit(admin.email, "create", "export", `Exported ${type} (CSV)`);
  // A byte-order mark so Excel opens the UTF-8 (₹, names) correctly.
  return new NextResponse(`﻿${csv}`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${type}-${day}.csv"`,
      "cache-control": "no-store",
    },
  });
}
