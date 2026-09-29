"use client";

import { FormEvent, useState } from "react";

interface MndaKeySettingsProps {
  hasKey: boolean;
  onSave: (key: string) => void;
  onRemove: () => void;
}

export function MndaKeySettings({ hasKey, onSave, onRemove }: MndaKeySettingsProps) {
  const [input, setInput] = useState("");

  if (hasKey) {
    return (
      <div className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800">
        <span className="text-zinc-500">Using your OpenRouter API key for AI chat.</span>
        <button
          type="button"
          onClick={onRemove}
          className="font-medium"
          style={{ color: "#209dd7" }}
        >
          Remove key
        </button>
      </div>
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setInput("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800"
    >
      <label className="block font-medium" htmlFor="openrouter-key">
        Have an OpenRouter API key? Enable AI chat.
      </label>
      <div className="flex gap-2">
        <input
          id="openrouter-key"
          type="password"
          autoComplete="off"
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="sk-or-..."
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="rounded-full px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          style={{ backgroundColor: "#753991" }}
        >
          Save
        </button>
      </div>
      <p className="text-xs text-zinc-500">
        Your key is stored only in this browser and sent directly to OpenRouter - never to our servers.
      </p>
    </form>
  );
}
