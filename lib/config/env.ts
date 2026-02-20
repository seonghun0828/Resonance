/**
 * Environment variable validation and access
 * Split into server-side and client-side variables
 */

import { z } from 'zod';

// Client-side environment variables (available in browser)
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Server-side environment variables (only available on server)
const serverEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type Env = ClientEnv & ServerEnv;

let cachedClientEnv: ClientEnv | null = null;
let cachedServerEnv: ServerEnv | null = null;

/**
 * Validate client-side environment variables
 */
function validateClientEnv(): ClientEnv {
  if (cachedClientEnv) return cachedClientEnv;

  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    const missing = parsed.error.issues
      .map(i => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');

    throw new Error(`❌ Client environment validation failed:\n\n${missing}\n\nPlease check your .env.local file.`);
  }

  cachedClientEnv = parsed.data;
  return cachedClientEnv;
}

/**
 * Validate server-side environment variables
 * Only call this on the server (API routes, Server Components, etc.)
 */
function validateServerEnv(): ServerEnv {
  if (cachedServerEnv) return cachedServerEnv;

  // Skip validation on client-side
  if (typeof window !== 'undefined') {
    throw new Error('❌ Server environment variables cannot be accessed on the client-side');
  }

  const parsed = serverEnvSchema.safeParse({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  });

  if (!parsed.success) {
    const missing = parsed.error.issues
      .map(i => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');

    throw new Error(`❌ Server environment validation failed:\n\n${missing}\n\nPlease check your .env.local file.`);
  }

  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}

/**
 * Client-safe environment variables
 * Can be used anywhere (client or server)
 */
export const env = new Proxy({} as ClientEnv, {
  get(_, prop) {
    const validated = validateClientEnv();
    return validated[prop as keyof ClientEnv];
  },
});

/**
 * Server-only environment variables
 * Must only be used in Server Components, API routes, or Server Actions
 *
 * Usage:
 * ```ts
 * import { serverEnv } from '@/lib/config/env';
 *
 * const apiKey = serverEnv.OPENAI_API_KEY; // Only works on server
 * ```
 */
export const serverEnv = new Proxy({} as ServerEnv, {
  get(_, prop) {
    const validated = validateServerEnv();
    return validated[prop as keyof ServerEnv];
  },
});
