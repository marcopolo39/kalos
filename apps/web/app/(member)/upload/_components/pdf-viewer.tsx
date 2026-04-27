"use client";

import { useEffect, useState } from "react";

interface PdfViewerProps {
  file: File;
}

export function PdfViewer({ file }: PdfViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setBlobUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!blobUrl) return null;

  return (
    <div className="sticky top-14">
      <iframe
        src={blobUrl}
        className="h-full w-full rounded-lg border border-neutral-200"
        title="DEXA scan PDF"
      />
    </div>
  );
}
