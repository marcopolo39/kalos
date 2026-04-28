import { computeDelta, goalDirectionToOverride, STATUS_COLORS } from "@/lib/scan-display/delta";
import type { GoalMetric, GoalRow } from "@/lib/scan-display/types";

export type { GoalMetric, GoalRow };

interface ScanValues {
  tbf_pct: number | null;
  almi: number | null;
  vat_area_cm2: number | null;
  weight_lb: number | null;
}

interface GoalProgressSectionProps {
  goals: GoalRow[];
  previous: ScanValues;
  current: ScanValues;
}

const METRIC_LABELS: Record<GoalMetric["metric"], string> = {
  tbf_pct: "Body Fat %",
  almi: "Lean Mass Index (ALMI)",
  vat_area_cm2: "Visceral Fat (VAT)",
  weight_lb: "Weight",
};

const METRIC_UNITS: Record<GoalMetric["metric"], string> = {
  tbf_pct: "%",
  almi: "kg/m²",
  vat_area_cm2: "cm²",
  weight_lb: "lb",
};

const DELTA_KIND: Record<GoalMetric["metric"], "tbf_pct" | "vat" | "almi" | "weight"> = {
  tbf_pct: "tbf_pct",
  almi: "almi",
  vat_area_cm2: "vat",
  weight_lb: "weight",
};

function metricValue(metric: GoalMetric["metric"], scan: ScanValues): number | null {
  return scan[metric as keyof ScanValues];
}

export function GoalProgressSection({
  goals,
  previous,
  current,
}: GoalProgressSectionProps) {
  const allMetrics = goals.flatMap((g) => g.metrics);
  if (allMetrics.length === 0) return null;

  const unique = allMetrics.filter(
    (m, i, arr) => arr.findIndex((x) => x.metric === m.metric) === i,
  );

  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 mt-4">
      <h2 className="text-lg font-bold text-black mb-4">Goal Progress</h2>
      <div className="divide-y divide-neutral-100">
        {unique.map((gm) => {
          const delta = computeDelta(
            metricValue(gm.metric, previous),
            metricValue(gm.metric, current),
            DELTA_KIND[gm.metric],
            goalDirectionToOverride(gm.direction),
          );

          const goalDir =
            gm.direction === "decrease"
              ? "↓ decrease"
              : gm.direction === "increase"
                ? "↑ increase"
                : "→ maintain";

          const colorClass = delta ? STATUS_COLORS[delta.status] : "text-neutral-400";
          const rawDelta = delta ? delta.value : null;
          const sign = rawDelta !== null && rawDelta > 0 ? "+" : "";

          return (
            <div key={gm.metric} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {METRIC_LABELS[gm.metric]}
                </p>
                <p className="text-xs text-neutral-400">Goal: {goalDir}</p>
              </div>
              <div className={`text-sm font-semibold tabular-nums ${colorClass}`}>
                {rawDelta !== null ? (
                  <>
                    {sign}
                    {rawDelta.toFixed(1)} {METRIC_UNITS[gm.metric]}
                  </>
                ) : (
                  "—"
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
