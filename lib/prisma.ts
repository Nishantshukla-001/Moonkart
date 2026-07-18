import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Wraps a read-only Prisma query used during page rendering — including
 * static builds, which run against a real database connection — so a
 * temporarily unreachable database (e.g. Prisma error P1001) degrades to a
 * safe fallback instead of crashing the entire build. Only ever wrap reads
 * with this; writes should fail loudly, not silently no-op.
 */
export async function safeRead<T>(query: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await query();
  } catch (error) {
    console.error(`[safeRead] ${label} failed — using fallback.`, error);
    return fallback;
  }
}
