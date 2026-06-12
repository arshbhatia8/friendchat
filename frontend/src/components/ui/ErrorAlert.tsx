import { ReactNode } from "react";
import { cn } from "@/utils/cn";

// ── Inline error alert ────────────────────────────────────────────────────────

interface ErrorAlertProps {
  title?:     string;
  message:    string;
  onRetry?:   () => void;
  className?: string;
  size?:      "sm" | "md";
}

export function ErrorAlert({
  title,
  message,
  onRetry,
  className,
  size = "md",
}: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-xl border border-red-200 bg-danger-light",
        size === "sm" ? "px-3 py-2.5" : "px-4 py-4",
        className
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4 text-danger"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-sm font-medium text-danger-dark mb-0.5">{title}</p>
        )}
        <p className={cn("text-danger-dark", size === "sm" ? "text-xs" : "text-sm")}>
          {message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs font-medium text-danger-dark underline underline-offset-2 hover:no-underline"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

// ── Full-page error state ─────────────────────────────────────────────────────

interface PageErrorProps {
  title?:   string;
  message?: string;
  onRetry?: () => void;
}

export function PageError({
  title   = "Something went wrong",
  message = "We ran into an error loading this page.",
  onRetry,
}: PageErrorProps) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-light">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7 text-danger">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <p className="text-base font-semibold text-ink">{title}</p>
          <p className="mt-1 text-sm text-ink-muted">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

// ── Field-level validation error ──────────────────────────────────────────────

export function FieldError({ message }: { message: string }) {
  return (
    <p role="alert" className="flex items-center gap-1 text-xs text-danger mt-1">
      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 flex-shrink-0">
        <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm.75-10.25a.75.75 0 00-1.5 0v4a.75.75 0 001.5 0v-4zm-.75 6.5a.75.75 0 100 1.5.75.75 0 000-1.5z" clipRule="evenodd"/>
      </svg>
      {message}
    </p>
  );
}
