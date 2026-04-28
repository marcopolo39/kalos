interface AsymmetryScan {
  l_arm_lean_mass: number | null;
  r_arm_lean_mass: number | null;
  l_leg_lean_mass: number | null;
  r_leg_lean_mass: number | null;
}

export interface AsymmetryResult {
  region: "arm" | "leg";
  diffPct: number;
}

export function detectAsymmetry(scan: AsymmetryScan): AsymmetryResult[] {
  const results: AsymmetryResult[] = [];

  function check(left: number | null, right: number | null, region: "arm" | "leg") {
    if (left === null || right === null || left <= 0 || right <= 0) return;
    const diffPct = (Math.abs(left - right) / ((left + right) / 2)) * 100;
    if (diffPct > 10) results.push({ region, diffPct });
  }

  check(scan.l_arm_lean_mass, scan.r_arm_lean_mass, "arm");
  check(scan.l_leg_lean_mass, scan.r_leg_lean_mass, "leg");

  return results;
}
