/**
 * NextAuth module augmentation for AuraQA.
 *
 * Extends `Session.user` with the AuraQA-specific `id` and `username`
 * fields populated by the session callback in src/lib/auth.ts. Without
 * this, every callsite needs a `(session.user as { username?: string })`
 * cast.
 */

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      username: string | null;
    };
  }

  interface User {
    username?: string | null;
  }
}
