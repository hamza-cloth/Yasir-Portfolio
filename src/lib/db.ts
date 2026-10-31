import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Neon's URLs say sslmode=require, which pg already treats as verify-full but warns will change.
// Spelling out verify-full keeps today's (stricter) behaviour and silences the warning.
function withExplicitSsl(url: string): string {
  return url.replace(/([?&])sslmode=(require|prefer|verify-ca)(?=&|$)/, "$1sslmode=verify-full");
}

// Returns null when no database is configured, so the site can still render its defaults.
export function getDb(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  if (!globalForPrisma.prisma) {
    // The local `prisma dev` server (PGlite) drops connections when several arrive at once, so a
    // localhost database gets one connection and queries simply queue. Neon keeps the full pool.
    const local = /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString);
    globalForPrisma.prisma = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: withExplicitSsl(connectionString),
        ...(local ? { max: 1 } : {}),
      }),
    });
  }
  return globalForPrisma.prisma;
}
