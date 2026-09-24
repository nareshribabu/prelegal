import { afterEach, describe, expect, it } from "vitest";
import { isLoggedIn, login, logout } from "./auth";

afterEach(() => {
  localStorage.clear();
});

describe("auth", () => {
  it("reports logged out by default", () => {
    expect(isLoggedIn()).toBe(false);
  });

  it("reports logged in after login()", () => {
    login();
    expect(isLoggedIn()).toBe(true);
  });

  it("reports logged out after logout()", () => {
    login();
    logout();
    expect(isLoggedIn()).toBe(false);
  });
});
