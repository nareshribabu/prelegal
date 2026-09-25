"use client";

import Link from "next/link";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { catalog } from "@/lib/catalog";

export default function Dashboard() {
  const ready = useRequireAuth();
  if (!ready) return null;

  return (
    <main className="flex-1 p-6 lg:p-10">
      <h1 className="mb-6 text-3xl font-bold text-[#032147] dark:text-white">
        Documents
      </h1>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.map((entry) => (
          <li
            key={entry.slug}
            className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <h2 className="mb-1 font-medium">{entry.name}</h2>
            <p className="mb-3 text-sm text-zinc-500">{entry.description}</p>
            {entry.available ? (
              <Link
                href={`/documents/${entry.slug}`}
                className="inline-block rounded-full px-4 py-1.5 text-sm font-medium text-white"
                style={{ backgroundColor: "#753991" }}
              >
                Create
              </Link>
            ) : (
              <span className="inline-block rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-medium text-zinc-500 dark:bg-zinc-800">
                Coming soon
              </span>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
