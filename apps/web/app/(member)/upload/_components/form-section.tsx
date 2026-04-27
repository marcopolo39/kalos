import type { ReactNode } from "react";

interface FormSectionProps {
  heading: string;
  children: ReactNode;
}

export function FormSection({ heading, children }: FormSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-neutral-900">{heading}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}
