/**
 * Drizzle ORM client initialization for PostgreSQL 18.
 *
 * Uses a connection pool via the `pg` driver. The DATABASE_URL environment
 * variable must point to a PostgreSQL 18 instance.
 *
 * @see docs/DATABASE.md for connection configuration
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Drizzle ORM database client with full schema type inference.
 * Import this in server components and API routes.
 */
export const db = drizzle(pool, { schema });
