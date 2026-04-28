export interface BandInfo {
  status: "healthy" | "above" | "below";
  low: number;
  high: number;
}

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
    <div className="bg-white border border-neutral-200 rounded-lg p-5">
      <p className="text-sm font-medium text-neutral-500 mb-1">{title}</p>

      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-4xl font-bold text-black">{value}</span>
        <span className="text-lg text-neutral-500">{unit}</span>
      </div>

      {percentileAm !== null && (
        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold rounded-full px-2.5 py-1 mb-3">
          {ordinal(Math.round(percentileAm))} percentile (age-matched)
        </span>
      )}

      <p className="text-sm text-neutral-600 leading-relaxed mb-3">{explanation}</p>

      {band !== null && (
        <div className="border-t border-neutral-100 pt-3">
          <span className={`text-sm font-semibold ${bandStyles[band.status].className}`}>
            {bandStyles[band.status].label}
          </span>
          <p className="text-xs text-neutral-500 mt-0.5">
            Healthy range: {band.low}–{band.high}%
          </p>
        </div>
      )}
    </div>
  );
}
