import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MndaCreator } from "./MndaCreator";

const toBlobMock = vi.fn(async () => new Blob(["pdf-bytes"], { type: "application/pdf" }));
const pdfMock = vi.fn(() => ({ toBlob: toBlobMock }));

// Hoisted by Vitest above the imports above, so MndaPdfDocument (mounted
// transitively via MndaCreator) also picks up these mocked primitives.
// `pdf` must be a closure (not `pdfMock` directly) so the reference to the
// outer `pdfMock` const is deferred past its temporal dead zone at the point
// this hoisted factory actually runs.
vi.mock("@react-pdf/renderer", () => ({
  pdf: () => pdfMock(),
  Document: () => null,
  Page: () => null,
  Text: () => null,
  View: () => null,
  StyleSheet: { create: (styles: unknown) => styles },
}));

function mockObjectUrls() {
  const createObjectURL = vi.fn(() => "blob:mock-url");
  const revokeObjectURL = vi.fn();
  vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
  return { createObjectURL, revokeObjectURL };
}

/** Spies on document.createElement to capture the `download` attribute set on the <a> used to trigger the save. */
function captureDownloadFilename() {
  let filename: string | undefined;
  const originalCreateElement = document.createElement.bind(document);
  vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
    const el = originalCreateElement(tag);
    if (tag === "a") {
      Object.defineProperty(el, "download", {
        set(value: string) {
          filename = value;
        },
        get() {
          return filename;
        },
      });
    }
    return el;
  });
  return { get filename() {
    return filename;
  } };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  pdfMock.mockClear();
  toBlobMock.mockClear();
});

describe("MndaCreator", () => {
  it("renders the form and the live preview side by side", () => {
    render(<MndaCreator />);
    expect(screen.getByRole("heading", { name: "Mutual NDA Creator" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Party 1" })).toBeInTheDocument();
    expect(screen.getByText("Mutual Non-Disclosure Agreement")).toBeInTheDocument();
  });

  it("renders its content inside a single <main> landmark", () => {
    render(<MndaCreator />);
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });

  it("shows an error message and re-enables the button when PDF generation fails", async () => {
    toBlobMock.mockRejectedValueOnce(new Error("layout engine exploded"));
    const user = userEvent.setup();

    render(<MndaCreator />);
    await user.click(screen.getByRole("button", { name: "Download PDF" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/went wrong/i);
    expect(await screen.findByRole("button", { name: "Download PDF" })).toBeEnabled();
  });

  it("clears a previous error message on the next successful download", async () => {
    toBlobMock.mockRejectedValueOnce(new Error("layout engine exploded"));
    mockObjectUrls();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const user = userEvent.setup();

    render(<MndaCreator />);
    const button = screen.getByRole("button", { name: "Download PDF" });
    await user.click(button);
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    await user.click(button);
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });

  it("updates the preview when the form is edited", async () => {
    const user = userEvent.setup();
    render(<MndaCreator />);

    const [companyNameInput] = screen.getAllByPlaceholderText("Acme, Inc.");
    await user.type(companyNameInput, "Acme, Inc.");

    expect(await screen.findByText("Acme, Inc.")).toBeInTheDocument();
  });

  it("generates a PDF and triggers a download when clicking Download PDF", async () => {
    const { createObjectURL, revokeObjectURL } = mockObjectUrls();
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const user = userEvent.setup();

    render(<MndaCreator />);
    await user.click(screen.getByRole("button", { name: "Download PDF" }));

    await waitFor(() => expect(pdfMock).toHaveBeenCalledTimes(1));
    expect(toBlobMock).toHaveBeenCalledTimes(1);
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("disables the download button while generating and re-enables it afterward", async () => {
    let resolveToBlob: (blob: Blob) => void;
    toBlobMock.mockImplementationOnce(
      () => new Promise<Blob>((resolve) => (resolveToBlob = resolve))
    );
    mockObjectUrls();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const user = userEvent.setup();

    render(<MndaCreator />);
    const button = screen.getByRole("button", { name: "Download PDF" });
    await user.click(button);

    expect(await screen.findByRole("button", { name: "Preparing PDF…" })).toBeDisabled();

    resolveToBlob!(new Blob(["pdf-bytes"]));

    expect(await screen.findByRole("button", { name: "Download PDF" })).toBeEnabled();
  });

  it("names the downloaded file after party one's company name, slugified", async () => {
    mockObjectUrls();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const filenameCapture = captureDownloadFilename();
    const user = userEvent.setup();

    render(<MndaCreator />);
    const [companyNameInput] = screen.getAllByPlaceholderText("Acme, Inc.");
    await user.type(companyNameInput, "Acme & Co., Inc.");

    await user.click(screen.getByRole("button", { name: "Download PDF" }));
    await waitFor(() => expect(filenameCapture.filename).toBeDefined());

    expect(filenameCapture.filename).toBe("acme-co-inc.pdf");
  });

  it("falls back to party two's company name when party one is blank", async () => {
    mockObjectUrls();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const filenameCapture = captureDownloadFilename();
    const user = userEvent.setup();

    render(<MndaCreator />);
    const [, partyTwoCompanyNameInput] = screen.getAllByPlaceholderText("Acme, Inc.");
    await user.type(partyTwoCompanyNameInput, "Globex Corp.");

    await user.click(screen.getByRole("button", { name: "Download PDF" }));
    await waitFor(() => expect(filenameCapture.filename).toBeDefined());

    expect(filenameCapture.filename).toBe("globex-corp.pdf");
  });

  it("trims stray leading/trailing hyphens produced by punctuation at the edges of the name", async () => {
    mockObjectUrls();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const filenameCapture = captureDownloadFilename();
    const user = userEvent.setup();

    render(<MndaCreator />);
    const [companyNameInput] = screen.getAllByPlaceholderText("Acme, Inc.");
    await user.type(companyNameInput, "  (Acme)  ");

    await user.click(screen.getByRole("button", { name: "Download PDF" }));
    await waitFor(() => expect(filenameCapture.filename).toBeDefined());

    expect(filenameCapture.filename).toBe("acme.pdf");
  });

  it("falls back to a generic filename when the company name is only punctuation", async () => {
    mockObjectUrls();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const filenameCapture = captureDownloadFilename();
    const user = userEvent.setup();

    render(<MndaCreator />);
    const [companyNameInput] = screen.getAllByPlaceholderText("Acme, Inc.");
    await user.type(companyNameInput, "...");

    await user.click(screen.getByRole("button", { name: "Download PDF" }));
    await waitFor(() => expect(filenameCapture.filename).toBeDefined());

    expect(filenameCapture.filename).toBe("mutual-nda.pdf");
  });

  it("falls back to a generic filename when neither party has a company name", async () => {
    mockObjectUrls();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const filenameCapture = captureDownloadFilename();
    const user = userEvent.setup();

    render(<MndaCreator />);
    await user.click(screen.getByRole("button", { name: "Download PDF" }));
    await waitFor(() => expect(filenameCapture.filename).toBeDefined());

    expect(filenameCapture.filename).toBe("mutual-nda.pdf");
  });
});
