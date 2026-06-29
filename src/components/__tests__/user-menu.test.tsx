/**
 * Component tests for UserMenu.
 *
 * UserMenu is a prop-driven client component (the signed-in user is resolved
 * server-side in the Navbar). These cover: the signed-out Sign In link, the
 * display-name fallback chain (username → name → email local-part → "Account"),
 * the dropdown open/close + click-outside behaviour, the admin-only link, the
 * profile href, and the sign-out handler.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserMenu } from "../layout/user-menu";

// signOut is the only client side-effect; hoisted so the vi.mock factory can
// reference it.
const { signOutMock } = vi.hoisted(() => ({ signOutMock: vi.fn() }));
vi.mock("next-auth/react", () => ({
  signOut: (opts?: unknown) => signOutMock(opts),
}));

const adminUser = {
  name: "Admin",
  email: "admin@auraqa.local",
  image: null,
  username: "admin",
  role: "admin",
};

beforeEach(() => signOutMock.mockClear());

describe("UserMenu — signed out", () => {
  it("renders the Sign In link and no menu button when user is null", () => {
    render(<UserMenu user={null} />);
    const link = screen.getByTestId("sign-in-link");
    expect(link).toHaveTextContent("Sign In");
    expect(link).toHaveAttribute("href", "/login");
    expect(screen.queryByTestId("user-menu-button")).not.toBeInTheDocument();
  });
});

describe("UserMenu — button label fallback chain", () => {
  it("prefers the username", () => {
    render(<UserMenu user={adminUser} />);
    expect(screen.getByTestId("user-menu-button")).toHaveTextContent("admin");
  });

  it("falls back to the display name when username is absent", () => {
    render(<UserMenu user={{ ...adminUser, username: null }} />);
    expect(screen.getByTestId("user-menu-button")).toHaveTextContent("Admin");
  });

  it("falls back to the email local-part when username and name are absent", () => {
    render(<UserMenu user={{ ...adminUser, username: null, name: null, email: "jdoe@x.com" }} />);
    expect(screen.getByTestId("user-menu-button")).toHaveTextContent("jdoe");
  });

  it("falls back to 'Account' when username, name, and email are all absent", () => {
    render(
      <UserMenu user={{ username: null, name: null, email: null, image: null, role: "user" }} />,
    );
    expect(screen.getByTestId("user-menu-button")).toHaveTextContent("Account");
  });
});

describe("UserMenu — dropdown", () => {
  it("is closed initially and opens on click, showing identity + links", () => {
    render(<UserMenu user={adminUser} />);
    expect(screen.queryByTestId("user-menu-dropdown")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("user-menu-button"));

    const dropdown = screen.getByTestId("user-menu-dropdown");
    expect(dropdown).toHaveTextContent("Admin");
    expect(dropdown).toHaveTextContent("admin@auraqa.local");
    expect(screen.getByTestId("user-menu-profile")).toHaveAttribute("href", "/profile/admin");
    expect(screen.getByTestId("user-menu-settings")).toHaveAttribute("href", "/profile/settings");
  });

  it("shows the Admin link for admins", () => {
    render(<UserMenu user={adminUser} />);
    fireEvent.click(screen.getByTestId("user-menu-button"));
    expect(screen.getByTestId("user-menu-admin")).toHaveAttribute("href", "/admin");
  });

  it("hides the Admin link for non-admins", () => {
    render(<UserMenu user={{ ...adminUser, role: "user" }} />);
    fireEvent.click(screen.getByTestId("user-menu-button"));
    expect(screen.queryByTestId("user-menu-admin")).not.toBeInTheDocument();
  });

  it("uses the display name in the profile href when username is absent", () => {
    render(<UserMenu user={{ ...adminUser, username: null }} />);
    fireEvent.click(screen.getByTestId("user-menu-button"));
    expect(screen.getByTestId("user-menu-profile")).toHaveAttribute("href", "/profile/Admin");
  });

  it.each([
    ["user-menu-profile"],
    ["user-menu-settings"],
    ["user-menu-admin"],
  ])("closes the dropdown when %s is clicked", (testid) => {
    render(<UserMenu user={adminUser} />);
    fireEvent.click(screen.getByTestId("user-menu-button"));
    fireEvent.click(screen.getByTestId(testid));
    expect(screen.queryByTestId("user-menu-dropdown")).not.toBeInTheDocument();
  });

  it("calls signOut with the home callbackUrl when Sign Out is clicked", () => {
    render(<UserMenu user={adminUser} />);
    fireEvent.click(screen.getByTestId("user-menu-button"));
    fireEvent.click(screen.getByTestId("sign-out-button"));
    expect(signOutMock).toHaveBeenCalledWith({ callbackUrl: "/" });
  });

  it("stays open on an inside mousedown and closes on an outside mousedown", () => {
    render(<UserMenu user={adminUser} />);
    fireEvent.click(screen.getByTestId("user-menu-button"));
    expect(screen.getByTestId("user-menu-dropdown")).toBeInTheDocument();

    // Inside click — handler sees the target within the menu ref, stays open.
    fireEvent.mouseDown(screen.getByTestId("user-menu-dropdown"));
    expect(screen.getByTestId("user-menu-dropdown")).toBeInTheDocument();

    // Outside click — closes.
    fireEvent.mouseDown(document.body);
    expect(screen.queryByTestId("user-menu-dropdown")).not.toBeInTheDocument();
  });
});
