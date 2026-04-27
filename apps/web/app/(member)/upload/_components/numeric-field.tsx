interface NumericFieldProps {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  step?: string;
  compact?: boolean;
}

export function NumericField({
  label,
  value,
  onChange,
  step,
  compact = false,
}: NumericFieldProps) {
  const inputClasses = compact
    ? "border border-neutral-200 rounded-lg px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    : "border border-neutral-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-neutral-900">{label}</label>
      )}
      <input
        type="number"
        step={step ?? "any"}
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === "" ? null : Number(raw));
        }}
        className={inputClasses}
      />
      {value === null && (
        <p className="text-xs text-neutral-500 mt-0.5">
          Not extracted — fill in if known
        </p>
      )}
    </div>
  );
}
