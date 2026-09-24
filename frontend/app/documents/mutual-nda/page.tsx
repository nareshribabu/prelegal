"use client";

import Link from "next/link";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { MndaCreator } from "@/components/MndaCreator";

export default function MutualNdaPage() {
  const ready = useRequireAuth();
  if (!ready) return null;

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
        <Link href="/" className="text-sm font-medium" style={{ color: "#209dd7" }}>
          &larr; Back to dashboard
        </Link>
      </div>
      <MndaCreator />
    </div>
  );
}
