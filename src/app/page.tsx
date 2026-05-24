/**
 * AuraQA landing page.
 *
 * Server Component that renders the hero section, feature cards,
 * and community stats. Links to the three main content areas.
 */

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white px-4 py-20 text-center dark:from-slate-950 dark:to-slate-900 sm:py-28">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
          The QA Community
          <br />
          <span className="text-blue-600 dark:text-blue-400">Built for Testers</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Knowledge articles, community forums, and a testing tools directory
          — all in one place. Powered by AI to help you find answers faster.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/forum"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Join the Discussion
          </Link>
          <Link
            href="/articles"
            className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Browse Articles
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-slate-900 dark:text-white">
          Everything You Need
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-slate-600 dark:text-slate-400">
          A unified platform for the software testing community
        </p>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          <FeatureCard
            href="/articles"
            title="Knowledge Base"
            description="Community-written articles on test automation, CI/CD, performance, security, and more. Markdown-powered with AI-generated summaries."
            icon={<ArticlesIcon />}
          />
          <FeatureCard
            href="/forum"
            title="Community Forum"
            description="Ask questions, share experiences, and get answers. Organized by categories like Test Automation, API Testing, and Security."
            icon={<ForumIcon />}
          />
          <FeatureCard
            href="/tools"
            title="Tools Directory"
            description="Discover and compare testing tools. Browse by category, read community reviews, and find the right tool for your stack."
            icon={<ToolsIcon />}
          />
        </div>
      </section>

      {/* AI feature highlight */}
      <section className="border-t border-slate-200 bg-slate-50 px-4 py-16 dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            AI-Powered Features
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Claude AI helps you work smarter — from summarizing articles and
            suggesting answers to expanding your search queries and classifying
            content with relevant tags.
          </p>
          <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
            <AIFeature title="Smart Search" description="Natural language queries expanded into precise search terms" />
            <AIFeature title="Article Summaries" description="2-3 sentence summaries generated for every published article" />
            <AIFeature title="Answer Suggestions" description="AI-suggested answers for unanswered community questions" />
            <AIFeature title="Tag Classification" description="Content automatically classified with relevant testing tags" />
          </div>
        </div>
      </section>
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
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-800"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </Link>
  );
}

function AIFeature({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
}

function ArticlesIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function ForumIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  );
}

function ToolsIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.049.58.025 1.193-.14 1.743" />
    </svg>
  );
}
