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

function fmt(val: number | null): string {
  return val !== null ? val.toFixed(1) : "—";
}

function leanDiffPct(a: number | null, b: number | null): number | null {
  if (a === null || b === null || a <= 0 || b <= 0) return null;
  return (Math.abs(a - b) / ((a + b) / 2)) * 100;
}

interface PairedSectionProps {
  title: string;
  leftLean: number | null;
  leftFat: number | null;
  rightLean: number | null;
  rightFat: number | null;
  sectionName: "arm" | "leg";
}

function PairedSection({ title, leftLean, leftFat, rightLean, rightFat, sectionName }: PairedSectionProps) {
  const diffPct = leanDiffPct(leftLean, rightLean);
  const isAsymmetric = diffPct !== null && diffPct > 10;

  return (
    <div>
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">{title}</p>
      <table className="w-full text-sm mb-2">
        <thead>
          <tr className="text-xs text-neutral-400">
            <th className="text-left pb-1 font-normal"></th>
            <th className="text-right pb-1 font-normal">Lean (lb)</th>
            <th className="text-right pb-1 font-normal">Fat (lb)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-1 text-neutral-600">Left {sectionName}</td>
            <td className="py-1 text-right font-medium text-neutral-900">{fmt(leftLean)}</td>
            <td className="py-1 text-right font-medium text-neutral-900">{fmt(leftFat)}</td>
          </tr>
          <tr>
            <td className="py-1 text-neutral-600">Right {sectionName}</td>
            <td className="py-1 text-right font-medium text-neutral-900">{fmt(rightLean)}</td>
            <td className="py-1 text-right font-medium text-neutral-900">{fmt(rightFat)}</td>
          </tr>
        </tbody>
      </table>
      {diffPct !== null && (
        <p className={`text-xs font-medium ${isAsymmetric ? "text-red-600" : "text-green-600"}`}>
          {isAsymmetric
            ? `${(leftLean ?? 0) > (rightLean ?? 0) ? "Left" : "Right"} ${sectionName} leads by ${diffPct.toFixed(1)}% lean mass — significant asymmetry`
            : `${diffPct.toFixed(1)}% L/R difference — within normal range`}
        </p>
      )}
    </div>
  );
}

export function RegionalBreakdownCard(props: RegionalBreakdownCardProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-5">
      <p className="text-sm font-medium text-neutral-500">Regional Breakdown</p>

      <PairedSection
        title="Arms"
        leftLean={props.l_arm_lean_mass}
        leftFat={props.l_arm_fat_mass}
        rightLean={props.r_arm_lean_mass}
        rightFat={props.r_arm_fat_mass}
        sectionName="arm"
      />

      <div className="border-t border-neutral-100" />

      <PairedSection
        title="Legs"
        leftLean={props.l_leg_lean_mass}
        leftFat={props.l_leg_fat_mass}
        rightLean={props.r_leg_lean_mass}
        rightFat={props.r_leg_fat_mass}
        sectionName="leg"
      />

      <div className="border-t border-neutral-100" />

      <div>
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Trunk</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-neutral-400">
              <th className="text-left pb-1 font-normal"></th>
              <th className="text-right pb-1 font-normal">Lean (lb)</th>
              <th className="text-right pb-1 font-normal">Fat (lb)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-1 text-neutral-600">Trunk</td>
              <td className="py-1 text-right font-medium text-neutral-900">{fmt(props.trunk_lean_mass)}</td>
              <td className="py-1 text-right font-medium text-neutral-900">{fmt(props.trunk_fat_mass)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-xs text-neutral-400 border-t border-neutral-100 pt-3">
        Lean values include bone mineral content (Lean + BMC), as reported by Hologic DEXA.
        Asymmetry flagged at &gt;10% L/R lean-mass difference.
      </p>
    </div>
  );
}
