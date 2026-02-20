/**
 * Login button component
 * Initiates X OAuth flow via Supabase Auth
 */

'use client';

import { createClient } from '@/lib/utils/supabase';

export default function LoginButton() {
  const supabase = createClient();

  const handleLogin = async () => {
    // Redirect to auth callback which will handle the OAuth flow
    const redirectUrl = `${window.location.origin}/auth/callback`;

    await supabase.auth.signInWithOAuth({
      provider: 'x',
      options: {
        redirectTo: redirectUrl,
        scopes: 'tweet.read tweet.write users.read offline.access',
      },
    });
  };

  return (
    <button
      onClick={handleLogin}
      className="inline-flex items-center gap-3 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
    >
      <svg
        className="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      Login with X
    </button>
  );
}
