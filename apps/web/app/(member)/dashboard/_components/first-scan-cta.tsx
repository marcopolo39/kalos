import Link from "next/link";

export function FirstScanCta() {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6 flex flex-col items-center text-center gap-4">
      <p className="text-neutral-900 text-base">
        Now that you&apos;ve seen your data, let&apos;s set some goals.
      </p>
      <Link
        href="/goals"
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
      >
        Set your goals
      </Link>
    </div>
  );
}
