import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size    = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant;
  size?:     Size;
  loading?:  boolean;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:   "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500",
  secondary: "bg-surface-muted text-ink hover:bg-surface-subtle border border-gray-200 focus-visible:ring-brand-500",
  ghost:     "text-ink-muted hover:bg-surface-muted hover:text-ink focus-visible:ring-brand-500",
  danger:    "bg-red-50 text-danger hover:bg-red-100 border border-red-200 focus-visible:ring-red-400",
};

const sizes: Record<Size, string> = {
  sm: "h-7  px-3 text-xs  gap-1.5",
  md: "h-9  px-4 text-sm  gap-2",
  lg: "h-11 px-5 text-sm  gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size    = "md",
      loading = false,
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded font-medium",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
);
Button.displayName = "Button";
