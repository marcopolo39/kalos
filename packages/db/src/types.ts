// Hand-written to match the schema in supabase/migrations/20260425000000_schema_members_scans_goals.sql
// Replace with the generated output after applying the migration:
//   supabase gen types typescript --project-id yscfxutisqjcakxufiom > packages/db/src/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ---------------------------------------------------------------------------
// member_goals.metrics — validated in app layer (Zod), not Postgres
// ---------------------------------------------------------------------------
export type GoalMetric = "tbf_pct" | "almi" | "vat_area_cm2" | "weight_lb";
export type GoalDirection = "decrease" | "increase" | "maintain";

export interface GoalMetricEntry {
  metric: GoalMetric;
  direction: GoalDirection;
  baseline_value: number;
  baseline_scan_id: string;
}

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------
export interface Database {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          name: string;
          dob: string;
          sex: string;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          dob: string;
          sex: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          dob?: string;
          sex?: string;
          created_at?: string;
        };
      };
      scans: {
        Row: {
          id: string;
          member_id: string;
          scan_date: string;
          external_scan_id: string;
          source_pdf_path: string | null;
          created_at: string;
          // device provenance
          device_model: string | null;
          device_serial: string | null;
          software_version: string | null;
          // anthropometric
          weight_lb: number | null;
          height_in: number | null;
          // scan-level composition
          tbf_pct: number | null;
          tbf_pct_pctile_yn: number | null;
          tbf_pct_pctile_am: number | null;
          vat_area_cm2: number | null;
          almi: number | null;
          almi_pctile_yn: number | null;
          almi_pctile_am: number | null;
          // bone density
          total_bmd: number | null;
          total_t_score: number | null;
          total_z_score: number | null;
          // per-region mass
          l_arm_lean_mass: number | null;
          l_arm_fat_mass: number | null;
          r_arm_lean_mass: number | null;
          r_arm_fat_mass: number | null;
          trunk_lean_mass: number | null;
          trunk_fat_mass: number | null;
          l_leg_lean_mass: number | null;
          l_leg_fat_mass: number | null;
          r_leg_lean_mass: number | null;
          r_leg_fat_mass: number | null;
        };
        Insert: {
          id?: string;
          member_id: string;
          scan_date: string;
          external_scan_id: string;
          source_pdf_path?: string | null;
          created_at?: string;
          device_model?: string | null;
          device_serial?: string | null;
          software_version?: string | null;
          weight_lb?: number | null;
          height_in?: number | null;
          tbf_pct?: number | null;
          tbf_pct_pctile_yn?: number | null;
          tbf_pct_pctile_am?: number | null;
          vat_area_cm2?: number | null;
          almi?: number | null;
          almi_pctile_yn?: number | null;
          almi_pctile_am?: number | null;
          total_bmd?: number | null;
          total_t_score?: number | null;
          total_z_score?: number | null;
          l_arm_lean_mass?: number | null;
          l_arm_fat_mass?: number | null;
          r_arm_lean_mass?: number | null;
          r_arm_fat_mass?: number | null;
          trunk_lean_mass?: number | null;
          trunk_fat_mass?: number | null;
          l_leg_lean_mass?: number | null;
          l_leg_fat_mass?: number | null;
          r_leg_lean_mass?: number | null;
          r_leg_fat_mass?: number | null;
        };
        Update: {
          id?: string;
          member_id?: string;
          scan_date?: string;
          external_scan_id?: string;
          source_pdf_path?: string | null;
          created_at?: string;
          device_model?: string | null;
          device_serial?: string | null;
          software_version?: string | null;
          weight_lb?: number | null;
          height_in?: number | null;
          tbf_pct?: number | null;
          tbf_pct_pctile_yn?: number | null;
          tbf_pct_pctile_am?: number | null;
          vat_area_cm2?: number | null;
          almi?: number | null;
          almi_pctile_yn?: number | null;
          almi_pctile_am?: number | null;
          total_bmd?: number | null;
          total_t_score?: number | null;
          total_z_score?: number | null;
          l_arm_lean_mass?: number | null;
          l_arm_fat_mass?: number | null;
          r_arm_lean_mass?: number | null;
          r_arm_fat_mass?: number | null;
          trunk_lean_mass?: number | null;
          trunk_fat_mass?: number | null;
          l_leg_lean_mass?: number | null;
          l_leg_fat_mass?: number | null;
          r_leg_lean_mass?: number | null;
          r_leg_fat_mass?: number | null;
        };
      };
      member_goals: {
        Row: {
          id: string;
          member_id: string;
          metrics: Json;
        };
        Insert: {
          id?: string;
          member_id: string;
          metrics?: Json;
        };
        Update: {
          id?: string;
          member_id?: string;
          metrics?: Json;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
