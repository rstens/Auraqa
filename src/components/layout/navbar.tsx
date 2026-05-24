/**
 * Site-wide navigation bar.
 *
 * Server Component shell with a client-side UserMenu for auth state.
 * Includes links to the three main content areas and a search bar.
 */

import Link from "next/link";
import { UserMenu } from "./user-menu";

export function Navbar() {
  return (
    <header data-testid="navbar" className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          data-testid="navbar-logo"
          className="text-xl font-bold text-slate-900 dark:text-white"
        >
          AuraQA
        </Link>

        {/* Navigation links — hidden on mobile */}
        <nav data-testid="navbar-nav" className="hidden items-center gap-6 md:flex">
          <NavLink href="/articles">Articles</NavLink>
          <NavLink href="/forum">Forum</NavLink>
          <NavLink href="/tools">Tools</NavLink>
        </nav>

        {/* Right side: search + user */}
        <div className="flex items-center gap-4">
          <Link
            href="/search"
            data-testid="navbar-search"
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Search"
          >
            <SearchIcon />
          </Link>
          <UserMenu />

          {/* Mobile menu button */}
          <MobileMenuButton />
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
    >
      {children}
    </Link>
  );
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function MobileMenuButton() {
  return (
    <details className="relative md:hidden">
      <summary className="list-none rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </summary>
      <nav data-testid="mobile-nav" className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <MobileNavLink href="/articles">Articles</MobileNavLink>
        <MobileNavLink href="/forum">Forum</MobileNavLink>
        <MobileNavLink href="/tools">Tools</MobileNavLink>
        <MobileNavLink href="/search">Search</MobileNavLink>
      </nav>
    </details>
  );
}

function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
    >
      {children}
    </Link>
  );
}
