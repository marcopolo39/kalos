interface TextFieldProps {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  initiallyNull?: boolean;
}

export function TextField({ label, value, onChange, initiallyNull = false }: TextFieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-neutral-900">{label}</label>
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === "" ? null : raw);
        }}
        className="border border-neutral-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {initiallyNull && value === null && (
        <p className="text-xs text-neutral-500 mt-0.5">
          Not extracted — fill in if known
        </p>
      )}
    </div>
  );
}
