const AUTH_KEY = "prelegal_logged_in";
const AUTH_CHANGE_EVENT = "prelegal-auth-change";

/**
 * Fake auth for the V1 foundation: any credentials are accepted, we just
 * remember that "login" happened so gated pages let the user through.
 */
export function isLoggedIn(): boolean {
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function login(): void {
  localStorage.setItem(AUTH_KEY, "true");
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

/** Lets useSyncExternalStore react to login()/logout() calls. */
export function subscribeToAuthChanges(callback: () => void): () => void {
  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  return () => window.removeEventListener(AUTH_CHANGE_EVENT, callback);
}
