"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AddScanButtonProps {
  scanCount: number;
  hasGoal: boolean;
}

export function AddScanButton({ scanCount, hasGoal }: AddScanButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  function handleClick() {
    if (scanCount === 1 && !hasGoal) {
      setModalOpen(true);
    } else {
      router.push("/upload");
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer border-0"
      >
        Add Scan
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold text-black mb-2">
              Set your goals first
            </h2>
            <p className="text-neutral-500 text-sm mb-6">
              Before uploading a new scan, please set your goals so Kalos can
              track your progress over time.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/goals")}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 rounded-lg transition-colors cursor-pointer border-0"
              >
                Set Goals
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 bg-white hover:bg-neutral-50 text-neutral-700 text-sm font-medium py-2 rounded-lg border border-neutral-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
