import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./page";
import { isLoggedIn, logout } from "@/lib/auth";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
}));

afterEach(() => {
  logout();
  pushMock.mockClear();
});

describe("LoginPage", () => {
  it("logs in and navigates to the dashboard on submit", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "person@example.com");
    await user.type(screen.getByLabelText("Password"), "anything");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(isLoggedIn()).toBe(true);
    expect(pushMock).toHaveBeenCalledWith("/");
  });
});
