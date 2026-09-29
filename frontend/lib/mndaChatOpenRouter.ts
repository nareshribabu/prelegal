import { MndaFormData } from "@/lib/mnda-content";
import { ChatMessage, MndaChatResult, SendMndaChatMessage } from "@/lib/mndaChatTypes";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * A free (":free") OpenRouter model, so this path works with a $0-limit
 * BYOK key - unlike the backend's openai/gpt-oss-120b via Cerebras, which
 * always costs a small amount per token and has no free tier. None of
 * OpenRouter's free models are served by Cerebras, so this path doesn't
 * pin an inference provider either - it lets OpenRouter route across
 * whichever of this model's several free-tier providers is available.
 */
const MODEL = "google/gemma-4-26b-a4b-it:free";

const PARTY_SCHEMA = {
  type: "object",
  properties: {
    companyName: { type: "string" },
    signatoryName: { type: "string" },
    signatoryTitle: { type: "string" },
    noticeAddress: { type: "string" },
  },
  required: ["companyName", "signatoryName", "signatoryTitle", "noticeAddress"],
  additionalProperties: false,
};

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string" },
    fields: {
      type: "object",
      properties: {
        partyOne: PARTY_SCHEMA,
        partyTwo: PARTY_SCHEMA,
        purpose: { type: "string" },
        effectiveDate: { type: "string" },
        mndaTermType: { type: "string", enum: ["expires", "untilTerminated"] },
        mndaTermYears: { type: "number" },
        confidentialityTermType: { type: "string", enum: ["years", "perpetuity"] },
        confidentialityTermYears: { type: "number" },
        governingLaw: { type: "string" },
        jurisdiction: { type: "string" },
      },
      required: [
        "partyOne",
        "partyTwo",
        "purpose",
        "effectiveDate",
        "mndaTermType",
        "mndaTermYears",
        "confidentialityTermType",
        "confidentialityTermYears",
        "governingLaw",
        "jurisdiction",
      ],
      additionalProperties: false,
    },
  },
  required: ["reply", "fields"],
  additionalProperties: false,
};

/**
 * Mirrors the system prompt in backend/app/mnda_chat.py by hand - GitHub
 * Pages has no backend to share this logic with, so this is a deliberate,
 * unavoidable duplication of that instructional text.
 */
function buildSystemPrompt(fields: MndaFormData): string {
  return `You are a legal intake assistant helping a user fill out a \
Mutual Non-Disclosure Agreement (Mutual NDA) through freeform conversation.

Fields to collect (JSON field name -> meaning):
- partyOne.companyName, partyOne.signatoryName, partyOne.signatoryTitle, partyOne.noticeAddress
- partyTwo.companyName, partyTwo.signatoryName, partyTwo.signatoryTitle, partyTwo.noticeAddress
- purpose: why the parties are exchanging confidential information
- effectiveDate: ISO date (YYYY-MM-DD) the agreement starts
- mndaTermType ("expires" or "untilTerminated") and mndaTermYears (if "expires")
- confidentialityTermType ("years" or "perpetuity") and confidentialityTermYears (if "years")
- governingLaw: US state whose law governs the agreement
- jurisdiction: where legal disputes must be brought

Ask the user conversational, one-or-few-at-a-time questions about whichever \
fields are still missing below. Only discuss the Mutual NDA - if the user asks \
about a different kind of document, explain that only the Mutual NDA is \
supported here and steer back. Once every field is filled, confirm with the \
user and let them know they can download the PDF.

Always return the full field set, carrying forward every value already known \
below and merging in anything new the user just told you. Never blank out a \
field the user already provided unless they explicitly change it.

Current field values (JSON):
${JSON.stringify(fields)}
`;
}

/**
 * Sends a chat turn directly to OpenRouter from the browser using a
 * user-supplied API key - the GitHub Pages fallback, since there's no
 * backend there to hold a shared key.
 */
export function createOpenRouterMndaChatSender(apiKey: string): SendMndaChatMessage {
  return async function sendMndaChatMessageViaOpenRouter(
    messages: ChatMessage[],
    fields: MndaFormData
  ): Promise<MndaChatResult> {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        reasoning: { effort: "low" },
        messages: [{ role: "system", content: buildSystemPrompt(fields) }, ...messages],
        response_format: {
          type: "json_schema",
          json_schema: { name: "mnda_chat_completion", strict: true, schema: RESPONSE_SCHEMA },
        },
      }),
    });

    if (!response.ok) {
      // This is the user's own key/account, so surface OpenRouter's actual
      // reason (e.g. rate limit, invalid key) instead of a generic message.
      const errorBody = await response.json().catch(() => null);
      const detail = errorBody?.error?.message;
      throw new Error(detail ? `OpenRouter error: ${detail}` : "OpenRouter request failed. Check your API key and try again.");
    }

    const body = await response.json();
    const content = body?.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("OpenRouter response missing message content");

    return JSON.parse(content) as MndaChatResult;
  };
}
