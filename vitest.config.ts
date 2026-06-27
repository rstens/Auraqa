/**
 * Vitest configuration for AuraQA.
 *
 * Uses jsdom for component tests and supports path aliases
 * matching the Next.js tsconfig.
 *
 * @see docs/TESTING.md for test strategy
 */

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
