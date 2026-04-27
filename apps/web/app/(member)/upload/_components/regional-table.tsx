import type { ScanExtraction } from "@/lib/scan-extraction/schema";
import { NumericField } from "./numeric-field";

export type RegionalValues = Pick<
  ScanExtraction,
  | "l_arm_lean_mass"
  | "l_arm_fat_mass"
  | "r_arm_lean_mass"
  | "r_arm_fat_mass"
  | "trunk_lean_mass"
  | "trunk_fat_mass"
  | "l_leg_lean_mass"
  | "l_leg_fat_mass"
  | "r_leg_lean_mass"
  | "r_leg_fat_mass"
>;

interface RegionalTableProps {
  values: RegionalValues;
  onChange: <K extends keyof RegionalValues>(key: K, value: number | null) => void;
}

interface RegionRow {
  label: string;
  leanKey: keyof RegionalValues;
  fatKey: keyof RegionalValues;
}

const REGION_ROWS: RegionRow[] = [
  { label: "L Arm", leanKey: "l_arm_lean_mass", fatKey: "l_arm_fat_mass" },
  { label: "R Arm", leanKey: "r_arm_lean_mass", fatKey: "r_arm_fat_mass" },
  { label: "Trunk", leanKey: "trunk_lean_mass", fatKey: "trunk_fat_mass" },
  { label: "L Leg", leanKey: "l_leg_lean_mass", fatKey: "l_leg_fat_mass" },
  { label: "R Leg", leanKey: "r_leg_lean_mass", fatKey: "r_leg_fat_mass" },
];

export function RegionalTable({ values, onChange }: RegionalTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="text-left py-2 pr-4 text-sm font-medium text-neutral-900 w-24">
              Region
            </th>
            <th className="text-left py-2 pr-4 text-sm font-medium text-neutral-900">
              Lean + BMC (lb)
            </th>
            <th className="text-left py-2 text-sm font-medium text-neutral-900">
              Fat (lb)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {REGION_ROWS.map((row) => (
            <tr key={row.label}>
              <td className="py-2 pr-4 text-sm font-medium text-neutral-900 whitespace-nowrap">
                {row.label}
              </td>
              <td className="py-2 pr-4">
                <NumericField
                  label=""
                  value={values[row.leanKey]}
                  onChange={(v) => onChange(row.leanKey, v)}
                  compact
                />
              </td>
              <td className="py-2">
                <NumericField
                  label=""
                  value={values[row.fatKey]}
                  onChange={(v) => onChange(row.fatKey, v)}
                  compact
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
