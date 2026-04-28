import { vatRiskBand } from "@/lib/scan-display/healthy-ranges";
import { EducationCard } from "./education-card";

interface VatCardProps {
  vat_area_cm2: number | null;
}

const EXPLANATION =
  "Visceral adipose tissue (VAT) is fat wrapped around your internal organs — " +
  "distinct from the subcutaneous fat just under your skin. Even at a healthy body weight, " +
  "high VAT is a strong independent predictor of metabolic disease. " +
  "DEXA estimates it from the trunk region and reports it as a cross-sectional area.";

export function VatCard({ vat_area_cm2 }: VatCardProps) {
  const band = vat_area_cm2 !== null ? vatRiskBand(vat_area_cm2) : null;

  return (
    <EducationCard
      title="Visceral Fat (VAT)"
      value={vat_area_cm2 !== null ? Math.round(vat_area_cm2).toString() : "—"}
      unit="cm²"
      percentileAm={null}
      band={band}
      explanation={EXPLANATION}
    />
  );
}
