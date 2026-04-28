import type { GoalDirection } from "./types";

export type DeltaStatus = "improved" | "regressed" | "neutral";

export interface Delta {
  value: number;
  status: DeltaStatus;
}

type DeltaKind = "tbf_pct" | "vat" | "almi" | "weight";

// true = higher is better, false = lower is better
const IMPROVEMENT_DIRECTION: Record<DeltaKind, boolean> = {
  tbf_pct: false,
  vat: false,
  almi: true,
  weight: false,
};

export const STATUS_COLORS: Record<DeltaStatus, string> = {
  improved: "text-green-600",
  regressed: "text-red-600",
  neutral: "text-neutral-500",
};

export const STATUS_ARROWS: Record<DeltaStatus, string> = {
  improved: "↑",
  regressed: "↓",
  neutral: "→",
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
