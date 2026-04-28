import { bodyFatRange } from "@/lib/scan-display/healthy-ranges";
import { EducationCard } from "./education-card";
import type { BandInfo } from "./education-card";

interface BodyFatCardProps {
  tbf_pct: number | null;
  tbf_pct_pctile_am: number | null;
  sex: string;
}

const EXPLANATION =
  "Total body fat percentage is the proportion of your body weight made up of fat tissue — " +
  "including both essential fat (needed for normal organ and hormone function) and storage fat. " +
  "DEXA measures this directly from X-ray attenuation, making it more accurate than skin-fold or " +
  "bioelectrical methods.";

export function BodyFatCard({ tbf_pct, tbf_pct_pctile_am, sex }: BodyFatCardProps) {
  if (tbf_pct === null) {
    return (
      <EducationCard
        title="Body Fat"
        value="—"
        unit="%"
        percentileAm={null}
        band={null}
        explanation={EXPLANATION}
      />
    );
  }

  const range = bodyFatRange(sex);
  const status: BandInfo["status"] =
    tbf_pct < range.low ? "below" : tbf_pct > range.high ? "above" : "healthy";

  return (
    <EducationCard
      title="Body Fat"
      value={tbf_pct.toFixed(1)}
      unit="%"
      percentileAm={tbf_pct_pctile_am}
      band={{ status, low: range.low, high: range.high }}
      explanation={EXPLANATION}
    />
  );
}
