import { z } from 'zod';
import { Type } from '@google/genai';
import type { Schema } from '@google/genai';

export const ScanExtractionSchema = z.object({
  scan_date: z.string().nullable(),
  external_scan_id: z.string().nullable(),
  device_model: z.string().nullable(),
  device_serial: z.string().nullable(),
  software_version: z.string().nullable(),
  weight_lb: z.number().nullable(),
  height_in: z.number().nullable(),
  tbf_pct: z.number().nullable(),
  tbf_pct_pctile_yn: z.number().nullable(),
  tbf_pct_pctile_am: z.number().nullable(),
  vat_area_cm2: z.number().nullable(),
  almi: z.number().nullable(),
  almi_pctile_yn: z.number().nullable(),
  almi_pctile_am: z.number().nullable(),
  total_bmd: z.number().nullable(),
  total_t_score: z.number().nullable(),
  total_z_score: z.number().nullable(),
  l_arm_lean_mass: z.number().nullable(),
  l_arm_fat_mass: z.number().nullable(),
  r_arm_lean_mass: z.number().nullable(),
  r_arm_fat_mass: z.number().nullable(),
  trunk_lean_mass: z.number().nullable(),
  trunk_fat_mass: z.number().nullable(),
  l_leg_lean_mass: z.number().nullable(),
  l_leg_fat_mass: z.number().nullable(),
  r_leg_lean_mass: z.number().nullable(),
  r_leg_fat_mass: z.number().nullable(),
});

export type ScanExtraction = z.infer<typeof ScanExtractionSchema>;

const strField: Schema = { type: Type.STRING, nullable: true };
const numField: Schema = { type: Type.NUMBER, nullable: true };

export const GEMINI_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    scan_date: strField,
    external_scan_id: strField,
    device_model: strField,
    device_serial: strField,
    software_version: strField,
    weight_lb: numField,
    height_in: numField,
    tbf_pct: numField,
    tbf_pct_pctile_yn: numField,
    tbf_pct_pctile_am: numField,
    vat_area_cm2: numField,
    almi: numField,
    almi_pctile_yn: numField,
    almi_pctile_am: numField,
    total_bmd: numField,
    total_t_score: numField,
    total_z_score: numField,
    l_arm_lean_mass: numField,
    l_arm_fat_mass: numField,
    r_arm_lean_mass: numField,
    r_arm_fat_mass: numField,
    trunk_lean_mass: numField,
    trunk_fat_mass: numField,
    l_leg_lean_mass: numField,
    l_leg_fat_mass: numField,
    r_leg_lean_mass: numField,
    r_leg_fat_mass: numField,
  },
};
