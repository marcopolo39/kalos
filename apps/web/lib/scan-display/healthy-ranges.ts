// ACE (American Council on Exercise) body fat classification — fitness + acceptable bands combined.
// Women 20–35 %, Men 8–24 %. Aligns with ACSM guidelines and general DEXA population norms.
export interface BodyFatRange {
  low: number;
  high: number;
}

export function bodyFatRange(sex: string): BodyFatRange {
  return sex === "female" ? { low: 20, high: 35 } : { low: 8, high: 24 };
}
