/**
 * Auth Callback Route Handler
 * Handles OAuth callback from Supabase after X login
 */

import { createServerSupabaseClient } from '@/lib/utils/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(
        new URL(`/?error=authentication_failed&message=${encodeURIComponent(error.message)}`, requestUrl.origin)
      );
    }

    if (!data.session) {
      console.error('Auth callback: No session returned');
      return NextResponse.redirect(
        new URL('/?error=no_session', requestUrl.origin)
      );
    }

    // Log success for debugging
    console.log('Auth successful:', {
      userId: data.user.id,
      provider: data.user.app_metadata.provider,
    });

    // Success - redirect to dashboard
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  // No code present - redirect to home with error
  return NextResponse.redirect(
    new URL('/?error=no_code', requestUrl.origin)
  );
}
