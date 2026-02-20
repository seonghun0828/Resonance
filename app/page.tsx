import LoginButton from '@/components/LoginButton';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-900">
      <main className="flex flex-col items-center justify-center px-6 py-16 text-center max-w-4xl">
        <div className="flex flex-col items-center gap-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            MVP - Early Access
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-black dark:text-white">
            Build a{' '}
            <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Responsive Network
            </span>
            {' '}Not Just Followers
          </h1>

          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Stop missing opportunities. Discover posts from accounts likely to meaningfully respond.
            Build authentic connections, not vanity metrics.
          </p>

          <div className="flex flex-col items-center gap-6 mt-8">
            <LoginButton />
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              For solo founders, indie hackers, and early-stage builders
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 text-left">
            <div className="flex flex-col gap-3">
              <div className="text-2xl">🎯</div>
              <h3 className="font-semibold text-black dark:text-white">
                Find Relevant Posts
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Discover posts you would otherwise miss, filtered by engagement likelihood
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="text-2xl">💬</div>
              <h3 className="font-semibold text-black dark:text-white">
                Authentic Engagement
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No automation. Write your own replies. Build real connections.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="text-2xl">📈</div>
              <h3 className="font-semibold text-black dark:text-white">
                Response Likelihood
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                See signals: posting frequency, follower ratio, recent activity
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
