export const BAND_STYLES = {
  healthy: { label: "Within healthy range", className: "text-green-600" },
  above: { label: "Above healthy range", className: "text-red-600" },
  below: { label: "Below healthy range", className: "text-neutral-500" },
  warning: { label: "Needs attention", className: "text-amber-600" },
} as const;
