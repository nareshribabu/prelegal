import { afterEach, describe, expect, it, vi } from "vitest";
import { sendMndaChatMessage } from "./mndaChatBackend";
import { createDefaultMndaFormData } from "@/lib/mnda-content";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sendMndaChatMessage", () => {
  it("posts the message history and fields to /api/mnda-chat and returns the parsed body", async () => {
    const fields = createDefaultMndaFormData();
    const messages = [{ role: "user" as const, content: "hello" }];
    const responseBody = { reply: "hi", fields };
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => responseBody }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendMndaChatMessage(messages, fields);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/mnda-chat",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ messages, fields }),
      })
    );
    expect(result).toEqual(responseBody);
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, json: async () => ({}) }))
    );

    await expect(sendMndaChatMessage([], createDefaultMndaFormData())).rejects.toThrow();
  });
});
