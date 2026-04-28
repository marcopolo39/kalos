import type { Database } from "@kalos/supabase";
import type { GoalRow } from "@/lib/scan-display/types";
import { computeDelta, computeWeightDelta } from "@/lib/scan-display/delta";
import { SecondScanHero } from "./second-scan-hero";
import { DeltaCard } from "./delta-card";
import { GoalProgressSection } from "./goal-progress-section";
import { RegionalComparisonChart } from "./regional-comparison-chart";

type Scan = Pick<
  Database["public"]["Tables"]["scans"]["Row"],
  | "scan_date"
  | "tbf_pct"
  | "almi"
  | "vat_area_cm2"
  | "weight_lb"
  | "total_lean_mass"
  | "total_fat_mass"
  | "l_arm_lean_mass"
  | "l_arm_fat_mass"
  | "r_arm_lean_mass"
  | "r_arm_fat_mass"
  | "trunk_lean_mass"
  | "trunk_fat_mass"
  | "l_leg_lean_mass"
  | "l_leg_fat_mass"
  | "r_leg_lean_mass"
  | "r_leg_fat_mass"
>;

interface SecondScanViewProps {
  previous: Scan;
  current: Scan;
  goals: GoalRow[];
}

export function SecondScanView({ previous, current, goals }: SecondScanViewProps) {
  const tbfDelta = computeDelta(previous.tbf_pct, current.tbf_pct, "tbf_pct");
  const vatDelta = computeDelta(previous.vat_area_cm2, current.vat_area_cm2, "vat");
  const almiDelta = computeDelta(previous.almi, current.almi, "almi");
  const weightDelta = computeWeightDelta(
    previous.weight_lb, current.weight_lb,
    previous.total_lean_mass, current.total_lean_mass,
    previous.total_fat_mass, current.total_fat_mass,
  );
  const leanMassDelta = computeDelta(previous.total_lean_mass, current.total_lean_mass, "lean_mass");
  const fatMassDelta = computeDelta(previous.total_fat_mass, current.total_fat_mass, "fat_mass");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <SecondScanHero
        previousDate={previous.scan_date}
        currentDate={current.scan_date}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DeltaCard
          label="Body Fat"
          unit="%"
          currentValue={current.tbf_pct}
          delta={tbfDelta}
          helperText="Lower is improvement."
        />
        <DeltaCard
          label="Visceral Fat (VAT)"
          unit="cm²"
          currentValue={current.vat_area_cm2}
          delta={vatDelta}
          helperText="Lower is improvement."
          formatValue={(v) => v.toFixed(0)}
        />
        <DeltaCard
          label="Lean Mass Index (ALMI)"
          unit="kg/m²"
          currentValue={current.almi}
          delta={almiDelta}
          helperText="Higher is improvement."
        />
        <DeltaCard
          label="Weight"
          unit="lb"
          currentValue={current.weight_lb}
          delta={weightDelta}
        />
        <DeltaCard
          label="Total Lean Mass"
          unit="lb"
          currentValue={current.total_lean_mass}
          delta={leanMassDelta}
          helperText="Higher is improvement."
        />
        <DeltaCard
          label="Total Fat Mass"
          unit="lb"
          currentValue={current.total_fat_mass}
          delta={fatMassDelta}
          helperText="Lower is improvement."
        />
      </div>

      <GoalProgressSection goals={goals} previous={previous} current={current} />

      <RegionalComparisonChart
        previous={previous}
        current={current}
        previousDate={previous.scan_date}
        currentDate={current.scan_date}
      />
    </div>
  );
}
