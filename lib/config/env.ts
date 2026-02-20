/**
 * Environment variable validation and access
 */

import { z } from 'zod';

const envSchema = z.object({
  // OpenAI
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),

  // Twitter/X API
  TWITTER_BEARER_TOKEN: z.string().min(1).optional(),
  TWITTER_API_KEY: z.string().min(1).optional(),
  TWITTER_API_SECRET: z.string().min(1).optional(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

/**
 * Validate and return environment variables
 * Throws an error if required variables are missing
 */
export function validateEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const missing = result.error.issues
      .map(i => `${i.path.join('.')}: ${i.message}`)
      .join('\n');

    throw new Error(`Environment validation failed:\n${missing}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

/**
 * Get validated environment variables
 * Safe to call multiple times (cached)
 */
export const env = validateEnv();
