import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),

  // Supabase. The backend accesses the DB with the service-role key (bypasses RLS);
  // the anon key is kept for optional client-side/testing use.
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_ANON_KEY: z.string().optional(),

  // Direct Postgres connection string — only required to run migrations (db:migrate).
  DATABASE_URL: z.string().optional(),

  CLERK_SECRET_KEY: z.string().min(1),

  // Upstash Redis for rate limiting. Optional: when absent, rate limiting is disabled
  // (handy for local dev). Both values must be present together to enable it.
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingKeys = error.issues.map((e) => e.path.join('.')).join(', ');
      throw new Error(`Invalid environment variables: ${missingKeys}`);
    }
    throw error;
  }
}

export const env = validateEnv();
