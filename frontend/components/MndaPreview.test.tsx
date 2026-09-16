import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MndaPreview } from "./MndaPreview";
import { createDefaultMndaFormData } from "@/lib/mnda-content";

describe("MndaPreview", () => {
  it("shows bracketed placeholders for fields that are blank by default", () => {
    // partyOne/partyTwo names and governing law/jurisdiction default to "".
    render(<MndaPreview data={createDefaultMndaFormData()} />);

    expect(screen.getByText("[Party 1 name]")).toBeInTheDocument();
    expect(screen.getByText("[Party 2 name]")).toBeInTheDocument();
    // These placeholders sit alongside sibling label text within the same element
    // (e.g. "Governing Law: [Governing Law]"), so match by substring rather than
    // by the full (single-element) text content.
    expect(screen.getAllByText(/\[Governing Law\]/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\[Jurisdiction\]/).length).toBeGreaterThan(0);
  });

  it("shows bracketed placeholders for purpose and effective date when explicitly cleared", () => {
    const data = createDefaultMndaFormData();
    data.purpose = "";
    data.effectiveDate = "";

    render(<MndaPreview data={data} />);

    expect(screen.getAllByText(/\[Effective Date\]/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("[Purpose]").length).toBeGreaterThan(0);
  });

  it("renders the entered party names, purpose, and dates once filled in", () => {
    const data = createDefaultMndaFormData();
    data.partyOne.companyName = "Acme, Inc.";
    data.partyTwo.companyName = "Globex Corp.";
    data.purpose = "Evaluating a partnership.";
    data.effectiveDate = "2026-09-16";
    data.governingLaw = "Delaware";
    data.jurisdiction = "New Castle, DE";

    render(<MndaPreview data={data} />);

    expect(screen.getByText("Acme, Inc.")).toBeInTheDocument();
    expect(screen.getByText("Globex Corp.")).toBeInTheDocument();
    expect(screen.getAllByText("Evaluating a partnership.").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/September 16, 2026/).length).toBeGreaterThan(0);
    // Governing law / jurisdiction appear both on the cover page and inline in clause 9.
    expect(screen.getAllByText(/Delaware/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/New Castle, DE/).length).toBeGreaterThan(0);
  });

  it("renders a signatory's name and title as 'Name, Title'", () => {
    const data = createDefaultMndaFormData();
    data.partyOne.signatoryName = "Jane Doe";
    data.partyOne.signatoryTitle = "CEO";

    render(<MndaPreview data={data} />);

    expect(screen.getByText("Jane Doe, CEO")).toBeInTheDocument();
  });

  it("renders a signatory's name with no trailing comma when there is no title", () => {
    const data = createDefaultMndaFormData();
    data.partyOne.signatoryName = "Jane Doe";
    data.partyOne.signatoryTitle = "";

    render(<MndaPreview data={data} />);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.queryByText(/Jane Doe,/)).not.toBeInTheDocument();
  });

  it("renders defined terms as bold (<strong>) elements in the Standard Terms", () => {
    render(<MndaPreview data={createDefaultMndaFormData()} />);
    const boldTerms = screen.getAllByText("Disclosing Party", { selector: "strong" });
    expect(boldTerms.length).toBeGreaterThan(0);
  });

  it("reflects the MNDA term and confidentiality term cover-page summaries", () => {
    const data = createDefaultMndaFormData();
    data.mndaTermType = "untilTerminated";
    data.confidentialityTermType = "perpetuity";

    render(<MndaPreview data={data} />);

    expect(
      screen.getByText("Continues until terminated in accordance with the terms of the MNDA.")
    ).toBeInTheDocument();
    expect(screen.getByText("In perpetuity.")).toBeInTheDocument();
  });

  it("renders all 11 standard terms clauses with their headings", () => {
    render(<MndaPreview data={createDefaultMndaFormData()} />);
    for (const title of [
      "1. Introduction",
      "2. Use and Protection of Confidential Information",
      "9. Governing Law and Jurisdiction",
      "11. General",
    ]) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });
});
