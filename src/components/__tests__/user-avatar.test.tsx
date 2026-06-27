/**
 * Component tests for UserAvatar.
 *
 * Covers the image-vs-initials branch, size scaling, and the "U" fallback
 * when no name is provided.
 *
 * `next/image` renders both an `<img>` and a wrapping element with role="img"
 * in jsdom, so tests reach the underlying <img> by alt text rather than by
 * role.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserAvatar } from "../shared/user-avatar";

describe("UserAvatar — initials fallback", () => {
  it("renders the initials when no src is provided", () => {
    render(<UserAvatar name="Alice" />);
    expect(screen.getByLabelText("Alice")).toHaveTextContent("A");
  });

  it("uppercases the first letter of the name", () => {
    render(<UserAvatar name="bob" />);
    expect(screen.getByLabelText("bob")).toHaveTextContent("B");
  });

  it("falls back to 'U' when name is null/undefined", () => {
    render(<UserAvatar />);
    expect(screen.getByLabelText("U")).toHaveTextContent("U");
  });

  it("applies the requested size class on the initials fallback", () => {
    const { container } = render(<UserAvatar name="A" size="lg" />);
    const el = container.firstElementChild!;
    expect(el.className).toContain("h-16 w-16");
    expect(el.className).toContain("text-2xl");
  });

  it("applies the small size by default", () => {
    const { container } = render(<UserAvatar name="A" />);
    const el = container.firstElementChild!;
    expect(el.className).toContain("h-8 w-8");
  });
});

describe("UserAvatar — image", () => {
  it("renders an <img> when src is provided", () => {
    render(<UserAvatar src="/avatar.png" name="Alice" />);
    expect(screen.getByAltText("Alice").tagName).toBe("IMG");
  });

  it("uses the explicit alt prop when provided", () => {
    render(<UserAvatar src="/avatar.png" alt="Profile photo" name="Alice" />);
    expect(screen.getByAltText("Profile photo")).toBeInTheDocument();
  });

  it("renders an image with the matching pixel size for 'md'", () => {
    render(<UserAvatar src="/x.png" name="Alice" size="md" />);
    const img = screen.getByAltText("Alice");
    expect(img).toHaveAttribute("width", "48");
    expect(img).toHaveAttribute("height", "48");
  });
});
