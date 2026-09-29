import { afterEach, describe, expect, it } from "vitest";
import { clearStoredOpenRouterKey, getStoredOpenRouterKey, setStoredOpenRouterKey } from "./openRouterKey";

afterEach(() => {
  localStorage.clear();
});

describe("openRouterKey", () => {
  it("returns null when no key has been stored", () => {
    expect(getStoredOpenRouterKey()).toBeNull();
  });

  it("stores and retrieves a key", () => {
    setStoredOpenRouterKey("sk-or-test-key");
    expect(getStoredOpenRouterKey()).toBe("sk-or-test-key");
  });

  it("removes the stored key", () => {
    setStoredOpenRouterKey("sk-or-test-key");
    clearStoredOpenRouterKey();
    expect(getStoredOpenRouterKey()).toBeNull();
  });
});
