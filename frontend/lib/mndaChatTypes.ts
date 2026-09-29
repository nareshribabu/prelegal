import { MndaFormData } from "@/lib/mnda-content";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface MndaChatResult {
  reply: string;
  fields: MndaFormData;
}

/** Sends the full message history and current fields, and gets back a reply plus merged fields. */
export type SendMndaChatMessage = (
  messages: ChatMessage[],
  fields: MndaFormData
) => Promise<MndaChatResult>;
