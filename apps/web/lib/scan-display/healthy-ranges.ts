// Gallagher et al. (2000) healthy body fat ranges for adults aged 20–39.
// Women 20–32 %, Men 10–22 %.

export interface BandInfo {
  status: "healthy" | "above" | "below";
  low?: number;
  high?: number;
  label?: string;
  rangeText?: string;
}

export interface BodyFatRange {
  low: number;
  high: number;
}

export function bodyFatRange(sex: string): BodyFatRange {
  return sex === "female" ? { low: 20, high: 32 } : { low: 10, high: 22 };
}

// ALMI: < 25th percentile = below expected lean mass for age (EWGSOP-derived threshold)
export function almiBand(percentileAm: number): BandInfo {
  return {
    status: percentileAm >= 25 ? "healthy" : "below",
    rangeText: "≥ 25th percentile (age-matched)",
  };
}

// VAT risk bands — Neeland et al. (2019)
export function vatRiskBand(cm2: number): BandInfo {
  if (cm2 < 80) return { status: "healthy", label: "Low risk", rangeText: "< 80 cm²" };
  if (cm2 < 160) return { status: "above", label: "Moderate risk", rangeText: "80–160 cm²" };
  return { status: "above", label: "High risk", rangeText: "> 160 cm²" };
}
