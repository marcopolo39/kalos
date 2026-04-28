import type { BandInfo } from "@/lib/scan-display/types";

interface EducationCardProps {
  title: string;
  value: string;
  unit: string;
  percentileAm: number | null;
  band: BandInfo | null;
  explanation: string;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

const bandStyles = {
  healthy: { label: "Within healthy range", className: "text-green-600" },
  above: { label: "Above healthy range", className: "text-red-600" },
  below: { label: "Below healthy range", className: "text-neutral-500" },
  warning: { label: "Needs attention", className: "text-amber-600" },
} as const;

export function EducationCard({
  title,
  value,
  unit,
  percentileAm,
  band,
  explanation,
}: EducationCardProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6 flex flex-col h-full">
      <div className="flex items-start justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-black leading-tight">{title}</h2>
        {percentileAm !== null && (
          <span className="shrink-0 inline-block bg-blue-100 text-blue-700 text-xs font-semibold rounded-full px-2.5 py-1">
            {ordinal(Math.round(percentileAm))} percentile
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-5xl font-bold text-black tracking-tight">{value}</span>
        <span className="text-lg text-neutral-500">{unit}</span>
      </div>

      {band !== null && (
        <div className="mb-4">
          <span className={`text-sm font-semibold ${bandStyles[band.status].className}`}>
            {band.label ?? bandStyles[band.status].label}
          </span>
          {(band.rangeText !== undefined ||
            (band.low !== undefined && band.high !== undefined)) && (
            <p className="text-xs text-neutral-500 mt-0.5">
              {band.rangeText ?? `Healthy range: ${band.low}–${band.high}%`}
            </p>
          )}
        </div>
      )}

      <p className="text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-4 mt-auto">
        {explanation}
      </p>
    </div>
  );
}
