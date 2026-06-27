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
      <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
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
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <div className="border-b border-slate-200 px-4 py-2 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {session.user.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {session.user.email}
            </p>
          </div>
          {/* `username` comes from our session callback, not the OAuth name. */}
          {(session.user as { username?: string | null }).username && (
            <Link
              href={`/profile/${(session.user as { username: string }).username}`}
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              onClick={() => setOpen(false)}
            >
              Profile
            </Link>
          )}
          <Link
            href="/profile/settings"
            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          <button
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
