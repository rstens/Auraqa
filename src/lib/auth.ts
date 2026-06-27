/**
 * NextAuth.js configuration for AuraQA.
 *
 * Supports GitHub and Google OAuth providers with Drizzle adapter
 * for persisting users, accounts, and sessions in PostgreSQL 18.
 *
 * After first OAuth login, users are assigned a username derived from
 * their provider profile (email prefix or provider username).
 *
 * @see docs/ARCHITECTURE.md for auth flow details
 */

import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users, accounts, sessions, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    session({ session, user }) {
      // The DrizzleAdapter loads the full user row into `user`. Surface
      // the AuraQA-specific id + username on the session so callers don't
      // have to do an extra round-trip. Type augmentation lives in
      // src/types/next-auth.d.ts so this assignment is cast-free.
      session.user.id = user.id;
      session.user.username = user.username ?? null;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      const username =
        user.email?.split("@")[0] ??
        `user-${user.id.slice(0, 8)}`;
      await db
        .update(users)
        .set({ username, bio: "" })
        .where(eq(users.id, user.id));
    },
  },
  pages: {
    signIn: "/login",
  },
});
