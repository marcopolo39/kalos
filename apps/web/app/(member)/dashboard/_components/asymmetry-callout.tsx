import type { AsymmetryResult } from "@/lib/scan-display/asymmetry";

interface AsymmetryCalloutProps {
  asymmetries: AsymmetryResult[];
}

const regionLabel: Record<AsymmetryResult["region"], string> = {
  arm: "Arms",
  leg: "Legs",
};

export function AsymmetryCallout({ asymmetries }: AsymmetryCalloutProps) {
  if (asymmetries.length === 0) return null;

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-5">
      <p className="text-sm font-semibold text-neutral-900 mb-2">Left/right asymmetry detected</p>
      <ul className="space-y-1 mb-3">
        {asymmetries.map(({ region, diffPct }) => (
          <li key={region} className="text-sm text-neutral-700">
            {regionLabel[region]}: {diffPct.toFixed(1)}% lean-mass difference (L vs R)
          </li>
        ))}
      </ul>
      <p className="text-sm text-neutral-600 leading-relaxed">
        Small left/right differences are normal. A gap above 10% can reflect a dominant-side
        training pattern, a past injury, or a neurological difference worth discussing with a
        clinician.
      </p>
    </div>
  );
}
