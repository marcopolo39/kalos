import type { BandInfo } from "@/lib/scan-display/types";
import { ordinal } from "@/lib/scan-display/format";
import { BAND_STYLES } from "@/lib/scan-display/band-styles";

interface EducationCardProps {
  title: string;
  value: string;
  unit: string;
  percentileAm: number | null;
  band: BandInfo | null;
  explanation: string;
}

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
          <span className={`text-sm font-semibold ${BAND_STYLES[band.status].className}`}>
            {band.label ?? BAND_STYLES[band.status].label}
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
