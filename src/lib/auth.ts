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

const credentialsProvider = Credentials({
  name: "Credentials",
  credentials: {
    username: { label: "Username", type: "text" },
    password: { label: "Password", type: "password" },
    email: { label: "Email", type: "email" },
    name: { label: "Name", type: "text" },
  },
  async authorize(credentials) {
    const username = credentials.username as string | undefined;
    const password = credentials.password as string | undefined;

    // Admin login — available in all environments
    if (username === "admin" && password === "admin") {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.username, "admin"))
        .limit(1);

      if (existing.length > 0) {
        return { id: existing[0].id, email: existing[0].email, name: existing[0].name };
      }

      const id = uuidv7();
      await db.insert(users).values({
        id,
        email: "admin@auraqa.local",
        name: "Admin",
        username: "admin",
        bio: "",
        reputation: 0,
        role: "admin",
      });
      return { id, email: "admin@auraqa.local", name: "Admin" };
    }

    // Dev quick-login — dev only
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
    const uname = email.split("@")[0];
    await db.insert(users).values({
      id,
      email,
      name,
      username: uname,
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
  credentialsProvider,
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
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const dbUser = await db
          .select({ role: users.role, username: users.username })
          .from(users)
          .where(eq(users.id, user.id!))
          .limit(1);
        token.role = dbUser[0]?.role ?? "user";
        token.username = dbUser[0]?.username ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as Record<string, unknown>).role = token.role as string;
        (session.user as unknown as Record<string, unknown>).username = token.username as string;
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

export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return (session?.user as Record<string, unknown> | undefined)?.role === "admin";
}
