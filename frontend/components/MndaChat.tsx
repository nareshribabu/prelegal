"use client";

import { FormEvent, useState } from "react";
import { MndaFormData } from "@/lib/mnda-content";
import { ChatMessage, SendMndaChatMessage } from "@/lib/mndaChatTypes";

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'll help you put together your Mutual NDA. Let's start with the two parties - what's the name of the first company?",
};

interface MndaChatProps {
  fields: MndaFormData;
  onFieldsChange: (fields: MndaFormData) => void;
  sendMessage: SendMndaChatMessage;
}

export function MndaChat({ fields, onFieldsChange, sendMessage }: MndaChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if (!content || isSending) return;

    const nextMessages = [...messages, { role: "user", content } as ChatMessage];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      const result = await sendMessage(nextMessages, fields);
      setMessages([...nextMessages, { role: "assistant", content: result.reply }]);
      onFieldsChange(result.fields);
    } catch {
      setError("Something went wrong sending that message. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto" aria-live="polite">
        {messages.map((message, i) => (
          <div
            key={i}
            className={
              message.role === "user"
                ? "ml-auto max-w-[85%] rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-white dark:text-zinc-900"
                : "mr-auto max-w-[85%] rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            }
          >
            {message.content}
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <form className="mt-3 flex gap-2" onSubmit={handleSend}>
        <label className="sr-only" htmlFor="mnda-chat-input">
          Message
        </label>
        <input
          id="mnda-chat-input"
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer..."
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="rounded-full px-5 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: "#753991" }}
        >
          {isSending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
