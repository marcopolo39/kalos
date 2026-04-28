interface RegionalBreakdownCardProps {
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
}

const REGIONS = [
  { label: "Left arm",  leanKey: "l_arm_lean_mass",  fatKey: "l_arm_fat_mass"  },
  { label: "Right arm", leanKey: "r_arm_lean_mass",  fatKey: "r_arm_fat_mass"  },
  { label: "Trunk",     leanKey: "trunk_lean_mass",  fatKey: "trunk_fat_mass"  },
  { label: "Left leg",  leanKey: "l_leg_lean_mass",  fatKey: "l_leg_fat_mass"  },
  { label: "Right leg", leanKey: "r_leg_lean_mass",  fatKey: "r_leg_fat_mass"  },
] as const;

function fmt(val: number | null): string {
  return val !== null ? val.toFixed(1) : "—";
}

export function RegionalBreakdownCard(props: RegionalBreakdownCardProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-5">
      <p className="text-sm font-medium text-neutral-500 mb-4">Regional Breakdown</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
            <th className="text-left pb-2 font-semibold">Region</th>
            <th className="text-right pb-2 font-semibold">Lean (lb)</th>
            <th className="text-right pb-2 font-semibold">Fat (lb)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {REGIONS.map(({ label, leanKey, fatKey }) => (
            <tr key={leanKey}>
              <td className="py-2 text-neutral-700">{label}</td>
              <td className="py-2 text-right text-neutral-900 font-medium">{fmt(props[leanKey])}</td>
              <td className="py-2 text-right text-neutral-900 font-medium">{fmt(props[fatKey])}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-neutral-500 mt-3 leading-relaxed">
        Lean values include bone mineral content (Lean + BMC), as reported by Hologic DEXA.
      </p>
    </div>
  );
}
