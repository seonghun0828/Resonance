/**
 * Supabase client initialization for browser and server
 * Uses @supabase/ssr for Next.js App Router compatibility
 */

import { createBrowserClient, createServerClient, type CookieOptions } from '@supabase/ssr';
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { env } from '@/lib/config/env';

/**
 * Browser-side Supabase client
 * Use in Client Components
 */
export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Server-side Supabase client
 * Use in Server Components and API Routes
 *
 * @param cookieStore - Next.js cookies() object
 */
export function createServerSupabaseClient(cookieStore: ReadonlyRequestCookies) {
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Cookie setting may fail in Server Components
            // This is expected and can be ignored
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 });
          } catch {
            // Cookie deletion may fail in Server Components
            // This is expected and can be ignored
          }
        },
      },
    }
  );
}
