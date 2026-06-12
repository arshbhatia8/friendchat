import { useState, useEffect, useRef, InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onChange:    (value: string) => void;
  debounce?:   number;
  className?:  string;
}

export function SearchInput({
  onChange,
  debounce = 200,
  className,
  placeholder = "Search…",
  value: externalValue,
  ...props
}: SearchInputProps) {
  const [internal, setInternal] = useState((externalValue as string) ?? "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(internal), debounce);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [internal]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={cn("relative", className)}>
      {/* Search icon */}
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
          clipRule="evenodd"
        />
      </svg>

      <input
        type="search"
        value={internal}
        onChange={(e) => setInternal(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-9 w-full rounded-xl border border-gray-200 bg-surface-muted pl-9 pr-8",
          "text-sm text-ink placeholder:text-ink-faint",
          "focus:border-brand-400 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-100",
          "transition-all duration-150",
          "[&::-webkit-search-cancel-button]:hidden"   // hide native clear btn
        )}
        {...props}
      />

      {/* Custom clear button */}
      {internal && (
        <button
          type="button"
          onClick={() => { setInternal(""); onChange(""); }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-faint hover:text-ink transition-colors"
          aria-label="Clear search"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M4.47 4.47a.75.75 0 011.06 0L8 6.94l2.47-2.47a.75.75 0 111.06 1.06L9.06 8l2.47 2.47a.75.75 0 11-1.06 1.06L8 9.06l-2.47 2.47a.75.75 0 01-1.06-1.06L6.94 8 4.47 5.53a.75.75 0 010-1.06z" />
          </svg>
        </button>
      )}
    </div>
  );
}
