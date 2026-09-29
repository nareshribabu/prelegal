import { afterEach, describe, expect, it } from "vitest";
import {
  clearStoredOpenRouterKey,
  getStoredOpenRouterKey,
  normalizeApiKey,
  setStoredOpenRouterKey,
} from "./openRouterKey";

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

describe("normalizeApiKey", () => {
  it("trims surrounding whitespace", () => {
    expect(normalizeApiKey("  sk-or-test-key  ")).toBe("sk-or-test-key");
  });

  it("strips a leading Bearer prefix, case-insensitively", () => {
    expect(normalizeApiKey("Bearer sk-or-test-key")).toBe("sk-or-test-key");
    expect(normalizeApiKey("bearer sk-or-test-key")).toBe("sk-or-test-key");
  });

  it("strips surrounding double or single quotes", () => {
    expect(normalizeApiKey('"sk-or-test-key"')).toBe("sk-or-test-key");
    expect(normalizeApiKey("'sk-or-test-key'")).toBe("sk-or-test-key");
  });

  it("handles a Bearer prefix and quotes together", () => {
    expect(normalizeApiKey('Bearer "sk-or-test-key"')).toBe("sk-or-test-key");
  });

  it("leaves an already-clean key untouched", () => {
    expect(normalizeApiKey("sk-or-test-key")).toBe("sk-or-test-key");
  });
});
