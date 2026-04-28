import { STATUS_COLORS, STATUS_ARROWS } from "@/lib/scan-display/delta";
import type { Delta } from "@/lib/scan-display/delta";

interface DeltaCardProps {
  label: string;
  unit: string;
  currentValue: number | null;
  delta: Delta | null;
  helperText?: string;
  formatValue?: (v: number) => string;
}

function defaultFormat(v: number): string {
  return v.toFixed(1);
}

export function DeltaCard({
  label,
  unit,
  currentValue,
  delta,
  helperText,
  formatValue = defaultFormat,
}: DeltaCardProps) {
  const colorClass = delta ? STATUS_COLORS[delta.status] : "text-neutral-500";
  const arrow = delta ? STATUS_ARROWS[delta.status] : null;

  const absChange = delta ? Math.abs(delta.value) : null;
  const sign = delta?.status !== "neutral" ? (delta!.value > 0 ? "+" : "−") : null;

  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6">
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
        {label}
      </p>

      <div className="flex items-baseline gap-1.5 mb-2">
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

      {helperText && (
        <p className="text-xs text-neutral-400 mt-3 border-t border-neutral-100 pt-3">
          {helperText}
        </p>
      )}
    </div>
  );
}
