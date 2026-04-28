export type MemberSex = "male" | "female";

export type GoalDirection = "decrease" | "increase" | "maintain";
export type GoalMetricKey = "tbf_pct" | "almi" | "vat_area_cm2" | "weight_lb";

export interface GoalMetric {
  metric: GoalMetricKey;
  direction: GoalDirection;
  baseline_value?: number;
  target_value?: number;
}

export interface GoalRow {
  metrics: GoalMetric[];
}

export interface BandInfo {
  status: "healthy" | "above" | "below" | "warning";
  low?: number;
  high?: number;
  label?: string;
  rangeText?: string;
}
