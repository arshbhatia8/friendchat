import { RouterProvider } from "react-router-dom";
import { router }         from "@/router";
import { ToastProvider }  from "@/components/ui/Toast";

/**
 * App.tsx
 * ────────
 * Root of the component tree. Wraps everything in:
 *   - ToastProvider   — imperative toast queue available app-wide via useToast()
 *   - RouterProvider  — all route definitions from src/router/index.tsx
 *
 * Global state (Zustand stores) does not need a React context wrapper —
 * Zustand stores are module-level singletons accessible anywhere.
 */
export default function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}
