/**
 * User menu for the navbar.
 *
 * The signed-in user is resolved on the server (via `auth()` in the
 * Navbar) and passed in as a prop, rather than read from the client
 * `useSession()`. This is deliberate: after a credentials/OAuth login the
 * server action redirects and the navbar re-renders server-side with the
 * fresh session cookie, so the header switches to the user's name on the
 * very next render — no manual refresh. `useSession()` would lag here
 * because its provider seeds state once on mount and does not re-sync
 * across the post-login RSC navigation.
 *
 * Only the dropdown (open/close) and sign-out remain client-side.
 */

"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { UserAvatar } from "@/components/shared/user-avatar";

export type MenuUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string | null;
  role?: string | null;
};

export function UserMenu({ user }: { user: MenuUser | null }) {
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

  if (!user) {
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

  // Label the button with whoever is signed in: username → display name →
  // email local-part. This is the server-resolved user, so it is correct
  // immediately on the first render after login.
  const displayName = user.username || user.name || user.email?.split("@")[0] || "Account";

  return (
    <div className="relative" ref={menuRef}>
      <button
        data-testid="user-menu-button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full pr-2 transition-opacity hover:opacity-80"
      >
        <UserAvatar src={user.image} name={user.name} size="sm" />
        <span className="max-w-[10rem] truncate text-sm font-medium text-slate-700 dark:text-slate-200">
          {displayName}
        </span>
      </button>

      {open && (
        <div
          data-testid="user-menu-dropdown"
          className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="border-b border-slate-200 px-4 py-2 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
          <Link
            href={`/profile/${user.username ?? user.name}`}
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
          {user.role === "admin" && (
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
