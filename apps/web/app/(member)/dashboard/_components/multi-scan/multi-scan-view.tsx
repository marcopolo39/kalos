import type { Database } from "@kalos/supabase";
import type { GoalRow } from "@/lib/scan-display/types";
import { TrendChart } from "./trend-chart";
import { TrajectoryCallout } from "./trajectory-callout";
import { ScanHistoryTable } from "./scan-history-table";

type Scan = Pick<
  Database["public"]["Tables"]["scans"]["Row"],
  | "id"
  | "scan_date"
  | "tbf_pct"
  | "almi"
  | "vat_area_cm2"
  | "weight_lb"
  | "total_lean_mass"
  | "source_pdf_path"
>;

interface MultiScanViewProps {
  scans: Scan[];
  goals: GoalRow[];
  memberName: string;
  signedUrls: Record<string, string>;
}

function formatMonthYear(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr + "T12:00:00"));
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr + "T12:00:00"));
}

function monthsBetween(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.abs(Date.parse(b) - Date.parse(a)) / msPerDay;
  return Math.round(days / 30.44);
}

interface DeltaAnnotation {
  label: string;
  improved: boolean | null;
}

function computeDeltaAnnotation(
  firstVal: number | null,
  lastVal: number | null,
  lowerIsBetter: boolean,
  decimals = 1,
): DeltaAnnotation | undefined {
  if (firstVal === null || lastVal === null) return undefined;
  const diff = lastVal - firstVal;
  if (Math.abs(diff) < 0.001) return { label: "No change", improved: null };
  const sign = diff > 0 ? "+" : "";
  const improved = lowerIsBetter ? diff < 0 : diff > 0;
  return { label: `${sign}${diff.toFixed(decimals)}`, improved };
}

export function MultiScanView({ scans, goals, memberName, signedUrls }: MultiScanViewProps) {
  // scans arrive in descending order from DB; reverse for chronological charts
  const chronological = [...scans].reverse();
  const first = chronological[0];
  const latest = chronological[chronological.length - 1];

  if (!first || !latest) return null;

  const months = monthsBetween(first.scan_date, latest.scan_date);
  const monthsLabel = months === 1 ? "1 month" : `${months} months`;
  const firstName = memberName.split(" ")[0];

  const allGoalMetrics = goals.flatMap((g) => g.metrics);
  const tbfGoal = allGoalMetrics.find((m) => m.metric === "tbf_pct");
  const almiGoal = allGoalMetrics.find((m) => m.metric === "almi");
  const vatGoal = allGoalMetrics.find((m) => m.metric === "vat_area_cm2");

  const tbfData = chronological.map((s) => ({
    label: formatMonthYear(s.scan_date),
    value: s.tbf_pct,
  }));
  const leanData = chronological.map((s) => ({
    label: formatMonthYear(s.scan_date),
    value: s.total_lean_mass,
  }));
  const vatData = chronological.map((s) => ({
    label: formatMonthYear(s.scan_date),
    value: s.vat_area_cm2,
  }));
  const almiData = chronological.map((s) => ({
    label: formatMonthYear(s.scan_date),
    value: s.almi,
  }));

  const tbfDelta = computeDeltaAnnotation(first.tbf_pct, latest.tbf_pct, true);
  const leanDelta = computeDeltaAnnotation(first.total_lean_mass, latest.total_lean_mass, false, 1);
  const vatDelta = computeDeltaAnnotation(first.vat_area_cm2, latest.vat_area_cm2, true, 0);
  const almiDelta = computeDeltaAnnotation(first.almi, latest.almi, false, 2);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black mb-1">
          Your Progress, {firstName}
        </h1>
        <p className="text-neutral-500 text-sm">
          Latest scan:{" "}
          <span className="font-medium text-neutral-700">
            {formatDate(latest.scan_date)}
          </span>
          <span className="mx-2 text-neutral-300">·</span>
          <span className="font-medium text-neutral-700">
            {scans.length} scans over {monthsLabel}
          </span>
        </p>
        <div className="flex flex-wrap gap-5 mt-3">
          {latest.tbf_pct !== null && (
            <div className="text-sm">
              <span className="text-neutral-400">Body Fat </span>
              <span className="font-semibold text-neutral-900">
                {latest.tbf_pct.toFixed(1)}%
              </span>
            </div>
          )}
          {latest.total_lean_mass !== null && (
            <div className="text-sm">
              <span className="text-neutral-400">Lean Mass </span>
              <span className="font-semibold text-neutral-900">
                {latest.total_lean_mass.toFixed(1)} lb
              </span>
            </div>
          )}
          {latest.vat_area_cm2 !== null && (
            <div className="text-sm">
              <span className="text-neutral-400">VAT </span>
              <span className="font-semibold text-neutral-900">
                {latest.vat_area_cm2.toFixed(0)} cm²
              </span>
            </div>
          )}
          {latest.almi !== null && (
            <div className="text-sm">
              <span className="text-neutral-400">ALMI </span>
              <span className="font-semibold text-neutral-900">
                {latest.almi.toFixed(2)} kg/m²
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Trend charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TrendChart
          title="Body Fat %"
          unit="%"
          data={tbfData}
          deltaLabel={tbfDelta ? `${tbfDelta.label}%` : undefined}
          deltaImproved={tbfDelta?.improved ?? null}
          goalBaseline={tbfGoal?.baseline_value}
        />
        <TrendChart
          title="Total Lean Mass"
          unit="lb"
          data={leanData}
          deltaLabel={leanDelta ? `${leanDelta.label} lb` : undefined}
          deltaImproved={leanDelta?.improved ?? null}
          decimals={0}
        />
        <TrendChart
          title="Visceral Fat (VAT)"
          unit="cm²"
          data={vatData}
          deltaLabel={vatDelta ? `${vatDelta.label} cm²` : undefined}
          deltaImproved={vatDelta?.improved ?? null}
          goalBaseline={vatGoal?.baseline_value}
          decimals={0}
        />
        <TrendChart
          title="Lean Mass Index (ALMI)"
          unit="kg/m²"
          data={almiData}
          deltaLabel={almiDelta ? `${almiDelta.label} kg/m²` : undefined}
          deltaImproved={almiDelta?.improved ?? null}
          goalBaseline={almiGoal?.baseline_value}
        />
      </div>

      <TrajectoryCallout scans={chronological} />

      <ScanHistoryTable scans={scans} signedUrls={signedUrls} />
    </div>
  );
}
