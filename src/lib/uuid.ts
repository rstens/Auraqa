/**
 * UUIDv7 generation utility for AuraQA.
 *
 * UUIDv7 embeds a millisecond-precision timestamp in the most significant bits,
 * producing monotonically increasing values that are naturally sorted by creation
 * time. This yields excellent B-tree index performance compared to random UUIDv4.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9562#section-5.7
 */

import { uuidv7 } from "uuidv7";

/**
 * Generate a new UUIDv7 string.
 * Used as the primary key for all entity tables (users, articles, threads, etc.).
 */
export function generateId(): string {
  return uuidv7();
}
