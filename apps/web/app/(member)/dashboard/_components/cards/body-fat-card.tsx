import { bodyFatRange } from "@/lib/scan-display/healthy-ranges";
import type { BandInfo, MemberSex } from "@/lib/scan-display/types";
import { EducationCard } from "./education-card";

interface BodyFatCardProps {
  tbf_pct: number | null;
  tbf_pct_pctile_am: number | null;
  sex: MemberSex;
}

const EXPLANATION =
  "Total body fat percentage is the proportion of your body weight made up of fat tissue — " +
  "including both essential fat (needed for normal organ and hormone function) and storage fat. " +
  "DEXA measures this directly from X-ray attenuation, making it more accurate than skin-fold or " +
  "bioelectrical methods.";

export function BodyFatCard({ tbf_pct, tbf_pct_pctile_am, sex }: BodyFatCardProps) {
  const range = bodyFatRange(sex);
  const band: BandInfo | null =
    tbf_pct !== null
      ? {
          status: tbf_pct < range.low ? "below" : tbf_pct > range.high ? "above" : "healthy",
          low: range.low,
          high: range.high,
        }
      : null;

  return (
    <EducationCard
      title="Body Fat"
      value={tbf_pct !== null ? tbf_pct.toFixed(1) : "—"}
      unit="%"
      percentileAm={tbf_pct !== null ? tbf_pct_pctile_am : null}
      band={band}
      explanation={EXPLANATION}
    />
  );
}
