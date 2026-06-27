/**
 * User menu component for the navbar.
 *
 * Shows sign-in link for unauthenticated users, or a dropdown
 * with profile/settings/sign-out for authenticated users.
 */

"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (status === "loading") {
    return (
      <div data-testid="user-menu-loading" className="h-8 w-8 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        data-testid="sign-in-link"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        data-testid="user-menu-button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80"
      >
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name ?? "User"}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
            {(session.user.name ?? "U")[0].toUpperCase()}
          </div>
        )}
      </button>

      {open && (
        <div data-testid="user-menu-dropdown" className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <div className="border-b border-slate-200 px-4 py-2 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {session.user.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {session.user.email}
            </p>
          </div>
          <Link
            href={`/profile/${(session.user as unknown as Record<string, unknown>).username ?? session.user.name}`}
            data-testid="user-menu-profile"
            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <Link
            href="/profile/settings"
            data-testid="user-menu-settings"
            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          {(session.user as unknown as Record<string, unknown>).role === "admin" && (
            <Link
              href="/admin"
              data-testid="user-menu-admin"
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              onClick={() => setOpen(false)}
            >
              Admin
            </Link>
          )}
          <button
            data-testid="sign-out-button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100 dark:text-red-400 dark:hover:bg-slate-700"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
