import { almiBand } from "@/lib/scan-display/healthy-ranges";
import { EducationCard } from "./education-card";

interface AlmiCardProps {
  almi: number | null;
  almi_pctile_am: number | null;
}

const EXPLANATION =
  "ALMI (appendicular lean mass index) is a measure of functional muscle in your arms and legs, " +
  "scaled to height. It isolates the tissue most relevant to strength, mobility, and metabolic health — " +
  "excluding trunk fat and bone — making it a more precise signal than total weight or BMI.";

export function AlmiCard({ almi, almi_pctile_am }: AlmiCardProps) {
  const band = almi_pctile_am !== null ? almiBand(almi_pctile_am) : null;

  return (
    <EducationCard
      title="Lean Mass Index (ALMI)"
      value={almi !== null ? almi.toFixed(1) : "—"}
      unit="kg/m²"
      percentileAm={almi_pctile_am}
      band={band}
      explanation={EXPLANATION}
    />
  );
}
