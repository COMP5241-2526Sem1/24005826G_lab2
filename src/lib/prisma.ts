import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

import { getEnv } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaClient = globalForPrisma.prisma;

function createPrismaClient(): PrismaClient {
  const { DATABASE_URL } = getEnv();
  if (!DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is required to initialize the Prisma client at runtime"
    );
  }
  const parsedUrl = new URL(DATABASE_URL);
  const hostname = parsedUrl.hostname.toLowerCase();
  // Supabase guidance: ensure sslmode=require and consider pooled port 6543
  if (hostname.includes("supabase.co")) {
    const hasSsl = parsedUrl.searchParams.get("sslmode");
    if (!hasSsl) {
      console.warn(
        "Supabase connection detected: it's recommended to use '?sslmode=require' in DATABASE_URL."
      );
    }
    if (parsedUrl.port && parsedUrl.port !== "6543" && parsedUrl.port !== "5432") {
      console.warn(
        `Supabase connection on port ${parsedUrl.port}. For serverless environments, consider the pooled port 6543.`
      );
    }
  }
  const shouldUseNeonAdapter =
    process.env.PRISMA_FORCE_NEON === "true" || hostname.includes("neon.tech");

  if (shouldUseNeonAdapter) {
    neonConfig.webSocketConstructor = ws;
    const adapter = new PrismaNeon({ connectionString: DATABASE_URL });
    return new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  }

  return new PrismaClient({
    datasourceUrl: DATABASE_URL,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

function initPrisma() {
  if (!prismaClient) {
    prismaClient = createPrismaClient();
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prismaClient;
    }
  }
  return prismaClient;
}

// Export a proxy so consumers can import `prisma` synchronously but the real
// PrismaClient is only constructed on first runtime access. This avoids
// validating environment variables at module-import time (which breaks builds
// when `DATABASE_URL` isn't set in the build environment).
export const prisma = new Proxy(
  {},
  {
      get(_target: unknown, prop: PropertyKey) {
        // initialize on first property access
        const client = initPrisma();
    return (client as unknown as Record<PropertyKey, unknown>)[prop];
      },
      // No apply trap: PrismaClient is not expected to be callable. Keeping the
      // proxy minimal avoids needing the `Function` type which is disallowed
      // by eslint rules.
  }
) as unknown as PrismaClient;
