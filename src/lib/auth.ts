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
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users, accounts, sessions, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { uuidv7 } from "uuidv7";

const isDev = process.env.NODE_ENV !== "production";

const devProvider = Credentials({
  name: "Dev Login",
  credentials: {
    email: { label: "Email", type: "email" },
    name: { label: "Name", type: "text" },
  },
  async authorize(credentials) {
    if (!isDev) return null;
    const email = (credentials.email as string) || "dev@auraqa.local";
    const name = (credentials.name as string) || "Dev User";

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return { id: existing[0].id, email: existing[0].email, name: existing[0].name };
    }

    const id = uuidv7();
    const username = email.split("@")[0];
    await db.insert(users).values({
      id,
      email,
      name,
      username,
      bio: "",
      reputation: 0,
      role: "user",
    });
    return { id, email, name };
  },
});

const providers = [
  GitHub({
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  }),
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
  ...(isDev ? [devProvider] : []),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers,
  session: {
    // Credentials provider requires JWT — database sessions aren't
    // persisted for credentials sign-ins in Auth.js v5.
    strategy: isDev ? "jwt" : "database",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, user, token }) {
      if (session.user) {
        // JWT mode (dev): id comes from token. Database mode (prod): from user.
        session.user.id = (user?.id ?? token?.id) as string;
      }
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
