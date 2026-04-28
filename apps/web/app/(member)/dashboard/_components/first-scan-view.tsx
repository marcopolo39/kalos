import type { Database } from "@kalos/supabase";
import type { MemberSex } from "@/lib/scan-display/types";
import { FirstScanHero } from "./first-scan-hero";
import { BodyFatCard } from "./cards/body-fat-card";
import { AlmiCard } from "./cards/almi-card";
import { VatCard } from "./cards/vat-card";
import { BoneDensityCard } from "./cards/bone-density-card";
import { RegionalBreakdownCard } from "./cards/regional-breakdown-card";
import { FirstScanCta } from "./first-scan-cta";

type Scan = Pick<
  Database["public"]["Tables"]["scans"]["Row"],
  | "id"
  | "scan_date"
  | "tbf_pct"
  | "tbf_pct_pctile_am"
  | "almi"
  | "almi_pctile_am"
  | "vat_area_cm2"
  | "total_bmd"
  | "total_t_score"
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

interface FirstScanViewProps {
  scan: Scan;
  sex: MemberSex;
  hasGoal: boolean;
}

export function FirstScanView({ scan, sex, hasGoal }: FirstScanViewProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <FirstScanHero scanDate={scan.scan_date} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <BodyFatCard
          tbf_pct={scan.tbf_pct}
          tbf_pct_pctile_am={scan.tbf_pct_pctile_am}
          sex={sex}
        />
        <AlmiCard almi={scan.almi} almi_pctile_am={scan.almi_pctile_am} />
        <VatCard vat_area_cm2={scan.vat_area_cm2} />
        <BoneDensityCard total_bmd={scan.total_bmd} total_t_score={scan.total_t_score} />
      </div>

      <div className="mt-4">
        <RegionalBreakdownCard
          total_lean_mass={scan.total_lean_mass}
          total_fat_mass={scan.total_fat_mass}
          l_arm_lean_mass={scan.l_arm_lean_mass}
          l_arm_fat_mass={scan.l_arm_fat_mass}
          r_arm_lean_mass={scan.r_arm_lean_mass}
          r_arm_fat_mass={scan.r_arm_fat_mass}
          trunk_lean_mass={scan.trunk_lean_mass}
          trunk_fat_mass={scan.trunk_fat_mass}
          l_leg_lean_mass={scan.l_leg_lean_mass}
          l_leg_fat_mass={scan.l_leg_fat_mass}
          r_leg_lean_mass={scan.r_leg_lean_mass}
          r_leg_fat_mass={scan.r_leg_fat_mass}
        />
      </div>

      {!hasGoal && (
        <div className="mt-4">
          <FirstScanCta />
        </div>
      )}
    </div>
  );
}
