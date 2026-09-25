"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    login();
    router.push("/");
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border border-zinc-200 p-8 shadow-sm dark:border-zinc-800"
      >
        <h1 className="text-3xl font-bold text-[#032147] dark:text-white">
          Sign in to Prelegal
        </h1>
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900"
            style={{ outlineColor: "#209dd7" }}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900"
            style={{ outlineColor: "#209dd7" }}
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full px-5 py-2 text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: "#753991" }}
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
