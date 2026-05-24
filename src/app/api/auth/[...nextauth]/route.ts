/**
 * NextAuth.js API route handler.
 *
 * Handles all /api/auth/* routes including OAuth callbacks,
 * session management, and sign-in/sign-out.
 */

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
