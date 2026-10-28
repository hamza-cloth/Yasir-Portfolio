import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Returns null when no database is configured, so the site can still render its defaults.
export function getDb(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  }
  return globalForPrisma.prisma;
}
