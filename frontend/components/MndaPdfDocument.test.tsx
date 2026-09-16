// @vitest-environment node
import { describe, expect, it } from "vitest";
import { pdf } from "@react-pdf/renderer";
import { MndaPdfDocument } from "./MndaPdfDocument";
import { MndaFormData, createDefaultMndaFormData } from "@/lib/mnda-content";

async function renderToBuffer(data: MndaFormData): Promise<Buffer> {
  const instance = pdf(<MndaPdfDocument data={data} />);
  return instance.toBuffer().then(
    (stream) =>
      new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk: Buffer) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
      })
  );
}

describe("MndaPdfDocument", () => {
  it("renders a well-formed PDF for the default (mostly empty) form data", async () => {
    const buffer = await renderToBuffer(createDefaultMndaFormData());
    expect(buffer.subarray(0, 5).toString("ascii")).toBe("%PDF-");
    expect(buffer.length).toBeGreaterThan(500);
  });

  it("renders a well-formed PDF with all fields filled in", async () => {
    const data = createDefaultMndaFormData();
    data.partyOne = {
      companyName: "Acme, Inc.",
      signatoryName: "Jane Doe",
      signatoryTitle: "CEO",
      noticeAddress: "jane@acme.com",
    };
    data.partyTwo = {
      companyName: "Globex Corp.",
      signatoryName: "John Smith",
      signatoryTitle: "COO",
      noticeAddress: "john@globex.com",
    };
    data.purpose = "Evaluating a potential partnership.";
    data.effectiveDate = "2026-09-16";
    data.mndaTermType = "expires";
    data.mndaTermYears = 2;
    data.confidentialityTermType = "years";
    data.confidentialityTermYears = 3;
    data.governingLaw = "Delaware";
    data.jurisdiction = "New Castle, DE";

    const buffer = await renderToBuffer(data);
    expect(buffer.subarray(0, 5).toString("ascii")).toBe("%PDF-");
    expect(buffer.length).toBeGreaterThan(500);
  });

  it("does not throw when the purpose is a very long string (pagination stress case)", async () => {
    const data = createDefaultMndaFormData();
    data.purpose = "Evaluating a partnership. ".repeat(200);

    await expect(renderToBuffer(data)).resolves.toBeInstanceOf(Buffer);
  });

  it("does not throw for the 'until terminated' / 'in perpetuity' term combination", async () => {
    const data = createDefaultMndaFormData();
    data.mndaTermType = "untilTerminated";
    data.confidentialityTermType = "perpetuity";

    await expect(renderToBuffer(data)).resolves.toBeInstanceOf(Buffer);
  });
});
