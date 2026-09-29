const STORAGE_KEY = "prelegal_openrouter_api_key";
const KEY_CHANGE_EVENT = "prelegal-openrouter-key-change";

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
