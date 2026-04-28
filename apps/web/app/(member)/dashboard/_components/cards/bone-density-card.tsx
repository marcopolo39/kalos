import type { BandInfo } from "@/lib/scan-display/healthy-ranges";
import { EducationCard } from "./education-card";

interface BoneDensityCardProps {
  total_bmd: number | null;
  total_t_score: number | null;
}

// WHO (1994) T-score classification for bone mineral density
function tScoreBand(tScore: number): BandInfo {
  const display = tScore.toFixed(1);
  if (tScore >= -1) {
    return { status: "healthy", label: "Normal bone density", rangeText: `T-score ${display} — Normal: ≥ −1` };
  }
  if (tScore >= -2.5) {
    return { status: "below", label: "Osteopenia", rangeText: `T-score ${display} — Osteopenia: −2.5 to −1` };
  }
  return { status: "above", label: "Osteoporosis", rangeText: `T-score ${display} — Osteoporosis: < −2.5` };
}

const EXPLANATION =
  "Bone mineral density (BMD) measures the amount of mineral — mainly calcium — packed into your bone tissue. " +
  "DEXA reports a T-score comparing your BMD to a young-adult reference population. " +
  "Lower values mean lower bone density; very low values raise fracture risk.";

export function BoneDensityCard({ total_bmd, total_t_score }: BoneDensityCardProps) {
  const band = total_t_score !== null ? tScoreBand(total_t_score) : null;

  return (
    <EducationCard
      title="Bone Density"
      value={total_bmd !== null ? total_bmd.toFixed(3) : "—"}
      unit="g/cm²"
      percentileAm={null}
      band={band}
      explanation={EXPLANATION}
    />
  );
}
