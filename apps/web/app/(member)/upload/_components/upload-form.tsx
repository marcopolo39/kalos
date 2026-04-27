"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/button";
import { PdfViewer } from "./pdf-viewer";
import { ScanForm } from "./scan-form";
import type { ScanExtraction } from "@/lib/scan-extraction/schema";

interface FieldError {
  field: string;
  message: string;
}

const Stage = {
  pick: "pick",
  extracting: "extracting",
  review: "review",
  saving: "saving",
} as const;

type Stage = (typeof Stage)[keyof typeof Stage];

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>(Stage.pick);
  const [extractedData, setExtractedData] = useState<ScanExtraction | null>(null);
  const [extractErrors, setExtractErrors] = useState<FieldError[] | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setExtractErrors(null);
  }

  async function handleExtract() {
    if (!file) return;

    setStage(Stage.extracting);
    setExtractErrors(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/scans/extract", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!json.ok) {
        setExtractErrors(
          json.errors ?? [{ field: "server", message: "Something went wrong." }],
        );
        setStage(Stage.pick);
        return;
      }

      setExtractedData(json.data);
      setStage(Stage.review);
    } catch {
      setExtractErrors([{ field: "network", message: "Network error. Please try again." }]);
      setStage(Stage.pick);
    }
  }

  async function handleSave(data: ScanExtraction) {
    if (!file) return;

    setStage(Stage.saving);
    setSaveError(null);
    setIsDuplicate(false);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("data", JSON.stringify(data));

    try {
      const res = await fetch("/api/scans/save", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (json.ok) {
        router.push("/dashboard");
        return;
      }

      if (json.duplicate) {
        setIsDuplicate(true);
      } else {
        setSaveError(
          json.errors?.[0]?.message ?? "Something went wrong. Please try again.",
        );
      }
      setStage(Stage.review);
    } catch {
      setSaveError("Network error. Please try again.");
      setStage(Stage.review);
    }
  }

  if (stage === Stage.review || stage === Stage.saving) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 pt-10 pb-12 grid grid-cols-2 gap-8">
        <div className="sticky top-8 self-start h-[calc(100vh-6rem)]">
          <PdfViewer file={file!} />
        </div>
        <div>
          <ScanForm
            initialData={extractedData!}
            onSubmit={handleSave}
            isSaving={stage === Stage.saving}
            saveError={saveError}
            duplicateError={isDuplicate}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4 px-4">
      <h1 className="text-2xl font-semibold text-black">
        Upload your DEXA scan
      </h1>
      <p className="text-neutral-500">
        Drop your Hologic PDF report and we&apos;ll extract your body
        composition data automatically.
      </p>
      <div className="flex flex-col gap-4 w-full max-w-sm">
      <input
        type="file"
        accept="application/pdf"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        className="border-2 border-dashed border-neutral-300 rounded-xl p-8 cursor-pointer text-center hover:border-neutral-400 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        {file ? (
          <span className="text-sm">
            <span className="font-medium text-neutral-900">{file.name}</span>
            <button
              type="button"
              className="text-xs text-neutral-400 underline ml-2"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              Change
            </button>
          </span>
        ) : (
          <span className="text-sm text-neutral-500">
            Click to select your DEXA PDF
          </span>
        )}
      </div>

      {extractErrors !== null && extractErrors.length > 0 && (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4 text-sm text-red-700 text-left">
          {extractErrors.map((err) => (
            <p key={err.field}>
              {err.field}: {err.message}
            </p>
          ))}
        </div>
      )}

      <Button
        disabled={!file || stage === Stage.extracting}
        className="w-full px-5 py-[15px] text-sm gap-2"
        onClick={handleExtract}
      >
        {stage === Stage.extracting && (
          <svg
            className="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {stage === Stage.extracting ? "Parsing scan..." : "Upload scan"}
      </Button>
      </div>
    </div>
  );
}
