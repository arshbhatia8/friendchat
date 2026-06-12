import { cn } from "@/utils/cn";

// ── Badge ─────────────────────────────────────────────────────────────────────

interface BadgeProps {
  count?:     number;
  dot?:       boolean;
  className?: string;
}

export function Badge({ count, dot, className }: BadgeProps) {
  if (dot) {
    return (
      <span
        className={cn(
          "h-2 w-2 rounded-full bg-brand-500 animate-pulse-dot",
          className
        )}
      />
    );
  }
  if (!count || count <= 0) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        "h-4.5 min-w-4.5 rounded-full px-1",
        "bg-brand-600 text-white text-[10px] font-semibold leading-none",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
