/**
 * Site-wide footer.
 *
 * Links to content areas, documentation, and project info.
 */

import Link from "next/link";

export function Footer() {
  return (
    <footer data-testid="footer" className="border-t border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Community
            </h3>
            <ul className="mt-3 space-y-2">
              <FooterLink href="/articles">Knowledge Base</FooterLink>
              <FooterLink href="/forum">Discussion Forum</FooterLink>
              <FooterLink href="/tools">Tools Directory</FooterLink>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Resources
            </h3>
            <ul className="mt-3 space-y-2">
              <FooterLink href="/glossary">ISTQB Glossary</FooterLink>
              <FooterLink href="/search">Search</FooterLink>
              <FooterLink href="/forum/test-automation">Test Automation</FooterLink>
              <FooterLink href="/forum/api-testing">API Testing</FooterLink>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              About
            </h3>
            <ul className="mt-3 space-y-2">
              <FooterLink href="https://github.com/rstens/Auraqa">GitHub</FooterLink>
              <FooterLink href="/login">Sign In</FooterLink>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          AuraQA — A community platform for software testers. Powered by Claude AI.
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        {children}
      </Link>
    </li>
  );
}
