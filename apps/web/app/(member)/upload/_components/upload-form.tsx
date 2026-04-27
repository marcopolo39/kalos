"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/button";

interface FieldError {
  field: string;
  message: string;
}

type Status = "idle" | "uploading" | "error";

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldError[] | null>(null);
  const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setFieldErrors(null);
    setDuplicateMessage(null);
  }

  async function handleUpload() {
    if (!file) return;

    setStatus("uploading");
    setFieldErrors(null);
    setDuplicateMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/scans/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (json.ok) {
        router.push("/dashboard");
        return;
      }

      if (json.duplicate) {
        setDuplicateMessage(json.message);
      } else if (json.errors) {
        setFieldErrors(json.errors);
      } else {
        setFieldErrors([
          { field: "server", message: "Something went wrong. Please try again." },
        ]);
      }
    } catch {
      setFieldErrors([
        { field: "network", message: "Network error. Please try again." },
      ]);
    }

    setStatus("error");
  }

  return (
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

      {fieldErrors !== null && fieldErrors.length > 0 && (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4 text-sm text-red-700 text-left">
          {fieldErrors.map((err) => (
            <p key={err.field}>
              {err.field}: {err.message}
            </p>
          ))}
        </div>
      )}

      {duplicateMessage && (
        <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 text-sm text-amber-800 text-left">
          {duplicateMessage}
        </div>
      )}

      <Button
        disabled={!file || status === "uploading"}
        className="w-full px-5 py-[15px] text-sm"
        onClick={handleUpload}
      >
        {status === "uploading" ? "Parsing scan..." : "Upload scan"}
      </Button>
    </div>
  );
}
