import { FirstScanHero } from "./first-scan-hero";
import { BodyFatCard } from "./cards/body-fat-card";
import { AlmiCard } from "./cards/almi-card";
import { VatCard } from "./cards/vat-card";

interface Scan {
  id: string;
  scan_date: string;
  tbf_pct: number | null;
  tbf_pct_pctile_am: number | null;
  almi: number | null;
  almi_pctile_am: number | null;
  vat_area_cm2: number | null;
}

interface FirstScanViewProps {
  scan: Scan;
  sex: string;
}

export function FirstScanView({ scan, sex }: FirstScanViewProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      <FirstScanHero scanDate={scan.scan_date} />
      <BodyFatCard
        tbf_pct={scan.tbf_pct}
        tbf_pct_pctile_am={scan.tbf_pct_pctile_am}
        sex={sex}
      />
      <AlmiCard almi={scan.almi} almi_pctile_am={scan.almi_pctile_am} />
      <VatCard vat_area_cm2={scan.vat_area_cm2} />
    </div>
  );
}
