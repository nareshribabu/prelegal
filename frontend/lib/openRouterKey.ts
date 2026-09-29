const STORAGE_KEY = "prelegal_openrouter_api_key";
const KEY_CHANGE_EVENT = "prelegal-openrouter-key-change";

/**
 * Strips common copy-paste mistakes from a pasted API key: a leading
 * "Bearer " (people often copy a whole curl/Authorization example) and
 * surrounding quote marks (from a JSON or code snippet). Without this,
 * OpenRouter rejects the malformed value with an opaque
 * "Missing Authentication header" error instead of a clear one.
 */
export function normalizeApiKey(rawKey: string): string {
  let key = rawKey.trim();
  key = key.replace(/^bearer\s+/i, "");
  const quoted = key.match(/^(['"])(.*)\1$/);
  if (quoted) key = quoted[2];
  return key.trim();
}

/**
 * A user-supplied OpenRouter API key for the GitHub Pages BYOK chat path.
 * Stored only in this browser's localStorage - never sent to our servers,
 * since GitHub Pages has none.
 */
export function getStoredOpenRouterKey(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function setStoredOpenRouterKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key);
  window.dispatchEvent(new Event(KEY_CHANGE_EVENT));
}

export function clearStoredOpenRouterKey(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(KEY_CHANGE_EVENT));
}

/** Lets useSyncExternalStore react to setStoredOpenRouterKey()/clearStoredOpenRouterKey() calls. */
export function subscribeToOpenRouterKeyChanges(callback: () => void): () => void {
  window.addEventListener(KEY_CHANGE_EVENT, callback);
  return () => window.removeEventListener(KEY_CHANGE_EVENT, callback);
}
