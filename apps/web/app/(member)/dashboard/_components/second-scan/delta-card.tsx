import { STATUS_COLORS } from "@/lib/scan-display/delta";
import type { Delta } from "@/lib/scan-display/delta";
import type { BandInfo } from "@/lib/scan-display/types";

interface DeltaCardProps {
  label: string;
  unit: string;
  previousValue: number | null;
  currentValue: number | null;
  delta: Delta | null;
  band?: BandInfo | null;
  formatValue?: (v: number) => string;
  previousPercentile?: number | null;
  currentPercentile?: number | null;
}

const BAND_STYLES = {
  healthy: { label: "Within healthy range", className: "text-green-600" },
  above: { label: "Above healthy range", className: "text-red-600" },
  below: { label: "Below healthy range", className: "text-neutral-500" },
  warning: { label: "Needs attention", className: "text-amber-600" },
} as const;

function defaultFormat(v: number): string {
  return v.toFixed(1);
}

function ordinal(n: number): string {
  const abs = Math.round(Math.abs(n));
  const s = ["th", "st", "nd", "rd"];
  const v = abs % 100;
  return abs + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

export function DeltaCard({
  label,
  unit,
  previousValue,
  currentValue,
  delta,
  band,
  formatValue = defaultFormat,
  previousPercentile,
  currentPercentile,
}: DeltaCardProps) {
  const colorClass = delta ? STATUS_COLORS[delta.status] : "text-neutral-500";
  const arrow = delta ? (delta.value > 0 ? "↑" : delta.value < 0 ? "↓" : "→") : null;

  const absChange = delta ? Math.abs(delta.value) : null;
  const sign = delta && delta.status !== "neutral" ? (delta.value > 0 ? "+" : "−") : null;

  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6">
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
        {label}
      </p>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-semibold text-neutral-400">
          {previousValue !== null ? formatValue(previousValue) : "—"}
        </span>
        <span className="text-neutral-300 text-xl">→</span>
        <span className="text-3xl font-bold text-black">
          {currentValue !== null ? formatValue(currentValue) : "—"}
        </span>
        <span className="text-sm text-neutral-500">{unit}</span>
      </div>

      {delta !== null && absChange !== null ? (
        <div className={`flex items-center gap-1 text-sm font-medium ${colorClass}`}>
          {arrow && <span className="text-base leading-none">{arrow}</span>}
          <span>
            {sign}
            {formatValue(absChange)} {unit}
          </span>
        </div>
      ) : (
        <div className="text-sm text-neutral-400">No previous data</div>
      )}

      {currentPercentile !== null && currentPercentile !== undefined && (
        <div className="mt-1 text-xs text-neutral-500">
          {previousPercentile !== null && previousPercentile !== undefined
            ? `${ordinal(previousPercentile)} → `
            : ""}
          <span className="font-medium text-neutral-700">{ordinal(currentPercentile)} percentile</span>
          {previousPercentile !== null && previousPercentile !== undefined && (() => {
            const diff = Math.round(currentPercentile - previousPercentile);
            if (diff === 0) return null;
            return (
              <span className={`ml-1 font-medium ${colorClass}`}>
                ({diff > 0 ? "+" : "−"}{Math.abs(diff)} pts)
              </span>
            );
          })()}
        </div>
      )}

      {band && (
        <div className="mt-3 border-t border-neutral-100 pt-3">
          <p className={`text-xs font-semibold ${BAND_STYLES[band.status].className}`}>
            {band.label ?? BAND_STYLES[band.status].label}
          </p>
          {band.rangeText && (
            <p className="text-xs text-neutral-500 mt-0.5">{band.rangeText}</p>
          )}
        </div>
      )}
    </div>
  );
}
