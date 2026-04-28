interface TrendScan {
  tbf_pct: number | null;
  total_lean_mass: number | null;
  vat_area_cm2: number | null;
  almi: number | null;
}

interface Trajectory {
  headline: string;
  detail: string;
}

function computeTrajectory(first: TrendScan, last: TrendScan): Trajectory {
  const tbfChange =
    first.tbf_pct !== null && last.tbf_pct !== null
      ? last.tbf_pct - first.tbf_pct
      : null;
  const leanChange =
    first.total_lean_mass !== null && last.total_lean_mass !== null
      ? last.total_lean_mass - first.total_lean_mass
      : null;
  const vatChange =
    first.vat_area_cm2 !== null && last.vat_area_cm2 !== null
      ? last.vat_area_cm2 - first.vat_area_cm2
      : null;
  const almiChange =
    first.almi !== null && last.almi !== null ? last.almi - first.almi : null;

  const tbfDown = tbfChange !== null && tbfChange < -0.5;
  const tbfUp = tbfChange !== null && tbfChange > 0.5;
  const tbfStable = !tbfDown && !tbfUp;

  const leanUp = leanChange !== null && leanChange > 0.5;
  const leanDown = leanChange !== null && leanChange < -0.5;
  const leanStable = !leanUp && !leanDown;

  const vatDown = vatChange !== null && vatChange < -3;
  const vatUp = vatChange !== null && vatChange > 3;

  const almiUp = almiChange !== null && almiChange > 0.1;

  if (leanUp && tbfDown) {
    return {
      headline: "Body Recomposition",
      detail:
        "You're simultaneously losing fat and gaining lean mass — the ideal body composition outcome. Keep the consistency going.",
    };
  }
  if (almiUp && tbfStable && !vatUp) {
    return {
      headline: "Building Lean Mass",
      detail:
        "Your lean mass index is rising steadily while fat levels have stayed controlled. This is a strong, clean bulk trajectory.",
    };
  }
  if (tbfDown && vatDown && (leanStable || leanUp)) {
    return {
      headline: "Fat Loss Phase",
      detail:
        "Body fat and visceral fat are both trending down while lean mass holds steady. You're losing the right kind of weight.",
    };
  }
  if (tbfStable && leanStable && !vatUp) {
    return {
      headline: "Holding Steady",
      detail:
        "Your metrics have remained stable across all scans. Small fluctuations are normal — consistency is the foundation for future progress.",
    };
  }
  if (tbfUp && leanDown) {
    return {
      headline: "Course Correction Needed",
      detail:
        "Body fat is rising and lean mass is declining. Your coach can help identify what to adjust in training and nutrition.",
    };
  }
  if (tbfUp || leanDown) {
    return {
      headline: "Mixed Results",
      detail:
        "Some metrics are moving in the wrong direction. This is a signal to revisit training intensity, protein intake, or recovery.",
    };
  }
  return {
    headline: "Progress Underway",
    detail:
      "Your numbers are moving in the right direction overall. Keep up the consistency.",
  };
}

interface TrajectoryCalloutProps {
  scans: TrendScan[];
}

export function TrajectoryCallout({ scans }: TrajectoryCalloutProps) {
  if (scans.length < 2) return null;
  const first = scans[0];
  const last = scans[scans.length - 1];
  const { headline, detail } = computeTrajectory(first, last);

  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 mt-4">
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
        Trajectory
      </p>
      <h2 className="text-lg font-bold text-black mb-1">{headline}</h2>
      <p className="text-sm text-neutral-900 leading-relaxed">{detail}</p>
    </div>
  );
}
