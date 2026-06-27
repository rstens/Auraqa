/**
 * Drizzle ORM client initialization for PostgreSQL 18.
 *
 * The pg Pool is cached on `globalThis` in dev/test so Next.js' HMR (which
 * re-evaluates modules on each file change) reuses the same pool instead of
 * leaking a new one. Without this, the dev server eventually hits Postgres'
 * connection limit and rejects new requests with "too many clients already".
 *
 * @see docs/DATABASE.md for connection configuration
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type Drizzled = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  __auraqa_db?: Drizzled;
};

function createDb(): Drizzled {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle(pool, { schema });
}

/**
 * Drizzle ORM database client with full schema type inference.
 * Import this in server components and API routes.
 *
 * In production this is a regular module-scoped singleton. In dev/test, it's
 * pinned on `globalThis` so HMR doesn't leak a new pool on each reload.
 */
export const db: Drizzled =
  process.env.NODE_ENV === "production" ? createDb() : (globalForDb.__auraqa_db ??= createDb());
