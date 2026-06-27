/**
 * Vitest setup file.
 *
 * - Registers @testing-library/jest-dom matchers (toHaveTextContent,
 *   toHaveAttribute, toBeInTheDocument, etc.) on Vitest's expect.
 * - Runs cleanup() after every test so renders from one test don't leak
 *   into the next (vitest doesn't auto-cleanup like jest does).
 */

import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
