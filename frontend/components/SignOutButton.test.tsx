import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignOutButton } from "./SignOutButton";
import { isLoggedIn, login, logout } from "@/lib/auth";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

afterEach(() => {
  logout();
  pushMock.mockClear();
});

describe("SignOutButton", () => {
  it("logs the user out and redirects to /login when clicked", async () => {
    login();
    const user = userEvent.setup();

    render(<SignOutButton />);
    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(isLoggedIn()).toBe(false);
    expect(pushMock).toHaveBeenCalledWith("/login");
  });
});
