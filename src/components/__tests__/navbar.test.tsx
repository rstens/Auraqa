/**
 * Component tests for Navbar.
 *
 * Navbar is an async Server Component that resolves the session via auth()
 * and hands the user to UserMenu. We mock @/lib/auth (so the real NextAuth /
 * Drizzle stack never loads) and render `await Navbar()`. Covers the static
 * shell plus the signed-out / signed-in / user-less-session branches of
 * `session?.user ?? null`.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: () => authMock() }));
// UserMenu (rendered by Navbar) imports signOut at module load.
vi.mock("next-auth/react", () => ({ signOut: vi.fn() }));

import { Navbar } from "../layout/navbar";

beforeEach(() => authMock.mockReset());

describe("Navbar", () => {
  it("renders the static shell and the Sign In link when signed out", async () => {
    authMock.mockResolvedValue(null);
    render(await Navbar());

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("navbar-logo")).toHaveTextContent("AuraQA");
    expect(screen.getByTestId("navbar-nav")).toBeInTheDocument();
    expect(screen.getByTestId("navbar-search")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-nav")).toBeInTheDocument();
    // All four primary nav destinations render.
    for (const label of ["Articles", "Forum", "Tools", "Glossary"]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }

    expect(screen.getByTestId("sign-in-link")).toBeInTheDocument();
    expect(screen.queryByTestId("user-menu-button")).not.toBeInTheDocument();
  });

  it("passes the signed-in user through to the menu", async () => {
    authMock.mockResolvedValue({
      user: { name: "Admin", username: "admin", email: "admin@auraqa.local", role: "admin", image: null },
    });
    render(await Navbar());

    expect(screen.getByTestId("user-menu-button")).toHaveTextContent("admin");
    expect(screen.queryByTestId("sign-in-link")).not.toBeInTheDocument();
  });

  it("treats a session without a user as signed out", async () => {
    authMock.mockResolvedValue({});
    render(await Navbar());

    expect(screen.getByTestId("sign-in-link")).toBeInTheDocument();
    expect(screen.queryByTestId("user-menu-button")).not.toBeInTheDocument();
  });
});
