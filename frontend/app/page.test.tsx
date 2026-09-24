import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Dashboard from "./page";
import { login, logout } from "@/lib/auth";
import { catalog } from "@/lib/catalog";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: replaceMock }),
}));

afterEach(() => {
  logout();
  replaceMock.mockClear();
});

describe("Dashboard", () => {
  it("redirects to /login when not logged in", () => {
    render(<Dashboard />);
    expect(replaceMock).toHaveBeenCalledWith("/login");
  });

  it("renders a tile for every catalog entry when logged in", () => {
    login();
    render(<Dashboard />);

    for (const entry of catalog) {
      expect(screen.getByText(entry.name)).toBeInTheDocument();
    }
  });

  it("only links to the document creator for available entries", () => {
    login();
    render(<Dashboard />);

    expect(screen.getByRole("link", { name: "Create" })).toHaveAttribute(
      "href",
      "/documents/mutual-nda"
    );
    expect(screen.getAllByText("Coming soon")).toHaveLength(
      catalog.filter((entry) => !entry.available).length
    );
  });
});
