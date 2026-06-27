/**
 * Drizzle ORM client initialization for PostgreSQL 18.
 *
 * The pg Pool is cached on `globalThis` so Next.js' HMR (which re-evaluates
 * modules on every file change in dev) doesn't leak a fresh pool on each
 * reload. Without this, the dev server eventually hits Postgres' connection
 * limit and rejects new requests with "too many clients already".
 *
 * Pool construction does not open a network connection — pg connects lazily
 * on first query — so importing this module without DATABASE_URL set is safe.
 * Pages that actually issue queries at build time still need `force-dynamic`.
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
 */
export const db: Drizzled = globalForDb.__auraqa_db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__auraqa_db = db;
}
