"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { MndaFormData, defaultMndaFormData } from "@/lib/mnda-content";
import { MndaForm } from "@/components/MndaForm";
import { MndaPreview } from "@/components/MndaPreview";
import { MndaPdfDocument } from "@/components/MndaPdfDocument";

export function MndaCreator() {
  const [data, setData] = useState<MndaFormData>(defaultMndaFormData);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleDownload() {
    setIsGenerating(true);
    try {
      const blob = await pdf(<MndaPdfDocument data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const companySlug = data.partyOne.companyName || data.partyTwo.companyName || "mutual-nda";
      const filename = `${companySlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "mutual-nda"}.pdf`;

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="grid flex-1 grid-cols-1 gap-8 p-6 lg:grid-cols-2 lg:p-10">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Mutual NDA Creator</h1>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isGenerating ? "Preparing PDF…" : "Download PDF"}
          </button>
        </div>
        <p className="text-sm text-zinc-500">
          Fill in the details below. The document on the right updates as you type.
        </p>
        <MndaForm data={data} onChange={setData} />
      </div>

      <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-900 lg:overflow-y-auto lg:max-h-[calc(100vh-2rem)]">
        <MndaPreview data={data} />
      </div>
    </div>
  );
}
