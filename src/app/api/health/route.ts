import { getEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { DATABASE_URL } = getEnv();
  const hasDatabaseUrl = Boolean(DATABASE_URL);

  const result: {
    status: "ok" | "error";
    env: { hasDatabaseUrl: boolean };
    db: { connected: boolean; error?: string };
    timestamp: string;
  } = {
    status: "ok",
    env: { hasDatabaseUrl },
    db: { connected: false },
    timestamp: new Date().toISOString(),
  };

  if (!hasDatabaseUrl) {
    result.status = "error";
    result.db.error = "Missing DATABASE_URL";
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    // Simple connectivity check
    await prisma.$queryRaw`SELECT 1`;
    result.db.connected = true;
  } catch (err) {
    result.status = "error";
    result.db.error = err instanceof Error ? err.message : "Unknown DB error";
  }

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
