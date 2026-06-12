import { cn } from "@/utils/cn";

interface AvatarProps {
  name:       string;
  src?:       string | null;
  size?:      "xs" | "sm" | "md" | "lg";
  isOnline?:  boolean;
  className?: string;
}

const sizes = {
  xs: { wrap: "h-7 w-7",  text: "text-xs",  dot: "h-2 w-2"   },
  sm: { wrap: "h-9 w-9",  text: "text-sm",  dot: "h-2.5 w-2.5" },
  md: { wrap: "h-11 w-11",text: "text-base", dot: "h-3 w-3"  },
  lg: { wrap: "h-14 w-14",text: "text-lg",  dot: "h-3.5 w-3.5" },
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Avatar({ name, src, size = "md", isOnline, className }: AvatarProps) {
  const s = sizes[size];
  return (
    <div className={cn("relative flex-shrink-0", className)}>
      <div
        className={cn(
          s.wrap,
          "rounded-full overflow-hidden bg-brand-100 flex items-center justify-center"
        )}
      >
        {src ? (
          <img src={src} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className={cn(s.text, "font-medium text-brand-700 select-none")}>
            {initials(name)}
          </span>
        )}
      </div>
      {isOnline !== undefined && (
        <span
          className={cn(
            s.dot,
            "absolute bottom-0 right-0 rounded-full ring-2 ring-white",
            isOnline ? "bg-success" : "bg-gray-300"
          )}
        />
      )}
    </div>
  );
}
