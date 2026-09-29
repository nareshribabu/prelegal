import { MndaFormData } from "@/lib/mnda-content";
import { ChatMessage, MndaChatResult } from "@/lib/mndaChatTypes";

/** Sends a chat turn to our backend's /api/mnda-chat, which holds the shared OpenRouter key. */
export async function sendMndaChatMessage(
  messages: ChatMessage[],
  fields: MndaFormData
): Promise<MndaChatResult> {
  const response = await fetch("/api/mnda-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, fields }),
  });
  // Deliberately generic: the backend's own error detail isn't meant for display
  // (it's backed by a shared key, not the user's own), so don't surface it here.
  if (!response.ok) throw new Error("Something went wrong sending that message. Please try again.");
  return response.json();
}
