import type { Database } from "@kalos/supabase";
import type { GoalRow, MemberSex } from "@/lib/scan-display/types";
import { computeDelta, computeWeightDelta } from "@/lib/scan-display/delta";
import { bodyFatRange, vatRiskBand, almiBand } from "@/lib/scan-display/healthy-ranges";
import type { BandInfo } from "@/lib/scan-display/types";
import { SecondScanHero } from "./second-scan-hero";
import { DeltaCard } from "./delta-card";
import { GoalProgressSection } from "./goal-progress-section";
import { RegionalComparisonChart } from "./regional-comparison-chart";

type Scan = Pick<
  Database["public"]["Tables"]["scans"]["Row"],
  | "scan_date"
  | "tbf_pct"
  | "tbf_pct_pctile_am"
  | "almi"
  | "almi_pctile_am"
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
  sex: MemberSex;
}

export function SecondScanView({ previous, current, goals, sex }: SecondScanViewProps) {
  const bfRange = bodyFatRange(sex);
  const tbfBand: BandInfo | null = current.tbf_pct !== null
    ? {
        status: current.tbf_pct < bfRange.low ? "below" : current.tbf_pct > bfRange.high ? "above" : "healthy",
        rangeText: `Healthy range: ${bfRange.low}–${bfRange.high}%`,
      }
    : null;
  const vatBand = current.vat_area_cm2 !== null ? vatRiskBand(current.vat_area_cm2) : null;
  const almiBandInfo = current.almi_pctile_am !== null ? almiBand(current.almi_pctile_am) : null;

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
          previousValue={previous.tbf_pct}
          currentValue={current.tbf_pct}
          delta={tbfDelta}
          band={tbfBand}
          previousPercentile={previous.tbf_pct_pctile_am}
          currentPercentile={current.tbf_pct_pctile_am}
        />
        <DeltaCard
          label="Visceral Fat (VAT)"
          unit="cm²"
          previousValue={previous.vat_area_cm2}
          currentValue={current.vat_area_cm2}
          delta={vatDelta}
          band={vatBand}
          formatValue={(v) => v.toFixed(0)}
        />
        <DeltaCard
          label="Lean Mass Index (ALMI)"
          unit="kg/m²"
          previousValue={previous.almi}
          currentValue={current.almi}
          delta={almiDelta}
          band={almiBandInfo}
          previousPercentile={previous.almi_pctile_am}
          currentPercentile={current.almi_pctile_am}
        />
        <DeltaCard
          label="Weight"
          unit="lb"
          previousValue={previous.weight_lb}
          currentValue={current.weight_lb}
          delta={weightDelta}
        />
        <DeltaCard
          label="Total Lean Mass"
          unit="lb"
          previousValue={previous.total_lean_mass}
          currentValue={current.total_lean_mass}
          delta={leanMassDelta}
        />
        <DeltaCard
          label="Total Fat Mass"
          unit="lb"
          previousValue={previous.total_fat_mass}
          currentValue={current.total_fat_mass}
          delta={fatMassDelta}
        />
      </div>

      <GoalProgressSection goals={goals} previous={previous} current={current} />

      <RegionalComparisonChart previous={previous} current={current} />
    </div>
  );
}
