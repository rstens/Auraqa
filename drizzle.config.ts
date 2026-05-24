/**
 * Drizzle Kit configuration for schema migrations.
 *
 * Run migrations:
 *   npx drizzle-kit generate  — generate SQL migration files
 *   npx drizzle-kit migrate   — apply pending migrations
 *   npx drizzle-kit push      — push schema directly (dev only)
 *
 * @see docs/DATABASE.md for migration workflow
 */

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
