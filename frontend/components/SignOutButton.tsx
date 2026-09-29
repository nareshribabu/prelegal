"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

export function SignOutButton() {
  const router = useRouter();

  function handleSignOut() {
    logout();
    router.push("/login");
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
    >
      Sign out
    </button>
  );
}
