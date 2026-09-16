import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MndaForm } from "./MndaForm";
import { createDefaultMndaFormData } from "@/lib/mnda-content";

function setup(overrides = {}) {
  const data = { ...createDefaultMndaFormData(), ...overrides };
  const onChange = vi.fn();
  render(<MndaForm data={data} onChange={onChange} />);
  return { data, onChange };
}

describe("MndaForm", () => {
  it("renders both party sections and the deal details section", () => {
    setup();
    expect(screen.getByRole("group", { name: "Party 1" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Party 2" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Deal details" })).toBeInTheDocument();
  });

  it("calls onChange with an updated party one when its company name is edited", async () => {
    const user = userEvent.setup();
    const { onChange } = setup();

    const [companyNameInput] = screen.getAllByPlaceholderText("Acme, Inc.");
    await user.type(companyNameInput, "A");

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        partyOne: expect.objectContaining({ companyName: "A" }),
      })
    );
  });

  it("does not mutate party two when editing party one", async () => {
    const user = userEvent.setup();
    const { data, onChange } = setup();

    const [companyNameInput] = screen.getAllByPlaceholderText("Acme, Inc.");
    await user.type(companyNameInput, "X");

    const lastCall = onChange.mock.calls.at(-1)![0];
    expect(lastCall.partyTwo).toBe(data.partyTwo);
  });

  it("shows a years input only when the MNDA term type is 'expires'", async () => {
    const user = userEvent.setup();
    const { onChange } = setup({ mndaTermType: "expires", mndaTermYears: 1 });

    expect(screen.getByLabelText("MNDA term")).toBeInTheDocument();
    const spinbuttons = screen.getAllByRole("spinbutton");
    expect(spinbuttons.length).toBeGreaterThan(0);

    await user.selectOptions(screen.getByLabelText("MNDA term"), "untilTerminated");
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ mndaTermType: "untilTerminated" })
    );
  });

  it("hides the MNDA term years input once switched to 'untilTerminated'", () => {
    setup({ mndaTermType: "untilTerminated" });
    const termYearsInputs = screen.queryAllByDisplayValue("1");
    // The confidentiality term years input (default 1) may still show "1", but there should
    // be exactly one spinbutton now (confidentiality years), not two.
    expect(screen.getAllByRole("spinbutton")).toHaveLength(1);
    void termYearsInputs;
  });

  it("hides the confidentiality term years input when set to perpetuity", () => {
    setup({ confidentialityTermType: "perpetuity" });
    expect(screen.getAllByRole("spinbutton")).toHaveLength(1);
  });

  it("coerces a cleared/invalid MNDA term years input to 1", async () => {
    const user = userEvent.setup();
    const { onChange } = setup({ mndaTermType: "expires", mndaTermYears: 5 });

    const [yearsInput] = screen.getAllByRole("spinbutton");
    await user.clear(yearsInput);

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ mndaTermYears: 1 })
    );
  });

  it("clamps a negative MNDA term years input to 1", () => {
    const { onChange } = setup({ mndaTermType: "expires", mndaTermYears: 5 });
    const [yearsInput] = screen.getAllByRole("spinbutton");

    fireEvent.change(yearsInput, { target: { value: "-3" } });

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ mndaTermYears: 1 }));
  });

  it("rounds a fractional MNDA term years input to the nearest whole number", () => {
    const { onChange } = setup({ mndaTermType: "expires", mndaTermYears: 1 });
    const [yearsInput] = screen.getAllByRole("spinbutton");

    fireEvent.change(yearsInput, { target: { value: "2.5" } });

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ mndaTermYears: 3 }));
  });

  it("caps an absurdly large MNDA term years input at 99", () => {
    const { onChange } = setup({ mndaTermType: "expires", mndaTermYears: 1 });
    const [yearsInput] = screen.getAllByRole("spinbutton");

    fireEvent.change(yearsInput, { target: { value: "1e21" } });

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ mndaTermYears: 99 }));
  });

  it("clamps a negative confidentiality term years input to 1", () => {
    const { onChange } = setup({
      mndaTermType: "untilTerminated",
      confidentialityTermType: "years",
      confidentialityTermYears: 5,
    });
    // With mndaTermType "untilTerminated", the MNDA years input is hidden, so
    // this is the only spinbutton (confidentiality years).
    const [yearsInput] = screen.getAllByRole("spinbutton");

    fireEvent.change(yearsInput, { target: { value: "-10" } });

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ confidentialityTermYears: 1 })
    );
  });

  it("updates the purpose textarea", async () => {
    const user = userEvent.setup();
    const { onChange } = setup({ purpose: "" });

    await user.type(screen.getByLabelText("Purpose"), "X");
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ purpose: "X" }));
  });

  it("updates governing law and jurisdiction independently", async () => {
    const user = userEvent.setup();
    const { onChange } = setup();

    await user.type(screen.getByPlaceholderText("Delaware"), "D");
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ governingLaw: "D" }));

    await user.type(screen.getByPlaceholderText("New Castle, DE"), "N");
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ jurisdiction: "N" }));
  });
});
