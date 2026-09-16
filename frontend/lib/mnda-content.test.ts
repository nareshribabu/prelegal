import { describe, expect, it } from "vitest";
import {
  MndaFormData,
  buildStandardTerms,
  createDefaultMndaFormData,
  formatConfidentialityTermCoverPage,
  formatConfidentialityTermInline,
  formatDate,
  formatMndaTermCoverPage,
  formatMndaTermInline,
} from "./mnda-content";

function makeData(overrides: Partial<MndaFormData> = {}): MndaFormData {
  return {
    ...createDefaultMndaFormData(),
    ...overrides,
  };
}

describe("formatDate", () => {
  it("formats an ISO date as a long US-style date", () => {
    expect(formatDate("2026-09-16")).toBe("September 16, 2026");
  });

  it("returns an empty string for an empty input", () => {
    expect(formatDate("")).toBe("");
  });

  it("returns the raw input when it cannot be parsed as y-m-d", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });

  it("pads single-digit months and days correctly", () => {
    expect(formatDate("2026-01-05")).toBe("January 5, 2026");
  });
});

describe("formatMndaTermCoverPage / formatMndaTermInline", () => {
  it("describes a fixed expiration in years on the cover page", () => {
    const data = makeData({ mndaTermType: "expires", mndaTermYears: 2 });
    expect(formatMndaTermCoverPage(data)).toBe("Expires 2 year(s) from Effective Date.");
    expect(formatMndaTermInline(data)).toBe("2 year(s) from the Effective Date");
  });

  it("describes an until-terminated term on the cover page", () => {
    const data = makeData({ mndaTermType: "untilTerminated" });
    expect(formatMndaTermCoverPage(data)).toBe(
      "Continues until terminated in accordance with the terms of the MNDA."
    );
    expect(formatMndaTermInline(data)).toBe(
      "the date either party terminates this MNDA in accordance with its terms"
    );
  });
});

describe("formatConfidentialityTermCoverPage / formatConfidentialityTermInline", () => {
  it("describes a fixed number of years, including the trade secret carve-out", () => {
    const data = makeData({ confidentialityTermType: "years", confidentialityTermYears: 3 });
    expect(formatConfidentialityTermCoverPage(data)).toBe(
      "3 year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws."
    );
    expect(formatConfidentialityTermInline(data)).toBe("3 year(s) from the Effective Date");
  });

  it("describes perpetuity", () => {
    const data = makeData({ confidentialityTermType: "perpetuity" });
    expect(formatConfidentialityTermCoverPage(data)).toBe("In perpetuity.");
    expect(formatConfidentialityTermInline(data)).toBe("perpetuity");
  });
});

describe("buildStandardTerms", () => {
  it("produces all 11 numbered clauses in order", () => {
    const clauses = buildStandardTerms(makeData());
    expect(clauses).toHaveLength(11);
    expect(clauses.map((c) => c.number)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
    ]);
    expect(clauses[0].title).toBe("Introduction");
    expect(clauses[10].title).toBe("General");
  });

  function flatText(clauseNumber: string, clauses: ReturnType<typeof buildStandardTerms>) {
    const clause = clauses.find((c) => c.number === clauseNumber)!;
    return clause.paragraphs.map((p) => p.map((run) => run.text).join("")).join("\n");
  }

  it("substitutes the purpose into clauses 1 and 2", () => {
    const clauses = buildStandardTerms(makeData({ purpose: "Evaluating a widget deal" }));
    expect(flatText("1", clauses)).toContain("in connection with the Evaluating a widget deal which");
    expect(flatText("2", clauses)).toContain("solely for the Evaluating a widget deal;");
  });

  it("falls back to a bracketed placeholder when the purpose is empty", () => {
    const clauses = buildStandardTerms(makeData({ purpose: "" }));
    expect(flatText("1", clauses)).toContain("[Purpose]");
  });

  it("substitutes the effective date and computed term phrases into clause 5", () => {
    const clauses = buildStandardTerms(
      makeData({ effectiveDate: "2026-01-01", mndaTermType: "expires", mndaTermYears: 5, confidentialityTermType: "perpetuity" })
    );
    const text = flatText("5", clauses);
    expect(text).toContain("commences on the January 1, 2026");
    expect(text).toContain("5 year(s) from the Effective Date");
    expect(text).toContain("survive for perpetuity");
  });

  it("substitutes governing law and jurisdiction into clause 9", () => {
    const clauses = buildStandardTerms(makeData({ governingLaw: "Delaware", jurisdiction: "New Castle, DE" }));
    const text = flatText("9", clauses);
    expect(text).toContain("laws of the State of Delaware");
    expect(text).toContain("courts located in New Castle, DE");
    expect(text).toContain("exclusive jurisdiction of such New Castle, DE");
  });

  it("marks defined terms as bold runs", () => {
    const clauses = buildStandardTerms(makeData());
    const introParagraph = clauses[0].paragraphs[0];
    const boldTexts = introParagraph.filter((run) => run.bold).map((run) => run.text);
    expect(boldTexts).toEqual(
      expect.arrayContaining(["MNDA", "Disclosing Party", "Receiving Party", "Confidential Information", "Cover Page"])
    );
  });

  it("does not mark surrounding text as bold", () => {
    const clauses = buildStandardTerms(makeData());
    const introParagraph = clauses[0].paragraphs[0];
    const nonBoldRuns = introParagraph.filter((run) => !run.bold);
    expect(nonBoldRuns.length).toBeGreaterThan(0);
    expect(nonBoldRuns[0].text).toContain("This Mutual Non-Disclosure Agreement");
  });
});

describe("createDefaultMndaFormData", () => {
  it("gives each call independent (non-shared) party objects", () => {
    const first = createDefaultMndaFormData();
    const second = createDefaultMndaFormData();
    first.partyOne.companyName = "Acme";
    expect(second.partyOne.companyName).toBe("");
    expect(first.partyTwo).not.toBe(second.partyTwo);
  });

  it("does not share party one and party two references with each other", () => {
    const data = createDefaultMndaFormData();
    expect(data.partyOne).not.toBe(data.partyTwo);
  });

  it("defaults the effective date to today (UTC ISO date)", () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(createDefaultMndaFormData().effectiveDate).toBe(today);
  });
});
