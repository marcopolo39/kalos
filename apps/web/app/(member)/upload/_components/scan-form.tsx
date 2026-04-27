"use client";

import { useState } from "react";
import {
  ScanExtractionSchema,
  type ScanExtraction,
} from "@/lib/scan-extraction/schema";
import { Button } from "@/app/_components/button";
import { FormSection } from "./form-section";
import { NumericField } from "./numeric-field";
import { TextField } from "./text-field";
import { DateField } from "./date-field";
import { RegionalTable } from "./regional-table";

interface ScanFormProps {
  initialData: ScanExtraction;
  onSubmit: (data: ScanExtraction) => void;
  isSaving: boolean;
  saveError: string | null;
  duplicateError: boolean;
}

export function ScanForm({
  initialData,
  onSubmit,
  isSaving,
  saveError,
  duplicateError,
}: ScanFormProps) {
  const [data, setData] = useState<ScanExtraction>(initialData);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function setField<K extends keyof ScanExtraction>(
    key: K,
    val: ScanExtraction[K]
  ) {
    setData((prev) => ({ ...prev, [key]: val }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = ScanExtractionSchema.safeParse(data);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString();
        if (key) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    onSubmit(result.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <FormSection heading="Scan info">
        <DateField
          label="Scan date"
          value={data.scan_date}
          onChange={(v) => setField("scan_date", v)}
        />
        <TextField
          label="Scan ID"
          value={data.external_scan_id}
          onChange={(v) => setField("external_scan_id", v)}
        />
      </FormSection>

      <FormSection heading="Device">
        <TextField
          label="Model"
          value={data.device_model}
          onChange={(v) => setField("device_model", v)}
        />
        <TextField
          label="Serial"
          value={data.device_serial}
          onChange={(v) => setField("device_serial", v)}
        />
        <TextField
          label="Software version"
          value={data.software_version}
          onChange={(v) => setField("software_version", v)}
        />
      </FormSection>

      <FormSection heading="Anthropometrics">
        <NumericField
          label="Weight"
          value={data.weight_lb}
          onChange={(v) => setField("weight_lb", v)}
        />
        <NumericField
          label="Height"
          value={data.height_in}
          onChange={(v) => setField("height_in", v)}
        />
      </FormSection>

      <FormSection heading="Body composition">
        <NumericField
          label="Total Body % Fat"
          value={data.tbf_pct}
          onChange={(v) => setField("tbf_pct", v)}
        />
        <NumericField
          label="% Fat percentile YN"
          value={data.tbf_pct_pctile_yn}
          onChange={(v) => setField("tbf_pct_pctile_yn", v)}
        />
        <NumericField
          label="% Fat percentile AM"
          value={data.tbf_pct_pctile_am}
          onChange={(v) => setField("tbf_pct_pctile_am", v)}
        />
        <NumericField
          label="Est. VAT Area (cm²)"
          value={data.vat_area_cm2}
          onChange={(v) => setField("vat_area_cm2", v)}
        />
        <NumericField
          label="Appen. Lean/Height² (kg/m²)"
          value={data.almi}
          onChange={(v) => setField("almi", v)}
        />
        <NumericField
          label="Appen. Lean/Height² YN percentile"
          value={data.almi_pctile_yn}
          onChange={(v) => setField("almi_pctile_yn", v)}
        />
        <NumericField
          label="Appen. Lean/Height² AM percentile"
          value={data.almi_pctile_am}
          onChange={(v) => setField("almi_pctile_am", v)}
        />
      </FormSection>

      <FormSection heading="Bone density">
        <NumericField
          label="BMD (g/cm²)"
          value={data.total_bmd}
          onChange={(v) => setField("total_bmd", v)}
        />
        <NumericField
          label="T-score"
          value={data.total_t_score}
          onChange={(v) => setField("total_t_score", v)}
        />
        <NumericField
          label="Z-score"
          value={data.total_z_score}
          onChange={(v) => setField("total_z_score", v)}
        />
      </FormSection>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-neutral-900">
          Regional mass
        </h3>
        <RegionalTable
          values={{
            l_arm_lean_mass: data.l_arm_lean_mass,
            l_arm_fat_mass: data.l_arm_fat_mass,
            r_arm_lean_mass: data.r_arm_lean_mass,
            r_arm_fat_mass: data.r_arm_fat_mass,
            trunk_lean_mass: data.trunk_lean_mass,
            trunk_fat_mass: data.trunk_fat_mass,
            l_leg_lean_mass: data.l_leg_lean_mass,
            l_leg_fat_mass: data.l_leg_fat_mass,
            r_leg_lean_mass: data.r_leg_lean_mass,
            r_leg_fat_mass: data.r_leg_fat_mass,
          }}
          onChange={(key, value) => setField(key, value)}
        />
      </div>

      {duplicateError && (
        <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 text-sm text-amber-800">
          This scan looks like one that&apos;s already on file. Try changing the
          scan date or scan ID, then resubmit.
        </div>
      )}

      {saveError && !duplicateError && (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4 text-sm text-red-700">
          {saveError}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSaving}
        className="w-full px-5 py-[15px] text-sm mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSaving ? "Saving scan…" : "Confirm and save scan"}
      </Button>
    </form>
  );
}
