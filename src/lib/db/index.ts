/**
 * Prisma client singleton.
 * Prevents multiple PrismaClient instances in development (hot-reload).
 * In production, this just creates one instance.
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaUrl: string | undefined;
};

function getRuntimeDatabaseUrl() {
  const configuredUrl = process.env.DATABASE_URL?.trim();
  const fallbackUrl = process.env.DIRECT_URL?.trim();
  const databaseUrl = configuredUrl || fallbackUrl;

  if (!databaseUrl) {
    return undefined;
  }

  try {
    const parsed = new URL(databaseUrl);

    if (
      parsed.hostname.endsWith(".neon.tech") &&
      !parsed.searchParams.has("connect_timeout")
    ) {
      // Neon computes can take a few seconds to wake from idle. Give Prisma
      // enough time to connect instead of failing the first request.
      parsed.searchParams.set("connect_timeout", "15");
    }

    if (
      parsed.hostname.includes("-pooler.") &&
      !parsed.searchParams.has("pgbouncer")
    ) {
      parsed.searchParams.set("pgbouncer", "true");
    }

    return parsed.toString();
  } catch {
    return databaseUrl;
  }
}

const runtimeDatabaseUrl = getRuntimeDatabaseUrl();
const shouldReuseExistingClient =
  globalForPrisma.prisma &&
  globalForPrisma.prismaUrl === (runtimeDatabaseUrl ?? undefined);

if (!shouldReuseExistingClient && globalForPrisma.prisma) {
  void globalForPrisma.prisma.$disconnect().catch(() => undefined);
}

export const db =
  globalForPrisma.prisma && shouldReuseExistingClient
    ? globalForPrisma.prisma
    :
  new PrismaClient({
        ...(runtimeDatabaseUrl
          ? {
              datasourceUrl: runtimeDatabaseUrl,
            }
          : {}),
        log:
          process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
      });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.prismaUrl = runtimeDatabaseUrl;
}
