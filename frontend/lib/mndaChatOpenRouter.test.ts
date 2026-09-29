import { afterEach, describe, expect, it, vi } from "vitest";
import { createOpenRouterMndaChatSender } from "./mndaChatOpenRouter";
import { createDefaultMndaFormData } from "@/lib/mnda-content";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createOpenRouterMndaChatSender", () => {
  it("calls OpenRouter directly with the given API key, model, and structured output schema", async () => {
    const fields = createDefaultMndaFormData();
    const updatedFields = { ...fields, purpose: "Evaluating a partnership" };
    const openRouterBody = {
      choices: [{ message: { content: JSON.stringify({ reply: "hi", fields: updatedFields }) } }],
    };
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => openRouterBody }));
    vi.stubGlobal("fetch", fetchMock);

    const sendMessage = createOpenRouterMndaChatSender("sk-or-test-key");
    const result = await sendMessage([{ role: "user", content: "hello" }], fields);

    expect(result).toEqual({ reply: "hi", fields: updatedFields });

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://openrouter.ai/api/v1/chat/completions");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer sk-or-test-key");

    const sentBody = JSON.parse(init.body as string);
    expect(sentBody.model).toBe("nvidia/nemotron-3-super-120b-a12b:free");
    expect(sentBody.provider).toEqual({ require_parameters: true });
    expect(sentBody.max_tokens).toBeGreaterThan(0);
    expect(sentBody.response_format.type).toBe("json_schema");
    expect(sentBody.messages[0].role).toBe("system");
    expect(sentBody.messages.at(-1)).toEqual({ role: "user", content: "hello" });
  });

  it("throws with OpenRouter's own error message when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        json: async () => ({ error: { message: "Rate limit exceeded" } }),
      }))
    );

    const sendMessage = createOpenRouterMndaChatSender("sk-or-test-key");
    await expect(sendMessage([], createDefaultMndaFormData())).rejects.toThrow("Rate limit exceeded");
  });

  it("throws a generic message when the response is not ok and has no error detail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, json: async () => ({}) }))
    );

    const sendMessage = createOpenRouterMndaChatSender("sk-or-test-key");
    await expect(sendMessage([], createDefaultMndaFormData())).rejects.toThrow();
  });

  it("throws when the response has no message content", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => ({ choices: [{ message: {} }] }) }))
    );

    const sendMessage = createOpenRouterMndaChatSender("sk-or-test-key");
    await expect(sendMessage([], createDefaultMndaFormData())).rejects.toThrow();
  });

  it("throws a specific message when the response was cut off while reasoning", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ choices: [{ message: { content: "" }, finish_reason: "length" }] }),
      }))
    );

    const sendMessage = createOpenRouterMndaChatSender("sk-or-test-key");
    await expect(sendMessage([], createDefaultMndaFormData())).rejects.toThrow(/ran out of tokens/i);
  });
});
