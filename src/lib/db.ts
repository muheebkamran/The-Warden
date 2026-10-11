import { PrismaClient } from "@prisma/client";

/**
 * High-performance Prisma Client singleton with connection pooling configuration.
 * Prevents connection leakage across serverless cold starts and hot lambdas.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    datasourceUrl: process.env.DATABASE_URL,
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

// Preserve singleton across hot reloads and serverless Lambda container lifecycles
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = db;
}