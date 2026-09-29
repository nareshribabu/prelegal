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
  if (!response.ok) throw new Error("chat request failed");
  return response.json();
}
