import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";

const MANROPE_STYLE = { fontFamily: "var(--font-manrope)" } as const;

const variantClasses = {
  primary:
    "bg-blue-500 hover:bg-blue-600 text-white border border-transparent",
  secondary:
    "bg-white text-blue-500 border border-blue-500 hover:bg-blue-50",
} as const;

const baseClasses =
  "font-semibold rounded-xl leading-none tracking-tight transition-colors inline-flex items-center justify-center no-underline";

export type ButtonVariant = keyof typeof variantClasses;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

export function Button({
  children,
  className = "",
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`.trim()}
      style={MANROPE_STYLE}
      {...props}
    >
      {children}
    </button>
  );
}

export type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  className?: string;
  variant?: ButtonVariant;
  children: ReactNode;
};

export function ButtonLink({
  children,
  className = "",
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={`${baseClasses} ${variantClasses[variant]} ${className}`.trim()}
      style={MANROPE_STYLE}
      {...props}
    >
      {children}
    </Link>
  );
}
