/**
 * Dashboard page
 * Shows recommended posts after successful authentication
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/utils/supabase';
import LogoutButton from '@/components/LogoutButton';

export default async function Dashboard() {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  const { data: { session }, error } = await supabase.auth.getSession();

  if (!session) {
    redirect('/?error=not_authenticated');
  }

  // Access user data
  const user = session.user;
  const username = user.user_metadata?.user_name || user.email;
  const displayName = user.user_metadata?.name || 'User';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-black dark:text-white">
            Responsive Network Builder
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Welcome, @{username}!
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-black dark:text-white">
                Recommended Posts
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Posts from accounts likely to meaningfully respond
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="text-4xl">🚧</div>
              <h3 className="text-lg font-semibold text-black dark:text-white">
                Dashboard Coming Soon
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-md">
                Post discovery and recommendation features are being implemented.
                You have successfully authenticated with X!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
