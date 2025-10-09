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
  const parsedUrl = new URL(DATABASE_URL);
  const hostname = parsedUrl.hostname.toLowerCase();
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
    get(_, prop) {
      // initialize on first property access
      const client = initPrisma();
      // @ts-ignore - forward access to the real client
      return (client as any)[prop];
    },
    apply(_, thisArg, args) {
      const client = initPrisma();
      return (client as any).apply(thisArg, args);
    },
  }
) as unknown as PrismaClient;
