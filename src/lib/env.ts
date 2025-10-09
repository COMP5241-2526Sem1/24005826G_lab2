import { z } from "zod";

const envSchema = z.object({
  // Make DATABASE_URL optional so modules that only need OPENAI_API_KEY
  // don't fail during Next.js build-time static analysis. Runtime callers
  // that actually need DATABASE_URL (e.g. Prisma initialization) must
  // validate its presence explicitly.
  DATABASE_URL: z.string().url().optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
});

type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(`Invalid environment variables: ${parsed.error.message}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
