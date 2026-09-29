import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MndaChat } from "./MndaChat";
import { createDefaultMndaFormData } from "@/lib/mnda-content";
import { ChatMessage, MndaChatResult } from "@/lib/mndaChatTypes";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MndaChat", () => {
  it("shows a greeting message on mount without calling sendMessage", () => {
    const sendMessage = vi.fn();
    render(<MndaChat fields={createDefaultMndaFormData()} onFieldsChange={vi.fn()} sendMessage={sendMessage} />);

    expect(screen.getByText(/help you put together your Mutual NDA/i)).toBeInTheDocument();
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("sends the message history and current fields, then applies the returned fields", async () => {
    const fields = createDefaultMndaFormData();
    const updatedFields = { ...fields, purpose: "Evaluating a partnership" };
    const sendMessage = vi.fn(async () => ({
      reply: "Got it. What's the purpose of sharing information?",
      fields: updatedFields,
    }));
    const onFieldsChange = vi.fn();
    const user = userEvent.setup();

    render(<MndaChat fields={fields} onFieldsChange={onFieldsChange} sendMessage={sendMessage} />);
    await user.type(screen.getByLabelText("Message"), "Party one is Acme, Inc.");
    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(sendMessage).toHaveBeenCalledTimes(1));
    const [sentMessages, sentFields] = sendMessage.mock.calls[0] as unknown as [ChatMessage[], typeof fields];
    expect(sentFields).toEqual(fields);
    expect(sentMessages.at(-1)).toEqual({ role: "user", content: "Party one is Acme, Inc." });

    expect(await screen.findByText("Got it. What's the purpose of sharing information?")).toBeInTheDocument();
    expect(onFieldsChange).toHaveBeenCalledWith(updatedFields);
  });

  it("clears the input after sending", async () => {
    const sendMessage = vi.fn(async () => ({ reply: "ok", fields: createDefaultMndaFormData() }));
    const user = userEvent.setup();

    render(<MndaChat fields={createDefaultMndaFormData()} onFieldsChange={vi.fn()} sendMessage={sendMessage} />);
    const input = screen.getByLabelText("Message");
    await user.type(input, "hello");
    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(input).toHaveValue(""));
  });

  it("shows an error message when sendMessage rejects and does not update fields", async () => {
    const sendMessage = vi.fn(async () => {
      throw new Error("network error");
    });
    const onFieldsChange = vi.fn();
    const user = userEvent.setup();

    render(<MndaChat fields={createDefaultMndaFormData()} onFieldsChange={onFieldsChange} sendMessage={sendMessage} />);
    await user.type(screen.getByLabelText("Message"), "hello");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/went wrong/i);
    expect(onFieldsChange).not.toHaveBeenCalled();
  });

  it("disables the Send button while empty and while a request is in flight", async () => {
    let resolveSend: (value: MndaChatResult) => void;
    const sendMessage = vi.fn(
      () =>
        new Promise<MndaChatResult>((resolve) => {
          resolveSend = resolve;
        })
    );
    const user = userEvent.setup();

    render(<MndaChat fields={createDefaultMndaFormData()} onFieldsChange={vi.fn()} sendMessage={sendMessage} />);
    const sendButton = screen.getByRole("button", { name: "Send" });
    expect(sendButton).toBeDisabled();

    await user.type(screen.getByLabelText("Message"), "hello");
    expect(sendButton).toBeEnabled();

    await user.click(sendButton);
    expect(await screen.findByRole("button", { name: "Sending…" })).toBeDisabled();

    resolveSend!({ reply: "ok", fields: createDefaultMndaFormData() });
    expect(await screen.findByRole("button", { name: "Send" })).toBeDisabled();
  });
});
