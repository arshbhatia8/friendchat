import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { cn } from "@/utils/cn";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id:        number;
  type:      ToastType;
  message:   string;
  duration:  number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons: Record<ToastType, string> = {
  success: "✓",
  error:   "✕",
  warning: "⚠",
  info:    "ℹ",
};

const styles: Record<ToastType, string> = {
  success: "bg-white border border-green-200 text-green-800",
  error:   "bg-white border border-red-200   text-red-800",
  warning: "bg-white border border-yellow-200 text-yellow-800",
  info:    "bg-white border border-blue-200  text-blue-800",
};

const iconStyles: Record<ToastType, string> = {
  success: "text-emerald-500 bg-emerald-50 rounded-full",
  error:   "text-red-500 bg-red-50 rounded-full",
  warning: "text-yellow-600 bg-yellow-50 rounded-full",
  info:    "text-blue-500 bg-blue-50 rounded-full",
};

const progressStyles: Record<ToastType, string> = {
  success: "bg-emerald-400",
  error:   "bg-red-400",
  warning: "bg-yellow-400",
  info:    "bg-blue-400",
};

function ToastItem({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible]   = useState(false);

  useEffect(() => {
    // Animate in
    const enter = requestAnimationFrame(() => setVisible(true));

    // Progress countdown
    const start  = Date.now();
    const tick   = () => {
      const elapsed  = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / item.duration) * 100);
      setProgress(remaining);
      if (remaining > 0) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    // Auto-dismiss
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(item.id), 200);
    }, item.duration);

    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(timer);
    };
  }, [item.id, item.duration, onDismiss]);

  return (
    <div
      className={cn(
        "pointer-events-auto w-80 rounded-xl shadow-modal overflow-hidden",
        "transition-all duration-200",
        styles[item.type],
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Icon */}
        <span className={cn("flex h-6 w-6 flex-shrink-0 items-center justify-center text-xs font-bold mt-0.5", iconStyles[item.type])}>
          {icons[item.type]}
        </span>

        {/* Message */}
        <p className="flex-1 text-sm font-medium leading-5">{item.message}</p>

        {/* Dismiss */}
        <button
          onClick={() => { setVisible(false); setTimeout(() => onDismiss(item.id), 200); }}
          className="flex-shrink-0 rounded p-0.5 opacity-50 hover:opacity-100 transition-opacity -mr-1 -mt-0.5"
          aria-label="Dismiss"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current">
            <path d="M4.47 4.47a.75.75 0 011.06 0L8 6.94l2.47-2.47a.75.75 0 111.06 1.06L9.06 8l2.47 2.47a.75.75 0 11-1.06 1.06L8 9.06l-2.47 2.47a.75.75 0 01-1.06-1.06L6.94 8 4.47 5.53a.75.75 0 010-1.06z" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-black/5">
        <div
          className={cn("h-full transition-none", progressStyles[item.type])}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info", duration = 3500) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev.slice(-4), { id, type, message, duration }]);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Portal-like fixed container */}
      <div
        className="fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-2 pointer-events-none"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.toast;
}
