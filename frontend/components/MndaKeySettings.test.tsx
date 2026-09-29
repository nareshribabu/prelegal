import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MndaKeySettings } from "./MndaKeySettings";

describe("MndaKeySettings", () => {
  it("shows a key-entry form when no key is stored", () => {
    render(<MndaKeySettings hasKey={false} onSave={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByLabelText(/enable ai chat/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("calls onSave with the trimmed key and clears the input", async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();

    render(<MndaKeySettings hasKey={false} onSave={onSave} onRemove={vi.fn()} />);
    const input = screen.getByLabelText(/enable ai chat/i);
    await user.type(input, "  sk-or-test-key  ");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSave).toHaveBeenCalledWith("sk-or-test-key");
  });

  it("shows a remove option and calls onRemove when a key is stored", async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();

    render(<MndaKeySettings hasKey={true} onSave={vi.fn()} onRemove={onRemove} />);
    expect(screen.getByText(/using your openrouter api key/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove key" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
