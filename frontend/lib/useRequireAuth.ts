"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, subscribeToAuthChanges } from "@/lib/auth";

function getServerSnapshot() {
  return false;
}

/** Redirects to /login when the user isn't logged in; returns whether they are. */
export function useRequireAuth(): boolean {
  const router = useRouter();
  const loggedIn = useSyncExternalStore(subscribeToAuthChanges, isLoggedIn, getServerSnapshot);

  useEffect(() => {
    // Re-check the real flag here rather than trusting `loggedIn`: right after a
    // fresh page load (e.g. a static-export client navigation that fell back to a
    // hard reload), the first render can still reflect getServerSnapshot's `false`
    // when the user is actually logged in - redirecting on that would bounce a
    // logged-in user straight back to /login.
    if (!isLoggedIn()) {
      router.replace("/login");
    }
  }, [loggedIn, router]);

  return loggedIn;
}
