import { formatDate } from "@/lib/scan-display/format";

interface FirstScanHeroProps {
  scanDate: string;
}

export function FirstScanHero({ scanDate }: FirstScanHeroProps) {
  const formatted = formatDate(scanDate);

  return (
    <div className="text-center py-10 px-4">
      <p className="text-sm text-neutral-500 mb-2">{formatted}</p>
      <h1 className="text-3xl font-semibold text-black">Your first DEXA results</h1>
      <p className="text-sm text-neutral-500 mt-3 max-w-md mx-auto">
        We&apos;ve surfaced the metrics that matter most — the ones with the strongest signal for your long-term health.
      </p>
    </div>
  );
}
