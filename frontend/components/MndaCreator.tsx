"use client";

import { useState, useSyncExternalStore } from "react";
import { pdf } from "@react-pdf/renderer";
import { MndaFormData, createDefaultMndaFormData } from "@/lib/mnda-content";
import { isGithubPagesBuild } from "@/lib/deployment";
import {
  clearStoredOpenRouterKey,
  getStoredOpenRouterKey,
  setStoredOpenRouterKey,
  subscribeToOpenRouterKeyChanges,
} from "@/lib/openRouterKey";
import { sendMndaChatMessage } from "@/lib/mndaChatBackend";
import { createOpenRouterMndaChatSender } from "@/lib/mndaChatOpenRouter";
import { MndaChat } from "@/components/MndaChat";
import { MndaForm } from "@/components/MndaForm";
import { MndaKeySettings } from "@/components/MndaKeySettings";
import { MndaPreview } from "@/components/MndaPreview";
import { MndaPdfDocument } from "@/components/MndaPdfDocument";

function getServerApiKeySnapshot() {
  return null;
}

export function MndaCreator() {
  const onGithubPages = isGithubPagesBuild();
  const [data, setData] = useState<MndaFormData>(createDefaultMndaFormData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const apiKey = useSyncExternalStore(
    subscribeToOpenRouterKeyChanges,
    getStoredOpenRouterKey,
    getServerApiKeySnapshot
  );

  async function handleDownload() {
    setIsGenerating(true);
    setDownloadError(null);
    try {
      const blob = await pdf(<MndaPdfDocument data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const companySlug = data.partyOne.companyName || data.partyTwo.companyName || "mutual-nda";
      const slug = companySlug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const filename = `${slug || "mutual-nda"}.pdf`;

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError("Something went wrong generating the PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  const showChat = !onGithubPages || Boolean(apiKey);
  const sendMessage = onGithubPages && apiKey ? createOpenRouterMndaChatSender(apiKey) : sendMndaChatMessage;

  return (
    <main className="grid flex-1 grid-cols-1 gap-8 p-6 lg:grid-cols-2 lg:p-10">
      <div className="flex h-full min-h-0 flex-col space-y-4 lg:max-h-[calc(100vh-2rem)]">
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
          {showChat
            ? "Chat with the assistant below. The document on the right updates as you answer."
            : "Fill in the details below. The document on the right updates as you type."}
        </p>
        {downloadError && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {downloadError}
          </p>
        )}
        {onGithubPages && (
          <MndaKeySettings
            hasKey={Boolean(apiKey)}
            onSave={setStoredOpenRouterKey}
            onRemove={clearStoredOpenRouterKey}
          />
        )}
        {showChat ? (
          <MndaChat fields={data} onFieldsChange={setData} sendMessage={sendMessage} />
        ) : (
          <MndaForm data={data} onChange={setData} />
        )}
      </div>

      <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-900 lg:overflow-y-auto lg:max-h-[calc(100vh-2rem)]">
        <MndaPreview data={data} />
      </div>
    </main>
  );
}
