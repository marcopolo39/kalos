// Gallagher et al. (2000) healthy body fat ranges for adults aged 20–39.
// Women 20–32 %, Men 10–22 %.
export interface BodyFatRange {
  low: number;
  high: number;
}

export function bodyFatRange(sex: string): BodyFatRange {
  return sex === "female" ? { low: 20, high: 32 } : { low: 10, high: 22 };
}
