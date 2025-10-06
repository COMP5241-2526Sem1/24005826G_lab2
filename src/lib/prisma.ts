import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

import { getEnv } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const { DATABASE_URL } = getEnv();
const parsedUrl = new URL(DATABASE_URL);
const hostname = parsedUrl.hostname.toLowerCase();
const shouldUseNeonAdapter =
  process.env.PRISMA_FORCE_NEON === "true" || hostname.includes("neon.tech");

let prismaClient = globalForPrisma.prisma;

if (!prismaClient) {
  if (shouldUseNeonAdapter) {
    neonConfig.webSocketConstructor = ws;
    const adapter = new PrismaNeon({ connectionString: DATABASE_URL });
    prismaClient = new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  } else {
    prismaClient = new PrismaClient({
      datasourceUrl: DATABASE_URL,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  }
}

export const prisma = prismaClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
