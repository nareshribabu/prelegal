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
    if (!loggedIn) {
      router.replace("/login");
    }
  }, [loggedIn, router]);

  return loggedIn;
}
