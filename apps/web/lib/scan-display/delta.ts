import type { GoalDirection } from "./types";

export type DeltaStatus = "improved" | "regressed" | "neutral";

export interface Delta {
  value: number;
  status: DeltaStatus;
}

type DeltaKind = "tbf_pct" | "vat" | "almi" | "weight" | "lean_mass" | "fat_mass";

// true = higher is better, false = lower is better
const IMPROVEMENT_DIRECTION: Record<DeltaKind, boolean> = {
  tbf_pct: false,
  vat: false,
  almi: true,
  weight: false,
  lean_mass: true,
  fat_mass: false,
};

export const STATUS_COLORS: Record<DeltaStatus, string> = {
  improved: "text-green-600",
  regressed: "text-red-600",
  neutral: "text-neutral-500",
};


export function goalDirectionToOverride(direction: GoalDirection | undefined): boolean | null {
  if (direction === "decrease") return false;
  if (direction === "increase") return true;
  return null;
}

export function computeDelta(
  prev: number | null,
  curr: number | null,
  kind: DeltaKind,
): Delta | null {
  if (prev === null || curr === null) return null;

  const value = curr - prev;
  const direction = IMPROVEMENT_DIRECTION[kind];
  const isImprovement = direction ? value > 0 : value < 0;
  return { value, status: isImprovement ? "improved" : "regressed" };
}

// Weight status is composition-aware: green if lean mass drove the change, red if fat did.
export function computeWeightDelta(
  prevWeight: number | null,
  currWeight: number | null,
  prevLean: number | null,
  currLean: number | null,
  prevFat: number | null,
  currFat: number | null,
): Delta | null {
  if (prevWeight === null || currWeight === null) return null;
  const value = currWeight - prevWeight;

  if (prevLean !== null && currLean !== null && prevFat !== null && currFat !== null) {
    const leanDelta = currLean - prevLean;
    const fatDelta = currFat - prevFat;
    let status: DeltaStatus;
    if (leanDelta > fatDelta) status = "improved";
    else if (fatDelta > leanDelta) status = "regressed";
    else status = "neutral";
    return { value, status };
  }

  // Fallback when composition data is unavailable
  const status = value < 0 ? "improved" : value > 0 ? "regressed" : "neutral";
  return { value, status };
}
