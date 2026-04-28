export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      member_goals: {
        Row: {
          id: string
          member_id: string
          metrics: Json
        }
        Insert: {
          id?: string
          member_id: string
          metrics: Json
        }
        Update: {
          id?: string
          member_id?: string
          metrics?: Json
        }
        Relationships: [
          {
            foreignKeyName: "member_goals_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          created_at: string
          dob: string
          id: string
          name: string
          sex: string
        }
        Insert: {
          created_at?: string
          dob: string
          id: string
          name: string
          sex: string
        }
        Update: {
          created_at?: string
          dob?: string
          id?: string
          name?: string
          sex?: string
        }
        Relationships: []
      }
      scans: {
        Row: {
          almi: number | null
          almi_pctile_am: number | null
          almi_pctile_yn: number | null
          created_at: string
          device_model: string | null
          device_serial: string | null
          external_scan_id: string
          height_in: number | null
          id: string
          l_arm_fat_mass: number | null
          l_arm_lean_mass: number | null
          l_leg_fat_mass: number | null
          l_leg_lean_mass: number | null
          member_id: string
          r_arm_fat_mass: number | null
          r_arm_lean_mass: number | null
          r_leg_fat_mass: number | null
          r_leg_lean_mass: number | null
          scan_date: string
          software_version: string | null
          source_pdf_path: string | null
          tbf_pct: number | null
          tbf_pct_pctile_am: number | null
          tbf_pct_pctile_yn: number | null
          total_bmd: number | null
          total_fat_mass: number | null
          total_lean_mass: number | null
          total_t_score: number | null
          total_z_score: number | null
          trunk_fat_mass: number | null
          trunk_lean_mass: number | null
          vat_area_cm2: number | null
          weight_lb: number | null
        }
        Insert: {
          almi?: number | null
          almi_pctile_am?: number | null
          almi_pctile_yn?: number | null
          created_at?: string
          device_model?: string | null
          device_serial?: string | null
          external_scan_id: string
          height_in?: number | null
          id?: string
          l_arm_fat_mass?: number | null
          l_arm_lean_mass?: number | null
          l_leg_fat_mass?: number | null
          l_leg_lean_mass?: number | null
          member_id: string
          r_arm_fat_mass?: number | null
          r_arm_lean_mass?: number | null
          r_leg_fat_mass?: number | null
          r_leg_lean_mass?: number | null
          scan_date: string
          software_version?: string | null
          source_pdf_path?: string | null
          tbf_pct?: number | null
          tbf_pct_pctile_am?: number | null
          tbf_pct_pctile_yn?: number | null
          total_bmd?: number | null
          total_fat_mass?: number | null
          total_lean_mass?: number | null
          total_t_score?: number | null
          total_z_score?: number | null
          trunk_fat_mass?: number | null
          trunk_lean_mass?: number | null
          vat_area_cm2?: number | null
          weight_lb?: number | null
        }
        Update: {
          almi?: number | null
          almi_pctile_am?: number | null
          almi_pctile_yn?: number | null
          created_at?: string
          device_model?: string | null
          device_serial?: string | null
          external_scan_id?: string
          height_in?: number | null
          id?: string
          l_arm_fat_mass?: number | null
          l_arm_lean_mass?: number | null
          l_leg_fat_mass?: number | null
          l_leg_lean_mass?: number | null
          member_id?: string
          r_arm_fat_mass?: number | null
          r_arm_lean_mass?: number | null
          r_leg_fat_mass?: number | null
          r_leg_lean_mass?: number | null
          scan_date?: string
          software_version?: string | null
          source_pdf_path?: string | null
          tbf_pct?: number | null
          tbf_pct_pctile_am?: number | null
          tbf_pct_pctile_yn?: number | null
          total_bmd?: number | null
          total_fat_mass?: number | null
          total_lean_mass?: number | null
          total_t_score?: number | null
          total_z_score?: number | null
          trunk_fat_mass?: number | null
          trunk_lean_mass?: number | null
          vat_area_cm2?: number | null
          weight_lb?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scans_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
