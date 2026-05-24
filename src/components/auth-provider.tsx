/**
 * NextAuth.js session provider wrapper.
 *
 * Client component that wraps the app with SessionProvider,
 * enabling useSession() in child components.
 */

"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
