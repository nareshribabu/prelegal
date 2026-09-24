import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MutualNdaPage from "./page";
import { login, logout } from "@/lib/auth";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: replaceMock }),
}));

afterEach(() => {
  logout();
  replaceMock.mockClear();
});

describe("MutualNdaPage", () => {
  it("redirects to /login when not logged in", () => {
    render(<MutualNdaPage />);
    expect(replaceMock).toHaveBeenCalledWith("/login");
  });

  it("renders the Mutual NDA creator and a link back to the dashboard when logged in", () => {
    login();
    render(<MutualNdaPage />);

    expect(screen.getByRole("heading", { name: "Mutual NDA Creator" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to dashboard/i })).toHaveAttribute("href", "/");
  });
});
