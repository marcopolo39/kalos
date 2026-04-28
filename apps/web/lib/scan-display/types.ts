export type MemberSex = "male" | "female";

export interface BandInfo {
  status: "healthy" | "above" | "below" | "warning";
  low?: number;
  high?: number;
  label?: string;
  rangeText?: string;
}
