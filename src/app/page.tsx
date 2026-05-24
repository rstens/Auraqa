/**
 * AuraQA landing page.
 *
 * Server Component — renders the hero section with links to the three
 * main content areas: Articles, Forum, and Tools Directory.
 */

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <main className="flex flex-col items-center gap-12 px-6 py-24 text-center">
        {/* Hero */}
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            AuraQA
          </h1>
          <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            The community platform for software testers. Knowledge articles,
            community forums, and a testing tools directory — all in one place.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid max-w-4xl gap-6 sm:grid-cols-3">
          <FeatureCard
            href="/articles"
            title="Knowledge Base"
            description="Articles on testing methodologies, best practices, and tool guides written by the community."
            icon="📚"
          />
          <FeatureCard
            href="/forum"
            title="Community Forum"
            description="Ask questions, share experiences, and get answers from fellow testers worldwide."
            icon="💬"
          />
          <FeatureCard
            href="/tools"
            title="Tools Directory"
            description="Discover, compare, and review testing tools across all categories."
            icon="🔧"
          />
        </div>

        {/* AI badge */}
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          <span>Powered by Claude AI</span>
          <span className="text-xs">— smart search, article summaries, and answer suggestions</span>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6 text-left transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
    >
      <span className="text-3xl">{icon}</span>
      <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
        {title}
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </Link>
  );
}
