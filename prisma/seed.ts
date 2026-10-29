import "dotenv/config";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword, verifyPassword } from "../src/lib/auth/password";
import { CREDENTIALS } from "../src/lib/content/credentials";
import { EXPERIENCE } from "../src/lib/content/experience";
import { NOTES } from "../src/lib/content/notes";
import { PROJECTS } from "../src/lib/content/projects";
import { DEFAULT_SITE_SETTINGS } from "../src/lib/content/site-settings";
import { SKILLS } from "../src/lib/content/skills";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set.");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

// The one admin account, from ADMIN_EMAIL and ADMIN_PASSWORD (kept only in the local .env); the
// database stores just the argon2id hash. Every other account is removed, and every session ends,
// whenever something changed. Running it again with the same values changes nothing.
async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("ADMIN_EMAIL or ADMIN_PASSWORD is not set; the admin account was left as it is.");
    return;
  }
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters.");

  const others = { OR: [{ email: { not: email } }, { email: null }] };
  const current = await db.user.findUnique({ where: { email }, select: { passwordHash: true } });
  const samePassword = current?.passwordHash
    ? await verifyPassword(password, current.passwordHash)
    : false;
  if (samePassword && (await db.user.count({ where: others })) === 0) {
    console.log("Admin account already up to date.");
    return;
  }

  const passwordHash =
    samePassword && current?.passwordHash ? current.passwordHash : await hashPassword(password);
  await db.$transaction([
    db.user.deleteMany({ where: others }),
    db.user.upsert({
      where: { email },
      update: { passwordHash },
      create: { email, name: "Admin", passwordHash },
    }),
    db.session.deleteMany(),
  ]);
  console.log(`Admin account set to ${email}; older accounts removed and all sessions ended.`);
}

// Each table is filled only while it is empty, so re-running never overwrites edits made in /admin.
async function main() {
  await seedAdmin();
  const now = new Date();

  await db.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, ...DEFAULT_SITE_SETTINGS },
  });

  if ((await db.project.count()) === 0) {
    await db.project.createMany({
      data: PROJECTS.map((project, order) => ({
        ...project,
        published: true,
        publishedAt: now,
        order,
      })),
    });
  }

  if ((await db.experience.count()) === 0) {
    await db.experience.createMany({
      data: EXPERIENCE.map(({ id: _id, ...item }, order) => ({
        ...item,
        published: true,
        publishedAt: now,
        order,
      })),
    });
  }

  if ((await db.certification.count()) === 0) {
    await db.certification.createMany({
      data: CREDENTIALS.map(({ id: _id, ...credential }, order) => ({
        ...credential,
        published: true,
        publishedAt: now,
        order,
      })),
    });
  }

  if ((await db.skill.count()) === 0) {
    await db.skill.createMany({
      data: SKILLS.map((skill, order) => ({ ...skill, published: true, order })),
    });
  }

  if ((await db.note.count()) === 0) {
    const notesDirectory = path.join(process.cwd(), "content", "notes");
    const bodies = await Promise.all(
      NOTES.map((note) => readFile(path.join(notesDirectory, `${note.slug}.md`), "utf8")),
    );
    await db.note.createMany({
      // Listed newest first, so earlier notes get later publish times.
      data: NOTES.map((note, order) => ({
        ...note,
        body: bodies[order] ?? "",
        published: true,
        publishedAt: new Date(now.getTime() - order * 60_000),
        order,
      })),
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
