// Gallagher et al. (2000), Am J Clin Nutr 72:694–701
// "Healthy percentage body fat ranges: an approach for developing guidelines based on body mass index"
export interface BodyFatRange {
  low: number;
  high: number;
}

export function bodyFatRange(sex: string): BodyFatRange {
  return sex === "female" ? { low: 20, high: 32 } : { low: 10, high: 22 };
}
