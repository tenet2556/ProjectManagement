// src/lib/prisma.ts
import "server-only";
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Lazily returns a singleton PrismaClient.
 * (Prisma v7 requires a driver adapter or accelerateUrl)
 */
export function getPrisma(): PrismaClient {
  // Guard against Edge runtime
  if (process.env.NEXT_RUNTIME === "edge") {
    throw new Error(
      'PrismaClient cannot run in Edge runtime. Ensure the calling route exports `export const runtime = "nodejs"`.'
    );
  }

  if (!globalThis.__prisma) {
    // ---- Pick ONE adapter block ----

    // PostgreSQL:
    const { PrismaPg } = require("@prisma/adapter-pg");
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    });

    globalThis.__prisma = new PrismaClient({
      log: ["warn", "error"],
      adapter, // <-- required in Prisma 7 if you don't use Accelerate
    });
  }
  return globalThis.__prisma;
}